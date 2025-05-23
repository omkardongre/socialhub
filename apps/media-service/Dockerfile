# Base image
FROM node:20-alpine

WORKDIR /app

# Copy package files first for better layer caching
COPY apps/media-service/package*.json ./
COPY apps/media-service/prisma ./prisma/

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY apps/media-service/ .

# Generate Prisma client if needed
RUN if [ -f "prisma/schema.prisma" ]; then npx prisma generate; fi

EXPOSE 3000

CMD ["npm", "run", "start"]
