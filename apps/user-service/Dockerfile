# Base image
FROM node:20-alpine

WORKDIR /app

# Copy package files first for better layer caching
COPY apps/user-service/package*.json ./
COPY apps/user-service/prisma ./prisma/

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY apps/user-service/ .

# Generate Prisma client if needed
RUN if [ -f "prisma/schema.prisma" ]; then npx prisma generate; fi

# Build the application
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
