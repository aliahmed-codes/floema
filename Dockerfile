# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./

# Install all deps (devDependencies needed for webpack build)
RUN npm install

COPY . .

# Build frontend assets into dist/
RUN npm run build

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

COPY package.json ./

# Install only production dependencies
# ua-parser-js and dotenv are used at runtime but listed under devDependencies,
# so we install everything and prune what we can't avoid needing.
RUN npm install --omit=dev && \
    npm install ua-parser-js dotenv

# Copy server source and views
COPY src/ ./src/

# Copy built frontend assets from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "src/app.js"]
