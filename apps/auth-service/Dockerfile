# ---- Stage 1: Build ----
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and prisma schema for dependency install and client generation
COPY apps/auth-service/package*.json ./
COPY apps/auth-service/prisma ./prisma/

# Install ALL dependencies (including dev) for building
RUN npm install

# Copy the rest of the application
COPY apps/auth-service/ .

# Build the application (do not generate Prisma client here)
RUN npm run build

# ---- Stage 2: Runtime ----
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

# Copy package files and prisma schema for runtime
COPY apps/auth-service/package*.json ./
COPY apps/auth-service/prisma ./prisma/

# Install only production dependencies
RUN npm install --only=production

# Copy built output from builder
COPY --from=builder /app/dist ./dist

# Generate Prisma client in the runtime node_modules
RUN npx prisma generate

EXPOSE 3000

CMD ["node", "dist/main.js"]
