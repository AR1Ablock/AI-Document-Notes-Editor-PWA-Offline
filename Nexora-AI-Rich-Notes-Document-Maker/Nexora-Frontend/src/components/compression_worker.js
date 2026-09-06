import pako from 'pako';
import { encode, ExtensionCodec } from '@msgpack/msgpack';
import { ensureDatabase } from './Database';

// Configure msgpack extension codec
const extensionCodec = new ExtensionCodec();
extensionCodec.register({
  type: 0x01,
  encode: (input) => input instanceof ArrayBuffer ? new Uint8Array(input) : null
});

// Initialize database

self.onmessage = async function (event) {
  let note_id = null;
  let compressedNote = null;
  let inputData = null;
  let deflater = null;
  let newRecord = null;
  let table = null;
  let existing = null;
  let updatedRecord = null;

  try {
    // Handle suicide command first
    if (event.data.command === 'SUICIDE') {
      console.log("[Worker] Received SUICIDE command");
      self.postMessage({ status: 'SUICIDE_CONFIRMED' });
      console.log("[Worker] Closing now...");
      self.close();
      return;
    }

    // Extract note ID consistently
    const extractId = (data) => {
      try {
        if (event.data.Type === 'note') return JSON.parse(data).id;
        if (event.data.Type === 'media') return event.data.Media_Buffer.id;
      } catch (e) {
        throw new Error("Invalid ID format in payload");
      }
    };

    note_id = extractId(event.data.Data || event.data.Media_Buffer);

    console.log(`3. extracted ids ${note_id} of type ${event.data.Type}`);

    // Process input data
    if (event.data.Type === 'note') {
      inputData = event.data.Data;
      if (!inputData) throw new Error("Empty note data received");
    } else if (event.data.Type === 'media') {
      inputData = encode(event.data.Media_Buffer, { extensionCodec });
    }

    console.log(`4. input data ${inputData} of type ${event.data.Type}`);

    // Compress data
    deflater = new pako.Deflate({ level: 9 });
    deflater.push(inputData, true);
    if (deflater.err) throw new Error(`Compression failed: ${deflater.msg}`);
    compressedNote = deflater.result;

    console.log(`5. compressed data ${compressedNote} of type ${event.data.Type}`);

    // Database operations
    console.log('6. opening db');

    const db = await ensureDatabase();

    await db.transaction("rw", db.notes, db.media, async () => {
      console.log('7. inside db transaction and operation is', event.data.Operation);

      if (event.data.Operation === 'save') {
        newRecord = {
          id: note_id,
          [event.data.Type === 'note' ? 'note' : 'blob']: compressedNote,
          createdAt: new Date(),
          updatedAt: null
        };
        console.log(`8. new record ${newRecord} of save operation`);

        await db[event.data.Type === 'note' ? 'notes' : 'media'].put(newRecord);
      }
      else if (event.data.Operation === 'update') {
        console.log('9. inside update operation');

        table = event.data.Type === 'note' ? db.notes : db.media;
        existing = await table.get(note_id);

        console.log(`10. record exist? ${existing} of update operation`);
        console.log('11. db table is of type,', table);

        if (!existing) {
          console.log(`Record for ${event.data.Type} ${note_id} not found, creating a new one.`);
          newRecord = {
            id: note_id,
            [event.data.Type === 'note' ? 'note' : 'blob']: compressedNote,
            createdAt: new Date(),
            updatedAt: null
          };
          await table.put(newRecord);
        } else {
          console.log(`Updating existing record for ${event.data.Type} ${note_id}.`);
          updatedRecord = {
            ...existing,
            [event.data.Type === 'note' ? 'note' : 'blob']: compressedNote,
            updatedAt: new Date()
          };
          await table.put(updatedRecord);
        }

        if (event.data.Type === 'note') {
          console.log(`Note update for ${note_id}, checking for existing media to delete.`);
          const mediaExists = await db.media.get(note_id);
          if (mediaExists) {
            console.log(`Found existing media for note ${note_id}, deleting it.`);
            await db.media.delete(note_id);
          } else {
            console.log(`No existing media found for note ${note_id}.`);
          }
        }
      }
    });

    // Post success message
    console.log(`13. operation ${event.data.Operation} completed successfully`);
    console.log(`14. compressed data ${compressedNote} of type ${event.data.Type}`);
    console.log(`15. note id ${note_id} of type ${event.data.Type}`);

    console.log('16 sending response back to main thread');

    self.postMessage({
      Operation: event.data.Operation,
      Type: event.data.Type,
      status: 'success',
      Id: event.data.Id,
      id: note_id
    });

  } catch (error) {
    console.error("[Worker] Critical Error:", error);
    self.postMessage({
      error: error.message,
      Operation: event.data?.Operation,
      Type: event.data?.Type,
      Id: event.data?.Id,
      id: note_id
    });
    self.close();
  } finally {
    // Cleanup
    note_id = null;
    compressedNote = null;
    inputData = null;
    deflater = null;
    newRecord = null;
    table = null;
    existing = null;
    updatedRecord = null;
    // self.close();
  }
};