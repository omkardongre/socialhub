# Base image
FROM node:20-alpine

WORKDIR /app

# Copy package files first for better layer caching
COPY apps/post-service/package*.json ./apps/post-service/
COPY apps/post-service/prisma ./apps/post-service/prisma/

# Copy shared libraries
COPY libs ./libs

# Copy root tsconfig for path aliases
COPY tsconfig.json ./

# Copy the rest of the application
COPY apps/post-service ./apps/post-service


# Install dependencies (run from service directory)
WORKDIR /app/apps/post-service
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Build the application (run from service directory)
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]