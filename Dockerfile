# Multi-stage Docker build for React + Express Application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests and install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps || npm install

# Copy source code and build Vite bundle
COPY . .
RUN npm run build

# Production Runtime Image
FROM node:20-alpine AS runner

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps || npm install --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["npx", "tsx", "server.ts"]
