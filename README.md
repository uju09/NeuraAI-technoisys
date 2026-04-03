<![CDATA[<div align="center">

# ⚡ LudicForge

**AI-Powered Code Generation Platform**

_Describe what you want — LudicForge's multi-agent pipeline enhances your prompt, generates production-ready React components, debugs them, and renders a live preview — all in seconds._

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://hub.docker.com/r/uju009/lucide-backend)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 🎯 What is LudicForge?

LudicForge is a full-stack AI code generation platform that transforms natural language prompts into fully functional, rendered React components. It features a **multi-agent backend pipeline** and an **instant-preview frontend** with a sleek, modern editor interface.

### ✨ Key Features

| Feature | Description |
|---|---|
| 🤖 **Multi-Agent Pipeline** | Prompt Enhancement → Code Generation → Debugging → Validation |
| 👁️ **Instant Live Preview** | Generated components render in a live iframe instantly |
| 🔄 **Multi-Provider AI** | Supports Gemini, OpenRouter, Ollama, and Groq |
| 📜 **Generation History** | Browse, reuse, and delete past generations |
| 🐳 **Docker Ready** | One-command deployment with Docker Compose |
| ⚡ **Job Queue** | Bull + Redis powered async generation with real-time progress |

---

## 📁 Project Structure

```
lucide/
├── backend/          # Express.js API — multi-agent AI pipeline
│   ├── src/
│   │   ├── agents/       # AI agents (enhancer, generator, debugger, validator)
│   │   ├── controllers/  # Request handlers
│   │   ├── jobs/         # Bull queue workers
│   │   ├── routes/       # API route definitions
│   │   └── utils/        # AI clients, helpers, Prisma client
│   ├── prisma/           # Database schema
│   ├── Dockerfile
│   └── docker-compose.yml
│
└── frontend/         # React + Vite — AI code editor UI
    ├── src/
    │   ├── components/   # UI components (Landing, Preview, Prompt, etc.)
    │   ├── hooks/        # Custom React hooks
    │   ├── services/     # API client layer
    │   └── store.js      # Zustand global state
    └── vite.config.js
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 20
- **Docker** & **Docker Compose** (for backend)
- A **Gemini API Key** (or OpenRouter key)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/lucide.git
cd lucide
```

### 2. Start the Backend

```bash
cd backend
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

docker compose up --build -d
```

The API will be available at `http://localhost:3000`.

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🐳 Production Deployment

The backend image is published on Docker Hub:

```bash
docker pull uju009/lucide-backend:latest
```

See [`backend/README.md`](./backend/README.md) for full server deployment instructions.

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ | Google Gemini API key |
| `OPENROUTER_API_KEY` | ❌ | OpenRouter API key (alternative provider) |
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `REDIS_URL` | ✅ | Redis connection string |
| `PORT` | ❌ | Server port (default: `3000`) |
| `MAX_DEBUG_LOOPS` | ❌ | Max auto-debug iterations (default: `3`) |
| `MAX_VALIDATION_LOOPS` | ❌ | Max validation iterations (default: `2`) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Zustand, Framer Motion |
| **Backend** | Express.js, Prisma ORM, Bull Queue |
| **Database** | PostgreSQL 15 |
| **Cache / Queue** | Redis 7 |
| **AI Providers** | Google Gemini, OpenRouter, Ollama, Groq |
| **Infra** | Docker, Docker Compose |

---

## 📄 License

This project is licensed under the MIT License.
]]>
