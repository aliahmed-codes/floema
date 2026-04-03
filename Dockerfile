# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Install build tools needed for native modules (gifsicle, etc.)
RUN apk add --no-cache \
    autoconf \
    automake \
    libtool \
    make \
    gcc \
    g++ \
    libc-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    nasm \
    zlib-dev \
    python3

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

# Copy package.json first
COPY package.json ./

# Copy ONLY production node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Manually remove dev-only packages that aren't needed at runtime
# (This avoids reinstalling and triggering gifsicle build)
RUN npm prune --omit=dev --ignore-scripts || true

# Copy server source and views
COPY src/ ./src/

# Copy built frontend assets from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "src/app.js"]