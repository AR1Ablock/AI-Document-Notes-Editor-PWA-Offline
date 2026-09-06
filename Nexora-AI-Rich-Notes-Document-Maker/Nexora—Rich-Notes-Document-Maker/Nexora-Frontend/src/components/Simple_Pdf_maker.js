import { debugError } from "./Global_Error_Handler";

export async function exportNoteAsPdf(white = false) {
    try {
        // 1. Select the content
        const original = document.getElementsByClassName('read_mode_content')[0];
        if (!original) {
            console.error("notepag_con not found!");
            return;
        }

        // 2. Clone and Clean
        const clone = original.cloneNode(true);

        clone.querySelectorAll(".audio, .video, .document, .loading").forEach(el => el.remove());

        // Center the title if it exists
        const titleEl = clone.querySelector('.View_Text_In_UI.View_Text_In_UI_Title');
        if (titleEl) titleEl.style.textAlign = 'center';

        // 3A. Convert Canvas Elements (Chart.js) to Static Images
        const originalCanvases = Array.from(original.querySelectorAll("canvas"));
        const clonedCanvases = Array.from(clone.querySelectorAll("canvas"));

        originalCanvases.forEach((origCanvas, index) => {
            const targetClonedCanvas = clonedCanvases[index];
            if (!targetClonedCanvas) return;

            try {
                // Export rendered pixels from live canvas to base64 image
                const imgDataUrl = origCanvas.toDataURL("image/png");
                const staticImg = document.createElement("img");

                staticImg.src = imgDataUrl;
                staticImg.style.maxWidth = "100%";
                staticImg.style.height = "auto";
                staticImg.style.display = "block";
                staticImg.style.margin = "0 auto";
                staticImg.style.pageBreakInside = "avoid";

                // Replace blank canvas in clone with static image
                targetClonedCanvas.replaceWith(staticImg);
            } catch (err) {
                console.warn("Canvas export failed:", err);
            }
        });

        // 3B. Image Compression Logic
        async function compressImg(img, maxWidth = 1024) {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const scale = Math.min(1, maxWidth / img.naturalWidth);
            canvas.width = img.naturalWidth * scale;
            canvas.height = img.naturalHeight * scale;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            return new Promise(resolve => {
                canvas.toBlob(blob => {
                    const newImg = new Image();
                    newImg.src = URL.createObjectURL(blob);
                    newImg.onload = () => resolve(newImg);
                }, "image/jpeg", 0.7);
            });
        }

        const imgs = Array.from(clone.querySelectorAll("img"));
        for (let img of imgs) {
            img.style.maxWidth = "100%";
            img.style.height = "auto";
            img.style.pageBreakInside = "avoid";

            if (img.src.startsWith('https') || img.src.startsWith('data:image/png')) continue;
            try {
                const newImg = await compressImg(img);
                img.replaceWith(newImg);
            } catch (err) {
                console.warn("Image compress failed", err);
            }
        }

        // 4. Create Hidden Iframe
        const iframe = document.createElement("iframe");
        Object.assign(iframe.style, {
            position: "fixed", top: "0", left: "0", width: "100%", height: "100%",
            border: "none", visibility: "hidden", zIndex: "-1000"
        });
        document.body.appendChild(iframe);

        const idoc = iframe.contentDocument || iframe.contentWindow.document;
        idoc.open();

        // 5. Gather Styles
        let stylesHtml = "";
        document.querySelectorAll("link[rel='stylesheet']").forEach(link => {
            stylesHtml += `<link rel="stylesheet" href="${link.href}" />`;
        });
        document.querySelectorAll("style").forEach(style => {
            stylesHtml += `<style>${style.innerHTML}</style>`;
        });

        // Theme definitions
        const bg = white ? '#ffffff' : '#2F2F2F';
        const fg = white ? '#000000' : 'inherit';
        const tableBg = white ? 'table { background-color: #ebe8e8 !important; color: #131313 !important; }' : '';
        const codeBg = white ? '#ffffff' : '#1c1c1c';
        const codeFg = white ? '#d7d7d7' : '#47d3ff';

        const final_html = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Print Note</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                ${stylesHtml}
                <style>
                    @media print {
                        html, body, .notepag_con, .View_Text_In_UI {
                            background: ${bg} !important;
                            ${white ? `color: ${fg} !important;` : ''}
                        }
                        html, body {
                            height: auto !important;
                            min-height: 0 !important;
                            overflow: visible !important;
                            display: block !important;
                            margin: 0 !important;
                            padding: 1rem !important;
                        }
                        .notepag_con {
                            position: static !important;
                            display: block !important;
                            height: auto !important;
                            max-height: none !important;
                            overflow: visible !important;
                            width: 100% !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        .View_Text_In_UI {
                            width: 100% !important;
                            max-width: 100% !important;
                            white-space: normal !important;
                        }
                        body {
                            -webkit-print-color-adjust: exact;
                        }
                        p, h1, h2, h3, li, img, table, tr {
                            break-inside: avoid;
                            page-break-inside: avoid;
                        }
                        ${tableBg}
                        .table-container {
                            overflow: visible !important;
                            max-height: none !important;
                            width: 100% !important;
                            page-break-inside: auto;
                        }
                        .table-container table {
                            width: 100% !important;
                            max-width: 100% !important;
                            table-layout: auto !important;
                            border-collapse: collapse !important;
                            page-break-inside: auto;
                        }
                        .table-container td, .table-container th {
                            word-break: break-word !important;
                            overflow-wrap: break-word !important;
                            hyphens: auto !important;
                            max-width: 100% !important;
                            padding: 8px !important;
                            page-break-inside: avoid;
                        }
                        .table-container tr {
                            page-break-inside: avoid !important;
                            page-break-after: auto !important;
                        }
                        .code-block, pre {
                            overflow: visible !important;
                            max-height: none !important;
                            white-space: pre-wrap !important;
                            page-break-inside: avoid;
                            background: #1a1a1a !important;
                            color: #d7d7d7 !important;
                        }
                        code {
                            background: ${codeBg} !important;
                            color: ${codeFg} !important;
                        }
                    }
                </style>
            </head>
            <body>
                <div id="print-wrapper"></div>
            </body>
        </html>
    `;

        idoc.write(final_html);
        idoc.close();

        // 7. Insert Content safely
        const printWrapper = idoc.getElementById("print-wrapper");
        if (printWrapper) printWrapper.appendChild(clone);

        // 8. Wait for Links to Load
        const loadPromises = Array.from(idoc.querySelectorAll("link")).map(link => {
            if (link.sheet) return Promise.resolve();
            return new Promise(resolve => {
                link.onload = resolve;
                link.onerror = resolve;
                setTimeout(resolve, 500);
            });
        });

        await Promise.all(loadPromises);

        // 9. Print
        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();

            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 2000);
        }, 500);

    } catch (e) {
        debugError(e, 'Simple_Pdf_Method');
    }
}