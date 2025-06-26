#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Function to run migrations for a service
run_migration() {
  local service=$1
  echo -e "${GREEN}Running migrations for ${service}...${NC}"
  
  cd "apps/${service}"
  
  # Install dependencies if needed
  if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
  fi
  
  # Run migrations
  npx prisma migrate deploy
  
  # Go back to root
  cd ../..
  
  echo -e "${GREEN}✓ ${service} migrations completed${NC}\n"
}

# List of services with Prisma
services=("auth-service" "user-service" "post-service" "chat-service" "media-service" "notification-service")

# Run migrations for each service
for service in "${services[@]}"; do
  if [ -d "apps/${service}" ]; then
    run_migration "$service"
  else
    echo "Service ${service} not found, skipping..."
  fi
done

echo -e "${GREEN}All migrations completed successfully!${NC}"
