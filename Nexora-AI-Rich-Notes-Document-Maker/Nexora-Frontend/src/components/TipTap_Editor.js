import { debugError } from "./Global_Error_Handler";

// src/editor/Tiptap_Editor.js
import { Editor, Extension, mergeAttributes, Node } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle, FontSize, LineHeight } from '@tiptap/extension-text-style'
//
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
//
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
//
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
//
import { CellSelection, TableMap } from 'prosemirror-tables';
import { Fragment, Slice } from 'prosemirror-model'; // ✅ Add this import
//
import Placeholder from '@tiptap/extension-placeholder' // 👈 import this
//
import { ref } from 'vue';
import { MediaNode } from "./Media_Custom_Tiptap_Node/Media_Node_Scheme";
import { MediaNodeView } from "./Media_Custom_Tiptap_Node/Media_Node_View";
import { Paste } from "./Paste_Drag_Drop_Handler";
//
import Suggestion from '@tiptap/suggestion'
import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'

//
import { all, createLowlight } from 'lowlight'                    // ← Import ALL languages
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { AiRichBlock } from "./Media_Custom_Tiptap_Node/custom_visiual_block_schema";
import turndown from "./Turndown_config";
import { useTouchDetection } from "./Is_Touch";

// Create lowlight instance with ALL languages (required for auto-detect)

export let manageMedia_Metod_ref = ref(null); // Ref to hold the manageMedia method

export function setManageMediaMethod(method) {
  manageMedia_Metod_ref.value = method;
}


const BackgroundBlock = Extension.create({
  name: 'backgroundBlock',

  addOptions() {
    return {
      types: ['paragraph', 'heading', 'listItem', 'codeBlock', 'blockquote', 'tableCell', 'tableHeader'],  // Will configure with ['paragraph', 'heading', 'listItem', 'codeBlock', 'blockquote', 'tableCell', 'tableHeader', ...]
      defaultBG: 'transparent',  // Your default (or compute dynamically if needed)
    };
  },

  addGlobalAttributes() {
    return [
      {
        // Apply to all specified types
        types: this.options.types,
        attributes: {
          backgroundColor: {
            default: null,
            parseHTML: element => element.style.backgroundColor || null,
            renderHTML: attributes => {
              if (!attributes.backgroundColor) return {};
              return {
                style: `background-color: ${attributes.backgroundColor}; border-radius: 5px;`,  // Your conditional border-radius
              };
            },
          },
        },
      },
    ];
  },
});



function Toggle_Block_Background_Color(color) {
  /*     const { selection } = Tiptap_Editor.state;
      const { $from, $to } = selection;
  
      Tiptap_Editor.commands.setNodeAttribute('backgroundBlock', 'backgroundColor', color); */
  const { state } = Tiptap_Editor;
  const { selection } = state;
  const defaultBG = getDefaultEditorBG();  // Your helper, adapted below

  if (!selection.empty) {
    // Selection: Inline mark (text spans)
    const currentInlineBG = Tiptap_Editor.getAttributes('textStyle').backgroundColor || defaultBG;
    const isTransparent = currentInlineBG === 'rgba(0, 0, 0, 0)' || currentInlineBG === 'rgba(255, 255, 255, 0)' || color?.toLowerCase() === 'transparent';
    const isDefaultBG = currentInlineBG === defaultBG;
    if (!isTransparent && !isDefaultBG) {
      return commands.unsetHighlight();  // Toggle off
    } else {
      return commands.setHighlight(color);  // Toggle on
    }
  } else {
    // Cursor-only: Current block
    const { $from } = selection;
    const node = $from.parent;
    const nodeType = node.type.name;
    const currentBlockBG = node.attrs.backgroundColor || defaultBG;
    const isTransparent = currentBlockBG === 'rgba(0, 0, 0, 0)' || currentBlockBG === 'rgba(255, 255, 255, 0)' || color?.toLowerCase() === 'transparent';
    const isDefaultBG = currentBlockBG === defaultBG;
    if (!isTransparent && !isDefaultBG) {
      return Tiptap_Editor.chain().focus().updateAttributes(nodeType, { backgroundColor: null }).run();  // Toggle off
    } else {
      return Tiptap_Editor.chain().focus().updateAttributes(nodeType, { backgroundColor: color }).run();  // Toggle on
    }
  }
}


// Your getDefaultEditorBG (unchanged, but call from commands)
export function getDefaultEditorBG() {  // Remove param if editor is global ref
  try {
    return window.getComputedStyle(Tiptap_Editor.view.dom).backgroundColor || 'rgba(0, 0, 0, 0)';
  } catch (error) {
    debugError(error, 'Error getting default editor background color');
    return 'transparent';
  }
}

// Clean method: Now use command instead of DOM
export function clean_colored_block_Style() {
  commands.toggle_block_bg('transparent');  // Or integrate your range logic if needed
}


// Replace your current TextStyle line with this extended version
const ExtendedTextStyle = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),               // keeps fontSize, lineHeight, etc.
      backgroundColor: {
        default: null,
        parseHTML: element => element.style.backgroundColor || null,
        renderHTML: attributes => {
          if (!attributes.backgroundColor) return {};
          // Your exact custom style + border-radius
          return {
            style: `background-color: ${attributes.backgroundColor}; border-radius: 5px;`,
          };
        },
      },
    };
  },
});


function findTable(pos) {
  let depth = pos.depth;
  while (depth > 0) {
    if (pos.node(depth).type.name === 'table') {
      return pos.before(depth);
    }
    depth--;
  }
  return null;
}

function getRowStart(tablePos, table, rowIndex) {
  let pos = tablePos + 1;
  const maxI = Math.min(rowIndex, table.childCount);
  for (let i = 0; i < maxI; i++) {
    pos += table.content.child(i).nodeSize;
  }
  return pos;
}

function getRowColFromPos(state, $pos) {
  console.log('getRowColFromPos: Starting with depth', $pos.depth, 'pos', $pos.pos);
  const tablePos = findTable($pos);
  if (tablePos === null) {
    console.log('getRowColFromPos: No table found, returning null');
    return null;
  }
  const table = state.doc.nodeAt(tablePos);
  const map = TableMap.get(table);
  let depth = $pos.depth;
  while (depth > 0) {
    const nodeType = $pos.node(depth).type.name;
    console.log('getRowColFromPos: Depth', depth, 'node type', nodeType);
    if (['tableCell', 'tableHeader'].includes(nodeType)) {
      break;
    }
    depth--;
  }
  if (depth <= 0) {
    console.log('getRowColFromPos: No cell found, returning null');
    return null;
  }
  const cellDepth = depth;
  const cellStart = $pos.start(cellDepth);
  console.log('getRowColFromPos: Cell start pos', cellStart);
  const offset = cellStart - tablePos - 2;
  console.log('getRowColFromPos: Offset', offset);
  const cellInfo = map.findCell(offset);
  console.log('getRowColFromPos: Cell info', cellInfo);
  return { row: cellInfo.top, col: cellInfo.left };
}

function getCellPos(tablePos, table, map, row, col) {
  const rowStart = getRowStart(tablePos, table, row);
  const rowNode = table.content.child(row);
  let cellOffset = 0;
  for (let j = 0; j < col; j++) {
    cellOffset += rowNode.content.child(j).nodeSize;
  }
  return rowStart + 1 + cellOffset;
}

