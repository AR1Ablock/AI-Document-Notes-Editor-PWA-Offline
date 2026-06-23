# AI Sticky Document Notes PWA 📒✨  

![Demo](demo.gif) *A quick demo of creating a note with video recording and file attachments*  

**A note-taking companion** – Capture ideas, record audio/video, attach files, and organize everything in one place. Perfect for students, developers, and creatives! Built with Vue.js for a seamless, premium experience.

## 🚀 Features  

### ✨ **Create & Manage Notes**  
- **Rich Notes**: Add titles and detailed content with advanced formatting.  
- **Edit Anytime**: Update titles, content, or attachments on the fly.  
- **Smooth Deletion**: Animated transitions with confirmation dialogs for deleting notes.  
- **Search & Sort**: Find notes by title, content, or date; sort by creation date.  
- **Lazy Loading**: Fetch 5 notes at a time for fast browsing.  

### 🎥 **Multimedia & Attachments**  
- **Attach Files**: Supports images, audio, video, PDFs, Word/Excel docs (10MB/note limit).  
- **Record Audio**: Capture up to 3 minutes with instant playback preview.  
- **Record Video**: Record 20-second clips, switch front/back cameras, and use flashlight in low light.  
- **Attachment Panel**: View and delete attachments with smooth animations.  
- **Downloadable Files**: Save attachments directly from notes.  

### ✍️ **Rich Text Editing**  
- **Formatting Options**: Headings (H1-H6), bold, italic, underline, strikethrough, lists (ordered/unordered), quotes, code blocks, links, text color, and highlighting.  
- **Checkboxes**: Create to-do lists with a sticky mode for continuous checkbox insertion.  
- **Clipboard Magic**: Copy notes as HTML, Markdown, or plain text; paste with smart format detection.  

### 🎨 **Premium Interface**  
- **Dark Theme**: Elegant dark mode with gold accents for a luxurious feel.  
- **Colorful Notes**: Toggle between vibrant, auto-generated colors or classic minimalist style.  
- **Responsive Design**: Looks stunning on phones, tablets, and desktops.  
- **Keyboard Navigation**: Scroll with arrow keys, close dialogs with Escape.  
- **Animations**: Smooth transitions for dialogs, deletions, and loading states.  

### ⚡ **Performance & Storage**  
- **Storage Meter**: Track used vs. total capacity (e.g., *1.2GB/5GB used*).  
- **Offline Mode**: Save and manage notes without internet using IndexedDB.  
- **Web Workers**: Compress/decompress data for optimized storage and speed.  

### 💡 **User Experience Extras**  
- **Sound Effects**: Satisfying clicks for recording, deleting, and saving.  
- **Confirmation Dialogs**: Safety nets for deleting notes or attachments.  
- **Memory Management**: Auto-cleans resources to prevent leaks.  

## 🛠️ Tech Stack  
- **Vue.js**: Reactive frontend framework.  
- **Web Workers**: For compression/decompression tasks.  
- **IndexedDB (Dexie.js)**: Local storage for offline persistence.  
- **CSS**: Custom styles with responsive design and animations.  

## 📈 Why StickyNotes Premium?  
- **Versatile**: Combines text, media, and formatting in one app.  
- **Offline-First**: Ideal for areas with unreliable internet (e.g., Pakistan).  
- **Premium Feel**: A polished UI that rivals top-tier note-taking apps.  

Perfect for students jotting down lecture notes, professionals organizing projects, or creatives capturing inspiration on the go!

#
## Main Page
<img src="https://github.com/user-attachments/assets/97eff178-ec92-4ff1-a0c7-6c0f0e9359d6" style="margin-bottom: 20px;">


## 1. Color Mode
<img src="https://github.com/user-attachments/assets/bd6fbfd5-20a2-4024-b614-fa47e7a7fe27" style="margin-bottom: 20px;">


## 2. Classic Mode
<img src="https://github.com/user-attachments/assets/49d8dd22-ba13-41f7-91f9-79571c899c10" style="margin-bottom: 20px;">


## Create
<img src="https://github.com/user-attachments/assets/1bb4e4c5-8557-4d20-8968-19160d4d0815" style="margin-bottom: 10rem;">
<img src="https://github.com/user-attachments/assets/cdc5074d-3ab5-4768-b4cf-a6e687e68f1f" style="margin-bottom: 10rem;">

## Edit
<img src="https://github.com/user-attachments/assets/171e0d92-c4fe-4570-8b00-f5d51fa923fa" style="margin-bottom: 10rem;">

## Delete Media Panel
<img src="https://github.com/user-attachments/assets/8908a81d-523c-4f83-9f2e-14ef63c2ea55" style="margin-bottom: 10rem;">


## Read
<img src="https://github.com/user-attachments/assets/17509579-3e02-4564-9b45-37268c03cd5e" style="margin-bottom: 10rem;">

## Full Screen Mode
<img src="https://github.com/user-attachments/assets/dda42658-279e-4402-8fb6-0dbcf55a1048" style="margin-bottom: 10rem;">
<img src="https://github.com/user-attachments/assets/bac8e9c9-1f9f-4292-b4fb-9a9cbceee7f0" style="margin-bottom: 10rem;">


## 🛠️ Quick Start  
```bash  
git clone https://github.com/AR1Ablock/Premium-StickyNotes-PWA-Offline.git
cd Premium-StickyNotes-PWA-Offline
npm install  
npm run dev
