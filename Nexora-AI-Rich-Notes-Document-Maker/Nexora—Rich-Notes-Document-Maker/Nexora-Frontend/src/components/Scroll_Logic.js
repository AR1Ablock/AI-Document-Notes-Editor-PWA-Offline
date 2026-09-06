import Lenis from "lenis";
import { editor, View_Note_Page_UI } from "./TipTap_Editor";
import { debugError } from "./Global_Error_Handler";

export let editorLenis = null;
export let viewLenis = null;
export let editorRafId = null;
export let viewRafId = null;

export function initializeLenisScroll() {

    try {
        let Editor_Element = editor.value.$el.firstElementChild;
        // Editor Lenis (contenteditable - enable keyboard optionally, as it may interfere with editing)
        if (editor.value.$el) {
            editorLenis = new Lenis({
                wrapper: Editor_Element,
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                direction: "vertical",
                gestureDirection: "vertical",
                lerp: 0.085,                    // ← add this
                smooth: true,
                mouseMultiplier: 1,
                smoothTouch: true, // Or true if you want enhanced touch
                touchMultiplier: 2,
                infinite: false,
            });

            editorRafId = requestAnimationFrame(editorRaf);

            Editor_Element.addEventListener(
                "keydown",
                handleEditorKeyboardScroll.bind(null, editorLenis, Editor_Element)
            );

            Editor_Element.addEventListener("load", resize_lenis_scroll_On_media_Adition);
        }

        /////

        if (View_Note_Page_UI.value) {
            View_Note_Page_UI.value.tabIndex = 0; // Allows focus without tabindex="-1" hiding it

            viewLenis = new Lenis({
                wrapper: View_Note_Page_UI.value,
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                direction: "vertical",
                gestureDirection: "vertical",
                lerp: 0.085,                    // ← add this
                smooth: true,
                mouseMultiplier: 1,
                smoothTouch: true,
                touchMultiplier: 2,
                infinite: false,
            });

            viewRafId = requestAnimationFrame(viewRaf);

            View_Note_Page_UI.value.addEventListener(
                "keydown",
                handleViewKeyboardScroll.bind(null, viewLenis, View_Note_Page_UI.value)
            );
        }

        // Global load listener: only trigger if the loaded element is inside the wrapper


    } catch (error) {
        console.log(error.stack);
        debugError(error, 'Method');
    }
};



function editorRaf(time) {
    try {
        editorLenis.raf(time);
        editorRafId = requestAnimationFrame(editorRaf);
    } catch (error) {
        console.log(error.stack);
        debugError(error, 'Method');
    }
}

function viewRaf(time) {
    try {
        viewLenis.raf(time);
        viewRafId = requestAnimationFrame(viewRaf);
    } catch (error) {
        console.log(error.stack);
        debugError(error, 'Method');
    }
}


export function resize_lenis_scroll_On_media_Adition(e) {
    try {
        const el = e.target;
        if (
            ["IMG", "VIDEO", "AUDIO", "IFRAME", "OBJECT"].includes(el.tagName) ||
            el.closest(".override_media_position_in_live_editor") || el.closest(".ai-rich-block")
        ) {
            editorLenis.resize();
        }
    } catch (error) {
        console.log(error.stack);
        debugError(error, 'Method');
    }
}



function computeBuffer(wrapperElement) {
    const lh = parseFloat(getComputedStyle(wrapperElement).lineHeight);
    const base = !isNaN(lh) ? lh : Math.max(parseFloat(getComputedStyle(wrapperElement).fontSize) * 1.25 || 16, 16);
    return base * 1.5;
};


const getAccurateCaretRect = () => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount || !sel.isCollapsed) return null;
    const range = sel.getRangeAt(0).cloneRange(); // Clone to avoid mutating original
    const tempSpan = document.createElement('span');
    tempSpan.appendChild(document.createTextNode('\u200b')); // Zero-width space for rect
    range.insertNode(tempSpan);
    const rect = tempSpan.getBoundingClientRect();
    tempSpan.parentNode.removeChild(tempSpan);
    range.startContainer.normalize(); // Clean up any text node splits
    return rect;
};

