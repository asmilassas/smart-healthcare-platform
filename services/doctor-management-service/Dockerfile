# ── Stage 1: Build ──────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 5002

CMD ["node", "src/server.js"]
