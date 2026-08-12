# Nexora — Rich Notes & Document Maker

> An offline-first rich notes and document-making application for creating, editing, organizing, and exporting text, Markdown, HTML, media, and AI-assisted content.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Nexora-F4C430?style=flat-square)](https://nexora-notes-document-maker.web.app/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3-42b883?style=flat-square\&logo=vue.js\&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square\&logo=vite\&logoColor=white)](https://vite.dev/)
[![PWA](https://img.shields.io/badge/PWA-Offline--First-5A0FC8?style=flat-square\&logo=pwa\&logoColor=white)](https://web.dev/progressive-web-apps/)

Nexora is a feature-rich notes and document application built around a rich editing workflow. It combines structured text editing with Markdown and HTML content, broad media attachment support, AI writing and image generation, voice tools, OCR, workspaces, visual content, and PDF export.

The application is designed **offline-first**, allowing notes and locally stored content to remain available in the browser without requiring a constant internet connection.

## ✨ Features

### 📝 Rich Notes & Documents

* Rich-text document editing powered by **Tiptap**
* Text, Markdown, and HTML content
* Headings, formatting, lists, task lists, links, colors, highlights, and alignment
* Tables with advanced row, column, and cell operations
* Multi-column document layouts
* Code blocks with syntax highlighting
* Slash commands
* Undo and redo
* Keyboard shortcuts
* Read-only document view
* Full-screen reading mode

### 📎 Broad Media Support

Nexora treats media as part of the document rather than as a separate feature.

* Image attachments
* Video attachments
* Audio attachments
* PDF and document attachments
* Drag-and-drop media
* Paste-based media insertion
* URL-based media where supported
* Audio recording
* Video recording
* Media management directly within notes

### 🤖 AI Tools

AI functionality is integrated directly into the writing workflow.

* Improve writing
* Correct text
* Simplify text
* Summarize content
* Expand content
* Shorten content
* Change writing tone
* Custom AI instructions
* AI-assisted writing
* AI image generation
* AI-generated charts and diagrams

### 🎙️ Voice Tools

Nexora includes voice functionality for both input and playback.

* Speech-to-text
* Text-to-speech
* Voice input for writing and AI prompts
* Audio playback controls
* Adjustable speech playback speed
* Audio recording

### 🔎 OCR

* Extract text from supported images and scanned documents
* Convert extracted content into usable document content
* Process OCR results into structured Markdown where supported

### 📊 Charts & Diagrams

Documents can contain visual information alongside normal text.

* Chart.js-based charts
* Mermaid diagrams
* AI-assisted chart generation
* AI-assisted diagram generation
* Visual content embedded directly into notes

### 🗂️ Workspaces & Organization

Organize large collections of notes without treating every note as an isolated document.

* Color-coded workspaces
* Nested subgroups
* Workspace-based filtering
* Note search
* Sorting
* Favorites
* Drag-and-drop note reordering
* Note organization by project, subject, or other categories
* Temporary undo after note deletion

### 💾 Offline-First Storage

Nexora is designed around local-first usage.

* Browser-based local persistence
* IndexedDB storage
* Offline application support
* Service-worker caching
* Progressive Web App support
* Background processing for storage optimization
* Storage usage information
* Automatic note persistence

Internet connectivity is still required for services that depend on external APIs, such as cloud-based AI, OCR, and voice processing.

### 📄 PDF Export

Create PDF documents directly from notes.

* PDF export
* Print-friendly light output
* Dark-background output
* Export from the document viewing workflow

---

## 🖥️ Preview

### Desktop

![Nexora desktop interface](https://nexora-notes-document-maker.web.app/Desktop.png)

### Mobile

![Nexora mobile interface](https://nexora-notes-document-maker.web.app/Mobile.png)

---

## 🚀 Live Demo

**Try Nexora:**
https://nexora-notes-document-maker.web.app/

Nexora is delivered as a Progressive Web App, so supported browsers can install it as an application.

---

## 🧠 What Makes Nexora Different?

Many note-taking applications focus primarily on text.

Nexora takes a different approach: **the note itself is the workspace.**

Text, Markdown, HTML, media, recordings, OCR results, AI-generated content, charts, diagrams, and documents can all become part of the same note.

Instead of separating these capabilities into different applications, Nexora brings them together inside one document-making workflow.

### Example workflow

```text
Create Note
    ↓
Write / Paste Content
    ↓
Format with Rich Editor
    ↓
Add Markdown / HTML / Media
    ↓
Use OCR / Voice Tools / AI
    ↓
Generate Images / Charts / Diagrams
    ↓
Organize in Workspace
    ↓
Read / Review
    ↓
Export as PDF
```

---

## 🛠️ Technology Stack

### Frontend

* **Vue 3**
* **JavaScript**
* **HTML5**
* **CSS3**
* **Vite**

### Editor & Content

* **Tiptap**
* **ProseMirror**
* Markdown
* HTML
* Highlight.js
* Chart.js
* Mermaid

### Local Storage & Offline

* IndexedDB
* Dexie
* Web Workers
* PWA / Service Worker
* Client-side compression and serialization

### AI & External Services

Nexora integrates external services for selected capabilities, including:

* AI-assisted writing
* AI image generation
* Speech-to-text
* Text-to-speech
* OCR

The application architecture keeps these services separate from the core local note-taking experience, allowing the main document workflow to remain usable offline.

---

## 🏗️ Architecture Overview

Nexora follows an **offline-first, client-side application architecture**.

```text
                         ┌─────────────────────┐
                         │       Nexora        │
                         │    Vue 3 Frontend   │
                         └──────────┬──────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
      ┌─────────────┐       ┌──────────────┐       ┌──────────────┐
      │ Tiptap /    │       │ Local Data   │       │ PWA /        │
      │ ProseMirror │       │ IndexedDB    │       │ Service      │
      │ Editor      │       │ + Dexie      │       │ Worker       │
      └─────────────┘       └──────────────┘       └──────────────┘
                                    │
                                    ▼
                            ┌────────────────┐
                            │ Web Workers /  │
                            │ Background     │
                            │ Processing     │
                            └────────────────┘

                    External capabilities
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
       AI APIs           Voice Services        OCR
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ▼
                     Nexora document workflow
```

The core principle is that **local document creation and storage should not depend on a permanent network connection**.

---

## 📦 Getting Started

### Prerequisites

Before running Nexora locally, make sure you have:

* Node.js installed
* npm installed
* Git installed

### Clone the repository

```bash
git clone <your-repository-url>
cd <your-repository-directory>
```

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Vite will start the local development server and provide a URL for the application.

### Build for production

```bash
npm run build
```

The production build is generated in the configured output directory.

---

## ⚙️ Configuration

Here is the **concise, point‑to‑point** Markdown section for your GitHub README. It covers all three API integrations exactly as requested.

---

```markdown
## 🔑 Configuration – API Keys

Nexora uses third‑party APIs for AI, speech, and OCR features. Replace the placeholders with your own keys.

---

### 1. Mistral AI (Content Generation)

**Used for:** AI rewriting, summarisation, image generation, and diagram repair.

**Where to get it:**  
Sign up at [Mistral AI](https://mistral.ai/) and generate an API key.

**Where to set it:**  
`src/components/AI_Feature.js` – find this line:

```javascript
export let mistral_api_key = "YOUR_MISTRAL_API_KEY_HERE";
```

---

### 2. Speechmatics (STT / TTS)

**Used for:** Speech‑to‑Text transcription and Text‑to‑Speech playback.

**Where to get it:**  
Sign up at [Speechmatics](https://www.speechmatics.com/) and obtain your API key.

**Where to set it:**  
`src/components/Speech_To_Text.js` and `src/components/Text_To_Speech.js` – find this line in both files:

```javascript
const apiKey = ref('YOUR_SPEECHMATICS_API_KEY_HERE');
```

---

### 3. LlamaIndex / OCR Proxy (Cloudflare Worker)

**Used for:** Extracting text from images and scanned documents via LlamaParse.

**Where to get it:**  
Sign up at [LlamaIndex Cloud](https://cloud.llamaindex.ai/) and generate an API key.

**Step 1 – Worker Key:**  
In the Cloudflare Worker script (`index.js`), find this line:

```javascript
headers.set("Authorization", "Bearer YOUR_LLAMAINDEX_API_KEY_HERE");
```

**Step 2 – Proxy URL:**  
# Deploy Proxy to Cloudflare with Wrangler

## 1. Create a Cloudflare account

Create an account at [Cloudflare Sign Up](https://dash.cloudflare.com/sign-up).

Enter your email and password, then verify your email address.

## 2. Check Node.js and npm

Open a terminal and run:

```bash
node -v
npm -v
```

If both commands show version numbers, you are ready.

## 3. Open the project

Open the terminal inside your existing Nexora Wrangler proxy project:


## 4. Install nexora proxy dependencies

```bash
npm i
```

## 5. Install Wrangler

```bash
npm i -D wrangler@latest
```

## 6. Sign in to Cloudflare

```bash
npx wrangler login
```

A browser window will open.

1. Sign in to Cloudflare.
2. Allow Wrangler to access your account.
3. Return to the terminal.

Confirm that you are signed in:

```bash
npx wrangler whoami
```

## 7. Build the project

```bash
npm run build
```

## 8. Deploy to Cloudflare

```bash
npx wrangler deploy
```

After deployment, Wrangler will display proxy live url, you need to copy it.

It will look similar to:

```text
https://your-project.your-subdomain.workers.dev
```

`src/components/OCR.js` – find this line:

```javascript
const PROXY_ROOT = "https://your-worker-name.your-subdomain.workers.dev";
```

---

## 📁 Project Structure

The exact structure may evolve as the project grows, but the application is organized around the major areas of the product:

```text
Nexora/
├── public/
│   ├── App_Icon/
│   │   ├── note_1536.png
│   │   ├── note_192.png
│   │   └── note_512.png
│   ├── fonts/
│   │   └── README.md
│   ├── Desktop.png
│   ├── Mobile.png
│   ├── manifest.json
│   ├── note_512.png
│   ├── notes.png
│   ├── Notes.png
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── static_preview.html
│   ├── BingSiteAuth.xml
│   └── google8bf52544982d2003.html
│
├── src/
│   ├── assets/
│   │   ├── effects/
│   │   │   ├── Close_Btn.mp3
│   │   │   ├── Create_Edit_Btn.mp3
│   │   │   ├── Delete_Note_Btn.mp3
│   │   │   ├── Done_Btn.wav
│   │   │   └── View_Btn.mp3
│   │   └── Seed_Note/
│   │       ├── Seed.js
│   │       └── Seed.json
│   │
│   ├── components/
│   │   ├── AI_Feature.js
│   │   ├── compression_worker.js
│   │   ├── controller.js
│   │   ├── decompression_worker.js
│   │   ├── Editor_Live_Media_Adding_Parser.js
│   │   ├── File_Type_Checker.js
│   │   ├── Global_Error_Handler.js
│   │   ├── Is_Touch.js
│   │   ├── MarkDown_It.js
│   │   ├── OCR.js
│   │   ├── Paste_Drag_Drop_Handler.js
│   │   ├── Scroll_Logic.js
│   │   ├── Simple_Pdf_maker.js
│   │   ├── Speech_To_Text.js
│   │   ├── Text_File_Handler.js
│   │   ├── Text_To_Speech.js
│   │   ├── TipTap_Editor.js
│   │   ├── Turndown_config.js
│   │   └── Media_Custom_Tiptap_Node/
│   │       ├── custom_visiual_block_schema.js
│   │       ├── custom_visiual_block_view.js
│   │       ├── Media_Node_Scheme.js
│   │       └── Media_Node_View.js
│   │
│   ├── scripts/
│   │   ├── generateSitemap.js
│   │   └── headBuilder.js
│   │
│   ├── App.vue
│   ├── main.js
│   ├── registerServiceWorker.js
│   └── style.css
│
├── eslint.config.js
├── index.html
├── jsconfig.json
├── package.json
├── package-lock.json
└── vite.config.js
```

---

## 🔐 Data & Privacy Considerations

Nexora is designed with local-first storage in mind.

Notes and locally stored content are persisted in the browser rather than requiring a traditional remote database for the core note-taking workflow.

However, features that use external services may send the relevant content or input to those services. Users should review the privacy policies and terms of the services configured for AI, OCR, speech recognition, and text-to-speech functionality.

---

## 📱 Progressive Web App

Nexora can operate as a Progressive Web App.

Depending on browser and platform support, users can:

* Install Nexora on their device
* Launch it as a standalone application
* Continue working with locally available content offline
* Benefit from cached application resources
* Use the responsive interface across desktop and mobile devices

---

## 🎯 Project Goals

Nexora is built around several core goals:

* Keep note creation fast and practical
* Make rich documents possible without leaving the notes application
* Treat media as first-class document content
* Keep important data available offline
* Integrate AI into the actual writing workflow
* Provide useful voice and OCR tools
* Make complex documents easier to organize
* Support both quick notes and more structured documents
* Remain usable across desktop and mobile devices
---

## 🔗 Links

* **Live Application:** https://nexora-notes-document-maker.web.app/
* **Portfolio:** https://rehman-product-engineer.web.app/
---


<p align="center">
  <strong>Nexora</strong><br>
  Rich Notes & Document Maker
</p>
