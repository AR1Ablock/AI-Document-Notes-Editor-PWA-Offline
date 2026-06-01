// Editor_Live_Media_Adding_Parser.js
import { ref, watch } from "vue";
import { Show_Create_Edit_Model_Warning } from "./TipTap_Editor";
import { abort_Controller } from "./controller";
import { debugError } from "./Global_Error_Handler";
import { editorLenis } from "./Scroll_Logic";
import { Get_Image_Node_Spec_For_Tiptap } from "./Paste_Drag_Drop_Handler";
import { useTouchDetection } from './Is_Touch'  // adjust path



export let selectionMode = ref(false); // Global flag for selection mode


let Media_Element_Direction = ref({
    StartX: 0,
    StartY: 0,
    StartWidth: 0,
    StartHeight: 0,
    AspectRatio: 0,
    CurrentDirection: null,
    Min: { width: 120, height: 80 },
    PreserveAspectRatio: false,
});

let Is_Resizing = false; // Flag to track if resizing is in progress
let Resize_Animation_ID = null; // To track the current animation frame for potential cancellation

let Resizeing_Method_Reference = null; // To hold the reference to the current resizing method (if needed for more complex logic)
let Stop_Resize_Method_Reference = null; // To hold the reference to the stop resize method (if needed for more complex logic)

//
let Resize_ESC_Key_Press_Method_Refrence = null;
let Rotation_ESC_Key_Press_Method_Refrence = null;

export function Clear_Editor_KeyPress_Media_Selection(method_ref) {
    if (method_ref) {
        window.removeEventListener('keydown', method_ref);
        method_ref = null;
        console.log('--- Editor ESC key press to clear media selection cleared ---');

    }
}

// ...existing imports and vars...

export function startResize(event, container, editor, direction) {
    event.preventDefault();
    if (!container || Is_Resizing) return;

    container.setPointerCapture(event.pointerId); // Lock pointer to container for reliable moves on mobile

    Media_Element_Direction.value.CurrentDirection = direction;
    Media_Element_Direction.value.StartX = event.clientX;
    Media_Element_Direction.value.StartY = event.clientY;
    Media_Element_Direction.value.StartWidth = parseFloat(getComputedStyle(container).width) || 0;
    Media_Element_Direction.value.StartHeight = parseFloat(getComputedStyle(container).height) || 0;
    if (Media_Element_Direction.value.PreserveAspectRatio && Media_Element_Direction.value.StartHeight > 0) {
        Media_Element_Direction.value.AspectRatio = Media_Element_Direction.value.StartWidth / Media_Element_Direction.value.StartHeight;
    }

    Is_Resizing = true;
    container.classList.add('resizing');

    if (!Resize_ESC_Key_Press_Method_Refrence) {
        Resize_ESC_Key_Press_Method_Refrence = (e) => {
            if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
                e.preventDefault();
                e.stopPropagation();
                stopResize(container, editor);
            }
        };
        window.addEventListener('keydown', Resize_ESC_Key_Press_Method_Refrence);
    }

    Resizeing_Method_Reference = (e) => doResize(e, container, editor);
    Stop_Resize_Method_Reference = (e) => stopResize(container, editor);

    // Attach to container (with capture) instead of window
    container.addEventListener('pointermove', Resizeing_Method_Reference, { passive: false });
    container.addEventListener('pointerup', Stop_Resize_Method_Reference);
    container.addEventListener('pointercancel', Stop_Resize_Method_Reference);

    document.body.style.userSelect = 'none';
    document.body.style.touchAction = 'none';
    // Remove this: document.body.style.pointerEvents = 'none'; // Can break event delivery on mobile
}

