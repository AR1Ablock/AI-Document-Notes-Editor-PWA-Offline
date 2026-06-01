
import { ref, onBeforeUnmount } from 'vue';
import { Show_Create_Edit_Model_Warning } from './TipTap_Editor';

const apiKey = ref('Wam1ZmbcAnWTGCa4KxqxtQSrj3yGUOh5');
export const text = ref('');
const isLoading = ref(false);
const statusMessage = ref('Idle');
const connectionStatus = ref('idle');
export const currentTimeDisplay = ref('0');
export const playbackRate = ref(1);
export const Show_TTS_Player = ref(false);
export const Toggle_Playback_dropdown = ref(false);
const logs = ref([]);

export const playbackRate_Speeds = [
    { msg: '0.5X', speed: 0.5 },
    { msg: '0.7X', speed: 0.7 },
    { msg: '1X', speed: 1 },
    { msg: '1.2X', speed: 1.2 },
    { msg: '1.5X', speed: 1.5 },
    { msg: '1.8X', speed: 1.8 },
    { msg: '2X', speed: 2 },
]


const INACTIVITY_TIMEOUT = 5000;   // 22 seconds - Best balance
const HARD_TOTAL_TIMEOUT = 10000;  // 2 minutes max (safety)

// Thread & Core Audio State Engine
const audioContext = ref(null);
let masterSamples = new Float32Array(0);
let activeNodes = [];
let abortController = null;
let schedulerInterval = null;

// Clock & Synchronization Anchors
export let isPlaying = ref(false);
let isStreamCompleted = false;
let playStartTrackTime = 0;
let playStartContextTime = 0;
let schedulingPlayheadSeconds = 0;
let nextScheduleContextTime = 0;
let leftOverBytes = null;
let isFirstChunk = true;



const log = (msg, type = 'info') => {
    const time = new Date().toLocaleTimeString().split(' ')[0];
    logs.value.unshift({ time, msg, type });
};



const getLivePlayheadPosition = () => {
    if (!isPlaying.value || !audioContext.value) return playStartTrackTime;
    const elapsedContext = audioContext.value.currentTime - playStartContextTime;
    const elapsedTrack = elapsedContext * parseFloat(playbackRate.value);
    const currentPos = playStartTrackTime + elapsedTrack;
    const maxDuration = masterSamples.length / 16000;
    return Math.min(currentPos, maxDuration);
};



const appendSamples = (newSamples) => {
    const tmp = new Float32Array(masterSamples.length + newSamples.length);
    tmp.set(masterSamples, 0);
    tmp.set(newSamples, masterSamples.length);
    masterSamples = tmp;
};



const scheduleAudioQueue = () => {
    if (!isPlaying.value || !audioContext.value) return;

    const currentContextTime = audioContext.value.currentTime;
    const totalDurationAvailable = masterSamples.length / 16000;

    while (
        schedulingPlayheadSeconds < totalDurationAvailable &&
        nextScheduleContextTime < currentContextTime + 0.35
    ) {
        const blockSizeSeconds = 0.2;
        const startSample = Math.floor(schedulingPlayheadSeconds * 16000);
        const endSample = Math.min(Math.floor((schedulingPlayheadSeconds + blockSizeSeconds) * 16000), masterSamples.length);

        if (startSample >= endSample) break;

        const sampleLength = endSample - startSample;
        const sliceSamples = masterSamples.subarray(startSample, endSample);

        const audioBuffer = audioContext.value.createBuffer(1, sampleLength, 16000);
        audioBuffer.getChannelData(0).set(sliceSamples);

        const source = audioContext.value.createBufferSource();
        source.buffer = audioBuffer;

        const speed = parseFloat(playbackRate.value);
        source.playbackRate.value = speed;
        source.connect(audioContext.value.destination);

        if (nextScheduleContextTime < currentContextTime) {
            nextScheduleContextTime = currentContextTime + 0.01;
        }

        source.start(nextScheduleContextTime);
        const nodeDurationOnTimeline = (sampleLength / 16000) / speed;

        activeNodes.push({
            node: source,
            endContextTime: nextScheduleContextTime + nodeDurationOnTimeline
        });

        nextScheduleContextTime += nodeDurationOnTimeline;
        schedulingPlayheadSeconds += (sampleLength / 16000);
    }

    activeNodes = activeNodes.filter(item => item.endContextTime > currentContextTime);
};



