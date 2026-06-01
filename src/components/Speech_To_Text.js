import { ref, onUnmounted } from 'vue';
import { Show_Create_Edit_Model_Warning, Tiptap_Editor } from './TipTap_Editor';
import { Is_AI_Edit_Started, prompt_dialog_input_ref, prompt_input } from './AI_Feature';
import { OCR_Processing } from './OCR';


const apiKey = ref('Wam1ZmbcAnWTGCa4KxqxtQSrj3yGUOh5'); // Replace with your key
export const isRecording = ref(false);
export const status = ref('Idle'); // Idle, Connecting, Listening, Error
export const selectedLang = ref('en');
//
export const menuVisible = ref(false);
export const isDropdownOpen = ref(false);
export const isDropdownAnimation = ref(false);

// 2026 Speechmatics Supported Languages
export const languages = [
    // --- Global Majors ---
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },

    // --- Asian & South Asian ---
    { code: 'cmn', name: 'Mandarin', flag: '🇨🇳' },
    { code: 'yue', name: 'Cantonese', flag: '🇭🇰' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
    { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
    { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi', flag: '🇮🇳' },
    { code: 'th', name: 'Thai', flag: '🇹🇭' },
    { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
    { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
    { code: 'ms', name: 'Malay', flag: '🇲🇾' },

    // --- Middle Eastern & African ---
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'fa', name: 'Persian', flag: '🇮🇷' },
    { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
    { code: 'sw', name: 'Swahili', flag: '🇰🇪' },

    // --- European & Others ---
    { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
    { code: 'pl', name: 'Polish', flag: '🇵🇱' },
    { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
    { code: 'da', name: 'Danish', flag: '🇩🇰' },
    { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
    { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
    { code: 'el', name: 'Greek', flag: '🇬🇷' },
    { code: 'cs', name: 'Czech', flag: '🇨🇿' },
    { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
    { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
    { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
    { code: 'bg', name: 'Bulgarian', flag: '🇧🇬' },
    { code: 'hr', name: 'Croatian', flag: '🇭🇷' },
    { code: 'sk', name: 'Slovak', flag: '🇸🇰' },
    { code: 'sl', name: 'Slovenian', flag: '🇸🇮' },
    { code: 'et', name: 'Estonian', flag: '🇪🇪' },
    { code: 'lv', name: 'Latvian', flag: '🇱🇻' },
    { code: 'lt', name: 'Lithuanian', flag: '🇱🇹' },
    { code: 'ca', name: 'Catalan', flag: '🇪🇸' },
    { code: 'eu', name: 'Basque', flag: '🇪🇸' },
    { code: 'gl', name: 'Galician', flag: '🇪🇸' },
    { code: 'cy', name: 'Welsh', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
    { code: 'ga', name: 'Irish', flag: '🇮🇪' },
    { code: 'mt', name: 'Maltese', flag: '🇲🇹' }
];

let socket = null;
let mediaRecorder = null;
let audioStream = null;


// Timeouts Configuration (Adjustable)
const FETCH_TIMEOUT = 5000;      // 5s to get the API Token
const HANDSHAKE_TIMEOUT = 7000;  // 7s for WebSocket to start recognition
const INACTIVITY_TIMEOUT = 15000; // 15s of silence before auto-disconnect

// Timer References
let handshakeTimer = null;
let inactivityTimer = null;

// Resets the "Watchdog" timer every time we get data
const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer);
    if (isRecording.value) {
        inactivityTimer = setTimeout(() => {
            console.warn("Stream stalled: No data received for 15s.");
            Show_Create_Edit_Model_Warning("Connection Lost, Please Try Again.", 3000);
            status.value = 'Error';
            handleDisconnect();
        }, INACTIVITY_TIMEOUT);
    }
};

const startSTT = async (source = 'main') => {

    if (!navigator.onLine) {
        Show_Create_Edit_Model_Warning("No Internet Connection, Please Connect and Try Again.", 3000);
        return;
    }

    if(source === 'main') fully_close_prompt_STT(); // Ensure any existing prompt STT session is fully closed before starting a new one for the main editor

    if(Is_AI_Edit_Started.value || OCR_Processing.value) {
        Show_Create_Edit_Model_Warning("Please Finish the Ongoing AI Edit Before Starting Speech-to-Text.", 3000);
        return;
    }

    status.value = 'Connecting';

    try {

        const controller = new AbortController();
        const totalTimeoutSignal = AbortSignal.timeout(FETCH_TIMEOUT);

        const combinedSignal = AbortSignal.any([controller.signal, totalTimeoutSignal]);

        const tokenRes = await fetch('https://mp.speechmatics.com/v1/api_keys?type=rt', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey.value.trim()}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ ttl: 3600 }),
            signal: combinedSignal
        });

        if (!tokenRes.ok) throw new Error('Auth Failed');
        const { key_value: tempToken } = await tokenRes.json();

        socket = new WebSocket(`wss://eu2.rt.speechmatics.com/v2/${selectedLang.value}?jwt=${tempToken}`);


        handshakeTimer = setTimeout(() => {
            if (status.value === 'Connecting') { // if after 7s we're still "Connecting", then timeout
                console.warn("Handshake timeout: No response from WebSocket after 7s.");
                Show_Create_Edit_Model_Warning("Connection Timeout, Please Check Your Network and Try Again.", 3000);
                status.value = 'Error';
                handleDisconnect();
            }
        }, HANDSHAKE_TIMEOUT);



        socket.onopen = () => {
            socket.send(JSON.stringify({
                message: "StartRecognition",
                audio_format: { type: "file" },
                transcription_config: {
                    language: selectedLang.value,
                    operating_point: "enhanced",
                    enable_partials: true
                }
            }));
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            // Data received! Reset the inactivity watchdog.
            resetInactivityTimer();

            if (data.message === 'RecognitionStarted') {
                status.value = 'Listening';
                isRecording.value = true;
                startMicrophone();
            }

            else if (data.message === 'AddTranscript') {
                const finalizedText = data.metadata.transcript;
                if (source === 'prompt') {
                    prompt_dialog_input_ref.value.focus();
                    prompt_input.value += finalizedText;
                } // Executes the command
                else Tiptap_Editor.chain().focus().insertContent(finalizedText + ' ').run(); // Executes the command
            }

            else if (data.message === 'Error') {
                status.value = 'Error';
                handleDisconnect();
            }
        };

        socket.onerror = () => {
            try {
                status.value = 'Error';
                handleDisconnect();
            } catch (error) {
                console.error("WebSocket Error:", error);
            }
        };
        socket.onclose = () => handleDisconnect();

    } catch (err) {
        status.value = 'Error';
        handleDisconnect();
        if (err.name === 'AbortError') {
            Show_Create_Edit_Model_Warning("Connection Timeout, Please Check Your Network and Try Again.", 3000);
        } else {
            Show_Create_Edit_Model_Warning("Failed to Start STT, Please Try Again.", 3000);
        }
    }
};

const startMicrophone = async () => {
    try {
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(audioStream);
        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0 && socket?.readyState === WebSocket.OPEN) socket.send(e.data);
        };
        mediaRecorder.start(500);
    } catch (err) {
        status.value = 'Error';
        handleDisconnect();
        Show_Create_Edit_Model_Warning("Microphone Access Denied, Please Allow it and Try Again.", 3000);
    }
};

const stopSTT = () => {
    if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ message: "EndOfStream", last_seq_no: 0 }));
    }
    handleDisconnect();
};

