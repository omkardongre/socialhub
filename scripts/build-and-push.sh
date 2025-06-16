#!/bin/bash

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text --profile terraform)
REGION="us-east-1"

# Array of services
SERVICES=(
  "auth-service"
  "user-service"
  "post-service"
  "chat-service"
  "media-service"
  "notification-service"
  "api-gateway"
)

# Function to create ECR repository if it doesn't exist
create_ecr_repo() {
  local repo_name="$1"
  aws ecr describe-repositories --repository-names "$repo_name" --region "$REGION" --profile terraform >/dev/null 2>&1 || \
    aws ecr create-repository --repository-name "$repo_name" --region "$REGION" --profile terraform
}

# Function to get ECR login token
get_ecr_login() {
  aws ecr get-login-password --region "$REGION" --profile terraform | \
    docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"
}

# Main build and push loop
for SERVICE in "${SERVICES[@]}"; do
  echo "=== Processing $SERVICE ==="
  
  # Create ECR repository
  echo "Creating ECR repository for $SERVICE..."
  create_ecr_repo "$SERVICE"
  
  # Build Docker image
  echo "Building Docker image for $SERVICE..."
  docker build -f apps/$SERVICE/Dockerfile -t $SERVICE .
  if [ $? -ne 0 ]; then
    echo "Error building $SERVICE"
    exit 1
  fi
  
  # Tag for ECR
  ECR_REPO="$AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$SERVICE"
  echo "Tagging image for ECR..."
  docker tag $SERVICE:latest "$ECR_REPO:latest"
  
  # Login to ECR (only once)
  if [ "$SERVICE" == "${SERVICES[0]}" ]; then
    echo "Logging in to ECR..."
    get_ecr_login
    if [ $? -ne 0 ]; then
      echo "Error logging in to ECR"
      exit 1
    fi
  fi
  
  # Push to ECR
  echo "Pushing $SERVICE to ECR..."
  docker push "$ECR_REPO:latest"
  if [ $? -ne 0 ]; then
    echo "Error pushing $SERVICE to ECR"
    exit 1
  fi
  
  echo "=== $SERVICE processed successfully ==="
  echo ""
done

echo "=== All services built and pushed successfully ==="