// Table Cells Reordering
let Table_Reorder = {
  moveRowUp: () => {
    const { state, dispatch } = Tiptap_Editor.view;
    const { selection } = state;
    const tablePos = findTable(selection.$from);
    if (tablePos === null) return false;
    const table = state.doc.nodeAt(tablePos);
    const map = TableMap.get(table);
    let rowIndices = [];
    let colIndices = [];
    const isCellSelection = selection instanceof CellSelection;
    if (!isCellSelection) {
      const posInfo = getRowColFromPos(state, selection.$from);
      if (!posInfo) return false;
      rowIndices = [posInfo.row];
      colIndices = [posInfo.col];
    } else {
      const rowSet = new Set();
      const colSet = new Set();
      for (let i = 0; i < selection.ranges.length; i++) {
        const range = selection.ranges[i];
        const posInfo = getRowColFromPos(state, range.$from);
        if (posInfo) {
          rowSet.add(posInfo.row);
          colSet.add(posInfo.col);
        }
      }
      rowIndices = Array.from(rowSet).sort((a, b) => a - b);
      colIndices = Array.from(colSet).sort((a, b) => a - b);
    }
    if (rowIndices.length === 0) return false;
    const isConsecutiveRows = rowIndices.every((v, i) => i === 0 || v === rowIndices[i - 1] + 1);
    if (!isConsecutiveRows) return false;
    const minRow = rowIndices[0];
    const maxRow = rowIndices[rowIndices.length - 1];
    const minCol = colIndices[0];
    const maxCol = colIndices[colIndices.length - 1];
    const isFullRow = minCol === 0 && maxCol === map.width - 1;
    if (minRow === 0) return false;
    const tr = state.tr;
    const groupRows = [minRow - 1, ...rowIndices];
    const shiftAmount = 1;
    if (isFullRow) {
      let changes = [];
      for (let j = 0; j < groupRows.length; j++) {
        const r = groupRows[j];
        const rowPos = getRowStart(tablePos, table, r);
        const row = table.content.child(r);
        changes.push({
          pos: rowPos,
          oldSize: row.nodeSize,
          oldRow: row
        });
      }
      const m = changes.length;
      for (let j = 0; j < m; j++) {
        const targetIndex = (j + shiftAmount) % m;
        changes[j].newRow = changes[targetIndex].oldRow.copy(changes[targetIndex].oldRow.content);
      }
      changes.sort((a, b) => b.pos - a.pos);
      for (let ch of changes) {
        tr.replaceWith(ch.pos, ch.pos + ch.oldSize, ch.newRow);
      }
    } else {
      for (let col of colIndices) {
        let changes = [];
        for (let j = 0; j < groupRows.length; j++) {
          const r = groupRows[j];
          if (r < 0 || r >= map.height) continue;
          const cellPos = getCellPos(tablePos, table, map, r, col);
          const cell = state.doc.nodeAt(cellPos);
          if (!cell) continue;
          const contentPos = cellPos + 1;
          const content = cell.content;
          let frag = Fragment.from(content);
          changes.push({
            pos: contentPos,
            oldSize: content.size,
            oldContent: frag
          });
        }
        const m = changes.length;
        if (m < 2) continue;
        for (let j = 0; j < m; j++) {
          const targetIndex = (j + shiftAmount) % m;
          let newFrag = changes[targetIndex].oldContent;
          if (newFrag.childCount === 0) {
            newFrag = Fragment.from(state.schema.nodes.paragraph.create());
          }
          changes[j].newContent = newFrag;
        }
        changes.sort((a, b) => b.pos - a.pos);
        for (let ch of changes) {
          tr.replace(ch.pos, ch.pos + ch.oldSize, new Slice(ch.newContent, 0, 0));
        }
      }
    }
    dispatch(tr);
    return true;
  },
  moveRowDown: () => {
    const { state, dispatch } = Tiptap_Editor.view;
    const { selection } = state;
    const tablePos = findTable(selection.$from);
    if (tablePos === null) return false;
    const table = state.doc.nodeAt(tablePos);
    const map = TableMap.get(table);
    let rowIndices = [];
    let colIndices = [];
    const isCellSelection = selection instanceof CellSelection;
    if (!isCellSelection) {
      const posInfo = getRowColFromPos(state, selection.$from);
      if (!posInfo) return false;
      rowIndices = [posInfo.row];
      colIndices = [posInfo.col];
    } else {
      const rowSet = new Set();
      const colSet = new Set();
      for (let i = 0; i < selection.ranges.length; i++) {
        const range = selection.ranges[i];
        const posInfo = getRowColFromPos(state, range.$from);
        if (posInfo) {
          rowSet.add(posInfo.row);
          colSet.add(posInfo.col);
        }
      }
      rowIndices = Array.from(rowSet).sort((a, b) => a - b);
      colIndices = Array.from(colSet).sort((a, b) => a - b);
    }
    if (rowIndices.length === 0) return false;
    const isConsecutiveRows = rowIndices.every((v, i) => i === 0 || v === rowIndices[i - 1] + 1);
    if (!isConsecutiveRows) return false;
    const minRow = rowIndices[0];
    const maxRow = rowIndices[rowIndices.length - 1];
    const minCol = colIndices[0];
    const maxCol = colIndices[colIndices.length - 1];
    const isFullRow = minCol === 0 && maxCol === map.width - 1;
    if (maxRow === map.height - 1) return false;
    const tr = state.tr;
    const groupRows = [...rowIndices, maxRow + 1];
    const shiftAmount = groupRows.length - 1;
    if (isFullRow) {
      let changes = [];
      for (let j = 0; j < groupRows.length; j++) {
        const r = groupRows[j];
        const rowPos = getRowStart(tablePos, table, r);
        const row = table.content.child(r);
        changes.push({
          pos: rowPos,
          oldSize: row.nodeSize,
          oldRow: row
        });
      }
      const m = changes.length;
      for (let j = 0; j < m; j++) {
        const targetIndex = (j + shiftAmount) % m;
        changes[j].newRow = changes[targetIndex].oldRow.copy(changes[targetIndex].oldRow.content);
      }
      changes.sort((a, b) => b.pos - a.pos);
      for (let ch of changes) {
        tr.replaceWith(ch.pos, ch.pos + ch.oldSize, ch.newRow);
      }
    } else {
      for (let col of colIndices) {
        let changes = [];
        for (let j = 0; j < groupRows.length; j++) {
          const r = groupRows[j];
          if (r < 0 || r >= map.height) continue;
          const cellPos = getCellPos(tablePos, table, map, r, col);
          const cell = state.doc.nodeAt(cellPos);
          if (!cell) continue;
          const contentPos = cellPos + 1;
          const content = cell.content;
          let frag = Fragment.from(content);
          changes.push({
            pos: contentPos,
            oldSize: content.size,
            oldContent: frag
          });
        }
        const m = changes.length;
        if (m < 2) continue;
        for (let j = 0; j < m; j++) {
          const targetIndex = (j + shiftAmount) % m;
          let newFrag = changes[targetIndex].oldContent;
          if (newFrag.childCount === 0) {
            newFrag = Fragment.from(state.schema.nodes.paragraph.create());
          }
          changes[j].newContent = newFrag;
        }
        changes.sort((a, b) => b.pos - a.pos);
        for (let ch of changes) {
          tr.replace(ch.pos, ch.pos + ch.oldSize, new Slice(ch.newContent, 0, 0));
        }
      }
    }
    dispatch(tr);
    return true;
  },
  moveColumnLeft: () => {
    const { state, dispatch } = Tiptap_Editor.view;
    const { selection } = state;
    const tablePos = findTable(selection.$from);
    if (tablePos === null) return false;
    const table = state.doc.nodeAt(tablePos);
    const map = TableMap.get(table);
    let rowIndices = [];
    let colIndices = [];
    const isCellSelection = selection instanceof CellSelection;
    if (!isCellSelection) {
      const posInfo = getRowColFromPos(state, selection.$from);
      if (!posInfo) return false;
      rowIndices = [posInfo.row];
      colIndices = [posInfo.col];
    } else {
      const rowSet = new Set();
      const colSet = new Set();
      for (let i = 0; i < selection.ranges.length; i++) {
        const range = selection.ranges[i];
        const posInfo = getRowColFromPos(state, range.$from);
        if (posInfo) {
          rowSet.add(posInfo.row);
          colSet.add(posInfo.col);
        }
      }
      rowIndices = Array.from(rowSet).sort((a, b) => a - b);
      colIndices = Array.from(colSet).sort((a, b) => a - b);
    }
    if (colIndices.length === 0) return false;
    const isConsecutiveCols = colIndices.every((v, i) => i === 0 || v === colIndices[i - 1] + 1);
    if (!isConsecutiveCols) return false;
    const minRow = rowIndices[0];
    const maxRow = rowIndices[rowIndices.length - 1];
    const minCol = colIndices[0];
    const maxCol = colIndices[colIndices.length - 1];
    const isFullCol = minRow === 0 && maxRow === map.height - 1;
    if (minCol === 0) return false;
    const tr = state.tr;
    const groupCols = [minCol - 1, ...colIndices];
    const shiftAmount = 1;
    const rowList = isFullCol ? Array.from({ length: map.height }, (_, i) => i) : rowIndices;
    if (isFullCol) {
      for (let row of rowList) {
        let changes = [];
        for (let j = 0; j < groupCols.length; j++) {
          const c = groupCols[j];
          const cellPos = getCellPos(tablePos, table, map, row, c);
          const cell = state.doc.nodeAt(cellPos);
          if (!cell) continue;
          changes.push({
            pos: cellPos,
            oldSize: cell.nodeSize,
            oldCell: cell
          });
        }
        const m = changes.length;
        if (m < 2) continue;
        for (let j = 0; j < m; j++) {
          const targetIndex = (j + shiftAmount) % m;
          changes[j].newCell = changes[targetIndex].oldCell.copy(changes[targetIndex].oldCell.content);
        }
        changes.sort((a, b) => b.pos - a.pos);
        for (let ch of changes) {
          tr.replaceWith(ch.pos, ch.pos + ch.oldSize, ch.newCell);
        }
      }
    } else {
      for (let row of rowList) {
        let changes = [];
        for (let j = 0; j < groupCols.length; j++) {
          const c = groupCols[j];
          const cellPos = getCellPos(tablePos, table, map, row, c);
          const cell = state.doc.nodeAt(cellPos);
          if (!cell) continue;
          const contentPos = cellPos + 1;
          const content = cell.content;
          let frag = Fragment.from(content);
          changes.push({
            pos: contentPos,
            oldSize: content.size,
            oldContent: frag
          });
        }
        const m = changes.length;
        if (m < 2) continue;
        for (let j = 0; j < m; j++) {
          const targetIndex = (j + shiftAmount) % m;
          let newFrag = changes[targetIndex].oldContent;
          if (newFrag.childCount === 0) {
            newFrag = Fragment.from(state.schema.nodes.paragraph.create());
          }
          changes[j].newContent = newFrag;
        }
        changes.sort((a, b) => b.pos - a.pos);
        for (let ch of changes) {
          tr.replace(ch.pos, ch.pos + ch.oldSize, new Slice(ch.newContent, 0, 0));
        }
      }
    }
    dispatch(tr);
    return true;
  },
  moveColumnRight: () => {
    const { state, dispatch } = Tiptap_Editor.view;
    const { selection } = state;
    const tablePos = findTable(selection.$from);
    if (tablePos === null) return false;
    const table = state.doc.nodeAt(tablePos);
    const map = TableMap.get(table);
    let rowIndices = [];
    let colIndices = [];
    const isCellSelection = selection instanceof CellSelection;
    if (!isCellSelection) {
      const posInfo = getRowColFromPos(state, selection.$from);
      if (!posInfo) return false;
      rowIndices = [posInfo.row];
      colIndices = [posInfo.col];
    } else {
      const rowSet = new Set();
      const colSet = new Set();
      for (let i = 0; i < selection.ranges.length; i++) {
        const range = selection.ranges[i];
        const posInfo = getRowColFromPos(state, range.$from);
        if (posInfo) {
          rowSet.add(posInfo.row);
          colSet.add(posInfo.col);
        }
      }
      rowIndices = Array.from(rowSet).sort((a, b) => a - b);
      colIndices = Array.from(colSet).sort((a, b) => a - b);
    }
    if (colIndices.length === 0) return false;
    const isConsecutiveCols = colIndices.every((v, i) => i === 0 || v === colIndices[i - 1] + 1);
    if (!isConsecutiveCols) return false;
    const minRow = rowIndices[0];
    const maxRow = rowIndices[rowIndices.length - 1];
    const minCol = colIndices[0];
    const maxCol = colIndices[colIndices.length - 1];
    const isFullCol = minRow === 0 && maxRow === map.height - 1;
    if (maxCol === map.width - 1) return false;
    const tr = state.tr;
    const groupCols = [...colIndices, maxCol + 1];
    const shiftAmount = groupCols.length - 1;
    const rowList = isFullCol ? Array.from({ length: map.height }, (_, i) => i) : rowIndices;
    if (isFullCol) {
      for (let row of rowList) {
        let changes = [];
        for (let j = 0; j < groupCols.length; j++) {
          const c = groupCols[j];
          const cellPos = getCellPos(tablePos, table, map, row, c);
          const cell = state.doc.nodeAt(cellPos);
          if (!cell) continue;
          changes.push({
            pos: cellPos,
            oldSize: cell.nodeSize,
            oldCell: cell
          });
        }
        const m = changes.length;
        if (m < 2) continue;
        for (let j = 0; j < m; j++) {
          const targetIndex = (j + shiftAmount) % m;
          changes[j].newCell = changes[targetIndex].oldCell.copy(changes[targetIndex].oldCell.content);
        }
        changes.sort((a, b) => b.pos - a.pos);
        for (let ch of changes) {
          tr.replaceWith(ch.pos, ch.pos + ch.oldSize, ch.newCell);
        }
      }
    } else {
      for (let row of rowList) {
        let changes = [];
        for (let j = 0; j < groupCols.length; j++) {
          const c = groupCols[j];
          const cellPos = getCellPos(tablePos, table, map, row, c);
          const cell = state.doc.nodeAt(cellPos);
          if (!cell) continue;
          const contentPos = cellPos + 1;
          const content = cell.content;
          let frag = Fragment.from(content);
          changes.push({
            pos: contentPos,
            oldSize: content.size,
            oldContent: frag
          });
        }
        const m = changes.length;
        if (m < 2) continue;
        for (let j = 0; j < m; j++) {
          const targetIndex = (j + shiftAmount) % m;
          let newFrag = changes[targetIndex].oldContent;
          if (newFrag.childCount === 0) {
            newFrag = Fragment.from(state.schema.nodes.paragraph.create());
          }
          changes[j].newContent = newFrag;
        }
        changes.sort((a, b) => b.pos - a.pos);
        for (let ch of changes) {
          tr.replace(ch.pos, ch.pos + ch.oldSize, new Slice(ch.newContent, 0, 0));
        }
      }
    }
    dispatch(tr);
    return true;
  },
  clearSelectedCells: () => {
    const { state, dispatch } = Tiptap_Editor.view;
    const { selection } = state;
    const tablePos = findTable(selection.$from);
    if (tablePos === null) return false;
    const table = state.doc.nodeAt(tablePos);
    const map = TableMap.get(table);
    const tr = state.tr;
    if (selection instanceof CellSelection) {
      let cells = [];
      selection.forEachCell((cell, pos) => {
        cells.push({ pos, end: pos + cell.nodeSize - 1 });
      });
      cells.sort((a, b) => b.pos - a.pos);
      for (let c of cells) {
        const emptyParagraph = state.schema.nodes.paragraph.create();
        tr.replaceWith(c.pos + 1, c.end, emptyParagraph);
      }
    } else {
      const posInfo = getRowColFromPos(state, selection.$from);
      if (!posInfo) return false;
      const cellPos = getCellPos(tablePos, table, map, posInfo.row, posInfo.col);
      const cell = state.doc.nodeAt(cellPos);
      const emptyParagraph = state.schema.nodes.paragraph.create();
      tr.replaceWith(cellPos + 1, cellPos + cell.nodeSize - 1, emptyParagraph);
    }
    dispatch(tr);
    return true;
  },
};


