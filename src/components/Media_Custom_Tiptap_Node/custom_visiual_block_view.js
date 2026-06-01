import mermaid from 'mermaid'
import Chart from 'chart.js/auto'
import { editorLenis, viewLenis } from '../Scroll_Logic'
import { run_visiual_block_animation } from '../Editor_Live_Media_Adding_Parser';

export function AiRichBlockView({ node, getPos, editor }) {
    const dom = document.createElement('div');


    // 1. PHYSICAL ATTRIBUTES (This makes Way 1 - innerHTML work!)
    dom.setAttribute('data-type', node.attrs.type || '');
    dom.setAttribute('data-config', node.attrs.config || '');
    dom.setAttribute('data-content', node.attrs.content || '');
    dom.setAttribute('data-loading', node.attrs.loading || 'false');

    // Consuming clean keys from node.attrs directly
    dom.className = `ai-rich-block ${node.attrs.type || ''}`;
    dom.contentEditable = 'false';
    dom.draggable = true;

    const contentContainer = document.createElement('div');
    contentContainer.className = 'ai-rich-content';
    dom.appendChild(contentContainer);

    const errorContainer = document.createElement('div');
    errorContainer.className = 'ai-rich-error';
    errorContainer.style.display = 'none';
    dom.appendChild(errorContainer);


    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin { to { transform: rotate(360deg); } }
        .ai-rich-block { margin: 1.5em 0; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .ai-rich-block .ai-rich-error { place-self: flex-start; padding: 16px; background: #fef2f2; color: #991b1b; font-size: 13px; font-family: monospace; white-space: pre-wrap; border-left: 4px solid #ef4444; }
    `;
    dom.appendChild(style);

    dom.style.opacity = 0;
    dom.style.transform = 'scale(0)';
    dom.style.transition = "all 0.3s ease";

    setTimeout(() => {
        console.log('block animation fired-----------');
        run_visiual_block_animation(dom);
    }, 100);

    let currentChartInstance = null;
    let isRendered = false;

    function renderVisualization() {
        if (isRendered) return;

        // Consuming clean schema attributes
        const type = node.attrs.type;
        const loading = node.attrs.loading;
        const schemaError = node.attrs.error;

        if (loading === 'true' || type === 'stream-loading') return;

        errorContainer.style.display = 'none';
        contentContainer.innerHTML = '';

        if (schemaError) {
            showError(`Data schema evaluation failed:\n${schemaError}`);
            return;
        }

        if (type === 'chart') {
            renderChart(node.attrs.config);
        } else if (type === 'mermaid') {
            renderMermaid(node.attrs.content);
        }

        if (editorLenis) editorLenis.resize();
    }

    function renderChart(configStr) {
        if (!configStr) return showError("Execution aborted: Configuration object empty.");

        const canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.maxHeight = '500px';
        contentContainer.appendChild(canvas);

        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false
        };


        try {
            const config = JSON.parse(configStr);

            let old_opt = config.options;
            config.options = { ...defaultOptions, ...old_opt }

            if (currentChartInstance) currentChartInstance.destroy();
            currentChartInstance = new Chart(canvas, config);

            if (editorLenis) {
                editorLenis.resize();
                requestAnimationFrame(() => editorLenis.resize());
            }

            isRendered = true;
            console.log('[AiRichBlockView] Chart painted dynamically.');
        } catch (err) {
            showError(`Chart Core Engine parsing stack fault:\n${err}`);
        }
    }

    async function renderMermaid(code) {
        if (!code) return showError("Execution aborted: Mermaid processing script empty.");

        try {
            const id = 'mermaid-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
            const { svg } = await mermaid.render(id, code.trim());
            contentContainer.innerHTML = svg;
            isRendered = true;
            console.log('[AiRichBlockView] Vector SVG generated cleanly.');
        } catch (err) {
            showError(`Mermaid Syntax Compilation Error:\n${err}`);
        }
    }

    function showError(err) {
        errorContainer.textContent = 'Block is broken, repairing failed!' // "An unknown error occurred during rendering.";
        errorContainer.style.display = 'block';
    }

    setTimeout(renderVisualization, 30);

    return {
        dom,
        update(newNode) {
            if (newNode.type.name !== 'aiRichBlock') return false;


            // 2. KEEP ATTRIBUTES SYNCED (If AI updates the config while you're looking)
            if (newNode.attrs.config !== node.attrs.config) {
                dom.setAttribute('data-config', newNode.attrs.config || '');
            }
            if (newNode.attrs.content !== node.attrs.content) {
                dom.setAttribute('data-content', newNode.attrs.content || '');
            }
            if (newNode.attrs.loading !== node.attrs.loading) {
                dom.setAttribute('data-loading', newNode.attrs.loading || 'false');
            }

            // Evaluating mutations using clean keys
            const attrsMutated =
                newNode.attrs.type !== node.attrs.type ||
                newNode.attrs.content !== node.attrs.content ||
                newNode.attrs.config !== node.attrs.config ||
                newNode.attrs.loading !== node.attrs.loading;

            node = newNode;

            if (attrsMutated) {
                isRendered = false;
                renderVisualization();
            }

            if (editorLenis) editorLenis.resize();


            return true;
        },
        destroy() {
            if (currentChartInstance) currentChartInstance.destroy();
        }
    }
}


/**
 * Scans the Read-Only DOM container, extracts the saved JSON configs,
 * and dynamically paints the Chart.js elements.
 */

let timer = null;

export function Render_Read_Mode_Charts(containerElement) {
    if (!containerElement) return;

    // Target all custom visual blocks that represent charts
    const chartBlocks = containerElement.querySelectorAll('.ai-rich-block[data-type="chart"], .ai-rich-block.chart');

    chartBlocks.forEach(block => {
        // Pull the configuration object saved by your Tiptap schema's renderHTML
        const configStr = block.getAttribute('data-config');
        if (!configStr) return;

        const contentContainer = block.querySelector('.ai-rich-content');
        if (!contentContainer) return;

        try {
            // Clean up serialized attribute quotes if necessary
            const cleanConfigStr = configStr.replace(/&quot;/g, '"');
            const config = JSON.parse(cleanConfigStr);

            // Wipe the dead canvas tag captured by getHTML()
            contentContainer.innerHTML = '';

            // Inject a clean, responsive canvas node
            const freshCanvas = document.createElement('canvas');
            contentContainer.appendChild(freshCanvas);

            const defaultOptions = {
                responsive: true,
                maintainAspectRatio: false
            };

            let old_opt = config.options;

            config.options = { ...defaultOptions, ...old_opt }

            // Execute the rendering engine
            let chart = new Chart(freshCanvas, config);
            chart.resize(1920, 1080); // so it draw effective and fix blank bug.

            if (timer) clearTimeout(timer);

            timer = setTimeout(() => requestAnimationFrame(() => { if (viewLenis) viewLenis.resize() }), 1000);

            console.log('[Read Mode] Successfully painted Chart.js instance.');
        } catch (err) {
            console.error('[Read Mode] Failed to parse/render Chart.js payload:', err);

            // Optionally unhide the error block in UI if parsing fails
            const errorBlock = block.querySelector('.ai-rich-error');
            if (errorBlock) {
                errorBlock.textContent = `Rendering failure in Read Mode: ${err.message}`;
                errorBlock.style.display = 'block';
            }
        }
    });
}


export const FIXER_SYSTEM_PROMPT = `
You are an ultra-strict, deterministic Syntax Repair Engine specialized in repairing Chart.js JSON and Mermaid.js inside custom visual blocks within Markdown documents.
Your single job: receive potentially broken Markdown containing <ai_visual_block> chart and mermaid blocks and return a perfectly clean, production-ready Markdown string with only necessary, minimal repairs.

ABSOLUTE OUTPUT RULES
1. Output ONLY the corrected full Markdown. No explanations, no commentary, no extra text. Begin immediately with the first character of the corrected Markdown.
2. NEVER use markdown code fences (\`\`\`). Do not wrap repaired blocks in fences.
3. Do not invent new semantic content. Only change what is required to restore syntactic validity and rendering safety.

VALIDATION-FIRST WORKFLOW
- Think internally first: validate Chart.js JSON → validate Mermaid → apply deterministic minimal repairs → re-validate.
- Assume programmatic validators exist and will be run by the orchestrator; do not attempt to implement parsers yourself—focus on producing syntactically correct output.
- Use strict programmatic validators internally (JSON parser for Chart.js; Mermaid parser/linter for Mermaid). Iterate repairs until both validators pass or until the block must be removed per the removal policy.

CHART.JS JSON REPAIR RULES (HIGHEST PRIORITY)
- The content inside <ai_config> must be raw, valid JSON (no HTML escaping, no " sequences).
- Required keys after repair: "type" (string), "data.labels" (array), "data.datasets" (array, may be empty only if removal policy applies).
- Allowed repairs: fix quoting, remove trailing commas, close unclosed brackets/braces, remove non-JSON tokens, remove non-numeric entries from numeric arrays.
- Deterministic data policy: If a numeric data point is missing or non-numeric, remove that data point rather than inventing a value.
- If a dataset is irreparably malformed, remove that dataset and preserve others.
- Do NOT add new datasets, keys, or inferred numeric values.
- If <ai_config> is embedded as an HTML attribute (rare), prefer converting it to a raw <ai_config> block; do not emit HTML-escaped JSON.
- After repair, JSON must parse with a strict JSON parser. If required keys are missing after minimal fixes, remove the entire <ai_visual_block> and annotate per the annotation policy.

MERMAID REPAIR RULES (VERY HIGH PRIORITY)
- Mermaid code must remain strictly inside <ai_content>.
- Wrap any node label or text containing special characters in double quotes. Special characters include but are not limited to: > < & { } ? = : " $ # ! @ % ^ * ( ) [ ] / \\ | ; , .
- If a label already contains double quotes, escape them as \\" inside the quoted label.
- Fix node IDs to be valid identifiers: alphanumeric and underscores only; remove leading/trailing spaces; replace invalid characters with underscores.
- Fix common syntax errors: unclosed subgraph/end pairs, missing arrow labels formatting, unclosed brackets, and truncated node labels.
- Preserve node ordering and flow semantics; do not reorder nodes unless necessary to restore validity.
- After repair, Mermaid must pass a parser/linter. If it cannot be validated after minimal safe fixes, remove the block and annotate per the removal policy.

VISUAL BLOCK STRUCTURE RULES
- Repaired chart blocks must use this exact structure:
<ai_visual_block class="ai-rich-block" data-type="chart" data-loading="true">
<ai_config>
{ ... }   <-- raw valid JSON
</ai_config>
</ai_visual_block>
- Repaired mermaid blocks must use this exact structure:
<ai_visual_block class="ai-rich-block" data-type="mermaid" data-loading="true">
<ai_content>
flowchart TD
A[Start] --> B{Decision}
</ai_content>
</ai_visual_block>
- Remove any surrounding code fences (\`\`\`) that enclose visual blocks.

GENERAL REPAIR PRINCIPLES
- Minimality: only perform syntactic fixes (quoting, commas, brackets, escaping, node ID normalization, removal of invalid elements). Do not rewrite prose, headings, lists, or other Markdown except to fix broken markup.
- Safety-first: prefer removing an offending block to emitting broken code. If a block is removed, append exactly <!--FIXED:removed-broken-block--> immediately adjacent to where the block was.
- Nontrivial changes (removing datasets, removing blocks, or other content-altering repairs) must be annotated with a single concise HTML comment in this exact format: <!--FIXED:reason-->. (Allowed reasons: removed-invalid-dataset, removed-broken-block, normalized-node-ids, fixed-json-structure).
- Do not add comments for trivial fixes (whitespace, quoting, trailing comma removal).
- Preserve original Markdown structure, headings, lists, and tone.

ERROR HANDLING AND DETERMINISTIC FALLBACKS
- If JSON parsing fails after minimal syntactic repairs, remove the entire chart block and append <!--FIXED:removed-broken-block-->.
- If Mermaid cannot be validated after minimal safe repairs, remove the mermaid block and append <!--FIXED:removed-broken-block-->.

VALIDATION & ORCHESTRATION CONSTRAINTS
- The model should be invoked deterministically (low randomness).
- Assume programmatic validators exist; focus on producing syntactically correct output.

EXAMPLES (templates only — do not output these examples in final result)
Chart template:
<ai_visual_block class="ai-rich-block" data-type="chart" data-loading="true">
<ai_config>
{"type":"line","data":{"labels":["Q1","Q2"],"datasets":[{"label":"Revenue","data":[100,200]}]},"options":{}}
</ai_config>
</ai_visual_block>
Mermaid template:
<ai_visual_block class="ai-rich-block" data-type="mermaid" data-loading="true">
<ai_content>
flowchart TD
A["Start"] --> B{"Decision"}
</ai_content>
</ai_visual_block>

FINAL RULES
- If the input is already valid, return it unchanged.
- Output only the corrected Markdown and nothing else.
- Use the minimal annotation policy described above when nontrivial repairs occur.
- You will be given output from another model that may contain errors. Repair it perfectly and return only the repaired Markdown.
`;


// FixerManager.js
export const Fixer = {
    cache: new Map(),      // Key: RawXML, Value: RepairedXML
    pending: new Set(),    // Tracks active API calls to avoid duplicates
    errors: new Map(), // New: Store parser error messages       // To track all ongoing repair promises for final settlement
    promises: [],

    /**
     * The main entry point. Call this inside your .replace() loop.
     * It is SYNCHRONOUS to prevent blocking the UI stream.
     */
   async process(rawBlock, mistralApiKey, signal) {
        // 1. If we already fixed this exact block, return the gold version
        if (this.cache.has(rawBlock)) return { state: 'success', data: this.cache.get(rawBlock) }

        if (this.errors.has(rawBlock)) return { state: 'error', message: this.errors.get(rawBlock) };

        // 2. Perform a "Fast Check" to see if it's actually broken
        const isBroken = await this.isBroken(rawBlock);

        if (!isBroken) {
            this.cache.set(rawBlock, rawBlock); // Cache as "valid"
            return { state: 'success', data: rawBlock };
        }

        // 3. If it's broken and NOT already being fixed, trigger the background repair
        if (!this.pending.has(rawBlock)) {
            const repairTask = this.triggerRepair(rawBlock, mistralApiKey, signal);
            this.promises.push(repairTask);
        }

        // 4. While fixing, return the original so the user sees the "bytes fetching" loader
        return { state: 'repairing' };
    },

    async isBroken(rawBlock) {
        let res = null;
        const type = this.getType(rawBlock);
        if (type === 'chart') {
            const config = this.getTagContent(rawBlock, 'ai_config');
            try { JSON.parse(config); return false; } catch { return true; }
        } else if (type === 'mermaid') {
            const content = this.getTagContent(rawBlock, 'ai_content');
            // Basic structural check (mermaid.parse is slow, regex is faster for streaming)
            try {
               res = await mermaid.parse(content);
                return false;
            } catch (err) {
                console.log("result of mermaid parse: "+res);
                return true;
            } // Assume broken if any error occurs during checks
        }
        return false;
    },

    async triggerRepair(rawBlock, apiKey, signal) {
        this.pending.add(rawBlock);
        console.log("This block is broken, start to repair: " + this.getType(rawBlock));
        try {
            // Note: Using 'codestral-latest' (Devstral is likely a typo for Codestral)
            const response = await fetch("https://api.mistral.ai/v1/conversations", {
                method: "POST",
                signal: signal,
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
                body: JSON.stringify({
                    model: "devstral-latest",
                    inputs: [{ role: "user", content: rawBlock.trim() }],
                    instructions: FIXER_SYSTEM_PROMPT
                })
            });

            const data = await response.json();
            const repaired = data.outputs?.[0]?.content;

            if (repaired && !await this.isBroken(repaired)) {
                this.cache.set(rawBlock, repaired.trim());
                console.log("[Fixer] Block repaired successfully.");
            }
            else this.errors.set(rawBlock, "AI failed to fix syntax structure.");

        } catch (err) {
            console.error("[Fixer] Background repair failed:", err);
            this.errors.set(rawBlock, err.message || "Repair connection failed.");
        } finally {
            this.pending.delete(rawBlock);
        }
    },
    // Await all background repairs to finish
    async settle() {
        if (this.promises.length > 0) {
            await Promise.all(this.promises);
            this.promises = []; // Clear for next run
        }
    },

    // Bulletproof extraction helper for child tags
    getTagContent(xmlStr, tagName) {
        try {
            const regex = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`);
            const match = xmlStr.match(regex);
            return match ? match[1].trim() : null;
        } catch (error) {
            console.log("getContent error: " + error);
        }
    },

    // Extract block type attribute safely
    getType(xmlStr) {
        try {
            const match = xmlStr.match(/type=["']([^"']+)["']/);
            return match ? match[1] : 'mermaid';
        } catch (error) {
            console.log("getType error: " + error);
        }
    },
};