export const togglePause = () => {
    if (!audioContext.value || masterSamples.length === 0) return;

    if (isPlaying.value) {
        playStartTrackTime = getLivePlayheadPosition();
        isPlaying.value = false;
        activeNodes.forEach(item => { try { item.node.stop(); } catch (e) {/* empty */ } });
        activeNodes = [];
        statusMessage.value = 'Paused';
        log(`Playback paused at ${playStartTrackTime.toFixed(1)}s`);
    } else {
        // Wrap around to start if trying to play from the absolute end
        const maxDuration = masterSamples.length / 16000;
        if (statusMessage.value === 'Finished' || playStartTrackTime >= maxDuration - 0.1) {
            playStartTrackTime = 0;
        }

        isPlaying.value = true;
        playStartContextTime = audioContext.value.currentTime;
        schedulingPlayheadSeconds = playStartTrackTime;
        nextScheduleContextTime = audioContext.value.currentTime + 0.02;
        statusMessage.value = 'Playing...';
        scheduleAudioQueue();
        log(`Playback resumed from ${playStartTrackTime.toFixed(1)}s`);
    }
};



export const seek = (seconds) => {
    if (masterSamples.length === 0 || !audioContext.value) return;

    const currentPos = getLivePlayheadPosition();
    let newPos = currentPos + seconds;
    const maxDuration = masterSamples.length / 16000;

    if (newPos < 0) newPos = 0;
    if (newPos > maxDuration) newPos = maxDuration;

    activeNodes.forEach(item => { try { item.node.stop(); } catch (e) {/* empty */ } });
    activeNodes = [];

    playStartTrackTime = newPos;
    playStartContextTime = audioContext.value.currentTime;
    schedulingPlayheadSeconds = newPos;
    nextScheduleContextTime = audioContext.value.currentTime + 0.02;

    // Restore operational states if modifying a dead timeline track
    if (statusMessage.value === 'Finished') {
        statusMessage.value = 'Paused';
    }

    if (isPlaying.value) {
        scheduleAudioQueue();
    }
    log(`Jumped position to ${newPos.toFixed(1)}s`);
};



let inactivityTimer = null;