const Custom_Table = Table.extend({
  // 1. Ensure resizable is on
  addOptions() {
    return {
      ...this.parent?.(),
      resizable: true,
      HTMLAttributes: {}
    }
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      { class: 'tableWrapper' }, // Your wrapper class
      [
        'table',
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
        ['tbody', 0] // 0 is the hole where content (rows) is rendered
      ]
    ]
  }
})



const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: { char: '/', startOfLine: false, allowedPrefixes: [' ', '\n'] },
      items: []
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,

        items: ({ query }) => {
          const allItems = this.options.items || []
          if (!query) return allItems
          return allItems.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase())
          )
        },

        command: ({ editor, range, props }) => {
          props.command({ editor, range })
        },

        render: () => {
          const component = {
            popup: null,
            menuElement: null,
            selectedIndex: 0,
            currentItems: [],
            Symbol_Range: null,
            group: null,
            start: false,
          }

          const buildMenu = (items) => {
            if (!component.menuElement) return

            component.menuElement.innerHTML = ''
            component.currentItems = items

            if (items.length === 0) {
              component.menuElement.innerHTML = `<div class="slash-menu-no-results">No results</div>`
              return
            }

            items.forEach((item, idx) => {
              const div = document.createElement('div')
              div.className = `slash-menu-item`
              div.dataset.index = idx.toString();
              //
              let group_divider = document.createElement('div');
              group_divider.className = 'slash-menu-group';
              //
              div.innerHTML = `
                  <span class="slash-menu-icon"> <i class="${item.icon}"> </i> </span>
                  <span class="slash-menu-title" title="${item.desc}">${item.title}</span>
                `
              if (!component.start) {
                component.group = item.group;
                component.start = true;
                component.group = item.group;
                //
                group_divider.innerText = item.group;
                component.menuElement.appendChild(group_divider);
              }

              if (component.start) {
                if (component.group != item.group) {
                  component.group = item.group;
                  group_divider.innerText = item.group;
                  component.menuElement.appendChild(group_divider);
                }
              }


              div.addEventListener('click', () => {
                this.editor.commands.deleteRange(component.Symbol_Range)
                item.command({ editor: this.editor })
                this.editor.commands.focus()
                if (component.popup) component.popup.hide()
              })

              div.addEventListener('mouseenter', () => {
                component.selectedIndex = idx
                updateSelected()
              })

              component.menuElement.appendChild(div)
            })

            updateSelected()
          }

          const updateSelected = () => {
            if (!component.menuElement) return
            const items = Array.from(component.menuElement.children)
            items.forEach((el) => {
              const idx = parseInt(el.dataset.index, 10)
              el.classList.toggle('slash-menu-item-selected', idx === component.selectedIndex)
            })
            scrollToSelected()
          }

          const scrollToSelected = () => {
            if (!component.menuElement) return
            const selectedEl = component.menuElement.querySelector('.slash-menu-item-selected')
            if (selectedEl) {
              selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
            }
          }

          return {
            onStart: (props) => {
              component.selectedIndex = 0
              component.currentItems = props.items
              component.Symbol_Range = props.range // Store range for later use in click

              component.menuElement = document.createElement('div')
              component.menuElement.className = 'slash-menu'

              if (component.popup) component.popup.hide()

              component.popup = tippy(document.body, {
                getReferenceClientRect: props.clientRect,
                appendTo: this.editor.view.dom.parentElement,
                content: component.menuElement,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
                arrow: false,
                offset: [0, 6],
                hideOnClick: true,
                popperOptions: {
                  modifiers: [
                    { name: 'flip', options: { fallbackPlacements: ['top-start', 'bottom-end'] } },
                    { name: 'preventOverflow', options: { boundary: this.editor.view.dom.parentElement, padding: 12 } }
                  ]
                },
                onHidden: () => {
                  if (component.popup) {
                    component.popup.destroy()
                    component.popup = null
                  }
                }
              })

              buildMenu(props.items)
            },

            onUpdate: (props) => {
              component.Symbol_Range = props.range // Update range on each update
              if (!props.text?.startsWith('/')) {
                if (component.popup) component.popup.hide()
                return
              }

              buildMenu(props.items)
              if (component.popup) component.popup.setProps({ getReferenceClientRect: props.clientRect })
            },

            onExit: () => {
              if (component.popup) component.popup.hide()
              component.popup = null
              component.menuElement = null
              component.currentItems = []
              component.selectedIndex = 0
              component.Symbol_Range = null
            },

            onKeyDown: (props) => {
              if (props.event.key === 'Escape') {
                props.event.preventDefault();
                this.editor.commands.deleteRange(props.range)
                if (component.popup) component.popup.hide()
                return true
              }

              if (props.event.key === 'ArrowDown') {
                component.selectedIndex = (component.selectedIndex + 1) % component.currentItems.length
                updateSelected()
                return true
              }

              if (props.event.key === 'ArrowUp') {
                component.selectedIndex = (component.selectedIndex - 1 + component.currentItems.length) % component.currentItems.length
                updateSelected()
                return true
              }

              if (props.event.key === 'Enter') {
                const item = component.currentItems[component.selectedIndex]
                if (item) {
                  this.editor.commands.deleteRange(props.range)
                  item.command({ editor: this.editor })
                  this.editor.commands.focus()
                  if (component.popup) component.popup.hide()
                }
                return true
              }

              return false
            }
          }
        }
      })
    ]
  }
})


