<div align="center">

# 📐 CanvasBuilder · AI-Powered Visual Layout Engine

[![Vite](https://img.shields.io/badge/Vite-6495ED?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/Gemini_API-8E44AD?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google/dev)

A highly polished, interactive visual design environment and code generator. Build, orchestrate, nest, and align high-fidelity **Shadcn-themed** components on an infinite canvas—accelerated by a conversational **Gemini-powered ambient AI Copilot**.


</div>

---

## ✨ Features & Capabilities

### 🍱 1. Shadcn-Style Component Toolbox
- **Dynamic Elements**: Instant drag-and-drop or center-compile for Buttons, Badges, Sliders, Progress bars, Switches, Inputs, Dialogs, and Avatars.
- **Structural Layout Shells**: Nest details inside flexible **Flex Rows**, **Flex Columns**, or responsive multi-column **Grid Panels**.
- **Predesigned Grid Templates**: One-click blueprint spawns for custom sales metrics dashboards, user feedback forms, profile directories, and analytics dashboards.

### 🤖 2. Conversational Layout Copilot (Gemini API)
- **Natural Language Compiles**: Tell the bot what you want to build (e.g. *"add a clean 3-column user profile card stack with headers"*) and watch components spawn instantly.
- **Smart Repositioning**: Floating, draggable, and collapsible HUD beautifully anchored at the center bottom, perfectly out of the way of your design.

### 🛠️ 3. Full-Spectrum Property Inspector
- **Tailwind Sandbox Overrides**: Inject inline Tailwind styling utilities directly into nodes (e.g. `shadow-2xl animate-pulse text-indigo-500 border-dashed`).
- **Precision Spacing**: Fine-tune absolute coordinates, width/height dimensions, child flex/grid gaps, paddings, and alignment orientations.

### 🛡️ 4. Enterprise-Grade State Engine & Undo
- **Ctrl+Z Undo (and Hudson HUD UI)**: Powerful, recursive snapshot undo state that tracks deleted node clusters and layout modifications.
- **Bulk Snapping Tools**: Select multiple elements to instantly align left, right, top, bottom, or distribute gaps evenly.
- **Modular Exporter**: Copy React + Tailwind JSX directly out of the app into a production file.

---

## 🚀 Getting Started Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)

---

### Step-by-Step Installation

1. **Clone or Download the Project Sources**
   Extract the archive to your workspace directory.

2. **Install Package Dependencies**
   ```bash
   npm install
   ```

3. **Configure Your Environment Variables**
   Create a `.env` or `.env.local` file in the root directory (using `.env.example` as a template) and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

4. **Boot Up the Development Server**
   Start the Express server backed by Vite for rapid HMR module compiling:
   ```bash
   npm run dev
   ```
   *Your terminal will display a local address (usually `http://localhost:3000`). Open it in your web browser of choice.*

---

## 📦 Project Directory Breakdown

```text
├── server.ts              # Full-stack Node.js/Express server (handles Gemini API proxies)
├── index.html             # Main HTML preview index entrypoint
├── package.json           # Active dependency libraries and script builders
├── src/
│   ├── main.tsx           # Global React renderer
│   ├── App.tsx            # Main state coordinator, template blueprints, controls
│   ├── index.css          # Core CSS stylesheet, Google Fonts, and Tailwind configs
│   └── components/        # Isolated sub-components
│       ├── Canvas.tsx          # Real-time SVG grid and workspace container
│       ├── CanvasNode.tsx      # Recursive, editable components (Buttons, Cards, Tables, etc.)
│       ├── CanvasCopilot.tsx   # Floating intelligent Layout Copilot Dialog UI
│       ├── Toolbar.tsx         # Drag-and-drop toolbox panel
│       └── Inspector.tsx       # Alignment controls and direct property editor
```

---

## 🚀 Deployment & Clean Production Builds

When you're ready to bundle the app for Cloud Run or other production nodes, make sure your production environments have `GEMINI_API_KEY` defined.

Build the application bundle securely into standard standalone optimized static structures:
```bash
npm run build
```

Serve the statically compiled client interface with Express in production:
```bash
npm run start
```

---

<div align="center">
Made with 🤍 using Google AI Studio
</div>
