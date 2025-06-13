# --- Stage 1: Builder ---
    FROM node:20-alpine AS builder
    WORKDIR /app
    
    # Install all dependencies
    COPY api-gateway/package*.json ./
    RUN npm install
    
    # Copy full source and build
    COPY api-gateway/ .
    RUN npm run build
    
    # Remove dev dependencies
    RUN npm prune --production
    
    # --- Stage 2: Runtime ---
    FROM node:20-alpine
    WORKDIR /app
    
    ENV NODE_ENV=production
    
    # Copy only what's needed from builder
    COPY --from=builder /app/dist ./dist
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/package*.json ./
    
    EXPOSE 8082
    CMD ["node", "dist/index.js"]
    