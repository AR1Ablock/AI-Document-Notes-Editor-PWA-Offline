// markdownSetup.mjs
import MarkdownIt from 'markdown-it';
import { full as emoji } from 'markdown-it-emoji';
import footnote from 'markdown-it-footnote';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // fallback
import { debugError } from './Global_Error_Handler';

// markdownSetup.mjs (relevant section)

// Dynamic scheme: Light fallback + pitch-black night mode (VS Code Dark+ clone)
const dynamicHLStyle = `
/* Light mode fallback (GitHub-inspired for day readability) */
@media (prefers-color-scheme: light) {
    .hljs {
        background: #f8f8f8 !important;
        color: #333 !important;
        padding: 1em;
        border-radius: 6px;
        overflow-x: auto;
        font-family: 'Fira Code', monospace;
        font-size: 14px;
    }
    .hljs-comment,
    .hljs-quote { color: #777; font-style: italic; }
    .hljs-keyword,
    .hljs-selector-tag,
    .hljs-subst { color: #d73a49; font-weight: bold; }
    .hljs-literal,
    .hljs-number,
    .hljs-link { color: #005cc5; }
    .hljs-string,
    .hljs-title,
    .hljs-name,
    .hljs-type,
    .hljs-attribute { color: #22863a; }
    .hljs-symbol,
    .hljs-bullet,
    .hljs-addition { color: #6f42c1; }
    .hljs-deletion,
    .hljs-variable { color: #e36209; }
}

/* Dark mode (pitch-black night scheme via vs2015 - VS Code Dark+ clone) */
@media (prefers-color-scheme: dark) {
    .hljs {
      background: #1E1E1E;
      color: #DCDCDC;
      padding: 1em;
      border-radius: 6px;
      overflow-x: auto;
      font-family: 'Fira Code', monospace;
      font-size: 14px;
    }

    .hljs-keyword,
    .hljs-literal,
    .hljs-symbol,
    .hljs-name {
      color: #569CD6;
    }
    .hljs-link {
      color: #569CD6;
      text-decoration: underline;
    }

    .hljs-built_in,
    .hljs-type {
      color: #4EC9B0;
    }

    .hljs-number,
    .hljs-class {
      color: #B8D7A3;
    }

    .hljs-string,
    .hljs-meta .hljs-string {
      color: #D69D85;
    }

    .hljs-regexp,
    .hljs-template-tag {
      color: #9A5334;
    }

    .hljs-subst,
    .hljs-function,
    .hljs-title,
    .hljs-params,
    .hljs-formula {
      color: #DCDCDC;
    }

    .hljs-comment,
    .hljs-quote {
      color: #57A64A;
      font-style: italic;
    }

    .hljs-doctag {
      color: #608B4E;
    }

    .hljs-meta,
    .hljs-meta .hljs-keyword,
    .hljs-tag {
      color: #9B9B9B;
    }

    .hljs-variable,
    .hljs-template-variable {
      color: #BD63C5;
    }

    .hljs-attr,
    .hljs-attribute {
      color: #9CDCFE;
    }

    .hljs-section {
      color: gold;
    }

    .hljs-emphasis {
      font-style: italic;
    }

    .hljs-strong {
      font-weight: bold;
    }

    .hljs-bullet,
    .hljs-selector-tag,
    .hljs-selector-id,
    .hljs-selector-class,
    .hljs-selector-attr,
    .hljs-selector-pseudo {
      color: #D7BA7D;
    }

    .hljs-addition {
      background-color: #144212;
      display: inline-block;
      width: 100%;
    }

    .hljs-deletion {
      background-color: #600;
      display: inline-block;
      width: 100%;
    }
}
`;

// Inject dynamic CSS into document (browser)
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = dynamicHLStyle;
  document.head.appendChild(style);
}



/* let our_allowlist = {
  // Custom allowlist: Tags to keep (override DOMPurify defaults for stricter control)
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', // Headings
    'blockquote', 'p', 'pre', 'div',    // Blocks
    'strong', 'em', 'b', 'i', 'u', 's', 'strike', 'code', 'sub', 'sup', 'del', 'span', // Inline
    'ul', 'ol', 'li',                   // Lists
    'a', 'img',                         // Links and images
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', // Tables
    'br', 'hr',                         // Separators
  ],
  // Allowed attributes (global or per-tag)
  ALLOWED_ATTR: {
    a: ['href', 'title', 'target', 'rel'], // allow everything useful for links
    img: ['src', 'alt', 'title', 'width', 'height', 'srcset', 'loading', 'decoding', 'crossorigin'], // allow all  ol: ['start'],                      // For ordered lists
    td: ['colspan', 'rowspan'],         // For tables
    th: ['colspan', 'rowspan'],
    '*': ['class', 'id', 'style', 'data-*'],   // allow styles and metadata
  },
  ALLOWED_URI_REGEXP: /^(https?:|\/\/)/i,       // allow http, https, protocol-relative
  // Forbid specific attributes (e.g., events)
  FORBID_ATTR: ['onload', 'onclick', 'onerror', 'onmouseover'],
  // Other options: See DOMPurify docs for more (e.g., ALLOWED_STYLES for CSS)
} */




// Initialize markdown-it
const mdit = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight: (str, lang) => {
    try {
      if (lang && hljs.getLanguage(lang)) {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
      }
      return `<pre class="hljs"><code>${mdit.utils.escapeHtml(str)}</code></pre>`;
    } catch (error) {
      debugError(error, "Markdown Highlighting Error");
      return `<pre class="hljs"><code>${mdit.utils.escapeHtml(str)}</code></pre>`;
    }
  }
});

// Plugins
mdit.use(emoji)
  .use(footnote);

// -----------------------------
// Utility: Highlight existing HTML block
export function highlightHTMLBlock(htmlString) {
  // Create temporary container
  const temp = document.createElement('div');
  temp.innerHTML = htmlString;

  // Find all <pre><code> blocks
  const codes = temp.querySelectorAll('pre code');
  codes.forEach(block => {
    const lang = block.className.replace('language-', '') || '';
    const codeContent = block.textContent || '';
    try {
      const highlighted = lang && hljs.getLanguage(lang)
        ? hljs.highlight(codeContent, { language: lang, ignoreIllegals: true }).value
        : hljs.highlightAuto(codeContent).value;
      block.innerHTML = highlighted;
      block.parentElement.classList.add('hljs'); // ensure <pre> has hljs
    } catch (e) {
      debugError(e, 'HTML Block Highlighting Error');
    }
  });

  return temp.innerHTML;
}

// Export parser
export default mdit;