function doResize(event, container, editor) {
    event.preventDefault(); // Block browser gestures (e.g., scroll) on touch
    if (!container || !Is_Resizing) return;

    if (!Media_Element_Direction.value.CurrentDirection) {
        stopResize(container, editor);
        return;
    }

    const dx = event.clientX - Media_Element_Direction.value.StartX;
    const dy = event.clientY - Media_Element_Direction.value.StartY;
    let newWidth = Media_Element_Direction.value.StartWidth;
    let newHeight = Media_Element_Direction.value.StartHeight;
    const dir = Media_Element_Direction.value.CurrentDirection;

    if (dir && dir.includes('right')) newWidth += dx;
    if (dir && dir.includes('left')) newWidth -= dx;
    if (dir && dir.includes('bottom')) newHeight += dy;
    if (dir && dir.includes('top')) newHeight -= dy;

    newWidth = Math.max(Media_Element_Direction.value.Min.width, newWidth);
    newHeight = Math.max(Media_Element_Direction.value.Min.height, newHeight);

    if (Media_Element_Direction.value.PreserveAspectRatio) {
        if (dir && (dir.includes('left') || dir.includes('right'))) {
            newHeight = newWidth / Media_Element_Direction.value.AspectRatio;
        } else {
            newWidth = newHeight * Media_Element_Direction.value.AspectRatio;
        }
    }

    if (Resize_Animation_ID) cancelAnimationFrame(Resize_Animation_ID);
    Resize_Animation_ID = requestAnimationFrame(() => {
        container.style.setProperty('width', `${Math.round(newWidth)}px`, 'important');
        container.style.setProperty('height', `${Math.round(newHeight)}px`, 'important');
    });
}

function stopResize(container, editor) {
    if (!container) return;

    Is_Resizing = false;
    if (Resize_Animation_ID) {
        cancelAnimationFrame(Resize_Animation_ID);
        Resize_Animation_ID = null;
    }

    if (Resizeing_Method_Reference) {
        container.removeEventListener('pointermove', Resizeing_Method_Reference);
        Resizeing_Method_Reference = null;
    }
    if (Stop_Resize_Method_Reference) {
        container.removeEventListener('pointerup', Stop_Resize_Method_Reference);
        container.removeEventListener('pointercancel', Stop_Resize_Method_Reference);
        Stop_Resize_Method_Reference = null;
    }

    Clear_Editor_KeyPress_Media_Selection(Resize_ESC_Key_Press_Method_Refrence);

    document.body.style.userSelect = 'auto';
    document.body.style.touchAction = 'auto';
    // Remove this if you kept it: document.body.style.pointerEvents = 'all';
    container.classList.remove('resizing');

    const newWidth = parseFloat(container.style?.width);
    const newHeight = parseFloat(container.style?.height);

    if (newWidth && newHeight && !isNaN(newWidth) && !isNaN(newHeight))
        editor.commands.updateAttributes('media', { width: Math.round(newWidth), height: Math.round(newHeight) });

    Media_Element_Direction.value.CurrentDirection = null;
}


/* ------------------------------------------------------------- */



// ...existing code...
let Rotation_Method_Reference = null;
let Stop_Rotation_Method_Reference = null;
let Rotation_Resize_Animation_ID = null;
//
let Is_Rotating = false;
let Rotation_State = {
    startAngle: 0,
    startRotation: 0,
    centerX: 0,
    centerY: 0,
    container: null,
    editorRef: null
};


// ...existing code...

export function startRotate(event, container, editor) {
    event.preventDefault();
    event.stopPropagation();
    if (!container || Is_Rotating) return;

    container.setPointerCapture(event.pointerId); // Lock pointer to container

    const rect = container.getBoundingClientRect();
    Rotation_State.centerX = rect.left + rect.width / 2;
    Rotation_State.centerY = rect.top + rect.height / 2;

    const dx = event.clientX - Rotation_State.centerX;
    const dy = event.clientY - Rotation_State.centerY;
    Rotation_State.startAngle = Math.atan2(dy, dx) * (180 / Math.PI);

    const currentRotation = parseFloat(container.getAttribute('data-rotation')) || 0;
    Rotation_State.startRotation = currentRotation;
    Rotation_State.container = container;
    Rotation_State.editorRef = editor;

    Is_Rotating = true;
    Rotation_State.container.classList.add('rotating');

    if (!Rotation_ESC_Key_Press_Method_Refrence) {
        Rotation_ESC_Key_Press_Method_Refrence = (e) => {
            if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
                e.preventDefault();
                e.stopPropagation();
                stopRotate();
            }
        };
        window.addEventListener('keydown', Rotation_ESC_Key_Press_Method_Refrence);
    }

    Rotation_Method_Reference = (e) => doRotate(e);
    Stop_Rotation_Method_Reference = () => stopRotate();

    // Attach to container instead of window
    container.addEventListener('pointermove', Rotation_Method_Reference, { passive: false });
    container.addEventListener('pointerup', Stop_Rotation_Method_Reference);
    container.addEventListener('pointercancel', Stop_Rotation_Method_Reference);

    document.body.style.userSelect = 'none';
}



