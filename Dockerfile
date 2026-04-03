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
    zlib-dev

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
RUN npm install --omit=dev && \
    npm install ua-parser-js dotenv

# Copy server source and views
COPY src/ ./src/

# Copy built frontend assets from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "src/app.js"]