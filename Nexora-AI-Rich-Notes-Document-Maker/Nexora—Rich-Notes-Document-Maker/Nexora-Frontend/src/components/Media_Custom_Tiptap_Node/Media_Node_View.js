import { Remove_Video_Overlay, runAnimation, attachMediaTimeout, startResize, animation_for_doc, startRotate } from "../Editor_Live_Media_Adding_Parser";
import { debugError } from "../Global_Error_Handler";


let Is_Media_Remover_Method_Initialized = false;
let mediaResizeHandlers = []; // ✅ Store handler references
let editorClickHandlerRef = null; // ✅ store editor click event listner handler reference

export function MediaNodeView({ node, getPos, editor }) {
    const { id, loaderId, src, type, order, name, source, width, height, rotation } = node.attrs

    let Source_Is_Online = source === 'online';

    const dom = document.createElement('div')
    if (type === 'image')
        dom.className = `img override_media_position_in_live_editor`;
    else
        dom.className = `${type} override_media_position_in_live_editor`;
    //
    if (!Source_Is_Online)
        dom.id = id
    //
    dom.setAttribute('draggable', 'true');
    // Set data attributes for online media
    if (Source_Is_Online) {
        const uniqueId = name + "__" + Date.now() + "__" + Math.floor(Math.random() * 1000);
        dom.setAttribute("data-uid", uniqueId);
        dom.setAttribute("data-url", src); // copy url later if needed
    }
    //
    dom.contentEditable = 'false'
    //
    dom.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        editor.view.dom.querySelectorAll('.override_media_position_in_live_editor.selected')
            .forEach(el => {
                if (el !== dom) el.classList.remove('selected')
            })
        // Add selection to THIS media
        dom.classList.add('selected');
    };


    if (!Is_Media_Remover_Method_Initialized) {
        Media_selection_remover(editor);
        Is_Media_Remover_Method_Initialized = true;
        console.log('---- Media Remover Method Initialize Done ----');
    }

    // Loader for everything except documents
    const loader = document.createElement('div')
    loader.className = 'Upload_Loader Upload_Loader_active_media'
    //
    if (!Source_Is_Online)
        loader.id = loaderId
    //
    loader.draggable = false

    let doc_wrapper = null // for document
    dom.appendChild(loader)
    if (type == 'document') {
        doc_wrapper = document.createElement('div');
        doc_wrapper.className = 'doc_wrapper'
    }

    switch (type) {
        case 'image': {
            const img = document.createElement('img')
            img.src = src
            img.alt = name
            img.title = name
            img.dataset.type = type
            img.dataset.order = order
            img.draggable = false
            // Start hidden and scaled down for animation
            img.style.transform = "scale(0)";
            img.style.opacity = 0;
            img.style.display = "none";
            //
            if (Source_Is_Online)
                attachMediaTimeout(img, dom, name)
            else
                img.addEventListener('load', async () => await runAnimation(img), { once: true });
            //
            dom.appendChild(img)
            break
        }

        case 'video': {
            const video = document.createElement('video')
            video.src = src
            video.title = name
            video.controls = true
            video.preload = 'metadata'
            video.muted = true
            video.dataset.type = type
            video.dataset.order = order
            video.draggable = false
            video.onclick = () => video.focus(); // alredy there
            // Start hidden and scaled down for animation
            video.style.transform = "scale(0)";
            video.style.opacity = 0;
            video.style.display = "none";
            //
            if (Source_Is_Online)
                attachMediaTimeout(video, dom, name)
            else
                video.addEventListener('loadeddata', async () => await runAnimation(video), { once: true })
            //
            dom.appendChild(video)

            const overlay = document.createElement('div')
            overlay.className = 'video_overlay'
            overlay.draggable = false
            overlay.onclick = (e) => Remove_Video_Overlay(e)
            // Start hidden and scaled down for animation
            overlay.style.transform = "scale(0)";
            overlay.style.opacity = 0;
            overlay.style.display = "none";
            //
            dom.appendChild(overlay)
            break
        }

        case 'audio': {
            const audio = document.createElement('audio')
            audio.src = src
            audio.title = name
            audio.controls = true
            audio.preload = 'metadata'
            audio.muted = true
            audio.dataset.type = type
            audio.dataset.order = order
            audio.draggable = false
            // Start hidden and scaled down for animation
            audio.style.transform = "scale(0)";
            audio.style.opacity = 0;
            audio.style.display = "none";
            //
            if (Source_Is_Online)
                attachMediaTimeout(audio, dom, name)
            else
                audio.addEventListener('loadeddata', async () => await runAnimation(audio), { once: true })
            //
            dom.appendChild(audio)
            break
        }

        case 'document': {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
            svg.setAttribute('width', '100')
            svg.setAttribute('height', '120')
            svg.setAttribute('viewBox', '0 0 24 24')
            svg.setAttribute('fill', 'none')

            const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
            path1.setAttribute('d', 'M6 2C5.44772 2 5 2.44772 5 3V21C5 21.5523 5.44772 22 6 22H18C18.5523 22 19 21.5523 19 21V8.41421C19 8.149 18.8946 7.89464 18.7071 7.70711L13.2929 2.29289C13.1054 2.10536 12.851 2 12.5858 2H6Z')
            path1.setAttribute('fill', 'black')
            path1.setAttribute('stroke', 'gold')
            path1.setAttribute('stroke-width', '1.5')

            const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
            path2.setAttribute('d', 'M9 11H15M9 15H15')
            path2.setAttribute('stroke', 'gold')
            path2.setAttribute('stroke-width', '1.5')
            path2.setAttribute('stroke-linecap', 'round')

            svg.appendChild(path1)
            svg.appendChild(path2)
            //
            doc_wrapper.appendChild(svg)

            const link = document.createElement('a')
            link.href = src
            link.download = name
            link.textContent = name
            link.dataset.type = type
            link.dataset.order = order
            link.title = name
            //
            doc_wrapper.appendChild(link)
            doc_wrapper.style.display = 'none'
            doc_wrapper.style.opacity = 0;
            doc_wrapper.style.transform = "scale(0)";
            //
            dom.appendChild(doc_wrapper);
            //
            setTimeout(() => {
                console.log('doc fired-----------');
                animation_for_doc(dom);
            }, 100);
            break;
        }
    }

    if (type !== 'audio' && type !== 'document') if (height) dom.style.height = height + 'px'
    if (width) dom.style.width = width + 'px'

    dom.style.transform = `rotate(${rotation}deg)`;
    dom.style.transformOrigin = 'center center'; // important for nice rotation

    const allDirections = ['top', 'right', 'bottom', 'left', 'top-right', 'top-left', 'bottom-right', 'bottom-left']

    // Allow only horizontal resizing for audio & document
    const directions = (type === 'audio' || type === 'document') ? ['left', 'right'] : allDirections;

    directions.forEach(dir => {
        const handle = document.createElement('div')
        handle.className = `resize-handle resize-handle-${dir}`

        // ✅ Create bound handler and store reference
        const boundHandler = (e) => startResize(e, dom, editor, dir, getPos);

        handle.addEventListener('pointerdown', boundHandler);

        // ✅ Store reference for later cleanup
        mediaResizeHandlers.push({
            element: handle,
            event: 'pointerdown',
            handler: boundHandler
        });

        dom.appendChild(handle)
    });


    // <-- NEW: rotate handle (circle or corner handle)
    if (type == 'video' || type == 'image') {
        const rotateHandle = document.createElement('div')
        rotateHandle.className = 'rotate-handle' // style in CSS (positioned top-center or corner)
        const boundRotate = (e) => startRotate(e, dom, editor, getPos)
        rotateHandle.addEventListener('pointerdown', boundRotate)
        mediaResizeHandlers.push({ element: rotateHandle, event: 'pointerdown', handler: boundRotate })
        dom.appendChild(rotateHandle)
    }


    return { dom }
}