const slashItems = [
  // Headings & Paragraph
  { title: 'Heading 1', icon: 'fa-solid fa-heading', desc: 'Large heading', group: 'Headings', command: () => commands.toggleHeading(1) },
  { title: 'Heading 2', icon: 'fa-solid fa-heading', desc: 'Medium heading', group: 'Headings', command: () => commands.toggleHeading(2) },
  { title: 'Heading 3', icon: 'fa-solid fa-heading', desc: 'Small heading', group: 'Headings', command: () => commands.toggleHeading(3) },
  { title: 'Heading 4', icon: 'fa-solid fa-heading', desc: 'Smaller heading', group: 'Headings', command: () => commands.toggleHeading(4) },
  { title: 'Heading 5', icon: 'fa-solid fa-heading', desc: 'Smallest heading', group: 'Headings', command: () => commands.toggleHeading(5) },
  { title: 'Paragraph', icon: 'fa-solid fa-paragraph', desc: 'Normal text', group: 'Headings', command: () => commands.toggleHeading_off() },

  // Lists
  { title: 'Bullet List', icon: 'fa-solid fa-list-ul', desc: 'Unordered list', group: 'Lists', command: () => commands.toggleBulletList() },
  { title: 'Number List', icon: 'fa-solid fa-list-ol', desc: 'Ordered list', group: 'Lists', command: () => commands.toggleOrderedList() },
  { title: 'Task List', icon: 'fa-solid fa-square-check', desc: 'Todo list', group: 'Lists', command: () => commands.toggleTaskList() },

  // Quotes & Code
  { title: 'Blockquote', icon: 'fa-solid fa-quote-left', desc: 'Quote', group: 'Blocks', command: () => commands.toggleBlockquote() },
  { title: 'Code Block', icon: 'fa-solid fa-code', desc: 'Code block', group: 'Blocks', command: () => commands.toggleCodeBlock() },
  { title: 'Divider', icon: 'fa-solid fa-minus', desc: 'Horizontal rule', group: 'Blocks', command: () => commands.insertHR() },

  // Text Styles
  { title: 'Bold', icon: 'fa-solid fa-bold', desc: 'Bold', group: 'Text Styles', command: () => commands.toggleBold() },
  { title: 'Italic', icon: 'fa-solid fa-italic', desc: 'Italic', group: 'Text Styles', command: () => commands.toggleItalic() },
  { title: 'Underline', icon: 'fa-solid fa-underline', desc: 'Underline', group: 'Text Styles', command: () => commands.toggleUnderline() },
  { title: 'Strikethrough', icon: 'fa-solid fa-strikethrough', desc: 'Strike', group: 'Text Styles', command: () => commands.toggleStrike() },
  { title: 'Inline Code', icon: 'fa-solid fa-code', desc: 'Inline code', group: 'Text Styles', command: () => commands.toggleInlineCode() },

  // Alignment
  { title: 'Align Left', icon: 'fa-solid fa-align-left', desc: 'Align text left', group: 'Alignment', command: () => commands.setTextAlign('left') },
  { title: 'Align Center', icon: 'fa-solid fa-align-center', desc: 'Align text center', group: 'Alignment', command: () => commands.setTextAlign('center') },
  { title: 'Align Right', icon: 'fa-solid fa-align-right', desc: 'Align text right', group: 'Alignment', command: () => commands.setTextAlign('right') },
  { title: 'Justify', icon: 'fa-solid fa-align-justify', desc: 'Justify text', group: 'Alignment', command: () => commands.setTextAlign('justify') },
  { title: 'Hard Break', icon: 'fa-solid fa-level-down-alt', desc: 'Line break', group: 'Alignment', command: () => commands.insertHardBreak() },

  // Layout
  { title: '2 Columns', icon: 'fa-solid fa-columns', desc: 'Split into two columns', group: 'Layout', command: () => commands.insertColumns(2) },
  { title: '3 Columns', icon: 'fa-solid fa-columns', desc: 'Split into three columns', group: 'Layout', command: () => commands.insertColumns(3) },
  { title: '4 Columns', icon: 'fa-solid fa-columns', desc: 'Split into four columns', group: 'Layout', command: () => commands.insertColumns(4) },
  { title: '5 Columns', icon: 'fa-solid fa-columns', desc: 'Split into five columns', group: 'Layout', command: () => commands.insertColumns(5) },
  { title: '6 Columns', icon: 'fa-solid fa-columns', desc: 'Split into six columns', group: 'Layout', command: () => commands.insertColumns(6) },
  { title: 'UnWrap Cols', icon: 'fa-solid fa-columns', desc: 'Turn columns back into normal text', group: 'Layout', command: () => commands.unwrapColumns() },
  { title: 'Delete Cols', icon: 'fa-solid fa-trash', desc: 'Delete entire columns block', group: 'Layout', command: () => commands.deleteColumns() },

  // Actions
  { title: 'Copy Content', icon: 'fa-solid fa-copy', desc: 'Copy to clipboard', group: 'Actions', command: () => commands.copyContentToClipboard() },
]


