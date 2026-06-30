# ==========================================
# Multi-Stage Build for Weather Intelligence App
# ==========================================

# --- Stage 1: Build & Bundle ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install standard dependencies for building
RUN npm ci

# Copy full application codebases
COPY . .

# Run production compilation (creates client static assets & bundles express in dist/)
RUN npm run build

# --- Stage 2: Lightweight Production Runtime ---
FROM node:20-alpine AS runner

WORKDIR /app

# Set node production flag
ENV NODE_ENV=production
ENV PORT=8080

# Copy manifests & compile deliverables
COPY package*.json ./

# Install exact production dependencies
RUN npm ci --omit=dev

# Copy compiled assets from builder stage
COPY --from=builder /app/dist ./dist

# Expose production port
EXPOSE 8080

# Execute server-side CommonJS bundle directly via node
CMD ["node", "dist/server.cjs"]
