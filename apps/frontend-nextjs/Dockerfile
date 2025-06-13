# --- Stage 1: Build ---
    FROM node:20-alpine AS builder
    WORKDIR /app
    
    # Install dependencies
    COPY apps/frontend-nextjs/package*.json ./
    RUN npm install
    
    # Copy source code
    COPY apps/frontend-nextjs/ .
    
    # Build the Next.js app
    RUN npm run build
    
    # Remove dev dependencies to reduce size
    RUN npm prune --production
    
    # --- Stage 2: Runtime ---
    FROM node:20-alpine
    WORKDIR /app
    
    ENV NODE_ENV=production
    
    # Copy only required runtime files from builder
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/package*.json ./
    COPY --from=builder /app/next.config.* ./
    
    EXPOSE 3000
    
    CMD ["npm", "run", "start"]
    