/* custom columns */

// parent columns container
const Columns = Node.create({
  name: 'columns',
  group: 'block',
  content: 'column+',
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      columnCount: { default: 2 },
    }
  },

  // ✅ ADD THIS PARSE HTML RULE
  parseHTML() {
    return [
      {
        tag: 'div.columns',
        getAttrs: element => {
          return {
            columnCount: parseInt(element.getAttribute('columncount') || '2', 10)
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        class: 'columns',
        style: 'display: flex; gap: 24px; width: 100%;',
      }),
      0,
    ]
  },

  addCommands() {
    return {
      insertColumns: (count = 2) => ({ commands }) => {
        return commands.insertContent({
          type: 'columns',
          attrs: { columnCount: count },
          content: Array.from({ length: count }, () => ({
            type: 'column',
            content: [{ type: 'paragraph' }],
          })),
        })
      },

      // ✅ FINAL WORKING UNWRAP (flat append method)
      unwrapColumns: () => ({ state, dispatch }) => {
        console.group('🔍 unwrapColumns DEBUG v8 — FLAT APPEND (final)')
        const { $from } = state.selection
        console.log('Cursor pos:', $from.pos, '| depth:', $from.depth, '| node:', $from.parent.type.name)

        let columnsNode = null
        let columnsPos = null

        for (let depth = $from.depth; depth > 0; depth--) {
          if ($from.node(depth).type.name === 'columns') {
            columnsNode = $from.node(depth)
            columnsPos = $from.before(depth)
            break
          }
        }

        if (!columnsNode || columnsPos === null) {
          console.error('❌ Columns node not found')
          console.groupEnd()
          return false
        }

        console.log(`✅ Found columns at pos ${columnsPos} | size ${columnsNode.nodeSize}`)

        // Flatten ALL inner content from every column (preserves text, media, tasks, etc.)
        let flatContent = Fragment.empty
        columnsNode.forEach((column) => {
          console.log(`  Column → appending ${column.childCount} blocks`)
          flatContent = flatContent.append(column.content)
        })

        console.log(`📦 Flattened fragment childCount: ${flatContent.childCount}`)

        const from = columnsPos
        const to = columnsPos + columnsNode.nodeSize

        // Replace columns with flattened content
        const tr = state.tr.replaceRangeWith(from, to, flatContent)

        // Place cursor at the start of the first restored block
        const newCursorPos = from + 1
        tr.setSelection(state.selection.constructor.near(tr.doc.resolve(newCursorPos)))

        dispatch(tr.scrollIntoView())

        console.log('✅ Unwrap successful — all content should be preserved')
        console.groupEnd()
        return true
      },

      deleteColumns: () => ({ state, dispatch }) => {
        const { $from } = state.selection
        for (let depth = $from.depth; depth > 0; depth--) {
          if ($from.node(depth).type.name === 'columns') {
            const pos = $from.before(depth)
            const size = $from.node(depth).nodeSize
            dispatch(state.tr.delete(pos, pos + size).scrollIntoView())
            return true
          }
        }
        return false
      },
    }
  },
});

