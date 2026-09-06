import { ref } from "vue";
import mdit, { highlightHTMLBlock } from "./MarkDown_It";
import { debugError } from "./Global_Error_Handler";           // plugin (IMPORTANT)
import DOMPurify from 'dompurify';
import { editorLenis } from './Scroll_Logic'
import { Show_Create_Edit_Model_Warning } from "./TipTap_Editor";
import { Tiptap_Editor } from "./TipTap_Editor";
import TurndownService from "turndown";
import { useTouchDetection } from "./Is_Touch";

async function Web_Image_pasting_handler(cd, manageMedia_method) {
    try {
        if (cd.items && cd.items.length > 0) {
            const items = Array.from(cd.items);
            const files = items
                .filter(item => item && item.kind === 'file')
                .map(item => item.getAsFile())
                .filter(Boolean);

            if (files.length === 0) return false;

            await Promise.all(files.map(file => manageMedia_method(file, true)));
            return true;
        }
        return false;

    } catch (error) {
        console.log(error.stack);
        debugError(error, 'Method');
    }
}


export let Get_Image_Node_Spec_For_Tiptap = ref({});

async function Web_Html_Image_Handler(temp, manageMedia_method) {

    const imgs = Array.from(temp.querySelectorAll('img'));
    for (const img of imgs) {
        let src = img.getAttribute('src');
        if (!src) continue;

        // Normalize src
        if (src.startsWith('//')) {
            src = 'https:' + src;
        } else if (!src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('data:image/')) {
            // Skip invalid or unsupported src types
            continue;
        }

        let blob;
        try {
            // Unified fetch for both remote and data URIs (fetch handles data: directly)
            const response = await fetch(src, { mode: src.startsWith('data:') ? 'no-cors' : 'cors' });
            if (!response.ok) continue;
            blob = await response.blob();

            if (!blob || !blob.type.startsWith('image/')) continue;

            // Filter: Check if real image (not icon/placeholder) by dimensions
            let objectUrl = URL.createObjectURL(blob);
            let testImg = new Image();
            testImg.src = objectUrl;
            await new Promise((resolve, reject) => {
                if (testImg.complete) {
                    return testImg.naturalWidth ? resolve() : reject(new Error("Broken image"));
                }
                testImg.onload = () => resolve();
                testImg.onerror = () => reject(new Error("Image failed to load"));
            });
            const { width, height } = testImg;
            URL.revokeObjectURL(objectUrl);
            testImg = null;
            objectUrl = null;

            if (width < 100 || height < 100) { // Arbitrary threshold for "real" image vs icon (adjust as needed)
                console.log('---- Skipping small image/icon:', src);
                img?.remove();
                continue;
            }

            // Use alt for filename if available
            const alt = img.getAttribute('alt')?.trim().replace(/\s+/g, '_') || 'unnamed';
            const ext = blob.type.split('/')[1] || 'png';
            const fileName = `pasted_image_${alt}_${ext}`;
            const file = new File([blob], fileName, { type: blob.type });

            await manageMedia_method(file, true, true);

            let node_Spec = Get_Image_Node_Spec_For_Tiptap.value;
            // Create new div with proper data attributes
            let div = document.createElement('div');
            div.className = 'override_media_position_in_live_editor';
            div.setAttribute('data-id', node_Spec.attrs.id);
            div.setAttribute('data-loader-id', `loader_${node_Spec.attrs.id}`); // Assuming your loaderId pattern
            div.setAttribute('data-src', node_Spec.attrs.src || src); // Blob URL from storage or original
            div.setAttribute('data-type', 'image');
            div.setAttribute('data-order', node_Spec.attrs.order || 1);
            div.setAttribute('data-name', node_Spec.attrs.name || 'unnamed');
            div.setAttribute('data-source', 'local'); // Since pasted/fetched

            // Replace img with div
            img.parentNode.replaceChild(div, img);
            //
            Get_Image_Node_Spec_For_Tiptap.value = {}; // Reset for next image (if any)
            console.log('pasted html image successfully replaced with structured image');
        } catch (e) {
            console.error('Failed to process image:', src, e);
        }
    }
    return temp.innerHTML;
}


export let Paste_Procssing = ref(false);
let Hide_Kb_on_touch_devices = ref(false);

