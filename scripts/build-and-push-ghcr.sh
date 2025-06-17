#!/bin/bash

# Get GitHub username from git config
GH_USERNAME=$(git config --get user.name)
GH_EMAIL=$(git config --get user.email)

# Get the root directory of the project
ROOT_DIR=$(git rev-parse --show-toplevel)
cd "$ROOT_DIR"


# Array of services with their paths
SERVICES=(
  "auth-service:apps/auth-service"
  "user-service:apps/user-service"
  "post-service:apps/post-service"
  "chat-service:apps/chat-service"
  "media-service:apps/media-service"
  "notification-service:apps/notification-service"
  "api-gateway:api-gateway"
)

# Login to GitHub Container Registry
# You'll need to enter your GitHub PAT (Personal Access Token) when prompted
echo "Logging in to GitHub Container Registry..."
docker login ghcr.io -u "$GH_USERNAME"

# Main build and push loop
for SERVICE in "${SERVICES[@]}"; do
  echo "=== Processing $SERVICE ==="
  
  # Get service name and path
  SERVICE_NAME=${SERVICE%%:*}
  SERVICE_PATH=${SERVICE#*:}


  # Detect uncommitted, staged, or unpushed committed changes
  if git diff --quiet -- "$SERVICE_PATH" && \
    git diff --cached --quiet -- "$SERVICE_PATH" && \
    git diff --quiet origin/main...HEAD -- "$SERVICE_PATH"; then
    echo "No changes detected in $SERVICE_PATH. Skipping build and push."
    continue
  fi
  
  # Build Docker image
  echo "Building Docker image for $SERVICE_NAME..."
  docker build -f $SERVICE_PATH/Dockerfile -t $SERVICE_NAME .
  if [ $? -ne 0 ]; then
    echo "Error building $SERVICE"
    exit 1
  fi
  
  # Tag for GitHub Container Registry
  GHCR_REPO="ghcr.io/$GH_USERNAME/$SERVICE_NAME"
  echo "Tagging image for GHCR..."
  docker tag $SERVICE_NAME:latest "$GHCR_REPO:latest"
  
  # Push to GHCR
  echo "Pushing $SERVICE to GHCR..."
  docker push "$GHCR_REPO:latest"
  if [ $? -ne 0 ]; then
    echo "Error pushing $SERVICE to GHCR"
    exit 1
  fi
  
  echo "=== $SERVICE processed successfully ==="
  echo ""
done

echo "=== All services built and pushed successfully to GHCR ==="
