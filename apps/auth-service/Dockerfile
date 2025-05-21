# Base image
FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies including devDependencies for Prisma
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