export async function Paste(cd, manageMedia_method, event) {


    if (Paste_Procssing.value) {
        console.warn("Paste blocked: already processing.");
        Show_Create_Edit_Model_Warning('Paste blocked: already processing.', 3000);
        return;
    }

    Paste_Procssing.value = true;


    try {

        if (cd.files && cd.files.length > 0) {
            const filesHandled = await Web_Image_pasting_handler(cd, manageMedia_method);
            console.log("Pure Image Files Handled: " + filesHandled);
        }

        let html = cd.getData("text/html") || "";
        const md = cd.getData("text/markdown") || "";
        const text = cd.getData("text/plain") || "";

        if (!html && !md && !text) {
            Show_Create_Edit_Model_Warning("Nothing to paste.", 3000);
            return; // nothing else to do
        }

        await new Promise(r => setTimeout(r, 40));

        // NEW: Fix malformed HTML using DOMParser (if html is present)
        if (html) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            html = doc.body.innerHTML;  // This outputs the repaired HTML
        }

        let Is_Valid = await ValidatePasteLimits(html, md, text);

        if (!Is_Valid) return;

        Tiptap_Editor.setEditable(false); // Temporarily disable editing during paste

        console.log('\n@@@@@@@@@\nRaw Text: ' + text + '\n@@@@@@@@@@\nRaw Markdown: ' + md + '\n@@@@@@\nRaw Html: ' + html + '\n@@@@@@@@@');

        let toInsert = "";
        if (html && html.length >= 4) {
            toInsert = mdit.render(html);
            console.log('Final cleaned HTML: ', toInsert);
        } else if (md) {
            toInsert = mdit.render(md);
            console.log('Final converted Markdown to HTML: ', toInsert);
        } else if (text) {
            toInsert = mdit.render(text);
            console.log('Final converted Plain-Text to HTML: ', toInsert);
        }

        if (!toInsert) return;

        let clean_html = DOMPurify.sanitize(toInsert);
        let intent_html = await HandleHtml(clean_html, manageMedia_method);
        let final_html = highlightHTMLBlock(intent_html);

        console.log('\nFinal Inserted Html: ' + final_html + '\n');

        if (Hide_Kb_on_touch_devices.value) Tiptap_Editor.chain().insertContent(final_html).run();
        else Tiptap_Editor.chain().insertContent(final_html).focus().run();

        if (editorLenis) {
            editorLenis.resize();
        }


    } catch (error) {
        console.error("Paste error:", error);
    } finally {
        Paste_Procssing.value = false;
        Hide_Kb_on_touch_devices.value = false;
        Tiptap_Editor.setEditable(true); // Ensure editor is editable after paste
    }
}


async function ValidatePasteLimits(html = "", md = "", text = "") {

    let maxLines = 6500;
    let temp_md = "";

    // HTML -> Markdown
    if (html && html.trim().length > 4) {
        let md_to_html = new TurndownService();
        const html_md = md_to_html.turndown(html);
        temp_md += html_md;
    }
    // Existing markdown
    if (md && md.trim().length > 0) {
        if (temp_md.length > 0) temp_md += "\n\n";
        temp_md += md;
    }
    // Plain text
    if (text && text.trim().length > 0) {
        if (temp_md.length > 0) temp_md += "\n\n";
        temp_md += text;
    }

    temp_md = temp_md.trim();
    const md_lines = temp_md.length > 0 ? temp_md.split('\n').length : 0;
    console.log("Pasted Lines: ", + md_lines);

    if (md_lines > 1000) {
        const { isTouchFirst } = useTouchDetection();
        if (isTouchFirst.value) {
            Tiptap_Editor.commands.blur();
            Hide_Kb_on_touch_devices.value = true;
            await new Promise(r => setTimeout(r, 300));
        }
    }

    // Line limit
    if (md_lines > maxLines) {
        Show_Create_Edit_Model_Warning(`Paste exceeds limit. (Max ${maxLines} Lines are allowed).`, 5000);
        return false;
    }
    return true;
}




