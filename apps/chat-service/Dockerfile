# ---- Stage 1: Build ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY apps/chat-service/package*.json ./
COPY apps/chat-service/prisma ./prisma/

RUN npm install

COPY apps/chat-service/ .

RUN npm run build

# ---- Stage 2: Runtime ----
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY apps/chat-service/package*.json ./
COPY apps/chat-service/prisma ./prisma/

RUN npm install --only=production

COPY --from=builder /app/dist ./dist

RUN npx prisma generate

EXPOSE 3000

CMD ["node", "dist/main.js"]
