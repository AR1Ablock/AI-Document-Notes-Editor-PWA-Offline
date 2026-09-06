import pako from 'pako';
import { decode, ExtensionCodec } from '@msgpack/msgpack';
// worker.js

self.onmessage = function (e) {

  let compressedNote = null;
  let decompressed = null;
  let decompressednote = null;
  let transferList = null;
  try {
    if (e.data.command === 'SUICIDE') {
      console.log('Compression Suciding');
      self.postMessage({ status: 'SUICIDE_CONFIRMED' });
      self.close();
      return;
    }

    compressedNote = e.data.Data;


    console.log("worker received note--> ", compressedNote);


    // Decompress and parse the file

    if (e.data.IsNote) {
      decompressed = pako.inflate(compressedNote, { to: 'string' });
      decompressednote = JSON.parse(decompressed);
    }
    else {
      decompressed = pako.inflate(compressedNote);
      ////
      const extensionCodec = new ExtensionCodec();
      extensionCodec.register({
        type: 0x01,
        decode: (data) => {
          // data is a Uint8Array. Return a copy of its underlying ArrayBuffer.
          return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
        }
      });
      decompressednote = decode(decompressed, { extensionCodec });
    }

    console.log("worker decompressed note--> ", decompressed);


    console.log("worker decompressed parsed note--> ", decompressednote);

    // Send the note back to the main thread
    if (e.data.IsNote) {
      self.postMessage({Id: e.data.Id, note: decompressednote });
    }
    else {
      transferList = Object.entries(decompressednote)
        .filter(([, value]) => Array.isArray(value))  // Only process arrays
        .flatMap(([, arr]) => arr)
        .map((item) => item.Data)
        .filter((data) => data instanceof ArrayBuffer);
      ////
      self.postMessage({ Id: e.data.Id, note: decompressednote }, transferList);
    }

    compressedNote = null;
    decompressed = null;
    decompressednote = null;
    transferList = null;
    e.data.Data = null;
   // self.close();
  } catch (error) {
    console.log(error);
    self.postMessage({ error: error });
    compressedNote = null;
    decompressed = null;
    decompressednote = null;
    transferList = null;
    self.close()
  }
};