function ensureCaretVisible(lenisInstance, wrapperElement){
    const rect = getAccurateCaretRect();
    if (!rect) return;

    const wrapperRect = wrapperElement.getBoundingClientRect();
    const buffer = computeBuffer(wrapperElement);

    if (rect.bottom > wrapperRect.bottom - buffer) {
        const delta = rect.bottom - (wrapperRect.bottom - buffer) + 8;
        lenisInstance.scrollTo(lenisInstance.scroll + delta, { duration: 0.25, easing: (t) => t * (2 - t) });
    } else if (rect.top < wrapperRect.top + buffer) {
        const delta = (wrapperRect.top + buffer) - rect.top + 8;
        lenisInstance.scrollTo(lenisInstance.scroll - delta, { duration: 0.25, easing: (t) => t * (2 - t) });
    }
};


// ==================== EDITOR KEYBOARD (contenteditable - keep caret logic) ====================
export function handleEditorKeyboardScroll(lenisInstance, wrapperElement, event) {
    try {
        if (!wrapperElement.contains(document.activeElement)) return;

        const key = event.key;

        // ───── Tab ─────
        if (key === "Tab") {
            event.preventDefault();
            event.stopPropagation();
            const tabText = "    ";
            document.execCommand('insertText', false, tabText);
            requestAnimationFrame(() => ensureCaretVisible(lenisInstance, wrapperElement));
            return;
        }

        // ───── Page / Home / End ─────
        switch (key) {
            case "PageDown":
                event.preventDefault();
                lenisInstance.scrollTo(lenisInstance.scroll + wrapperElement.clientHeight * 0.9, { duration: 0.3 });
                return;
            case "PageUp":
                event.preventDefault();
                lenisInstance.scrollTo(lenisInstance.scroll - wrapperElement.clientHeight * 0.9, { duration: 0.3 });
                return;
            case "Home":
                event.preventDefault();
                lenisInstance.scrollTo(0, { duration: 0.5 });
                return;
            case "End":
                event.preventDefault();
                lenisInstance.scrollTo("bottom", { duration: 0.5 });
                return;
        }

        // ───── ArrowUp / ArrowDown ─────
        if (key === "ArrowUp" || key === "ArrowDown") {
            requestAnimationFrame(() => ensureCaretVisible(lenisInstance, wrapperElement));
            return;
        }
    } catch (error) {
        console.log(error.stack);
        debugError(error, 'Method');
    }
}

// ==================== VIEW KEYBOARD (read-only - NO caret) ====================
export function handleViewKeyboardScroll(lenisInstance, wrapperElement, event) {
    try {
        if (!wrapperElement.contains(document.activeElement)) return;

        const key = event.key;

        // ───── ArrowUp / ArrowDown ───── (this was the problematic part)
        if (key === "ArrowUp" || key === "ArrowDown") {
            event.preventDefault();                    // ← CRITICAL: stop native scroll fight

            const step = getLineHeight(wrapperElement) || 60; // smart step
            const delta = key === "ArrowDown" ? step : -step;

            lenisInstance.scrollTo(lenisInstance.scroll + delta, {
                duration: 0.1,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            });
            return;
        }

        // ───── Page / Home / End ───── (same as before)
        switch (key) {
            case "PageDown":
                event.preventDefault();
                lenisInstance.scrollTo(lenisInstance.scroll + wrapperElement.clientHeight * 0.9, { duration: 0.3 });
                return;
            case "PageUp":
                event.preventDefault();
                lenisInstance.scrollTo(lenisInstance.scroll - wrapperElement.clientHeight * 0.9, { duration: 0.3 });
                return;
            case "Home":
                event.preventDefault();
                lenisInstance.scrollTo(0, { duration: 0.5 });
                return;
            case "End":
                event.preventDefault();
                lenisInstance.scrollTo("bottom", { duration: 0.5 });
                return;
        }
    } catch (error) {
        console.log(error.stack);
        debugError(error, 'Method');
    }
}

// Tiny helper for nice line-by-line scrolling in View
function getLineHeight(element) {
    const style = getComputedStyle(element);
    const lh = parseFloat(style.lineHeight);
    return !isNaN(lh) && lh > 0 ? lh : parseFloat(style.fontSize) * 1.6 || 58;
}