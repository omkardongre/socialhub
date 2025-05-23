# Base image
FROM node:20-alpine

WORKDIR /app

# Copy frontend package files
COPY apps/frontend-nextjs/package*.json ./
RUN npm install

# Copy the rest of the frontend app
COPY apps/frontend-nextjs/ .

EXPOSE 3000

CMD ["npm", "run", "dev"]