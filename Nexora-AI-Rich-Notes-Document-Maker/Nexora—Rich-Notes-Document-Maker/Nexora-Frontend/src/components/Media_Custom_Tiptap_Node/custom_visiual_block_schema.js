import { mergeAttributes, Node } from '@tiptap/core'
import { AiRichBlockView } from './custom_visiual_block_view'
import mermaid from 'mermaid'

export const AiRichBlock = Node.create({
    name: 'aiRichBlock',

    group: 'block',
    atom: true,
    selectable: true,
    draggable: true,

    // 1. Use clean internal keys and map them explicitly to HTML attributes
    addAttributes() {
        return {
            type: {
                default: null,
                parseHTML: element => element.getAttribute('data-type'),
                renderHTML: attrs => attrs.type ? { 'data-type': attrs.type } : {},
            },
            loading: {
                default: 'false',
                parseHTML: element => element.getAttribute('data-loading') || 'false',
                renderHTML: attrs => ({ 'data-loading': attrs.loading }),
            },
            config: {
                default: null,
                parseHTML: element => element.getAttribute('data-config'),
                renderHTML: attrs => attrs.config ? { 'data-config': attrs.config } : {},
            },
            content: {
                default: null,
                parseHTML: element => element.getAttribute('data-content'),
                renderHTML: attrs => attrs.content ? { 'data-content': attrs.content } : {},
            },
            error: {
                default: null,
                parseHTML: element => element.getAttribute('data-error'),
                renderHTML: attrs => attrs.error ? { 'data-error': attrs.error } : {},
            }
        }
    },

    parseHTML() {
        return [
            {
                tag: 'div.ai-rich-block',
                getAttrs: (dom) => {
                    const type = dom.getAttribute('data-type');
                    
                    // Ignore live stream preview placeholders completely
                    if (type === 'stream-loading') return false;

                    let config = dom.getAttribute('data-config');
                    let content = dom.getAttribute('data-content');
                    let errorMessage = null;

                    // Safely decode and validate JSON payloads
                    if (config || content) {
                        try {
                            if (config) {
                                const cleanConfig = config.replace(/&quot;/g, '"');
                                JSON.parse(cleanConfig); 
                                config = cleanConfig; 
                            }
                            if (content) {
                                content = content.replace(/&quot;/g, '"');
                                mermaid.parse(content);
                            }
                        } catch (e) {
                            console.warn('[AiRichBlock Schema] Shielding invalid JSON syntax payload safely.');
                            errorMessage = `JSON Syntax Error: ${e.message}`;
                            config = null;
                            content = null;
                        }
                    }

                    // Return clean keys matching addAttributes definitions
                    return {
                        type,
                        loading: dom.getAttribute('data-loading') || 'false',
                        config,
                        content,
                        error: errorMessage
                    }
                },
            },
        ]
    },

    // 2. mergeAttributes automatically maps the renderHTML hooks defined above
    renderHTML({ node, HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(HTMLAttributes, {
                class: `ai-rich-block ${node.attrs.type || ''}`,
                contenteditable: 'false',
                draggable: 'true',
            }),
        ]
    },

    addNodeView() {
        return AiRichBlockView
    }
})