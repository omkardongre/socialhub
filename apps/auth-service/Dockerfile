# Base image
FROM node:20-alpine

WORKDIR /app

# Copy package files first for better layer caching
COPY apps/auth-service/package*.json ./
COPY apps/auth-service/prisma ./prisma/

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY apps/auth-service/ .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