function doRotate(event) {
    event.preventDefault(); // Block gestures
    if (!Rotation_State.container || !Is_Rotating) return;

    const dx = event.clientX - Rotation_State.centerX;
    const dy = event.clientY - Rotation_State.centerY;
    const ang = Math.atan2(dy, dx) * (180 / Math.PI);

    let delta = ang - Rotation_State.startAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    const newRotation = Rotation_State.startRotation + delta;

    if (Rotation_Resize_Animation_ID) cancelAnimationFrame(Rotation_Resize_Animation_ID);
    Rotation_Resize_Animation_ID = requestAnimationFrame(() => {
        Rotation_State.container.style.setProperty('transform', `rotate(${newRotation}deg)`, 'important');
        Rotation_State.container.setAttribute('data-rotation', newRotation);
    });
}



function stopRotate() {
    if (!Rotation_State.container) return;

    const finalRotation = parseFloat(Rotation_State.container.getAttribute('data-rotation')) || 0;
    try {
        if (Rotation_State.editorRef && Rotation_State.editorRef.commands) {
            Rotation_State.editorRef.commands.updateAttributes('media', { rotation: Math.round(finalRotation) });
        }
    } catch (err) {
        console.warn('Could not persist rotation', err);
    }

    if (Rotation_Method_Reference) {
        Rotation_State.container.removeEventListener('pointermove', Rotation_Method_Reference);
        Rotation_Method_Reference = null;
    }
    if (Stop_Rotation_Method_Reference) {
        Rotation_State.container.removeEventListener('pointerup', Stop_Rotation_Method_Reference);
        Rotation_State.container.removeEventListener('pointercancel', Stop_Rotation_Method_Reference);
        Stop_Rotation_Method_Reference = null;
    }

    Clear_Editor_KeyPress_Media_Selection(Rotation_ESC_Key_Press_Method_Refrence);

    Is_Rotating = false;
    Rotation_State.container.classList.remove('rotating');
    if (Rotation_Resize_Animation_ID) cancelAnimationFrame(Rotation_Resize_Animation_ID);
    Rotation_State.container = null;
    Rotation_State.editorRef = null;
    document.body.style.userSelect = 'auto';
}



export function Remove_Video_Overlay(event) {
    try {
        event.target.classList.add("hide_video_overlay");
        setTimeout(() => event.target.style.display = 'none', 300);
        event.target.previousElementSibling.play();
    } catch (error) {
        console.log(error.message);
    }
}


export function Animate_Visiual_Block_View(html,) {
    try {
        let temp = document.createElement("div");
        temp.innerHTML = html;
        temp.querySelectorAll(".ai-rich-block").forEach((el) => {
            if (!el) return;
            el.style.opacity = 0;
            el.style.transform = 'scale(0)';
            el.style.transition = "all 0.3s ease";
        });
        return temp.innerHTML;
    }
    catch (error) {
        debugError(error, 'Animate_Visiual_Block_View'
        )
    }
}


export function run_visiual_block_animation(el) {
    el.style.opacity = 1;
    el.style.transform = 'scale(1)';
    el.style.transition = "all 0.3s ease";
}



export function Animation_Smoother_For_Edit_And_View_Mode(html) {
    try {

        let temp = document.createElement("div");
        temp.innerHTML = html;
        temp.querySelectorAll("audio, video, img").forEach((el) => {
            if (!el) return;
            if (el.previousElementSibling) {
                el.previousElementSibling.style.display = "block";
                el.previousElementSibling.style.opacity = 1;
                el.previousElementSibling.style.transform = 'scale(1)';
                console.log('Applying Animation Smoother Stage 1 Passed');
                el.style.transform = "scale(0)";
                el.style.opacity = 0;
                el.style.display = "none";
                console.log('Applying Animation Smoother Stage 2 Passed');
            }
            if (el.tagName === "VIDEO") {
                if (!el.nextElementSibling) {
                    const overlay = document.createElement("div");
                    overlay.className = "video_overlay";
                    el.parentNode.insertBefore(overlay, el.nextElementSibling);
                }
                if (el.previousElementSibling) {
                    if (el.nextElementSibling.classList.contains("hide_video_overlay"))
                        el.nextElementSibling.classList.remove("hide_video_overlay");
                    el.nextElementSibling.style.transform = "scale(0)";
                    el.nextElementSibling.style.opacity = 0;
                    el.nextElementSibling.style.display = "none";
                    console.log('Applying Animation Smoother Stage 3 For Videos Passed');
                }
            }
        });
        return temp.innerHTML;
    } catch (error) {
        debugError(error, 'Animation_Smoother_For_Edit_And_View_Mode'
        )
    }
}



