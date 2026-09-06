import './style.css';
import App from './App.vue';
import './registerServiceWorker';
import { ViteSSG } from 'vite-ssg';
import '@fortawesome/fontawesome-free/css/all.css';

// Request persistent storage to prevent Chromium background eviction
async function requestPersistentStorage() {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
        const isPersisted = await navigator.storage.persisted();
        if (!isPersisted) {
            const granted = await navigator.storage.persist();
            console.log(`[Storage] Persistent storage granted: ${granted}`);
        }
    }
}

export const createApp = ViteSSG(
    App,
    { routes: [{ path: '/', component: App }], base: '/' },
    async ({ app, isClient, initialState }) => {
        if (isClient) {
            initialState.data = initialState.data || {};

            // Enforce storage persistence immediately on client load
            requestPersistentStorage().catch(err => {
                console.error('[Storage Error] Failed to request persistence:', err);
            });

            // Global window error handler
            window.onerror = function (message, source, lineno, colno, error) {
                console.error("[Window Error Handler]", message);
                console.error("Source:", source, "Line:", lineno, "Column:", colno);
                console.error("Error Object:", error);
            };
        }

        // Global Vue error handler
        app.config.errorHandler = (err, vm, info) => {
            console.error('[Global Error Handler]', info);
            console.error('[Global Error Handler]', err);
            console.error('[Global Error Handler]', vm);
        };
    },
    { rootContainer: '.con' }
);
