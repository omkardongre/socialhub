# Base image
FROM node:20-alpine

WORKDIR /app

# Copy package files first for better layer caching
COPY apps/user-service/package*.json ./apps/user-service/
COPY apps/user-service/prisma ./apps/user-service/prisma/

# Copy shared libraries
COPY libs ./libs

# Copy root tsconfig for path aliases
COPY tsconfig.json ./

# Copy the rest of the application
COPY apps/user-service ./apps/user-service

# Generate Prisma client if needed
RUN if [ -f "apps/user-service/prisma/schema.prisma" ]; then npx prisma generate --schema=apps/user-service/prisma/schema.prisma; fi

# Install dependencies (run from service directory)
WORKDIR /app/apps/user-service
RUN npm install

# Build the application (run from service directory)
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
