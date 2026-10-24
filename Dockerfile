# Multi-stage production container for Google Cloud Run
# Base image with Node.js 22 LTS
FROM node:22-alpine AS builder

WORKDIR /app

# Ensure clean build environment
ENV NODE_ENV=development

# Install dependencies (respecting package-lock)
COPY package*.json ./
RUN npm ci --ignore-scripts || npm install

# Copy application source
COPY . .

# Build Vite client assets and compile server with esbuild
RUN npm run build

# -------------------------------------------------------------
# Production Runner Stage
# -------------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# Dynamic port binding configured for Cloud Run default (8080)
ENV PORT=8080

# Install curl for container health check
RUN apk add --no-cache curl

# Copy compiled bundles and necessary runtime manifests
COPY package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/services ./services
COPY --from=builder /app/index.html ./index.html

# Expose port (Cloud Run defaults to 8080)
EXPOSE 8080

# Container healthcheck using the lightweight /api/healthz endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://127.0.0.1:${PORT:-8080}/api/healthz || exit 1

# Start container through production entrypoint
CMD ["node", "dist/server.cjs"]
