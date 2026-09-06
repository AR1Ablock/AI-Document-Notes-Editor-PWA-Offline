/* import { fileURLToPath, URL } from 'node:url';
import { ViteSSG } from 'vite-ssg'; // Add this
//
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
//
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),

    VitePWA({
      workbox: { maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // 5 MB 
      },
      registerType: 'autoUpdate',
      includeAssets: ['robots.txt', 'App_Icon/*.png'],
      manifest: {
        name: 'Sticky Colorful Notes App',
        short_name: 'Sticky Notes',
        start_url: '/',
        display: 'standalone',
        background_color: '#1e1e1eff',
        theme_color: '#f4d145ff',
        scope: '/',
        orientation: 'portrait',
        lang: 'en-US',
        description: 'A beautiful, native-like notes app built with Vue.js.',
        icons: [
          {
            "src": "/App_Icon/note_192.png",
            "sizes": "192x192",
            "type": "image/png"
          },
          {
            "src": "/App_Icon/note_512.png",
            "sizes": "512x512",
            "type": "image/png"
          },
          {
            "src": "/App_Icon/note_1536.png",
            "sizes": "1536x1536",
            "type": "image/png"
          },
        ],
        screenshots: [
          {
            "src": "/App_Icon/note_1536.png",
            "sizes": "1536x1536",
            "type": "image/png",
            "form_factor": "wide"
          },
          {
            "src": "/App_Icon/note_512.png",
            "sizes": "512x512",
            "type": "image/png"
          },
          {
            "src": "/App_Icon/note_192.png",
            "sizes": "192x192",
            "type": "image/png"
          },
        ]
      }
    }),
  ],
  build: {
    minify: 'terser', terserOptions: {
      compress: {
        drop_console: true,
        // removes console.log, console.error, console.warn, etc. 
        drop_debugger: true // removes debugger statements 
      },
      mangle: true
    },
    target: 'esnext',
    sourcemap: false, // Enable source maps but remove in production builds
  },
  ssgOptions: {  // Prerender config
    script: 'async',  // Async hydration
    formatting: 'minify',  // Minify HTML
    dirStyle: 'nested',  // Styles output
    includedRoutes(paths, routes) {  // Only prerender root
      return ['/'];
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  worker: {
    format: "es", // Ensure ES module format for workers
  },
  output: {
    sourcemap: true
  },
  server: {
    // host: true,
    hmr: true,
    watch: {
  
    },
    host: '0.0.0.0', // Allow access from any device
    port: 5173, // Your Vite port
    strictPort: true, // Ensure it always uses this port
    cors: true, // Allow cross-origin requests
    allowedHosts: ['.ngrok-free.app'], // Allow all Ngrok subdomains
  }

}); */


import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import { ViteSSG } from 'vite-ssg'; // Add this

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['robots.txt', 'App_Icon/*.png'],
      manifest: {
        name: 'Nexora — Rich Notes & Document Maker',
        short_name: 'Nexora',
        start_url: '/',
        display: 'standalone',
        background_color: '#1e1e1eff',
        theme_color: '#f4d145ff',
        scope: '/',
        orientation: 'portrait',
        lang: 'en-US',
        description: 'Nexora is an offline-first rich notes and document maker with text, Markdown, HTML, all-media support, AI writing, image generation, voice tools, OCR, workspaces, and PDF export.',
        icons: [
          { src: '/App_Icon/note_192.png', sizes: '192x192', type: 'image/png' },
          { src: '/App_Icon/note_512.png', sizes: '512x512', type: 'image/png' },
          { src: '/App_Icon/note_1536.png', sizes: '1536x1536', type: 'image/png' },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
        globPatterns: [
          '**/*.{js,css,html,woff2,woff,ttf,eot,png,jpg,jpeg,svg}'
        ],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: ({ request }) => request.destination === 'style',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'css-cache'
            }
          },
          {
            urlPattern: ({ request }) => request.destination === 'script',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'js-cache'
            }
          }
        ]
      }
    }),
  ],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: { drop_console: true, drop_debugger: true },
      mangle: true
    },
    target: 'esnext',
    sourcemap: false
  },
  ssgOptions: {
    script: 'async',
    formatting: 'minify',
    dirStyle: 'nested',
    includedRoutes() { return ['/']; }
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  worker: { format: 'es' },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    cors: true,
    allowedHosts: ['.ngrok-free.app'],
    watch: { ignored: ['**/node_modules/**', '**/dist/**'] }
  }
});