function Enforce_Dynamic_Max_Font_Size_For_Too_Large_Elemtns(el) {
    try {
        const viewportWidth = window.innerWidth;

        const anchors = [
            { width: 320, max: 50 },
            { width: 1920, max: 200 },
            { width: 3840, max: 300 }
        ];

        let dynamicMax = anchors[anchors.length - 1].max; // Default to highest
        for (let i = 0; i < anchors.length - 1; i++) {
            if (viewportWidth <= anchors[i + 1].width) {
                const low = anchors[i];
                const high = anchors[i + 1];
                dynamicMax = low.max + (high.max - low.max) * (viewportWidth - low.width) / (high.width - low.width);
                break;
            }
        }
        if (viewportWidth < anchors[0].width) {
            dynamicMax = anchors[0].max;
        }

        const currentFontSize = parseInt(el.style.fontSize);

        if (!isNaN(currentFontSize) && currentFontSize > dynamicMax) {
            el.style.fontSize = dynamicMax + "px";
            //
            console.log('Enforcer Applied To ' + el?.tagName + ' Of Font Size ' + currentFontSize + ' With dynamicMax Size Of ' + dynamicMax);
        }
    } catch (error) {
        console.log(error.stack);
        debugError(error, 'Method');
    }
}


/* 
// old logic but working well except nested empty li and table cells erasing with intelligence
async function HandleHtml(html, manageMedia_method) {

    try {

        if (html.length > 1e6) { // Edge: Limit huge pastes
            console.warn('Pasted content too large; truncating');
            Show_Create_Edit_Model_Warning('Pasted Content Too Large; Cutting It Down', 3000);
            html = html.slice(0, 1e6) + '... [truncated]';
        }

        const temp = document.createElement("div");
        temp.innerHTML = html;

        cleanTextNodes(temp);


        /// preserve our some stlyes to these tags.
        const Dont_apply_some_styles_to_these_tags = ['code', 'pre', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'th', 'strong', 'em', 'u', 's'];
        /// Remove troublesome elements
        const Tags_To_Remove = ['script', 'noscript', 'style', 'iframe', 'embed', 'object', 'applet', 'canvas', 'form', 'input', 'button', 'select', 'textarea', 'head', 'meta', 'title', 'base', 'html', 'body', 'template', 'marquee', 'blink', 'font', 'center'];
        ///
        const voidTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'audio', 'video', 'a', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
        ///
        const blockTags = ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'section', 'article', 'aside', 'header', 'footer', 'nav', 'main', 'figure'];


        // Remove problematic styles that could cause overflow
        // Pre-clean: Remove non-standard attrs and !important
        temp.querySelectorAll('*').forEach(el => {
            // Remove mso- and other vendor attrs
            for (let i = el.attributes.length - 1; i >= 0; i--) {
                const attr = el.attributes[i].name.toLowerCase();
                if (attr.startsWith('mso-') || attr.startsWith('v:') || attr.startsWith('o:') || attr.startsWith('on') || ['class', 'id', 'xmlns', 'data-', 'srcset', 'sizes'].some(prefix => attr.startsWith(prefix)) || attr.includes('xml:')) {
                    el.removeAttribute(attr);
                }
            }

            // Strip !important from style
            if (el.style.cssText) {
                el.style.cssText = el.style.cssText.replace(/!important/g, '');
            }
        });


        // Main loop: Reset all troublesome styles
        temp.querySelectorAll("*").forEach(el => {
            const tag = el?.tagName?.toLowerCase();
            const style = el.style;

            // Positioning/Layout
            if (['absolute', 'fixed', 'sticky'].includes(style.position)) style.position = "static";
            style.top = style.right = style.bottom = style.left = "";
            style.zIndex = "";
            style.float = "none"; // Or inherit
            style.clear = "";

            // Display/Visibility
            style.display = ""; // Reverts to default
            style.visibility = "visible";
            style.opacity = "1";
            style.clip = style.clipPath = "";

            // Sizing
            style.width = style.minWidth = style.height = style.minHeight = '';
            style.maxWidth = '100%';
            style.maxHeight = 'auto';
            style.boxSizing = 'border-box'; // Consistent sizing
            style.aspectRatio = style.resize = '';

            // Overflow
            if (tag !== 'pre' || tag !== 'code') {
                style.overflow = style.overflowX = style.overflowY = "visible";
            }
            style.textOverflow = "";

            // Spacing/Alignment
            style.margin = style.marginTop = style.marginRight = style.marginBottom = style.marginLeft = "";
            style.padding = style.paddingTop = style.paddingRight = style.paddingBottom = style.paddingLeft = "";
            style.textAlign = style.verticalAlign = "inherit";
            style.lineHeight = "inherit";


            // Text/Typography
            if (!Dont_apply_some_styles_to_these_tags.includes(tag)) { // Expanded your allowlist
                style.color = style.background = style.backgroundColor = style.fontSize = style.fontFamily =
                    style.fontWeight = style.fontStyle = style.fontVariant = "inherit";
            }
            //
            if (tag === 'code') {
                if (!el.closest("pre") && el.textContent.trim() !== "") {
                    el.classList.add("btn_inserted_code");
                }
            }

            if ((tag === 'span' || tag === 'div') && !el.hasAttributes() && !el.textContent.trim()) {
                el.remove();
            }


            if (Dont_apply_some_styles_to_these_tags.includes(tag)) { // Expanded your allowlist
                Enforce_Dynamic_Max_Font_Size_For_Too_Large_Elemtns(el);
            }

            style.textDecoration = style.textTransform = style.textShadow = style.letterSpacing = style.wordSpacing = "";
            style.whiteSpace = "";
            style.wordBreak = style.hyphens = style.overflowWrap = "";
            style.direction = style.writingMode = "inherit";

            // Borders/Outlines
            style.border = style.borderWidth = style.borderStyle = style.borderColor = style.borderRadius = "";
            style.outline = "";
            style.boxShadow = "";

            // Transforms/Animations
            style.transform = style.transformOrigin = "";
            style.transition = style.animation = "";

            // Interaction
            style.cursor = "";
            style.pointerEvents = "auto";
            style.userSelect = "text"; // Enable selection
            style.touchAction = "";

            // Vendor/Legacy
            // Already handled in pre-clean; add more if needed, e.g., style.filter = "";
            style.filter = style.willChange = style.resize = style.content = style.quotes = "";

            // Figures (your existing)
            if (tag === 'figure' || el.closest('figure')) {
                style.margin = 'auto';
            }

            if (Tags_To_Remove.includes(tag))
                el.remove();

            //
            if (tag.startsWith('o:') || tag.startsWith('w:') || tag.startsWith('v:') || tag.startsWith('m:') || tag.startsWith('gdocs:')) {
                el.replaceWith(...el.childNodes);
            }
            //
        });

        temp.querySelectorAll('[class^="Mso"], [class*="gmail-"]').forEach(el => {
            el.replaceWith(...el.childNodes);
        });


        const elements = Array.from(temp.querySelectorAll('*')).reverse();
        elements.forEach(el => {
            const tag = el?.tagName?.toLowerCase();


            // Recheck textContent after text clean
            const trimmedContent = el.textContent.replace(/\s+/g, ' ').trim();



            if (trimmedContent === '') { // No meaningful text (whitespace collapsed)
                if (el.children.length === 0) { // Leaf (no voids/kept kids)
                    if (!voidTags.includes(tag)) {
                        if (blockTags.includes(tag)) {
                            // Add <br> only if needed for editability (e.g., not between lists)
                            if (!el.previousSibling || !el.nextSibling || !blockTags.includes(el.previousSibling?.tagName?.toLowerCase())) {
                                const br = document.createElement('br');
                                el.appendChild(br);
                            } else {
                                el.remove(); // Remove redundant empty block
                            }
                        } else {
                            el.remove(); // Inline empty
                        }
                    }
                }
            }
        });

        // New: Collapse consecutive <br> or empty blocks
        temp.querySelectorAll('br + br, div + div:empty, p + p:empty', 'li + li:empty').forEach(extra => extra.remove());

        // Final normalize
        temp.normalize();



        // normalize HR.
        const potentialHrs = temp.querySelectorAll(
            'hr, [style*="border-top"], [style*="border-bottom"], [style*="height: 0"], [style*="height: 1px"], [style*="height: 2px"], div[class*="separator"], div[class*="divider"], div[role="separator"]'
        );

        potentialHrs.forEach(el => {
            // Check if it truly acts like an HR (e.g., thin height, full-width border, no content)
            const computedStyle = window.getComputedStyle(el);
            const isHrLike = (el?.tagName?.toLowerCase() === 'hr' ||
                (computedStyle.borderTopWidth !== '0px' || computedStyle.borderBottomWidth !== '0px') &&
                (computedStyle.height === '0px' || computedStyle.height === '1px' || computedStyle.height === 'auto' && !el.textContent.trim()) &&
                !el.querySelector('img, video, audio, document, .document') // Ignore if it has media
            );

            if (isHrLike) {
                const hr = document.createElement('div');
                hr.className = 'hr-wrapper'; // For CSS

                const hardline = document.createElement('span');
                hardline.className = 'custom-hr';
                hardline.contentEditable = false;

                hr.appendChild(hardline);
                // Optionally preserve some styles if desired, e.g., customHr.style.borderTopColor = computedStyle.borderTopColor;
                el.replaceWith(hr);
            }
        });



        // Fix all links
        temp.querySelectorAll("a").forEach(a => {
            a.setAttribute("target", "_blank");
            a.setAttribute("rel", "noopener noreferrer");
        });


        // Wrap tables
        temp.querySelectorAll("table").forEach(table => {
            // Create wrapper
            const wrapper = document.createElement("div");
            wrapper.className = "tableWrapper";

            // Replace table with wrapper
            table.replaceWith(wrapper);
            wrapper.appendChild(table);

            // Helper: create empty line <div><br></div>
            const createEmptyLine = () => {
                const div = document.createElement("div");
                div.appendChild(document.createElement("br"));
                return div;
            };

            // Insert empty line before wrapper if not already present
            if (!wrapper.previousSibling || wrapper.previousSibling?.tagName !== "DIV" || wrapper.previousSibling.innerHTML.trim() !== "<br>") {
                wrapper.parentNode.insertBefore(createEmptyLine(), wrapper);
            }

            // Insert empty line after wrapper if not already present
            if (!wrapper.nextSibling || wrapper.nextSibling?.tagName !== "DIV" || wrapper.nextSibling.innerHTML.trim() !== "<br>") {
                wrapper.parentNode.insertBefore(createEmptyLine(), wrapper.nextSibling);
            }
        });


        // Enable checkboxes
        temp.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.removeAttribute("disabled");
        });

        return await Web_Html_Image_Handler(temp, manageMedia_method);

    } catch (error) {
        console.log(error);
    }
} 
*/