// child block of columns
const Column = Node.create({
  name: 'column',
  content: 'block+',        // any blocks allowed
  group: 'block',
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      width: {
        default: '1fr',
        parseHTML: element => element.style.flex || '1fr',
        renderHTML: attributes => ({
          style: `flex: ${attributes.width} 1 0; min-width: 0;`,
        }),
      },
    }
  },

  // ✅ ADD THIS PARSE HTML RULE
  parseHTML() {
    return [
      {
        tag: 'div.column',
        getAttrs: element => {
          const flexStyle = element.style.flex;
          return {
            width: flexStyle ? flexStyle.split(' ')[0] : '1fr'
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { class: 'column' }),
      0,
    ]
  },
});


const lowlight = createLowlight(all);

// 3. Export/Declare Tiptap_Editor as a static proxy pointer
export const Tiptap_Editor = new Editor({
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] },
      codeBlock: false,
    }),
    SlashCommand.configure({
      items: slashItems
    }),
    MediaNode.extend({
      addNodeView() {
        return MediaNodeView;
      },
    }),
    Placeholder.configure({
      placeholder: 'Write Your Thoughts /',
    }),
    CodeBlockLowlight.configure({
      lowlight,
      defaultLanguage: null,        // ← This enables auto-detection
    }),
    Columns,
    Column,
    AiRichBlock,
    ExtendedTextStyle,          // ← use this instead of plain TextStyle
    FontSize,
    LineHeight,
    Color,
    Highlight.configure({ multicolor: true }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Custom_Table,
    BackgroundBlock,         // ← our custom extension
    TableRow,
    TableHeader,
    TableCell,       // ← use our custom cell with background support
  ],
  content: '',
  editable: true,
  editorProps: {
    handlePaste(view, event) {
      Paste(
        event.clipboardData,
        manageMedia_Metod_ref.value,
        event
      );
      return true; // Tells Tiptap: "We handled it, don't do default"
    },
    handleDrop(view, event, slice, moved) {
      // let Is_our_internal_media = slice.content.toString() === '<media>'; // Check if the dropped content is our internal media node
      if (!moved) { // if something is moved inside editor then its our internal media node or text so we will not handle it here and let Tiptap handle it but if its not moved then its external file drop so we will handle it here.
        Paste(
          event.dataTransfer,
          manageMedia_Metod_ref.value,
          event
        );
        return true; // Tells Tiptap: "We handled it, don't do default"
      }
      return false; // Not a file drop, let Tiptap handle it (e.g. for dragging anything inside of editor like our media node or text)
    }
  }
});


function Is_Text_Alignment_Active(align = null) {
  const { selection } = Tiptap_Editor.state;
  const { $from } = selection;

  // Get the parent block node (universal: works for any node type)
  const node = $from.parent;

  // Get current textAlign (falls back to 'left' if unset or unsupported)
  const currentAlign = node.attrs.textAlign || 'left';

  // General: "On" if not default ('left' or null/undefined)
  let ans = currentAlign !== 'left';
  return { ans, currentAlign };
};


function Table_Insertion_With_Space(rows, cols) {
  const tableContent = Array.from({ length: rows }).map((_, rowIndex) => ({
    type: 'tableRow',
    content: Array.from({ length: cols }).map(() => ({
      type: rowIndex === 0 ? 'tableHeader' : 'tableCell',
      content: [{ type: 'paragraph' }]
    })),
  }));

  // Log initial state
  console.log('Starting insertTable: rows=', rows, 'cols=', cols);
  const initialDocJSON = Tiptap_Editor.state.doc.toJSON();
  console.log('Initial doc JSON:', initialDocJSON);

  // Capture the insertion position before inserting
  const insertPos = Tiptap_Editor.state.selection.from;
  console.log('Insertion position (insertPos):', insertPos);

  // Insert with spacing
  const insertCommand = Tiptap_Editor.chain().focus().insertContent([
    { type: 'paragraph' },  // Space above (empty p, nodeSize=2)
    { type: 'table', content: tableContent },
    { type: 'paragraph' }   // Space below (empty p, nodeSize=2)
  ]);
  insertCommand.run();
  console.log('Insertion command executed');

  // Log doc after insertion
  const postInsertDocJSON = Tiptap_Editor.state.doc.toJSON();
  console.log('Post-insertion doc JSON:', postInsertDocJSON);

  // Calculate expected tablePos: Based on logs, consistently insertPos + 1
  const expectedTablePos = insertPos + 1;
  console.log('Expected tablePos (insertPos + 1):', expectedTablePos);

  // Verify if node at expectedTablePos is indeed the table
  const doc = Tiptap_Editor.state.doc;
  const possibleTableNode = doc.nodeAt(expectedTablePos);
  console.log('Node at expectedTablePos:', possibleTableNode ? possibleTableNode.type.name : 'null');

  let tablePos = null;
  if (possibleTableNode && possibleTableNode.type.name === 'table') {
    tablePos = expectedTablePos;
    console.log('Using expectedTablePos as tablePos (direct match)');
  } else {
    // Fallback to searching for the table inserted at or after insertPos
    console.log('Fallback: Searching doc for table >= insertPos');
    doc.descendants((node, pos) => {
      if (tablePos !== null) {
        return false;  // Skip remaining after found to prevent overwrite
      }
      console.log('  Checking node at pos', pos, ':', node.type.name);
      if (node.type.name === 'table' && pos >= insertPos) {
        tablePos = pos;
        console.log('  Found matching table at pos:', pos);
        return false;  // Skip children
      }
      return true;  // Continue
    });
  }

  if (tablePos !== null) {
    console.log('Confirmed tablePos:', tablePos);
    const tableNode = doc.nodeAt(tablePos);
    console.log('Table node childCount:', tableNode.childCount);

    // Traverse inside the table to find the first paragraph's absolute position
    let paraPos = null;
    let currentPos = tablePos + 1;  // Start inside table content
    console.log('Starting traversal inside table at currentPos:', currentPos);

    const traverseNode = (node, startPos) => {
      console.log('  Traversing node:', node.type.name, 'at startPos:', startPos, 'childCount:', node.childCount);
      for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        const childPos = startPos;
        console.log('    Child', i, ':', child.type.name, 'at childPos:', childPos, 'nodeSize:', child.nodeSize);

        if (child.type.name === 'paragraph') {
          paraPos = childPos;
          console.log('    Found first paragraph at paraPos:', paraPos);
          return true;  // Found, stop traversal
        }

        if (child.childCount > 0) {
          if (traverseNode(child, childPos + 1)) {
            return true;  // Propagate stop signal
          }
        }

        // Move to next sibling
        startPos += child.nodeSize;
      }
      return false;  // Not found in this branch
    };

    traverseNode(tableNode, currentPos);

    if (paraPos !== null) {
      // Cursor position: inside the empty paragraph, typically paraPos + 1 (after open)
      const cursorPos = paraPos + 1;
      console.log('Calculated cursorPos:', cursorPos);

      // Verify the position is valid
      const resolved = doc.resolve(cursorPos);
      console.log('Resolved position at cursorPos:', resolved.parent.type.name, '(should be paragraph)');

      if (resolved.parent.type.name === 'paragraph') {
        // Set cursor (collapsed selection)
        Tiptap_Editor.chain().setTextSelection({ from: cursorPos, to: cursorPos }).run();
        console.log('Set selection to cursorPos successfully');
      } else {
        console.warn('Resolved parent is not paragraph:', resolved.parent.type.name);
      }
    } else {
      console.warn('First paragraph not found in the table');
    }
  } else {
    console.warn('Inserted table not found');
  }

  // Final log of selection after everything
  const finalSelection = Tiptap_Editor.state.selection;
  console.log('Final selection: from=', finalSelection.from, 'to=', finalSelection.to);
}

