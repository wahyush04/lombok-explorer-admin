# ==========================================
# Stage 1: Builder
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Cache dependencies
COPY package.json package-lock.json ./
RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm ci

# Copy project source
COPY . .

# Build Arguments (Can be overridden via docker build --build-arg)
ARG VITE_API_BASE_URL=http://34.142.205.101:3000/api/v1/admin
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build client SPA and server bundle
RUN npm run build

# ==========================================
# Stage 2: Production Runner
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm ci --omit=dev && npm cache clean --force

# Copy compiled bundles from builder
COPY --from=builder /app/dist ./dist

# Use non-root node user for container security
RUN chown -R node:node /app
USER node

EXPOSE 3000

# Healthcheck to ensure Express server responds
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:${PORT}/ || exit 1

CMD ["node", "dist/server.cjs"]