// Helper function to mimic runAnimation (with optional abort handling if defined elsewhere)
export async function runAnimation(el, openingNoteInViewMode = false) {
    try {
        if (!el) return;
        if (abort_Controller()) await new Promise((resolve) => setTimeout(resolve, 1000));


        // NEW: Detect and fix disrupted structure before animation
        let wrapper = el.closest('.override_media_position_in_live_editor');
        let mediaType = el.tagName.toLowerCase(); // 'img' or 'audio' (skip others per your note)
        if (wrapper && (mediaType === 'img' || mediaType === 'audio')) {
            let children = Array.from(wrapper.children);
            let loader = children.find(c => c.classList.contains('Upload_Loader_active_media'));
            let hasBadStructure = !el.previousElementSibling || !el.previousElementSibling.classList.contains('Upload_Loader_active_media');
            if (hasBadStructure && loader) {
                console.log('Detected bad structure, fixing...');
                let innerA = null;
                // Case 1: Check for <a> inside wrapper (common bad pattern: loader then <a><img></a>)
                if (loader.nextElementSibling && loader.nextElementSibling.tagName === 'A' && loader.nextElementSibling.contains(el)) {
                    innerA = loader.nextElementSibling;
                }
                // Case 2: If no inner <a>, check if wrapper's parent is <a> and structure inside is bad (e.g., maybe mangled differently)
                else if (wrapper.parentNode && wrapper.parentNode.tagName === 'A') {
                    // If parent is <a> but siblings not correct, treat parent as the <a> to preserve/clone
                    innerA = wrapper.parentNode;
                    // Temporarily unwrap to fix inside
                    let parentA = innerA;
                    while (wrapper.firstChild) {
                        parentA.insertBefore(wrapper.firstChild, wrapper);
                    }
                    parentA.removeChild(wrapper);
                    // Re-assign wrapper (now children are direct under <a>, will rebuild below)
                    wrapper = parentA; // Now treat the <a> as temp wrapper for fixing
                    children = Array.from(wrapper.children);
                    loader = children.find(c => c.classList.contains('Upload_Loader_active_media'));
                }
                // If found an <a> (inner or parent)
                if (innerA) {
                    // Extract media from <a>
                    innerA.removeChild(el);
                    // Insert media right after loader (now siblings)
                    loader.parentNode.insertBefore(el, loader.nextSibling);
                    // Remove the now-empty inner <a> from its parent
                    innerA.parentNode.removeChild(innerA);
                    // Rebuild: Create new wrapper <div> with preserved attributes if needed (but since original wrapper exists, preserve on it)
                    // Create new <a> with same attributes/styles/url and wrap the entire wrapper
                    let newA = document.createElement('a');
                    for (let attr of innerA.attributes) {
                        newA.setAttribute(attr.name, attr.value);
                    }
                    // Copy inline styles from original <a>
                    newA.style.cssText = innerA.style.cssText;
                    // Insert newA before wrapper, then move wrapper inside newA
                    wrapper.parentNode.insertBefore(newA, wrapper);
                    newA.appendChild(wrapper);
                    // Update wrapper reference if we unwrapped earlier (but now newA is outer)
                    let outermost = newA;
                    // Ensure line spacing: Wrap in <p> if not already in a block, and add <br> for space
                    if (outermost.parentNode && !['P', 'DIV'].includes(outermost.parentNode.tagName)) {
                        let pWrapper = document.createElement('p');
                        outermost.parentNode.insertBefore(pWrapper, outermost);
                        pWrapper.appendChild(outermost);
                        outermost = pWrapper;
                    }
                    // Add line space before and after (using <br> for explicit spacing in contenteditable)
                    if (!outermost.previousElementSibling || outermost.previousElementSibling.tagName !== 'BR') {
                        outermost.parentNode.insertBefore(document.createElement('br'), outermost);
                    }
                    if (!outermost.nextElementSibling || outermost.nextElementSibling.tagName !== 'BR') {
                        outermost.parentNode.insertBefore(document.createElement('br'), outermost.nextSibling);
                    }
                } else {
                    // No <a> found but structure bad: Just rebuild siblings (move el after loader if not)
                    if (el !== loader.nextSibling) {
                        loader.parentNode.insertBefore(el, loader.nextSibling);
                    }
                    // Ensure line spacing for non-link case
                    let outermost = wrapper;
                    if (outermost.parentNode && !['P', 'DIV'].includes(outermost.parentNode.tagName)) {
                        let pWrapper = document.createElement('p');
                        outermost.parentNode.insertBefore(pWrapper, outermost);
                        pWrapper.appendChild(outermost);
                        outermost = pWrapper;
                    }
                    // Add <br> before/after
                    if (!outermost.previousElementSibling || outermost.previousElementSibling.tagName !== 'BR') {
                        outermost.parentNode.insertBefore(document.createElement('br'), outermost);
                    }
                    if (!outermost.nextElementSibling || outermost.nextElementSibling.tagName !== 'BR') {
                        outermost.parentNode.insertBefore(document.createElement('br'), outermost.nextSibling);
                    }
                }
                // Optional: Clean up any adjacent empty <p> or <a> from browser mangling (from your logs)
                let prevSib = wrapper.previousElementSibling;
                if (prevSib && prevSib.tagName === 'P' && prevSib.innerHTML.trim() === '<a></a>') {
                    prevSib.remove();
                }
                let nextSib = wrapper.nextElementSibling;
                if (nextSib && nextSib.tagName === 'P' && nextSib.innerHTML.trim() === '') {
                    nextSib.remove();
                }
            }
        }


        console.log("calling animation method");
        await lazyLoadWithAnimation(el, openingNoteInViewMode);
    } catch (error) {
        console.log(error.message);
    }
}

