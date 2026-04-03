<![CDATA[<div align="center">

# 🎨 LudicForge — Frontend

**AI Code Editor with Instant Live Preview**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## 📖 Overview

The frontend is a **React + Vite** single-page application that provides a premium AI-powered code editor experience. Users describe what they want in natural language, and the app communicates with the backend pipeline to generate React components and render them in a **live iframe preview**.

### ✨ Features

- 🌑 **Dark-themed editor** with glassmorphism design
- ⚡ **Instant iframe preview** of generated components
- 📱 **Responsive viewport switcher** — Desktop / Tablet / Mobile
- 🔄 **Real-time progress tracking** with animated loading steps
- 📜 **Persistent chat history** with local storage
- 🎬 **Smooth page transitions** powered by Framer Motion & Lenis
- 🤖 **Multi-provider support** — switch between Gemini and OpenRouter
- 📤 **Export options** for generated code

---

## 📂 Directory Structure

```
frontend/
├── public/                    # Static assets
├── src/
│   ├── assets/                # Images, icons, and media
│   ├── components/
│   │   ├── Landing.jsx        # Landing page with hero section and CTA
│   │   ├── Header.jsx         # App header with branding and controls
│   │   ├── PromptInput.jsx    # Natural language input with send/cancel
│   │   ├── PreviewPanel.jsx   # Live iframe preview + code editor tabs
│   │   ├── HistoryList.jsx    # Sidebar list of past generations
│   │   ├── LoadingSteps.jsx   # Animated pipeline progress indicator
│   │   └── ExportButtons.jsx  # Code export/download actions
│   ├── hooks/
│   │   └── useWebContainer.js # WebContainer integration hook
│   ├── services/
│   │   └── api.js             # Axios client — generate, poll, history, delete
│   ├── store.js               # Zustand global state (persisted)
│   ├── App.jsx                # Root component with view routing
│   ├── App.css                # App-level styles
│   ├── index.css              # Global / Tailwind base styles
│   └── main.jsx               # Vite entry point
├── index.html                 # HTML shell
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS configuration
└── package.json
```

---

## 🧩 Component Breakdown

### Page Views

| Component | Description |
|---|---|
| **`Landing`** | Full-screen landing page with animated hero, feature showcase, and "Get Started" CTA |
| **`App`** | Root layout — manages view transitions between Landing and Canvas (editor) |

### Editor (Canvas View)

| Component | Description |
|---|---|
| **`Header`** | Top bar with LudicForge branding, sidebar toggle, and reset controls |
| **`PromptInput`** | Text input area with provider selector, send button, and cancel support |
| **`HistoryList`** | Scrollable sidebar showing past generations with click-to-restore |
| **`PreviewPanel`** | Main workspace — tabbed between live Preview (iframe) and Code view |
| **`LoadingSteps`** | Pipeline progress visualization (Enhancing → Generating → Building) |
| **`ExportButtons`** | Actions to copy or download the generated code |

---

## 🗃️ State Management

Global state is managed with **Zustand** and persisted to `localStorage` under the key `neura-store`.

### Key State Slices

| State | Type | Description |
|---|---|---|
| `prompt` | `string` | Current input text |
| `generatedCode` | `string` | Latest generated component code |
| `history` | `array` | Chat-style log of user prompts and AI responses |
| `loadingStep` | `string` | Pipeline progress: `idle` → `enhancing` → `generating` → `building` → `ready` |
| `jobProgress` | `number` | Numeric progress (0–100) from backend |
| `provider` | `string` | Selected AI provider (`gemini` / `openrouter`) |
| `currentView` | `string` | Navigation state (`landing` / `canvas`) |
| `activeTab` | `string` | Preview panel tab (`preview` / `code`) |
| `viewport` | `string` | Preview size (`desktop` / `tablet` / `mobile`) |
| `userId` | `string` | Auto-generated persistent user ID |

---

## 🔌 API Integration

The frontend communicates with the backend via the service layer in `services/api.js`:

| Function | Endpoint | Description |
|---|---|---|
| `generateComponentCode()` | `POST /generate` → poll `GET /generate/status/:jobId` | Submits a prompt, polls for progress, returns generated code |
| `fetchHistory()` | `GET /history/:userId` | Loads past generations for the sidebar |
| `deleteComponent()` | `DELETE /component/:id` | Removes a component from history |

### Backend URL

Configured via the `VITE_API_URL` environment variable:

```bash
# .env (frontend)
VITE_API_URL=http://localhost:3000
```

Falls back to `http://localhost:3000` if not set.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20
- Backend running at `http://localhost:3000` (see [`backend/README.md`](../backend/README.md))

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at **`http://localhost:5173`**.

### Other Commands

```bash
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | React 18 |
| **Bundler** | Vite 6 |
| **Styling** | Tailwind CSS 3 |
| **State** | Zustand (persisted) |
| **Animations** | Framer Motion |
| **Smooth Scroll** | Lenis |
| **HTTP Client** | Axios |
| **Icons** | Lucide React |
| **Notifications** | React Hot Toast |
| **Code Display** | React Syntax Highlighter |
| **Markdown** | React Markdown |

---

## ⚙️ Configuration

### `vite.config.js`

- Runs on port `5173` with network access (`host: '0.0.0.0'`)
- Sets `Cross-Origin-Embedder-Policy: credentialless` and `Cross-Origin-Opener-Policy: same-origin` headers (required for WebContainer support)
- Allows all hosts (for tunnel / proxy compatibility)

### `tailwind.config.js`

- Scans `./src/**/*.{js,jsx}` for class usage
- Extend with custom theme tokens as needed
]]>
