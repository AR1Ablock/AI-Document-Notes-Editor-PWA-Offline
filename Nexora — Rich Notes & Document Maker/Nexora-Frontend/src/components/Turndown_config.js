import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '_',
    strongDelimiter: '**'
});

// Enable GFM for basic tables, task lists, and strikethrough support
turndown.use(gfm);

// Helper function for safe, logged rule execution
function safeRuleTransform(ruleName, node, transformFn) {
    try {
        console.log(`[Turndown] Processing rule: "${ruleName}" on node:`, node.nodeName);
        const result = transformFn();
        console.log(`[Turndown] Rule "${ruleName}" successfully executed.`);
        return result;
    } catch (error) {
        console.error(`[Turndown Error] Failed executing rule "${ruleName}" on node:`, node, error);
        // Fallback: Return raw inner content or HTML to avoid breaking conversion completely
        return node.outerHTML || node.textContent || '';
    }
}

// 1. Strip ProseMirror specific breaks and empty elements
turndown.addRule('stripProseMirrorBreaks', {
    filter: (node) => node.classList && node.classList.contains('ProseMirror-trailingBreak'),
    replacement: (content, node) => safeRuleTransform('stripProseMirrorBreaks', node, () => '')
});

// 2. Inline Styles: Underline, Text Colors, Background Highlights, Font Sizes, Line Height
turndown.addRule('preserveInlineStyles', {
    filter: (node) => {
        return node.nodeName === 'U' ||
            (node.nodeName === 'SPAN' && node.hasAttribute('style'));
    },
    replacement: (content, node) => safeRuleTransform('preserveInlineStyles', node, () => {
        if (!content.trim()) return content;
        if (node.nodeName === 'U') return `<u>${content}</u>`;
        const style = node.getAttribute('style');
        return `<span style="${style}">${content}</span>`;
    })
});

// 3. Text Alignment & Block-Level Background Colors (paragraphs, headings)
turndown.addRule('preserveBlockStyles', {
    filter: (node) => {
        const isBlockTag = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(node.nodeName);
        const hasStyle = node.style && (node.style.textAlign || node.style.backgroundColor);
        return isBlockTag && hasStyle;
    },
    replacement: (content, node) => safeRuleTransform('preserveBlockStyles', node, () => {
        const tag = node.nodeName.toLowerCase();
        const style = node.getAttribute('style');
        return `\n\n<${tag} style="${style}">${content}</${tag}>\n\n`;
    })
});

// 4. Multi-Column Layout (2-6 Columns flex container)
turndown.addRule('preserveColumns', {
    filter: (node) => node.classList && node.classList.contains('columns'),
    replacement: (content, node) => safeRuleTransform('preserveColumns', node, () => {
        const columnCount = node.getAttribute('columncount') || '';
        const style = node.getAttribute('style') || '';
        return `\n\n<div class="columns" columncount="${columnCount}" style="${style}">${content}</div>\n\n`;
    })
});

turndown.addRule('preserveColumnItem', {
    filter: (node) => node.classList && node.classList.contains('column'),
    replacement: (content, node) => safeRuleTransform('preserveColumnItem', node, () => {
        const style = node.getAttribute('style') || '';
        return `<div class="column" style="${style}">${content}</div>`;
    })
});

// 5. Custom Media Wrappers: Images (Resized/Rotated)
turndown.addRule('customImageNodes', {
    filter: (node) => node.classList && node.classList.contains('img') && node.classList.contains('override_media_position_in_live_editor'),
    replacement: (content, node) => safeRuleTransform('customImageNodes', node, () => {
        const img = node.querySelector('img');
        if (!img) return content;
        const src = img.getAttribute('src') || node.getAttribute('data-url');
        const alt = img.getAttribute('alt') || 'image';
        const style = node.getAttribute('style') || '';

        return style ? `\n\n<img src="${src}" alt="${alt}" style="${style}" />\n\n` : `\n\n![${alt}](${src})\n\n`;
    })
});

// 6. Custom Media Wrappers: Audio Player Attachments
turndown.addRule('customAudioNodes', {
    filter: (node) => node.classList && node.classList.contains('audio'),
    replacement: (content, node) => safeRuleTransform('customAudioNodes', node, () => {
        const audio = node.querySelector('audio');
        const src = audio?.getAttribute('src') || node.getAttribute('data-url');
        const title = audio?.getAttribute('title') || 'Audio Attachment';
        return src ? `\n\n<audio src="${src}" title="${title}" controls></audio>\n\n` : content;
    })
});

// 7. Custom Media Wrappers: Video Player Attachments
turndown.addRule('customVideoNodes', {
    filter: (node) => node.classList && node.classList.contains('video'),
    replacement: (content, node) => safeRuleTransform('customVideoNodes', node, () => {
        const video = node.querySelector('video');
        const src = video?.getAttribute('src') || node.getAttribute('data-url');
        const title = video?.getAttribute('title') || 'Video Attachment';
        return src ? `\n\n<video src="${src}" title="${title}" controls></video>\n\n` : content;
    })
});

// 8. Custom Media Wrappers: Document File Attachments
turndown.addRule('customDocumentNodes', {
    filter: (node) => node.classList && node.classList.contains('document'),
    replacement: (content, node) => safeRuleTransform('customDocumentNodes', node, () => {
        const link = node.querySelector('a');
        const href = link?.getAttribute('href') || node.getAttribute('data-url') || '#';
        const fileName = link?.textContent.trim() || node.getAttribute('data-uid') || 'Download Document';
        return `\n\n[📄 ${fileName}](${href})\n\n`;
    })
});

// 9. AI Rich Blocks: Chart.js Code Conversion
turndown.addRule('chartBlocks', {
    filter: (node) => node.hasAttribute('data-type') && node.getAttribute('data-type') === 'chart',
    replacement: (content, node) => safeRuleTransform('chartBlocks', node, () => {
        const config = node.getAttribute('data-config') || '{}';
        return `\n\n\`\`\`chart\n${config}\n\`\`\`\n\n`;
    })
});

// 10. AI Rich Blocks: Mermaid Flowcharts & Diagrams
turndown.addRule('mermaidBlocks', {
    filter: (node) => node.hasAttribute('data-type') && node.getAttribute('data-type') === 'mermaid',
    replacement: (content, node) => safeRuleTransform('mermaidBlocks', node, () => {
        const mermaidCode = node.getAttribute('data-content') || '';
        return `\n\n\`\`\`mermaid\n${mermaidCode.trim()}\n\`\`\`\n\n`;
    })
});

export default turndown;