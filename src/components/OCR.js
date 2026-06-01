import { ref } from 'vue';
import { Show_Create_Edit_Model_Warning, Tiptap_Editor } from './TipTap_Editor';
import mdit from './MarkDown_It';
import { fully_close_prompt_STT, fullyCloseSTT } from './Speech_To_Text';
import { mistral_api_key, Stop_AI_Generation } from './AI_Feature';
import { Fixer } from './Media_Custom_Tiptap_Node/custom_visiual_block_view';
import { editorLenis } from './Scroll_Logic';

// State management for global access
let currentOcrController = null;
let inactivityTimer = null;

// set inactive to 50 sec
const INACTIVITY_TIMEOUT = 50000; // 50s (If server stops talking)
const HARD_TOTAL_TIMEOUT = 600000; // 10m (Safety net)

export const OCR_Processing = ref(false);
export const OCR_Status = ref("Ready for OCR");

let fileId = null;
let jobId = null;
let wasEditableBeforeOCR = null; // To track editor state before OCR starts
let MAX_ALLOWED_LINES = 3800;
// Local dev vs production
const PROXY_ROOT = "https://notes-ocr-proxy.ocr-proxy.workers.dev";

let AI_Custom_Prompt = `You are an expert academic document intelligence specialist and master Markdown formatter. Your task is to convert complex handwritten notes, scanned documents, textbooks, research papers, and study materials into clean, beautiful, professional, and highly readable Markdown.

### THE META-COGNITIVE PROTOCOL (SELF-CORRECTION)
Before generating your final output, you must engage in an internal "Thinking" phase.
1. **Analyze:** Identify all text, tables, math, and visual diagrams.
2. **Draft & Debug:** Mentally draft the Mermaid/Chart.js code and check for illegal characters.
3. **Verify:** Specifically check if Mermaid labels contain math symbols (\\, {, }, ^) or logic (<, >, =). If they do, they MUST be wrapped in double quotes to prevent parser crashes.
4. **Final Polish:** Ensure no Markdown code fences (\`\`\`) wrap the custom XML tags.

**Core Rules (Never Break These):**
- Extract **every single piece of information** without any loss of content, context, meaning, or visual elements.
- Preserve the original logical flow, hierarchy, and intent of the document as faithfully as possible.
- Prioritize clarity, readability, and aesthetic beauty while maintaining academic accuracy.
- Never hallucinate or invent information. If something is unclear, describe it honestly.

**Detailed Processing Instructions:**

1. **Text & Document Structure**
   - Use proper Markdown heading hierarchy (# H1, ## H2, ### H3, etc.) based on visual and semantic importance.
   - Preserve and clean bullet points, numbered lists, indentation, and emphasis (**bold**, *italic*, \`inline code\`).
   - Fix obvious OCR/handwriting errors intelligently while preserving original meaning.
   - Maintain section flow and group related content logically.

2. **Tables (Critical - Handle All Messy Cases)**
   - Convert **all tables** into clean, well-formatted Markdown tables.
   - Remove or intelligently handle empty rows and empty columns.
   - Merge or clean duplicate/sparse rows and columns when they add no value.
   - Use proper column alignment (\`:---\`, \`---:\`, \`:---:\`).
   - If a table is too large or complex, still represent it fully and accurately. Split only if it improves readability dramatically.
   - Preserve table captions and notes.

3. **Images, Pictures & Screenshots**
   - For every image, figure, photo, or screenshot:
     - Create a descriptive heading: **Figure X: Clear and concise description**
     - Provide a detailed, meaningful alt text description of what the image contains.
     - If the image contains readable text, extract and include that text properly.
     - If the image contains a chart, graph, diagram, flowchart, or vector structure, follow the strict **Rich Visual Content Directives** below.

4. **Diagrams, Charts, Flowcharts & Visual Explanations [RICH VISUAL CONTENT DIRECTIVES]**
   - Whenever you detect charts, graphs, flowcharts, diagrams, or structured vector visuals, strictly use the custom XML structures below.
   - NEVER wrap these blocks inside Markdown code fences (\`\`\`mermaid or \`\`\`json). Output raw XML directly.

   **Case A: Charts & Graphs (Data-driven visuals like Bar, Line, Pie charts)**
   - Analyze the visual data and reconstruct it as a valid Chart.js JSON configuration.
   - Output exactly like this:
   <ai_visual_block type="chart">
   <ai_config>
   {
     "type": "bar",
     "data": { ... },
     "options": { ... }
   }
   </ai_config>
   </ai_visual_block>
   - CRITICAL: Put raw JSON strictly inside <ai_config></ai_config>. Do not escape quotes inside the JSON.

   **Case B: Diagrams, Flowcharts & Vectors (Process flows, architecture, mind maps)**
   - Convert the visual structure into clean **Mermaid syntax** (prefer graph TD, graph LR, flowchart, sequenceDiagram, classDiagram, gantt, etc.).
   - Output exactly like this:
   <ai_visual_block type="mermaid">
   <ai_content>
   flowchart TD
       A[Start] --> B{Decision}
   </ai_content>
   </ai_visual_block>
   - CRITICAL: Put plain Mermaid syntax strictly inside <ai_content></ai_content>.

   - **THE QUOTE MANDATE:** You must wrap node labels in double quotes if they contain ANY special characters: \\, {, }, [, ], (, ), <, >, =, Δ, or math to prevent parser crashes.
     *   WRONG: A[/Output \\frac{a}{b}/] -> (Will crash)
     *   RIGHT: A[/"Output \\frac{a}{b}"/] -> (Safe)
   - Ensure node IDs are alphanumeric and do not start with numbers or contain spaces to avoid parser errors.

   **Rules for Visual XML Blocks:**
   - Do not add any extra text, introductory phrases, or Markdown backticks inside or immediately around the XML tags.
   - Fall back to detailed description + ASCII art only if the visual is absolutely impossible to represent as Chart.js JSON or Mermaid.
   - Preserve relationships, labels, arrows, and data values accurately.

5. **Mathematics & Formulas**
- Convert all math into proper LaTeX: \`$...\` for inline and \`$$...$$\` for display.
- Ensure LaTeX inside Mermaid diagrams follows the "Quote Mandate" above.

6. **Code Blocks & Programming Content**
   - Detect and wrap code in proper fenced blocks with correct language tag when identifiable.

7. **Handwritten & Noisy Content**
   - Pay extra attention to handwritten text — improve legibility while staying faithful.
   - Reconstruct unclear sections using surrounding context intelligently.

8. **Edge Cases & Cleanup**
   - Remove clutter: empty rows/columns, redundant whitespace, and noise.
   - Handle overlapping text, poor scan quality, annotations, and marginal notes intelligently.
   - Preserve important footnotes, side notes, and callouts.
   - Add logical section breaks (\`---\`) only when they genuinely improve readability.

**Final Output Requirements (Critical):**
- Return **ONLY pure, valid Markdown**. No explanations, no comments, no "Here is the result", nothing else.
- Make the output beautiful, well-organized, professional, and student-friendly.
- Use consistent spacing and visual hierarchy.
- Ensure the Markdown is easy to read and renders perfectly.
- The final Markdown output MUST be suitable for a web rich-text editor (Tiptap/ProseMirror).
- The platform will crash if the output exceeds 3,500 lines or in words **42,000 words** (roughly **55,000–70,000 tokens**).
- This is a hard limit. You **must not** exceed it under any circumstances.
- Count lines as the number of newline characters (\\n) in the final output.
- If the original document would produce more than 3,500 lines, you must **summarize, condense, or intelligently prune** the least critical parts while preserving all core information, tables, diagrams, and formulas.
- Do **not** simply cut off mid‑sentence – deliver a complete, well‑structured, self‑contained Markdown document of at most 6,500 lines.
- When you reach this limit, look for the nearest logical endpoint (end of a paragraph or section).
- Safely close any open Markdown tables, code blocks, or <ai_visual_block> tags.
- Immediately stop processing the rest of the document.
- If you cannot fit everything, prioritize: headings > key facts > tables > formulas > visual_blocks > explanations > minor details.
- Append this exact message at the end of your output: \`> ⚠️ **Notice:** Document truncated due to length limits.\`
`;