async function HandleHtml(html, manageMedia_method) {
    try {
        if (html.length > 1e6) {
            console.warn('Pasted content too large; truncating');
            Show_Create_Edit_Model_Warning('Pasted Content Too Large; Cutting It Down', 3000);
            html = html.slice(0, 1e6) + '... [truncated]';
        }

        const temp = document.createElement("div");
        temp.innerHTML = html;

        if (typeof cleanTextNodes === 'function') cleanTextNodes(temp);

        const Dont_apply_some_styles_to_these_tags = ['code', 'pre', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'th', 'strong', 'em', 'u', 's'];
        const Tags_To_Remove = ['script', 'noscript', 'style', 'iframe', 'embed', 'object', 'applet', 'canvas', 'form', 'input', 'button', 'select', 'textarea', 'head', 'meta', 'title', 'base', 'html', 'body', 'template', 'marquee', 'blink', 'font', 'center'];

        temp.querySelectorAll('*').forEach(el => {
            for (let i = el.attributes.length - 1; i >= 0; i--) {
                const attr = el.attributes[i].name.toLowerCase();
                if (attr.startsWith('mso-') || attr.startsWith('v:') || attr.startsWith('o:') || attr.startsWith('on') || ['class', 'id', 'xmlns', 'data-', 'srcset', 'sizes'].some(prefix => attr.startsWith(prefix)) || attr.includes('xml:')) {
                    el.removeAttribute(attr);
                }
            }
            if (el.style.cssText) el.style.cssText = el.style.cssText.replace(/!important/g, '');
        });

        const potentialHrs = temp.querySelectorAll('hr, [style*="border-top"], [style*="border-bottom"], [style*="height: 0"], [style*="height: 1px"], [style*="height: 2px"], div[class*="separator"], div[class*="divider"], div[role="separator"]');
        potentialHrs.forEach(el => {
            const computedStyle = window.getComputedStyle(el);
            const isHrLike = (el?.tagName?.toLowerCase() === 'hr' ||
                (computedStyle.borderTopWidth !== '0px' || computedStyle.borderBottomWidth !== '0px') &&
                (computedStyle.height === '0px' || computedStyle.height === '1px' || computedStyle.height === 'auto' && !el.textContent.trim()) &&
                !el.querySelector('img, video, audio, document, .document')
            );

            if (isHrLike) {
                const hr = document.createElement('div');
                hr.className = 'hr-wrapper';
                const hardline = document.createElement('span');
                hardline.className = 'custom-hr';
                hardline.contentEditable = false;
                hr.appendChild(hardline);
                el.replaceWith(hr);
            }
        });

        temp.querySelectorAll("*").forEach(el => {
            const tag = el?.tagName?.toLowerCase();
            const style = el.style;

            if (['absolute', 'fixed', 'sticky'].includes(style.position)) style.position = "static";
            style.top = style.right = style.bottom = style.left = style.zIndex = style.clear = "";
            style.float = "none";
            style.display = style.clip = style.clipPath = "";
            style.visibility = "visible";
            style.opacity = "1";
            style.width = style.minWidth = style.height = style.minHeight = style.aspectRatio = style.resize = '';
            style.maxWidth = '100%';
            style.maxHeight = 'auto';
            style.boxSizing = 'border-box';

            if (tag !== 'pre' && tag !== 'code') style.overflow = style.overflowX = style.overflowY = "visible";
            style.textOverflow = style.margin = style.marginTop = style.marginRight = style.marginBottom = style.marginLeft = "";
            style.padding = style.paddingTop = style.paddingRight = style.paddingBottom = style.paddingLeft = "";
            style.textAlign = style.verticalAlign = style.lineHeight = "inherit";

            if (!Dont_apply_some_styles_to_these_tags.includes(tag)) {
                style.color = style.background = style.backgroundColor = style.fontSize = style.fontFamily = style.fontWeight = style.fontStyle = style.fontVariant = "inherit";
            }

            if (tag === 'code' && !el.closest("pre") && el.textContent.trim() !== "") el.classList.add("btn_inserted_code");
            if (Dont_apply_some_styles_to_these_tags.includes(tag) && typeof Enforce_Dynamic_Max_Font_Size_For_Too_Large_Elemtns === 'function') {
                Enforce_Dynamic_Max_Font_Size_For_Too_Large_Elemtns(el);
            }

            style.textDecoration = style.textTransform = style.textShadow = style.letterSpacing = style.wordSpacing = style.whiteSpace = "";
            style.wordBreak = style.hyphens = style.overflowWrap = "";
            style.direction = style.writingMode = "inherit";
            style.border = style.borderWidth = style.borderStyle = style.borderColor = style.borderRadius = "";
            style.outline = style.boxShadow = style.transform = style.transformOrigin = style.transition = style.animation = "";
            style.cursor = style.touchAction = style.filter = style.willChange = style.content = style.quotes = "";
            style.pointerEvents = "auto";
            style.userSelect = "text";

            if (tag === 'figure' || el.closest('figure')) style.margin = 'auto';
            if (Tags_To_Remove.includes(tag)) {
                el.remove();
            }
            if (tag.startsWith('o:') || tag.startsWith('w:') || tag.startsWith('v:') || tag.startsWith('m:') || tag.startsWith('gdocs:')) {
                el.replaceWith(...el.childNodes);
            }
        });

        temp.querySelectorAll('[class^="Mso"], [class*="gmail-"]').forEach(el => el.replaceWith(...el.childNodes));

        // ====================================================================
        // AGGRESSIVE RECURSIVE DEEP PRUNER & EMPTY TABLE CELL CLEANER
        // ====================================================================
        const isElementEmpty = (el) => {
            if (!el) return false;
            const preserved = 'img, video, audio, iframe, canvas, svg, hr, .hr-wrapper, .custom-hr, input, button';
            if (el.matches(preserved) || el.querySelector(preserved)) return false;

            const text = el.textContent.replace(/[\s\u200B-\u200D\uFEFF\u00A0\u2028\u2029]+/g, '');
            if (text.length > 0) return false;

            return true;
        };

        let prunedSomething = true;
        let loopCount = 0;
        const MAX_LOOPS = 15;

        while (prunedSomething && loopCount < MAX_LOOPS) {
            prunedSomething = false;
            loopCount++;

            const elements = Array.from(temp.querySelectorAll('*')).reverse();

            for (const el of elements) {
                if (!temp.contains(el)) continue;
                const tag = el.tagName.toLowerCase();

                // Handle Tables and Empty Cells explicitly
                if (['td', 'th'].includes(tag)) {
                    if (isElementEmpty(el)) {
                        // If cell has internal trash (like empty paragraphs/lists), clear it out entirely
                        if (el.innerHTML !== '') {
                            el.innerHTML = '';
                            prunedSomething = true;
                        }
                    }
                    continue;
                }

                // Clean up empty rows if all cells inside them are completely empty
                if (tag === 'tr') {
                    const cells = Array.from(el.querySelectorAll('td, th'));
                    if (cells.length > 0 && cells.every(cell => isElementEmpty(cell))) {
                        el.remove();
                        prunedSomething = true;
                    }
                    continue;
                }

                if (isElementEmpty(el)) {
                    if (['li', 'ul', 'ol'].includes(tag)) {
                        el.remove();
                        prunedSomething = true;
                    }
                    else if (el.closest('li, ul, ol, td, th')) {
                        el.remove();
                        prunedSomething = true;
                    }
                    else if (['span', 'a', 'b', 'i', 'strong', 'em', 'u', 's', 'code', 'pre', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
                        el.remove();
                        prunedSomething = true;
                    }
                    else if (['p', 'div', 'section', 'article'].includes(tag)) {
                        if (!el.querySelector('br')) {
                            el.remove();
                            prunedSomething = true;
                        }
                    }
                }
            }
        }

        // Clean up empty tables left over after row removals
        temp.querySelectorAll('table').forEach(table => {
            if (!table.querySelector('tr')) {
                table.remove();
            }
        });

        // ====================================================================
        // TIPTAP & TRAILING SPACE ZAPPER
        // ====================================================================
        let spaceCount = 0;
        Array.from(temp.children).forEach(el => {
            if (isElementEmpty(el)) {
                spaceCount++;
                if (spaceCount > 1) {
                    el.remove();
                }
            } else {
                spaceCount = 0;
            }
        });

        while (temp.lastElementChild && isElementEmpty(temp.lastElementChild)) {
            temp.lastElementChild.remove();
        }

        temp.normalize();

        temp.querySelectorAll("a").forEach(a => {
            a.setAttribute("target", "_blank");
            a.setAttribute("rel", "noopener noreferrer");
        });

        temp.querySelectorAll("table").forEach(table => {
            const wrapper = document.createElement("div");
            wrapper.className = "tableWrapper";
            table.replaceWith(wrapper);
            wrapper.appendChild(table);

            const createEmptyLine = () => {
                const div = document.createElement("div");
                div.appendChild(document.createElement("br"));
                return div;
            };

            if (!wrapper.previousSibling || wrapper.previousSibling?.tagName !== "DIV" || wrapper.previousSibling.innerHTML.trim() !== "<br>") {
                wrapper.parentNode.insertBefore(createEmptyLine(), wrapper);
            }
            if (!wrapper.nextSibling || wrapper.nextSibling?.tagName !== "DIV" || wrapper.nextSibling.innerHTML.trim() !== "<br>") {
                wrapper.parentNode.insertBefore(createEmptyLine(), wrapper.nextSibling);
            }
        });

        temp.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.removeAttribute("disabled"));

        return await Web_Html_Image_Handler(temp, manageMedia_method);

    } catch (error) {
        console.error('[Sanitizer] CRITICAL ERROR:', error);
    }
}


function cleanTextNodes(node) {
    try {
        if (node.nodeType === Node.TEXT_NODE) {
            // Collapse whitespace: Multiple spaces/newlines/nbsp to single space; trim ends
            node.textContent = node.textContent
                .replace(/&nbsp;/g, ' ') // Convert nbsp to space
                .replace(/\u200B|\u200C|\u200D|\uFEFF/g, '') // Remove zero-width spaces
                .replace(/[^\S\n\r]+/g, ' ') // remove tabs and multiple spaces but preserve newlines to maintain structure.
                .trim(); // Trim leading/trailing
            if (node.textContent === '') node.remove(); // Empty text node
        } else {
            for (let child = node.firstChild; child; child = child.nextSibling) {
                cleanTextNodes(child);
            }
        }
    } catch (error) {
        console.log(error.stack);
        debugError(error, 'Method');
    }
}