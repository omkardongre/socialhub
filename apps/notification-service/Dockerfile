# Base image
FROM node:20-alpine

WORKDIR /app

# Copy package files first for better layer caching
COPY apps/notification-service/package*.json ./apps/notification-service/
COPY apps/notification-service/prisma ./apps/notification-service/prisma/

# Copy shared libraries
COPY libs ./libs

# Copy root tsconfig for path aliases
COPY tsconfig.json ./

# Copy the rest of the application
COPY apps/notification-service ./apps/notification-service

# Generate Prisma client if needed
RUN if [ -f "apps/notification-service/prisma/schema.prisma" ]; then npx prisma generate --schema=apps/notification-service/prisma/schema.prisma; fi

# Install dependencies (run from service directory)
WORKDIR /app/apps/notification-service
RUN npm install

# Build the application (run from service directory)
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