export let Read_mode_copy_success = ref(false);

let { isTouchFirst } = useTouchDetection();
// Helper methods (you will import these)
export const commands = {
  toggleBold: () => Tiptap_Editor.chain().focus().toggleBold().run(),
  toggleItalic: () => Tiptap_Editor.chain().focus().toggleItalic().run(),
  toggleUnderline: () => Tiptap_Editor.chain().focus().toggleUnderline().run(),
  toggleStrike: () => Tiptap_Editor.chain().focus().toggleStrike().run(),
  // set and remove link based on if selection has content then use that content as name and ask for link other  wise if no selection then ask for link and name both.
  setLink: (url) => Tiptap_Editor.chain().focus().setLink({ href: url }).run(),
  unsetLink: () => Tiptap_Editor.chain().focus().unsetLink().run(),
  //
  toggleCodeBlock: () => Tiptap_Editor.chain().focus().toggleCodeBlock().run(),
  toggleInlineCode: () => Tiptap_Editor.chain().focus().toggleCode().run(),
  //
  toggleHeading: (level) => Tiptap_Editor.chain().focus().toggleHeading({ level }).run(),
  toggleHeading_off: () => Tiptap_Editor.chain().focus().setParagraph().run(),
  //
  toggleBulletList: () => Tiptap_Editor.chain().focus().toggleBulletList().run(),
  toggleOrderedList: () => Tiptap_Editor.chain().focus().toggleOrderedList().run(),
  //
  toggleTaskList: () => Tiptap_Editor.chain().focus().toggleTaskList().run(),
  //
  toggleBlockquote: () => Tiptap_Editor.chain().focus().toggleBlockquote().run(),
  //
  setTextAlign: (align) => Tiptap_Editor.chain().focus().setTextAlign(align).run(),
  unsetTextAlign: () => Tiptap_Editor.chain().focus().setTextAlign('left').run(),
  //
  setColor: (color) => Tiptap_Editor.chain().focus().setColor(color).run(),
  unsetColor: () => Tiptap_Editor.chain().focus().unsetColor().run(),
  //
  setHighlight: (color) => Tiptap_Editor.chain().focus().setHighlight({ color }).run(),
  unsetHighlight: () => Tiptap_Editor.chain().focus().unsetHighlight().run(),
  //
  toggle_block_bg: (color) => Toggle_Block_Background_Color(color),
  //
  setFontSize: (size) => Tiptap_Editor.chain().focus().setFontSize(size).run(),
  unsetFontSize: () => Tiptap_Editor.chain().focus().unsetFontSize().run(),
  //
  insertColumns: (count = 2) => Tiptap_Editor.chain().focus().insertColumns(count).run(),
  unwrapColumns: () => Tiptap_Editor.chain().focus().unwrapColumns().run(),
  deleteColumns: () => Tiptap_Editor.chain().focus().deleteColumns().run(),
  // add logs as well to see if its touch device or not and then run undo or redo accordingly.
  undo: () => { isTouchFirst.value ? Tiptap_Editor.chain().undo().run() : Tiptap_Editor.chain().focus().undo().run(); },
  redo: () => { isTouchFirst.value ? Tiptap_Editor.chain().redo().run() : Tiptap_Editor.chain().focus().redo().run(); },
  // now make method for copy content to clipboard.
  copyContentToClipboard: async (mode) => {
    try {
      let content_html = '';

      if (mode === 'editor') content_html = Tiptap_Editor.view.dom.innerHTML;
      else if (mode === 'read') content_html = normalizeTitle(document.getElementsByClassName('read_mode_content')[0].innerHTML);
      else throw new Error('Invalid mode for copyContentToClipboard. Use "editor" or "read".');
      const tiptap_markdown = turndown.turndown(content_html);
      await Clipboard_Copy({ md: tiptap_markdown, html: content_html });
      // add successfull copy content emoji to message as well to make it good looking
      if (mode === 'editor') Show_Create_Edit_Model_Warning('✅ Content copied to clipboard! 📋', 2000);
      else if (mode === 'read') {
        Read_mode_copy_success.value = true;
        setTimeout(() => Read_mode_copy_success.value = false, 2000);
      }
    } catch (error) {
      Show_Create_Edit_Model_Warning('❌ Failed to copy content to clipboard. Please try again.', 2000);
      debugError('Failed to copy content to clipboard:', error);
    }
  },

  //
  setLineHeight: (height) => Tiptap_Editor.chain().focus().setLineHeight(height).run(),
  unsetLineHeight: () => Tiptap_Editor.chain().focus().unsetLineHeight().run(),
  //---------------
  insertTable: (row, col) => Table_Insertion_With_Space(col, row),

  deleteTable: () => Tiptap_Editor.chain().focus().deleteTable().run(),
  // row operations
  addRowBefore: () => Tiptap_Editor.chain().focus().addRowBefore().run(),
  addRowAfter: () => Tiptap_Editor.chain().focus().addRowAfter().run(),
  deleteRow: () => Tiptap_Editor.chain().focus().deleteRow().run(),
  // column operations
  addColumnBefore: () => Tiptap_Editor.chain().focus().addColumnBefore().run(),
  addColumnAfter: () => Tiptap_Editor.chain().focus().addColumnAfter().run(),
  deleteColumn: () => Tiptap_Editor.chain().focus().deleteColumn().run(),
  // cell operations
  mergeCells: () => Tiptap_Editor.chain().focus().mergeCells().run(),
  splitCell: () => Tiptap_Editor.chain().focus().splitCell().run(),
  // header operations
  toggleHeaderRow: () => Tiptap_Editor.chain().focus().toggleHeaderRow().run(),
  toggleHeaderColumn: () => Tiptap_Editor.chain().focus().toggleHeaderColumn().run(),
  toggleHeaderCell: () => Tiptap_Editor.chain().focus().toggleHeaderCell().run(),
  // Table Reorder
  moveTableRowUp: () => Table_Reorder.moveRowUp(),
  moveTableRowDown: () => Table_Reorder.moveRowDown(),
  moveTableColumnLeft: () => Table_Reorder.moveColumnLeft(),
  moveTableColumnRight: () => Table_Reorder.moveColumnRight(),
  clearSelectedTableCells: () => Table_Reorder.clearSelectedCells(),
  // table cell background color toggle
  setTableCellBackgroundColor: (color) => Tiptap_Editor.chain().setCellAttribute('backgroundColor', color).focus().run(),
  unsetTableCellBackgroundColor: () => Tiptap_Editor.chain().setCellAttribute('backgroundColor', null).focus().run(),
  //---------------
  insertHR: () => Tiptap_Editor.chain().focus().setHorizontalRule().run(),
  insertHardBreak: () => Tiptap_Editor.chain().focus().setHardBreak().run(),
  clearInlineStyles: () => Tiptap_Editor.chain().focus().unsetAllMarks().run(),
};