export function cleanupMediaListeners(editor) {
    // Remove all stored resize handle listeners
    mediaResizeHandlers.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
    });
    // Clear the array
    mediaResizeHandlers = [];

    // Remove editor click handler if attached
    try {
        if (editorClickHandlerRef && editor.view.dom) {
            editor.view.dom.removeEventListener('click', editorClickHandlerRef);
        } else if (editorClickHandlerRef) {
            // fallback: try to find any editor dom that has listener
            const editorDom = document.querySelector('.ProseMirror');
            if (editorDom) editorDom.removeEventListener('click', editorClickHandlerRef);
        }
    } catch (err) {
        console.warn('cleanupMediaListeners: could not remove editor click handler', err);
        debugError(err, 'error in Media Node view, cleanupMediaListeners method')
    }
    editorClickHandlerRef = null;
    Is_Media_Remover_Method_Initialized = false;
    //
    console.log('✅ All media event listeners cleaned up');
}



function Media_selection_remover(editor) {
    // Listen only on the editor container, not the entire document
    editorClickHandlerRef = (e) => {
        // If click is NOT on any media element inside the editor
        if (!e.target.closest('.override_media_position_in_live_editor')) {
            // Deselect all media in the editor only
            editor.view.dom.querySelectorAll('.override_media_position_in_live_editor.selected')
                .forEach(el => el.classList.remove('selected'))
        }
    }

    editor.view.dom.addEventListener('click', editorClickHandlerRef)
}