/**
 * STOP OCR: Call this from your UI "Cancel" button
 */
export function Stop_OCR() {
    if (currentOcrController) {
        console.log("[OCR] Manual stop triggered by user.");
        currentOcrController.abort(new Error("User cancelled operation"));
        currentOcrController = null;
    }
    clearTimeout(inactivityTimer);
}

/**
 * HANDLE OCR: The 3-stage intelligence pipeline
 */
export async function Handle_OCR(input) {
    if (!navigator.onLine) {
        const msg = "You are currently offline. Please connect to the internet to use the OCR feature.";
        Show_Create_Edit_Model_Warning(msg, 5000);
        console.warn("[OCR] Attempted to start OCR while offline.");
        return null;
    }
    // 1. Initialize Abort Logic
    currentOcrController = new AbortController();
    const hardTimeoutSignal = AbortSignal.timeout(HARD_TOTAL_TIMEOUT);

    // Combine Manual Abort + Hard Timeout
    const combinedSignal = AbortSignal.any([currentOcrController.signal, hardTimeoutSignal]);

    // 2. Inactivity Timer Logic
    const resetInactivityTimer = () => {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            const msg = `[OCR] Inactivity timeout (${INACTIVITY_TIMEOUT / 1000}s) - Server not responding`;
            console.warn(msg);
            Show_Create_Edit_Model_Warning(msg, 4000);
            if (currentOcrController) currentOcrController.abort(new Error("Inactivity timeout"));
        }, INACTIVITY_TIMEOUT);
    };


    try {

        fullyCloseSTT();
        fully_close_prompt_STT();
        Stop_AI_Generation();

        wasEditableBeforeOCR = Tiptap_Editor.isEditable;
        Tiptap_Editor.setEditable(false); // Make editor read-only during OCR to prevent conflicts

        OCR_Processing.value = true;

        // --- STAGE 1: UPLOAD ---
        // Note: We don't apply inactivity timer during binary upload 
        // because network speeds vary wildly for large files.
        if (input instanceof File) {

            OCR_Status.value = 'Uploading file...';
            const formData = new FormData();
            formData.append('upload_file', input);
            formData.append('purpose', "parse");

            const uploadRes = await fetch(`${PROXY_ROOT}/api/v1/files`, {
                method: 'POST',
                body: formData,
                signal: combinedSignal
            });

            if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.statusText}`);
            const uploadData = await uploadRes.json();
            fileId = uploadData.id;
            if (!fileId) throw new Error("No file ID returned from server after upload");
        }

        // --- STAGE 2: TRIGGER PARSE ---
        OCR_Status.value = 'Starting AI parsing...';
        resetInactivityTimer(); // Start monitoring server response here

        const parsePayload = {
            tier: 'agentic',
            version: 'latest',
            agentic_options: { custom_prompt: AI_Custom_Prompt },
            output_options: {
                markdown: {
                    annotate_links: true,
                    inline_images: true,
                    tables: {
                        output_tables_as_markdown: true,
                        compact_markdown_tables: true,
                        markdown_table_multiline_separator: "<br />"
                    }
                },
                images_to_save: ["embedded"]   // Save both types
            }
        };
        if (fileId) parsePayload.file_id = fileId;

        const parseRes = await fetch(`${PROXY_ROOT}/api/v2/parse`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parsePayload),
            signal: combinedSignal
        });

        if (!parseRes.ok) throw new Error(`Trigger failed: ${parseRes.statusText}`);
        let json = await parseRes.json();
        jobId = json.id;
        if (!jobId) throw new Error("No job ID returned from server");

        resetInactivityTimer(); // Reset: Server successfully acknowledged the job

        // --- STAGE 3: POLLING ---
        let renderContent = null;
        let attempts = 0;
        while (attempts < 100) {
            attempts++;
            OCR_Status.value = `AI is reading... (${attempts * 2}s)`;

            await new Promise(resolve => setTimeout(resolve, 2000));

            const pollRes = await fetch(`${PROXY_ROOT}/api/v2/parse/${jobId}?expand=markdown_full`, {
                signal: combinedSignal
            });

            const pollData = await pollRes.json();

            // CRITICAL: Every time the server sends a valid response (even if PENDING),
            // we reset the inactivity timer. This proves the "heartbeat" is alive.
            resetInactivityTimer();

            if (pollData.job?.status === 'COMPLETED') {
                clearTimeout(inactivityTimer);
                let markdown_full = pollData.markdown_full;
                if (!markdown_full || markdown_full.trim() === "") {
                    throw new Error("OCR completed but no content was extracted");
                }

                markdown_full = safelyTruncateMarkdown(markdown_full, MAX_ALLOWED_LINES)

                // ==========================================
                // CUSTOM XML VISUAL BLOCK PROCESSING PIPELINE
                // ==========================================

                renderContent = async (md) => {

                    const blocks = [];
                    let placeholderMarkdown = markdown_full;

                    console.log("OCR Placeholder Markdown: " + placeholderMarkdown);

                    // STAGE 1: Shield fully completed blocks
                    const matches = placeholderMarkdown.match(/<ai_visual_block([\s\S]*?)<\/ai_visual_block>/g) || [];

                    for (const match of matches) {
                        const fixed = await Fixer.process(match, mistral_api_key, combinedSignal);
                        blocks.push({ complete: true, raw: match, ...fixed });
                        placeholderMarkdown = placeholderMarkdown.replace(match, `___BLOCK_PLACEHOLDER_${blocks.length - 1}___`);
                    }

                    // STAGE 2: Intercept incomplete blocks (Safety net if payload cuts off)
                    placeholderMarkdown = placeholderMarkdown.replace(/<ai_visual_block[\s\S]*$/, (match) => {
                        blocks.push({ complete: false, raw: match });
                        return `___BLOCK_PLACEHOLDER_${blocks.length - 1}___`;
                    });

                    // Run Markdown parser safely on safe text outside the XML blocks
                    let our_html = mdit.render(placeholderMarkdown);

                    // Re-inject safe DOM representations
                    blocks.forEach((blockObj, index) => {
                        let targetDiv = "";

                        if (!blockObj.complete) {
                            targetDiv = `<div class="ai-rich-block preview-mode" data-type="stream-loading" data-loading="true" contenteditable="false">
                            <div style="font-size: clamp(.6rem, 2vw, 2.5rem); padding: 30px; text-align: center; font-family: monospace; color: #6b7280;">
                                Processing payload data...
                                </div>
                            </div>`;
                        }
                        else if (blockObj.state === 'repairing') {
                            // State: 1st AI failed, 2nd AI (Fixer) is working
                            targetDiv = `<div style="user-select: none;" class="ai-rich-block preview-mode" data-type="stream-loading" data-loading="true" contenteditable="false">
                            <div style="padding: 1rem; text-align: center; font-family: monospace; color: #6b7280;">
                               <div class="visiual_block_straming_text" style="display:inline-block; width:18px; height:18px; border:2px solid #3b82f6; border-top-color:transparent; border-radius:50%; animation:spin 1s linear infinite; vertical-align:middle; margin-right:10px;"></div>
                               Block is broken, AI trying to repair it... 
                               </div>
                            </div>`;
                        }
                        else if (blockObj.state === 'error') {
                            // State: 1st AI failed, 2nd AI (Fixer) is working
                            targetDiv = `<div style="user-select: none;" class="ai-rich-block preview-mode" data-type="stream-loading" data-loading="true" contenteditable="false">
                            <div style="padding: 1rem; text-align: center; font-family: monospace; color: #6b7280;">
                               <div class="visiual_block_straming_text" style="display:inline-block; width:18px; height:18px; border:2px solid #3b82f6; border-top-color:transparent; border-radius:50%; animation:spin 1s linear infinite; vertical-align:middle; margin-right:10px;"></div>
                               AI failed to repair this block! 
                               </div>
                            </div>`;
                        }
                        else {
                            const rawXml = blockObj.data;
                            const type = Fixer.getType(rawXml);
                            const config = Fixer.getTagContent(rawXml, 'ai_config');
                            const content = Fixer.getTagContent(rawXml, 'ai_content');

                            // Encode quotes purely to survive injection into the data-* attributes of the raw dom div.
                            const safeConfig = config ? config.replace(/"/g, '&quot;') : "";
                            const safeContent = content ? content.replace(/"/g, '&quot;') : "";

                            targetDiv = `<div class="ai-rich-block" 
                            data-type="${type}" 
                            data-loading="false"
                            ${safeConfig ? `data-config="${safeConfig}"` : ""}
                            ${safeContent ? `data-content="${safeContent}"` : ""}></div>`;
                        }

                        our_html = our_html.replace(`BLOCK_PLACEHOLDER_${index}`, targetDiv.replace(/\$/g, '$$$$'));
                    });
                    return our_html;
                }
                // ==========================================

                await renderContent(markdown_full);

                // 2. Handshake: Wait for all Codestral repairs to finish
                if (Fixer.promises.length > 0) {
                    await Fixer.settle();
                }

                let currentHtml = await renderContent(markdown_full);
                // Final sanity check before rendering
                if (!currentHtml || currentHtml.trim() === "") {
                    throw new Error("Final rendered HTML is empty after processing");
                }

                Tiptap_Editor.chain().focus().insertContent(currentHtml).run();
                OCR_Status.value = 'OCR Completed!';
                return; // Exit after successful completion
            }

            if (pollData.job?.status === 'FAILED') {
                throw new Error(pollData.job.error_message || "OCR failed on server");
            }
        }

    } catch (error) {
        // Clean up
        clearTimeout(inactivityTimer);

        if (error.name === 'AbortError') {
            // Signal was aborted (either by user, inactivity, or hard timeout)
            console.log("[OCR] Process terminated safely.");
            Show_Create_Edit_Model_Warning("The request was aborted!", 5000)
            return null; // Return null so the UI knows nothing was extracted
        }
        console.log("Error_ OCR: " + error);


        // Real Error Handling
        const errorMsg = `[OCR Error]: ${error.message}`;
        Show_Create_Edit_Model_Warning(errorMsg, 5000);
        throw error;

    } finally {
        currentOcrController = null;
        OCR_Processing.value = false;
        clearTimeout(inactivityTimer);
        await cleanupLlamaResources(fileId);
        fileId = null;
        jobId = null;
        Tiptap_Editor.setEditable(wasEditableBeforeOCR); // Restore editor state after OCR process
        if (editorLenis) editorLenis.resize();
    }
}


/**
 * Safely truncates Markdown to a maximum number of lines.
 * It will NEVER cut in the middle of a code block or your custom XML blocks.
 */
function safelyTruncateMarkdown(markdownString, maxLines) {
    const lines = markdownString.split('\n');

    // If it's already within limits, return as is
    if (lines.length <= maxLines) return markdownString;

    const safeLines = [];

    // State trackers to ensure we don't cut inside sensitive blocks
    let inCodeBlock = false;
    let inAiVisualBlock = false;
    let inTable = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        safeLines.push(line);

        // Toggle state for Markdown code blocks (```)
        if (line.trim().startsWith('```')) {
            inCodeBlock = !inCodeBlock;
        }

        // Toggle state for custom AI blocks
        if (line.includes('<ai_visual_block')) {
            inAiVisualBlock = true;
        }
        if (line.includes('</ai_visual_block>')) {
            inAiVisualBlock = false;
        }

        // Toggle state for tables (basic check)
        if (line.trim().startsWith('|')) {
            inTable = true;
        } else if (line.trim() !== '') {
            inTable = false; // We exited the table
        }

        // Check if we reached the limit AND it is safe to cut
        if (safeLines.length >= maxLines) {
            // We only cut if we are completely outside of ALL structured blocks
            if (!inCodeBlock && !inAiVisualBlock && !inTable && line.trim() === '') {
                safeLines.push('\n<hr>\n');
                safeLines.push('> ⚠️ **Manually Document Truncated:** The OCR result was too large for the editor. Only the first portion has been loaded to maintain performance.');
                break; // Stop accumulating lines
            }
        }
    }

    return safeLines.join('\n');
}


/**
 * Cleanup: Delete file and cancel job (if needed)
 */
async function cleanupLlamaResources(fileId) {
    try {
        // 1. Delete File (Most Important)
        if (fileId) {
            await fetch(`${PROXY_ROOT}/api/v1/beta/files/${fileId}`, {
                method: 'DELETE',
            });
            console.log(`[Cleanup] File deleted: ${fileId}`);
        }
    } catch (err) {
        console.warn("[Cleanup] Failed to delete resources:", err.message);
        // Don't throw — we don't want cleanup to break the main flow
    }
}