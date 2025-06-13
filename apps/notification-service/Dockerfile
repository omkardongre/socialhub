# ---- Stage 1: Build ----
    FROM node:20-alpine AS builder
    WORKDIR /app
    
    # Copy package files and lockfile for dependency install
    COPY apps/notification-service/package*.json ./apps/notification-service/
    COPY apps/notification-service/prisma ./apps/notification-service/prisma/
    COPY libs ./libs
    COPY tsconfig.json ./
    COPY apps/notification-service/ ./apps/notification-service/
    
    # Set working directory to service
    WORKDIR /app/apps/notification-service
    
    # Install all dependencies (including dev)
    RUN npm install
    
    # Generate Prisma client
    RUN npx prisma generate
    
    # Build the application
    RUN npm run build
    
    # ---- Stage 2: Runtime ----
    FROM node:20-alpine
    WORKDIR /app/apps/notification-service
    
    ENV NODE_ENV=production
    
    # Copy package files and prisma schema for runtime
    COPY apps/notification-service/package*.json ./
    COPY apps/notification-service/prisma ./prisma/
    COPY libs ../../libs
    COPY tsconfig.json ../../
    
    # Install only production dependencies
    RUN npm install --only=production
    
    # Copy built output from builder
    COPY --from=builder /app/apps/notification-service/dist ./dist
    
    # Generate Prisma client in the runtime node_modules
    RUN npx prisma generate
    
    EXPOSE 3000
    
    CMD ["node", "dist/apps/notification-service/src/main.js"]