export const startStreaming = async (Text, Apply, AI_in_progress) => {
    stopEverything();
    isLoading.value = true;
    connectionStatus.value = 'active';
    statusMessage.value = 'Connecting...';

    const controller = new AbortController();


    const resetInactivityTimer = () => {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            console.warn(`[AI] Inactivity timeout (${INACTIVITY_TIMEOUT / 1000}s) - No new data received`);
            Show_Create_Edit_Model_Warning(`[AI] Inactivity timeout (${INACTIVITY_TIMEOUT / 1000}s) - No new data received`, 3000)
            controller.abort(new Error("Inactivity timeout"));
        }, INACTIVITY_TIMEOUT);
    };

    try {

        const totalTimeoutSignal = AbortSignal.timeout(HARD_TOTAL_TIMEOUT);
        // Combine both signals
        const combinedSignal = AbortSignal.any([controller.signal, totalTimeoutSignal]);


        log("Opening text chunk network stream...");
        const response = await fetch('https://preview.tts.speechmatics.com/generate/en-US-1', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey.value}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: Text }),
            signal: combinedSignal
        });

        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
        const reader = response.body.getReader();

        resetInactivityTimer(); // Start the inactivity timer when the stream opens

        audioContext.value = new (window.AudioContext || window.webkitAudioContext)();
        isPlaying.value = true;
        isStreamCompleted = false;
        isFirstChunk = true;
        leftOverBytes = null;
        playStartTrackTime = 0;
        playStartContextTime = audioContext.value.currentTime;
        schedulingPlayheadSeconds = 0;
        nextScheduleContextTime = audioContext.value.currentTime + 0.03;

        statusMessage.value = 'Streaming Audio...';

        // Watchdog Engine: Stays alive continuously until explicitly cleared via Stop
        schedulerInterval = setInterval(() => {
            const maxDuration = masterSamples.length / 16000;

            const maxMemoryMB = 50;
            if (masterSamples.length * 4 / (1024 * 1024) > maxMemoryMB) {
                log(`Warning: Audio data exceeds ${maxMemoryMB}MB`, 'warning');
            }

            if (isPlaying.value) {
                scheduleAudioQueue();
                const currentPos = getLivePlayheadPosition();
                currentTimeDisplay.value = `${currentPos.toFixed(1)}s`;

                if (isStreamCompleted && activeNodes.length === 0 && schedulingPlayheadSeconds >= maxDuration) {
                    playStartTrackTime = maxDuration; // Lock playhead permanently at the track terminus
                    isPlaying.value = false;
                    statusMessage.value = 'Finished';
                    connectionStatus.value = 'idle';
                    isLoading.value = false;
                    log("Track reached end. Thread loop idling for seek inputs.", "success");
                }
            } else {
                // Keeps UI accurately synced when seeking while paused or finished
                currentTimeDisplay.value = `${playStartTrackTime.toFixed(1)}s`;
            }
        }, 50);

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                log("Network stream ingestion finished processing.", "success");
                isStreamCompleted = true;
                break;
            }

            resetInactivityTimer(); // Reset the inactivity timer on every new chunk received

            if (!audioContext.value) break;
            let audioBytes = value;

            if (isFirstChunk) {
                if (audioBytes.byteLength >= 44) {
                    audioBytes = audioBytes.slice(44);
                    Apply.loading = false;
                    AI_in_progress.value = false;
                    Toggle_Playback_dropdown.value = false;
                    Show_TTS_Player.value = true;
                    isFirstChunk = false;
                    log("PCM Stream Isolated. Instant rendering processing engaged.", "success");
                } else {
                    continue;
                }
            }

            if (audioBytes.byteLength === 0) continue;

            let totalBuffer;
            if (leftOverBytes) {
                totalBuffer = new Uint8Array(leftOverBytes.length + audioBytes.length);
                totalBuffer.set(leftOverBytes, 0);
                totalBuffer.set(audioBytes, leftOverBytes.length);
                leftOverBytes = null;
            } else {
                totalBuffer = audioBytes;
            }

            if (totalBuffer.length % 2 !== 0) {
                leftOverBytes = totalBuffer.slice(-1);
                totalBuffer = totalBuffer.slice(0, -1);
            }

            if (totalBuffer.length === 0) continue;

            const int16 = new Int16Array(totalBuffer.buffer, totalBuffer.byteOffset, totalBuffer.length / 2);
            const float32 = new Float32Array(int16.length);
            for (let i = 0; i < int16.length; i++) {
                float32[i] = int16[i] / 32768.0;
            }

            appendSamples(float32);
            if (isPlaying.value) scheduleAudioQueue();
        }

    } catch (err) {
        if (err.name !== 'AbortError') {
            log(`Pipeline Error: ${err.message}`, "error");
            Show_Create_Edit_Model_Warning(`${err.message}, Network Issue`, 3000);
            statusMessage.value = 'Error';
            connectionStatus.value = 'error';
        }
        isLoading.value = false;
        Apply.loading = false;
        AI_in_progress.value = false;
        Toggle_Playback_dropdown.value = false;
    }
    finally {
        clearTimeout(inactivityTimer);
    }
};



export const stopEverything = () => {

    clearTimeout(inactivityTimer);
    if (abortController) abortController.abort();
    if (schedulerInterval) { clearInterval(schedulerInterval); schedulerInterval = null; }
    activeNodes.forEach(item => { try { item.node.stop(); } catch (e) {/* empty */ } });
    activeNodes = [];
    if (audioContext.value) { try { audioContext.value.close(); } catch (e) {/* empty */ } audioContext.value = null; }

    masterSamples = new Float32Array(0);
    isPlaying.value = false;
    isStreamCompleted = false;
    isLoading.value = false;
    connectionStatus.value = 'idle';
    statusMessage.value = 'Stopped';
    currentTimeDisplay.value = '0';
    Toggle_Playback_dropdown.value = false;
    Show_TTS_Player.value = false;
    console.log("All TTS audio processes stopped and state reset.");
};

onBeforeUnmount(() => stopEverything());