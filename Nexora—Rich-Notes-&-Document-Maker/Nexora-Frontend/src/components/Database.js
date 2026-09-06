import Dexie from "dexie";

// --------------------------------------------------
// Internal state
// --------------------------------------------------
let db = null;
let isInitializing = false;
let initPromise = null;
let dbLock = null;

/**
 * Detect Vite HMR
 */
function isHMRActive() {
    return typeof import.meta.hot !== "undefined" && import.meta.hot !== null;
}

/**
 * Request persistent storage (best-effort)
 * Chrome/Edge often return false even in standalone mode.
 * We still request it every time the app starts.
 */
async function requestPersistentStorage() {
    if (!navigator.storage?.persist) {
        console.log("[Storage] StorageManager API not available");
        return false;
    }

    try {
        const alreadyPersisted = await navigator.storage.persisted();
        if (alreadyPersisted) {
            console.log("[Storage] Already persistent");
            return true;
        }

        const granted = await navigator.storage.persist();
        console.log(`[Storage] persist() → ${granted}`);
        return granted;
    } catch (err) {
        console.warn("[Storage] Failed to request persistent storage:", err);
        return false;
    }
}

/**
 * Create the Dexie instance (called only once)
 */
function createDatabase() {
    const instance = new Dexie("MyNotesDB");

    instance.version(1).stores({
        notes: "id, note, createdAt, updatedAt",
        media: "id, blob, createdAt, updatedAt",
        favorites: "id",
        workSpaces: "id",
    });

    // Event listeners
    instance.on("ready", () => {
        console.log("[DB] Database ready");
    });

    instance.on("versionchange", (event) => {
        console.warn(
            "[DB] versionchange event received. Another connection requested a version change.",
            event
        );
        // We intentionally do NOT close here automatically.
        // Closing can cause more problems than it solves in PWAs.
    });

    instance.on("close", () => {
        console.warn("[DB] Database connection was closed");
    });

    instance.on("blocked", () => {
        console.warn(
            "[DB] Database open is blocked. Another tab/window is holding an older version open."
        );
    });

    return instance;
}

/**
 * Initialize the database (singleton + open)
 * Safe to call multiple times.
 */
async function initializeDatabase() {
    if (db && db.isOpen()) {
        return db;
    }

    if (isInitializing) {
        return initPromise;
    }

    isInitializing = true;

    initPromise = (async () => {
        try {
            // Request persistent storage early
            await requestPersistentStorage();

            if (!db) {
                db = createDatabase();
                console.log("[DB] Dexie instance created");
            }

            if (!db.isOpen()) {
                console.log("[DB] Opening database...");
                await db.open();
                console.log("[DB] Database opened successfully");
            }

            return db;
        } catch (error) {
            console.error("[DB] Failed to initialize database:", error);
            // Reset so next call can retry
            db = null;
            throw error;
        } finally {
            isInitializing = false;
            initPromise = null;
        }
    })();

    return initPromise;
}

// --------------------------------------------------
// Public API
// --------------------------------------------------

/**
 * Get the shared database instance.
 * Always returns the same instance.
 * Prefer using `ensureDatabase()` when you need it to be open.
 */
export function getDatabase() {
    if (!db) {
        db = createDatabase();
    }
    return db;
}

/**
 * Ensures the database is created and open.
 * This is the recommended way to get the DB in most places.
 */
export async function ensureDatabase() {
    return initializeDatabase();
}


export async function acquireDBLock() {
    const maxWait = 10000; // 10 seconds timeout
    const startTime = Date.now();

    while (dbLock) {
        if (Date.now() - startTime > maxWait) {
            throw new Error("Database lock timeout - possible deadlock");
        }
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    dbLock = true;
}

/**
 * Release database lock
 */
export function releaseDBLock() {
    dbLock = false;
}


/**
 * Health check – counts records in all tables
 */
export async function validateDatabase() {
    try {
        const database = await ensureDatabase();

        const [noteCount, mediaCount, favCount, wsCount] = await Promise.all([
            database.notes.count(),
            database.media.count(),
            database.favorites.count(),
            database.workSpaces.count(),
        ]);

        console.log(`[DB] Health Check:
  Notes      : ${noteCount}
  Media      : ${mediaCount}
  Favorites  : ${favCount}
  Workspaces : ${wsCount}`);

        return {
            ok: true,
            counts: {
                notes: noteCount,
                media: mediaCount,
                favorites: favCount,
                workSpaces: wsCount,
            },
        };
    } catch (error) {
        console.error("[DB] Health check failed:", error);
        return { ok: false, error };
    }
}

/**
 * Close the database.
 * - Skipped during Vite HMR
 * - Safe to call on real app shutdown
 */
export async function closeDatabase() {
    if (isHMRActive()) {
        console.log("[DB] HMR active – skipping close");
        return;
    }

    if (db && db.isOpen()) {
        try {
            await db.close();
            console.log("[DB] Database closed");
        } catch (error) {
            console.error("[DB] Error while closing database:", error);
        }
    }
}

/**
 * Optional: Force a full reopen (rarely needed)
 */
export async function reopenDatabase() {
    await closeDatabase();
    db = null;
    return ensureDatabase();
}

// --------------------------------------------------
// Default export for convenience
// --------------------------------------------------
export default {
    getDatabase,
    ensureDatabase,
    validateDatabase,
    closeDatabase,
    reopenDatabase,
};
