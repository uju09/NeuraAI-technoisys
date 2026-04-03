<div align="center">

# ⚙️ NeuraAI — Backend

**Multi-Agent AI Game Generation Pipeline**

[![Docker Hub](https://img.shields.io/badge/Docker_Hub-uju009%2Flucide--backend-2496ED?logo=docker&logoColor=white)](https://hub.docker.com/r/uju009/lucide-backend)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)

</div>

---

## 📖 Overview

The backend is an **Express.js** server that orchestrates a multi-agent AI pipeline to transform natural language prompts into fully functional, production-ready web games. Fully powered by Google's Gemini, it uses **Bull** queues backed by **Redis** for async job processing and **Prisma** with **PostgreSQL** for persistent storage.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Express Server                     │
│                    (server.js)                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│   POST /generate ──► generateController              │
│                         │                            │
│                         ▼                            │
│               ┌── Bull Job Queue ──┐                 │
│               │   (Redis-backed)   │                 │
│               └────────┬──────────┘                 │
│                        │                             │
│           ┌────────────▼────────────┐                │
│           │    AGENT PIPELINE       │                │
│           │                         │                │
│           │  1. Prompt Enhancer     │                │
│           │  2. Code Generator      │                │
│           │  3. Code Debugger       │                │
│           │  4. Output Validator    │                │
│           │                         │                │
│           └────────────┬────────────┘                │
│                        │                             │
│                        ▼                             │
│              Prisma ──► PostgreSQL                   │
│              (persist component)                     │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Agent Pipeline

| # | Agent | File | Role |
|---|---|---|---|
| 1 | **Prompt Enhancer** | `agents/promptEnhancer.js` | Refines the raw user prompt for optimal game generation |
| 2 | **Code Generator** | `agents/codeGenerator.js` | Generates game code from the enhanced prompt using Gemini |
| 3 | **Code Debugger** | `agents/codeDebugger.js` | Iteratively fixes syntax/runtime errors (up to `MAX_DEBUG_LOOPS`) |
| 4 | **Output Validator** | `agents/outputValidator.js` | Validates the final output meets quality standards |

---

## 📂 Directory Structure

```
backend/
├── prisma/
│   └── schema.prisma         # Database schema (User, Project, Chat, Component, etc.)
├── src/
│   ├── agents/
│   │   ├── promptEnhancer.js  # Refines user prompts
│   │   ├── codeGenerator.js   # Generates React code
│   │   ├── codeDebugger.js    # Auto-fixes code errors
│   │   └── outputValidator.js # Validates final output
│   ├── controllers/
│   │   ├── generateController.js  # /generate & /generate/status/:jobId
│   │   └── historyController.js   # /history/:userId & /component/:id
│   ├── jobs/
│   │   └── generationQueue.js # Bull queue worker for async generation
│   ├── routes/
│   │   └── api.js             # Route definitions
│   ├── utils/
│   │   ├── aiClient.js        # Unified AI client interface
│   │   ├── geminiClient.js    # Google Gemini provider
│   │   ├── astAnalyzer.js     # AST analysis utilities
│   │   ├── codeExtractor.js   # Extracts code blocks from AI responses
│   │   ├── prisma.js          # Prisma client singleton
│   │   ├── redisClient.js     # Redis client singleton
│   │   └── logger.js          # Logging utility
│   └── server.js              # Application entry point
├── .env.example               # Environment variable template
├── Dockerfile                 # Container image definition
├── docker-compose.yml         # Full-stack orchestration
└── package.json
```

---

## 🔌 API Reference

### `POST /generate`

Queues a code generation job.

**Request Body:**
```json
{
  "prompt": "A retro pixel-art Snake game with high score tracking",
  "userId": "user-abc123",
  "provider": "gemini",
  "model": ""
}
```

**Response:**
```json
{
  "jobId": "job-uuid-here",
  "status": "queued"
}
```

---

### `GET /generate/status/:jobId`

Polls the status of a generation job.

**Response (in progress):**
```json
{
  "status": "active",
  "progress": 45
}
```

**Response (completed):**
```json
{
  "status": "completed",
  "result": {
    "code": "export default function Cube() { ... }",
    "validated": true,
    "componentId": "uuid"
  }
}
```

---

### `GET /history/:userId`

Returns generation history for a user.

### `DELETE /component/:id`

Deletes a component from history.

### `GET /health`

Health check endpoint. Returns `{ "status": "ok" }`.

---

## 🚀 Getting Started

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your API keys

# 3. Start infrastructure (Redis + PostgreSQL)
docker compose up redis postgres -d

# 4. Generate Prisma client
npx prisma generate

# 5. Run the dev server
npm run dev
```

### Docker (Full Stack)

```bash
# Build and start all services
docker compose up --build -d

# View logs
docker compose logs -f backend
```

---

## 🌐 Server Deployment

The image is published on Docker Hub as `uju009/lucide-backend:latest`.

### 1. Create project directory

```bash
mkdir -p ~/lucide-backend && cd ~/lucide-backend
```

### 2. Create `.env` file

```bash
echo "GEMINI_API_KEY=your_actual_key_here" > .env
```

### 3. Create `docker-compose.yml`

```yaml
version: '3.8'

services:
  backend:
    image: uju009/lucide-backend:latest
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgresql://user:password@postgres:5432/neuraai
      - MAX_DEBUG_LOOPS=3
      - MAX_VALIDATION_LOOPS=2
      - NODE_ENV=production
    depends_on:
      - redis
      - postgres
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: neuraai
    restart: unless-stopped
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  redis_data:
  postgres_data:
```

### 4. Deploy

```bash
docker compose pull
docker compose up -d
```

### Useful Commands

```bash
docker compose logs -f backend   # Stream logs
docker compose restart backend   # Restart the backend
docker compose down              # Stop all services
```

---

## 🔑 Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Server port |
| `GEMINI_API_KEY` | — | Google Gemini API key |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URL |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `MAX_DEBUG_LOOPS` | `3` | Max auto-debug iterations per generation |
| `MAX_VALIDATION_LOOPS` | `2` | Max validation passes per generation |
| `NODE_ENV` | `development` | Environment mode |

---

## 🗄️ Database Schema

The Prisma schema includes models for a full-featured platform:

| Model | Purpose |
|---|---|
| `User` | User accounts and authentication |
| `Project` | Projects containing files and chats |
| `Chat` / `ChatMessage` | Conversation history with AI |
| `Component` | Generated component storage (prompt, code, validation status) |
| `BoltAction` | Tracked AI actions (file writes, commands) |
| `Deployment` | Deployment records |
| `UsageLog` | Token usage tracking per provider/model |
| `PipelineLog` | Agent pipeline performance metrics |

