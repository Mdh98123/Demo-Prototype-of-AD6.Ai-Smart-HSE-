# Environment Setup & Deployment Guide — AD6.Ai Smart HSE

**Document Version:** 2.0.0-PROD  
**Target Environments:** Local Development (macOS/Linux/WSL2), Docker Sandbox, Production Google Cloud Run  

---

## 1. System Prerequisites

Before starting the AD6.Ai platform, ensure your local development workstation or build runner meets the following requirements:

| Runtime / Tool | Required Version | Verification Command | Purpose |
|---|---|---|---|
| **Node.js** | `>= 20.6.0` (LTS recommended) | `node -v` | Runtimes supporting native `.env` loading and ES Modules |
| **npm** | `>= 9.x` | `npm -v` | Dependency package manager |
| **Docker** | `>= 24.x` (Optional for local) | `docker -v` | Containerized runtime and local DB emulation |
| **Google Cloud SDK**| Optional (Production) | `gcloud version` | Deployment to Google Cloud Run / Cloud SQL |

---

## 2. Quick-Start Local Development

### Step 1: Clone Repository
```bash
git clone https://github.com/Mdh98123/Demo-Prototype-of-AD6.Ai-Smart-HSE-.git ad6-smart-hse
cd ad6-smart-hse
```

### Step 2: Install Verified Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and provide your Gemini API key:
```env
# Application Runtime
NODE_ENV=development
PORT=3000

# Google Gemini AI Suite (Required for Safi Copilot & Audio Analysis)
GEMINI_API_KEY=AIzaSyYourActualApiKeyHere

# Regional Compliance Default Scope (UAE | OMAN | COMBINED)
DEFAULT_JURISDICTION=COMBINED

# Client Public Flags (Vite Client Accessible)
VITE_ENABLE_MOCK_FALLBACKS=true
VITE_ENABLE_AI_VOICE_STREAMING=true
```

> **CRITICAL SECURITY NOTE:** `GEMINI_API_KEY` is loaded exclusively by `server.ts` and `routes/geminiRouter.ts`. It must **never** be prefixed with `VITE_` or exposed in client bundles.

### Step 4: Run Development Server
```bash
npm run dev
```
The server will boot on port `3000`:
- **Web Application:** `http://localhost:3000/`
- **Liveness Probe:** `http://localhost:3000/healthz`
- **Readiness Probe:** `http://localhost:3000/api/healthz`

---

## 3. Production Build & Execution

### 3.1 Local Production Build
```bash
npm run build
```
This script executes:
1. `vite build` — Compiles optimized React 19 SPA assets into `/dist`.
2. `esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs` — Bundles the Express 5 backend gateway.

### 3.2 Running the Production Build
```bash
npm start
```
Starts the bundled server using `node dist/server.cjs`, dynamically binding to `process.env.PORT` (defaults to `8080` in production containers).

---

## 4. Docker Containerization

### 4.1 Building Docker Image
```bash
docker build -t ad6-hse-platform:latest .
```

### 4.2 Running Container Locally
```bash
docker run -d \
  -p 8080:8080 \
  -e NODE_ENV=production \
  -e PORT=8080 \
  -e GEMINI_API_KEY="your_actual_key" \
  --name ad6-app \
  ad6-hse-platform:latest
```

Verify deployment at `http://localhost:8080/healthz`.

---

## 5. Common Troubleshooting & Diagnostics

| Symptom / Error | Likely Root Cause | Verified Resolution |
|---|---|---|
| `Port 3000 in use` | Another process is occupying dev port | Run `lsof -i :3000` and `kill -9 <PID>`, or pass custom port: `npm run dev -- --port 3001`. |
| `Gemini 503 / Key missing` | `GEMINI_API_KEY` not present in `.env` | Ensure `.env` is located at workspace root and contains valid Google AI Studio key. |
| `Rollup build failure on Leaflet heat` | CSS/Canvas bundling conflict | Verify `leaflet.heat` type declaration in `vite.config.ts`. Already configured in current build. |
| `HMR Disconnected warning` | Normal inside AI Studio iframe sandbox | HMR is intentionally disabled in cloud build sandbox environments. Safe to ignore. |
