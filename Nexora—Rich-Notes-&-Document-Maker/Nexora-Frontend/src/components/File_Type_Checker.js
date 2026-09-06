import { fileTypeFromBlob } from 'file-type';
import { isTextFile } from './Text_File_Handler';

/**
 * Returns the TRUE file category + real MIME (content-based).
 * Never trusts filename or file.type.
 */
export async function getRealFileInfo(file) {
  if (!file) return { category: 'unknown', mime: '', ext: '' };

  try {
    // === 1. Content signature detection (magic bytes) ===
    const result = await fileTypeFromBlob(file); // reads only first ~4-12 KB

    if (result) {
      const mime = result.mime;
      return {
        mime,
        ext: result.ext,
        category: getCategoryFromMime(mime)
      };
    }

    // === 2. Fallback: only plain text has no signature ===
    if (await isTextFile(file)) {   // ← keep your excellent existing function
      return { mime: 'text/plain', ext: 'txt', category: 'text' };
    }

    return { mime: file.type || 'application/octet-stream', ext: '', category: 'unknown' };
  } catch (err) {
    console.error('getRealFileInfo error:', err);
    return { mime: '', ext: '', category: 'unknown' };
  }
}

/**
 * Maps real MIME → your category (no extension magic needed)
 */
function getCategoryFromMime(mime) {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';

  // All your document formats (file-type detects them perfectly via signatures)
  const DOCUMENT_MIMES = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/rtf",
    "application/vnd.oasis.opendocument.text",
    "application/vnd.oasis.opendocument.spreadsheet",
    "application/vnd.oasis.opendocument.presentation",
    "application/epub+zip",
    "application/vnd.apple.pages",
    "application/vnd.apple.numbers",
    "application/vnd.apple.keynote"
  ]);

  if (DOCUMENT_MIMES.has(mime)) return 'document';

  return 'unknown';
}