const handleDisconnect = () => {
    clearTimeout(handshakeTimer);
    clearTimeout(inactivityTimer);
    if (mediaRecorder?.state !== 'inactive') mediaRecorder?.stop();
    audioStream?.getTracks().forEach(track => track.stop());
    socket?.close();
    if (socket) {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;
    }
    if (mediaRecorder) {
        mediaRecorder.ondataavailable = null;
    }
    socket = null;
    isRecording.value = false;
    if (status.value !== 'Error') status.value = 'Idle';
};

onUnmounted(() => handleDisconnect());

export const handleMicTapped = (source = 'main') => {
    if (isRecording.value) {
        stopSTT();
    } else {
        if (source === 'prompt') {
            fullyCloseSTT(); // Ensure any existing STT session is fully closed before starting a new one for the prompt
            startSTT('prompt');
        }
        else {
            fully_close_prompt_STT(); // Ensure any existing prompt STT session is fully closed before starting a new one for the main editor
            startSTT();
        }
    }
};

export const selectLanguage = (lang, source = 'main') => {
    selectedLang.value = lang.code;
    if (source === 'prompt') toggle_prompt_Dropdown();
    else toggleDropdown();
};


export const fullyCloseSTT = () => {
    stopSTT();
    if (isDropdownAnimation.value) {

        isDropdownAnimation.value = false;
        setTimeout(() => { isDropdownOpen.value = false; menuVisible.value = false }, 100);
    }
    else {
        menuVisible.value = false;
        isDropdownAnimation.value = false;
        isDropdownOpen.value = false;
    }
    console.log("STT fully closed and dropdown reset.");
};


export function fully_close_prompt_STT() {
    stopSTT();
    if (Is_prompt_dropdown_animate.value) {

        Is_prompt_dropdown_animate.value = false;
        setTimeout(() => { Is_prompt_dropdown_open.value = false; }, 100);
    }
    else {
        Is_prompt_dropdown_open.value = false;
        Is_prompt_dropdown_animate.value = false;
    }
    console.log("Prompt STT fully closed and dropdown reset.");
}



export function toggleDropdown() {
    if (isDropdownAnimation.value) {
        isDropdownAnimation.value = false;
        setTimeout(() => isDropdownOpen.value = false, 300);
    } else {
        isDropdownOpen.value = true;
        setTimeout(() => isDropdownAnimation.value = true, 10);
    }
}


export const Is_prompt_dropdown_open = ref(false);
export const Is_prompt_dropdown_animate = ref(false);

export function toggle_prompt_Dropdown() {
    if (Is_prompt_dropdown_animate.value) {
        Is_prompt_dropdown_animate.value = false;
        setTimeout(() => Is_prompt_dropdown_open.value = false, 300);
    } else {
        Is_prompt_dropdown_open.value = true;
        setTimeout(() => Is_prompt_dropdown_animate.value = true, 10);
    }
}