function normalizeTitle(htmlString) {
  // Create a temporary container
  const container = document.createElement("div");
  container.innerHTML = htmlString;

  // Find the title div
  const titleDiv = container.querySelector(".View_Text_In_UI_Title");
  if (titleDiv && titleDiv.innerText.trim() !== "") {
    const h1 = document.createElement("h1");
    h1.textContent = titleDiv.textContent; // copy inner text
    titleDiv.replaceWith(h1);
  }

  return container.innerHTML;
}


async function Clipboard_Copy({ md, html }) {
  const formats = {};

  // text/plain ALWAYS contains markdown
  formats["text/plain"] = new Blob([md], { type: "text/plain" });

  // Add markdown only if supported
  if (navigator.clipboard?.supports?.("text/markdown")) {
    formats["text/markdown"] = new Blob([md], { type: "text/markdown" });
  }

  // Add HTML only if supported
  if (navigator.clipboard?.supports?.("text/html")) {
    formats["text/html"] = new Blob([html], { type: "text/html" });
  }

  try {
    const item = new ClipboardItem(formats);
    await navigator.clipboard.write([item]);
    return true;
  } catch (err) {
    console.warn("ClipboardItem failed, falling back", err);

    // Fallback: plain text only (markdown)
    const ta = document.createElement("textarea");
    ta.value = md;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();

    return false;
  }
}



// In your 'selectionUpdate' handler or as a standalone function
function isTableCellBGActive() {
  const { state } = Tiptap_Editor;
  const { selection } = state;
  const defaultBG = getDefaultEditorBG();

  // Quick check for single-cell (cursor or basic selection)
  if (Tiptap_Editor.isActive('tableCell') || Tiptap_Editor.isActive('tableHeader')) {
    // Get attrs from the active node type (prioritize tableCell, fallback to tableHeader)
    const cellAttrs = Tiptap_Editor.getAttributes('tableCell') || Tiptap_Editor.getAttributes('tableHeader') || {};
    const cellBG = cellAttrs.backgroundColor || defaultBG;
    if (!!cellBG && cellBG !== 'transparent' && cellBG !== defaultBG) {
      return true;
    }
  }

  // If it's a multi-cell selection, fallback to full traversal
  if (selection instanceof CellSelection) {
    let hasActiveBG = false;
    selection.forEachCell((cell) => {
      const bgColor = cell.attrs.backgroundColor || defaultBG;
      if (!!bgColor && bgColor !== 'transparent' && bgColor !== defaultBG) {
        hasActiveBG = true;
      }
    });
    return hasActiveBG;
  }

  return false;
}


// Active state helpers
export const isActive = (type, attributes = {}) => Tiptap_Editor.isActive(type, attributes);



export const currentHeading = ref(null);
//
export const currentFontSize = ref(null);
export const isFontSizeActive = ref(false);
//
export const Is_Font_Color_Active = ref(false);
//
export const currentLineHeight = ref(null);
export const isLineHeightActive = ref(false);
//  now the text alignment size.
export const currentTextAlign = ref(null);
export const isTextAlignActive = ref(false);
//
export const Is_Block_Background_Color_Active = ref(false);
//
export const Is_Table_Cell_Background_Color_Active = ref(false);
//


// Update current states on selection change
function updateActiveStates() {
  const headingAttrs = Tiptap_Editor.getAttributes('heading');
  const attrs = Tiptap_Editor.getAttributes('textStyle')
  const editor_el = editor.value?.$el.firstElementChild;


  currentHeading.value = headingAttrs?.level || null;

  const fontSize = cleanStyleValue(attrs.fontSize);
  currentFontSize.value = fontSize || null;

  const defaultFontSize = window.getComputedStyle(editor_el).fontSize;
  isFontSizeActive.value = currentFontSize.value && currentFontSize.value !== defaultFontSize;

  const lineHeight = cleanStyleValue(attrs.lineHeight);
  currentLineHeight.value = lineHeight || null;

  const defaultLineHeight = window.getComputedStyle(editor_el).lineHeight;
  isLineHeightActive.value = currentLineHeight.value && currentLineHeight.value !== defaultLineHeight;

  const textAlign = Is_Text_Alignment_Active();
  currentTextAlign.value = textAlign.currentAlign || 'left';

  isTextAlignActive.value = textAlign.ans;

  let bgColor = attrs.backgroundColor;  // Inline
  if (!bgColor) {
    const { $from } = Tiptap_Editor.state.selection;
    bgColor = $from.parent.attrs.backgroundColor || getDefaultEditorBG();
  }

  Is_Block_Background_Color_Active.value = !!bgColor && bgColor !== 'transparent' && bgColor !== getDefaultEditorBG();

  Is_Table_Cell_Background_Color_Active.value = isTableCellBGActive();

  const fontColor = attrs.color;
  const currentFontColor = fontColor || null;
  const defaultFontColor = window.getComputedStyle(editor_el).color;
  Is_Font_Color_Active.value = !!currentFontColor && currentFontColor !== defaultFontColor && currentFontColor !== 'transparent';
};


Tiptap_Editor.on('transaction', updateActiveStates);


function cleanStyleValue(value) {
  if (!value) return null

  const invalid = ['inherit', 'initial', 'unset', 'normal', '']
  if (invalid.includes(value)) {
    return null
  }

  return value
}


export let editor = ref(null);
export let View_Note_Page_UI = ref(null);

// Attachment limit warning message logic
export let Note_Attachment_Limit_Warning_Message = ref();
export let Attachment_Capacity_Violation_Toggle_Message = ref(false)
let warningTimer = null;

export function Show_Create_Edit_Model_Warning(message, timeOut) {
  try {
    // Set message
    Note_Attachment_Limit_Warning_Message.value.textContent = message;
    Attachment_Capacity_Violation_Toggle_Message.value = true;
    // Clear any previous timer
    if (warningTimer)
      clearTimeout(warningTimer);
    // Start a new timer
    warningTimer = setTimeout(() => {
      Attachment_Capacity_Violation_Toggle_Message.value = false;
      warningTimer = null; // reset reference
    }, timeOut);
  } catch (error) {
    console.log(error.message);
  }
}