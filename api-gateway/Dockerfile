# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the TypeScript code (if using tsc)
RUN npm run build

# Expose the port (should match your app)
EXPOSE 8082

# Start the API Gateway
CMD ["npm", "run", "start"]