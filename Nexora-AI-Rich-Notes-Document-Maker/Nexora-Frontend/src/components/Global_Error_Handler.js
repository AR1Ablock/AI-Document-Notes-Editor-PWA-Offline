export function debugError(err, label = "Error") {
    if (!err || !err.stack) {
        console.error(`${label}:`, err);
        return;
    }

    const stack = err.stack.split("\n");

    // First real stack line (skips "Error: message")
    const target = stack[1] || "";

    // Chrome / Edge / Node format:
    // at functionName (file.js:10:25)
    const chrome = target.match(/at\s+(.*?)\s+\((.*):(\d+):(\d+)\)/);

    // Firefox format:
    // functionName@file.js:10:25
    const firefox = target.match(/(.*?)@(.*):(\d+):(\d+)/);

    let fn = "unknown";
    let file = "unknown";
    let line = "unknown";
    let col = "unknown";

    if (chrome) {
        [, fn, file, line, col] = chrome;
    } else if (firefox) {
        [, fn, file, line, col] = firefox;
    }

    console.error(
        `${label}:\n` +
        `• Function: ${fn}\n` +
        `• File: ${file}\n` +
        `• Line: ${line}\n` +
        `• Column: ${col}\n` +
        `• Message: ${err.message}`
    );
}