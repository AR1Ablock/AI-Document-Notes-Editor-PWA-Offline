import { Node } from '@tiptap/core'

export const MediaNode = Node.create({
  name: 'media',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      id: { default: null },
      loaderId: { default: null },
      src: { default: null },
      type: { default: 'image' }, // image | video | audio | document
      order: { default: 1 },
      name: { default: null },
      source: { default: null }, // online | local
      width: { default: null },
      height: { default: null },
      rotation: { default: 0 },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div.override_media_position_in_live_editor',
        getAttrs: (dom) => ({
          id: dom.getAttribute('data-id') || null,
          loaderId: dom.getAttribute('data-loader-id') || null,
          src: dom.getAttribute('data-src') || null,
          type: dom.getAttribute('data-type') || 'image',
          order: parseInt(dom.getAttribute('data-order')) || 1,
          name: dom.getAttribute('data-name') || null,
          source: dom.getAttribute('data-source') || null,
          width: parseInt(dom.getAttribute('data-width') || dom.style.width) || null,
          height: parseInt(dom.getAttribute('data-height') || dom.style.height) || null,
          rotation: parseFloat(dom.getAttribute('data-rotation')) || 0,
        }),
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { id, loaderId, src, type, order, name, source, width, height, rotation } = HTMLAttributes;
    const isOnline = source === 'online';
    const wrapperAttrs = {
      class: type === 'image' ? `img override_media_position_in_live_editor` : `${type} override_media_position_in_live_editor`,
      ...(id && !isOnline ? { id } : {}),
      draggable: 'true',
      contenteditable: 'false',
      style: `width: ${width ? width + 'px' : 'auto'}; height: ${height ? height + 'px' : 'auto'}; transform: ${(type == 'image' || type == 'video') ? `rotate(${rotation ? rotation : 0}deg)` : `rotate(0deg)`};`,
      ...(isOnline ? { 'data-uid': `${name}___${Date.now()}___${Math.floor(Math.random() * 1000)}`, 'data-url': src } : {}),
      'data-src': src,
      'data-type': type,
      'data-name': name,
      'data-source': source,
      'data-order': order,
      'data-id': id,
      'data-loader-id': loaderId,
      'data-width': width,
      'data-height': height,
      'data-rotation': rotation || 0,
    };

    let children = [];

    // Loader (for non-documents)
    const loaderAttrs = {
      class: 'Upload_Loader Upload_Loader_active_media',
      ...(loaderId && !isOnline ? { id: loaderId } : {}),
      draggable: 'false',
      // Note: Styles like opacity/transform are dynamic in NodeView; omit or default here for export
      style: 'transition: opacity 0.2s, transform 0.3s; opacity: 0; transform: scale(0); display: none;',
    };
    children.push(['div', loaderAttrs]);


    // Type-specific children
    switch (type) {
      case 'image': {
        const imgAttrs = {
          src,
          alt: name,
          title: name,
          'data-type': type,
          'data-order': order,
          draggable: 'false',
          // Default styles (animations applied dynamically in editor)
          style: `
          width: ${width ? width + 'px' : '100%'};
          height: ${height ? height + 'px' : '100%'};
          transform: rotate(${rotation ? rotation : 0}deg);
          transform-origin: center center;
          transform: scale(1); opacity: 1; display: block; 
          transition: opacity 0.2s, transform 0.3s;
          `,


        };
        children.push(['img', imgAttrs]);
        break;
      }
      case 'video': {
        const videoAttrs = {
          src,
          title: name,
          controls: 'true',
          preload: 'metadata',
          muted: 'true',
          'data-type': type,
          'data-order': order,
          draggable: 'false',
          style: `
          width: ${width ? width + 'px' : '100%'};
          height: ${height ? height + 'px' : '100%'};
          transform: rotate(${rotation ? rotation : 0}deg);
          transform-origin: center center;
          transform: scale(1); opacity: 1; display: block; 
          transition: opacity 0.2s, transform 0.3s;
          `,

        };
        children.push(['video', videoAttrs]);

        const overlayAttrs = {
          class: 'video_overlay',
          draggable: 'false',
          style: `
          width: ${width ? width + 'px' : '100%'};
          height: ${height ? height + 'px' : '100%'};
          transform: scale(1); opacity: 1; display: block; 
          transition: opacity 0.2s, transform 0.3s;
          `        };
        children.push(['div', overlayAttrs]);
        break;
      }
      case 'audio': {
        const audioAttrs = {
          src,
          title: name,
          controls: 'true',
          preload: 'metadata',
          muted: 'true',
          'data-type': type,
          'data-order': order,
          draggable: 'false',
          style: `
          width: ${width ? width + 'px' : '100%'};
          transform: scale(1); opacity: 1; display: block; 
          transition: opacity 0.2s, transform 0.3s;
          `,

        };
        children.push(['audio', audioAttrs]);
        break;
      }
      case 'document': {
        const docWrapperAttrs = {
          class: 'doc_wrapper',
          style: 'display: block; opacity: 1; transform: scale(1); transition: opacity 0.2s, transform 0.3s;'
        };

        const svgAttrs = {
          width: '100',
          height: '120',
          viewBox: '0 0 24 24',
          fill: 'none',
          xmlns: 'http://www.w3.org/2000/svg'
        };

        const svgPath1 = ['path', {
          d: 'M6 2C5.44772 2 5 2.44772 5 3V21C5 21.5523 5.44772 22 6 22H18C18.5523 22 19 21.5523 19 21V8.41421C19 8.149 18.8946 7.89464 18.7071 7.70711L13.2929 2.29289C13.1054 2.10536 12.851 2 12.5858 2H6Z',
          fill: 'black',
          stroke: 'gold',
          'stroke-width': '1.5'
        }];

        const svgPath2 = ['path', {
          d: 'M9 11H15M9 15H15',
          stroke: 'gold',
          'stroke-width': '1.5',
          'stroke-linecap': 'round'
        }];

        const linkAttrs = {
          href: src,
          download: name,
          'data-type': type,
          'data-order': order,
          title: name
        };

        // Correct nested structure
        children.push([
          'div',
          docWrapperAttrs,
          ['svg', svgAttrs, svgPath1, svgPath2],
          ['a', linkAttrs, name]
        ]);

        break;
      }
    }

    return ['div', wrapperAttrs, ...children];
  },
});