export let Opening_note_In_view_mode_completed = ref(false); // Flag to track if opening note animation in view mode has completed

let timer;
// Helper function to mimic Lazy_Load_With_animation
async function lazyLoadWithAnimation(el, openingNoteInViewMode = false) {
    try {
        if (abort_Controller()) await new Promise((resolve) => setTimeout(resolve, 1000));
        //
        console.log(
            el.previousElementSibling &&
            el.previousElementSibling.classList.contains("Upload_Loader_active_media")
        );
        if (
            el.previousElementSibling &&
            el.previousElementSibling.classList.contains("Upload_Loader_active_media")
        ) {
            el.previousElementSibling.style.transition = "opacity 0.2s ease, transform 0.3s ease";
            el.previousElementSibling.style.opacity = 0;
            el.previousElementSibling.style.transform = "scale(0)";
            await new Promise(r => requestAnimationFrame(r));
            await new Promise((resolve) => setTimeout(resolve, 300));
            el.previousElementSibling.style.display = "none";
            await new Promise(r => requestAnimationFrame(r));
            //
            console.log('Applying Real Animation Stage 1 Passed');
            //
            if (abort_Controller()) await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        if (openingNoteInViewMode) await waitForFlag(Opening_note_In_view_mode_completed); // Wait for the flag to be true before proceeding with the animation
        await new Promise(r => requestAnimationFrame(r));
        //
        el.style.display = 'block';
        await new Promise(r => requestAnimationFrame(r));
        el.style.transition = "opacity 0.2s ease, transform 0.3s ease";
        el.style.transform = "scale(1)";
        el.style.opacity = 1;
        await new Promise(r => requestAnimationFrame(r));
        console.log('Applying Real Animation Stage 2 Passed');
        /* enabling video overlay */
        if (el.tagName === "VIDEO") {
            if (abort_Controller()) await new Promise((resolve) => setTimeout(resolve, 1000));
            if (el.nextElementSibling) {
                el.nextElementSibling.style.display = 'block';
                await new Promise(r => requestAnimationFrame(r));
                el.nextElementSibling.style.transition = "opacity 0.2s ease, transform 0.3s ease";
                el.nextElementSibling.style.transform = "scale(1)";
                el.nextElementSibling.style.opacity = 1;
                await new Promise(r => requestAnimationFrame(r));
                el.nextElementSibling.addEventListener("click", Remove_Video_Overlay);
                console.log('Applying Real Animation Stage 3 for Videos Passed');
            }
        }
        if (timer)
            clearTimeout(timer);
        timer = setTimeout(() => {
            if (editorLenis)
                editorLenis.resize(); // resize lenis scrollbar after add media so it add media height to its scroll bar.
            timer = null;
        }, 400);

    } catch (error) {
        console.log(error.message);
    }
}


function waitForFlag(flagRef) {
    return new Promise((resolve) => {
        // 1. Already true? Resolve immediately
        if (flagRef.value === true) {
            console.log('✅ Flag was already true')
            resolve()
            return
        }

        console.log('⏳ Waiting for flag to become true...')

        // 2. Watch for change
        const stop = watch(
            flagRef,
            (newValue) => {
                if (newValue === true) {
                    console.log('✅ Flag became true → proceeding')
                    stop()           // ← critical: prevent memory leak
                    resolve()
                }
            },
            { immediate: false }   // we already checked initial value
        )
    })
}


export async function animation_for_doc(el) {
    if (
        el.firstElementChild &&
        el.firstElementChild.classList.contains("Upload_Loader_active_media")
    ) {
        el.firstElementChild.style.transition = "opacity 0.2s ease, transform 0.3s ease";
        el.firstElementChild.style.opacity = 0;
        el.firstElementChild.style.transform = "scale(0)";
        await new Promise((resolve) => setTimeout(resolve, 300));
        if (abort_Controller()) await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    el.firstElementChild.style.display = "none";
    await new Promise((resolve) => setTimeout(resolve, 10));
    el.children[1].style.display = 'block';
    await new Promise((resolve) => setTimeout(resolve, 10));
    el.children[1].style.transition = "opacity 0.2s ease, transform 0.3s ease";
    el.children[1].style.transform = "scale(1)";
    el.children[1].style.opacity = 1;
    //
    if (timer)
        clearTimeout(timer);

    timer = setTimeout(() => {
        if (editorLenis)
            editorLenis.resize(); // resize lenis scrollbar after add media so it add media height to its scroll bar.
        timer = null;
    }, 400);
}






export function attachMediaTimeout(element, wrapper, name, timeoutMs = 300000) {
    const loader = wrapper.querySelector(".Upload_Loader");
    let timer = setTimeout(() => fail(), timeoutMs);

    function success() {
        clearTimeout(timer);
        if (loader) loader.style.display = "none";
        runAnimation(element); // your existing animation
    }

    function fail() {
        clearTimeout(timer);
        if (loader) loader.style.display = "none";
        Show_Create_Edit_Model_Warning(
            `Media "${name}" failed to load or timed out.`,
            4000
        );
        setTimeout(() => wrapper.remove(), 5000);
    }

    // Success events
    element.addEventListener("loadeddata", success, { once: true });
    element.addEventListener("loadedmetadata", success, { once: true });
    element.addEventListener("load", success, { once: true }); // for <img>
    // Error event
    element.addEventListener("error", fail, { once: true });
}


export async function Editor_Media_Adding_Parser(editor, order, name, url, Type, Id, loader_Id, media_Source = 'local', Is_Image_From_Pasted_Html_Content = false) {

    const { isTouchFirst } = useTouchDetection();

    try {


        if (Is_Image_From_Pasted_Html_Content) {
            Get_Image_Node_Spec_For_Tiptap.value =
            {
                type: 'media',
                attrs: {
                    id: Id,
                    loaderId: loader_Id,
                    src: url,
                    type: Type,   // lowercase key matches schema
                    order,
                    name,
                    source: media_Source,
                }
            };
            return;
        }

        if (isTouchFirst.value) {
            editor
                .chain()
                .insertContent([
                    { type: 'paragraph' },
                    {
                        type: 'media',
                        attrs: {
                            id: Id,
                            loaderId: loader_Id,
                            src: url,
                            type: Type,
                            order,
                            name,
                            source: media_Source,
                        },
                    },
                    { type: 'paragraph' },
                ])
                .run()
        }
        else {
            editor
                .chain()
                .insertContent([
                    { type: 'paragraph' },
                    {
                        type: 'media',
                        attrs: {
                            id: Id,
                            loaderId: loader_Id,
                            src: url,
                            type: Type,
                            order,
                            name,
                            source: media_Source,
                        },
                    },
                    { type: 'paragraph' },
                ])
                .focus() // ensures editor regains focus
                .run()
        }

    } catch (error) {
        console.log(error.stack);
        debugError(error, 'Method');
    }
}
