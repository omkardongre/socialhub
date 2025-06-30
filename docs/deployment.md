# Deployment Guide

This guide covers the steps to deploy the SocialHub application to a production environment on AWS and Vercel.

## Overview

The deployment process is automated and leverages Infrastructure as Code (IaC) and CI/CD pipelines.

- **Frontend:** Deployed on **Vercel**.
- **Backend:** Deployed on **AWS ECS** (Elastic Container Service).
- **Infrastructure:** Provisioned with **Terraform**.
- **Automation:** Managed by **GitHub Actions**.

## Frontend Deployment (Vercel)

The Next.js frontend is configured for continuous deployment on Vercel.

1.  **Connect Repository to Vercel:**
    - Create a new project on your Vercel account.
    - Connect it to your GitHub repository (`socialhub`).
    - Vercel will automatically detect that it's a Next.js project.

2.  **Configuration:**
    - **Root Directory:** Set the root directory to `apps/frontend-nextjs`.
    - **Environment Variables:** Add the necessary environment variables to the Vercel project settings. The most important one is `NEXT_PUBLIC_API_URL`, which should point to the URL of your deployed API Gateway on AWS.

3.  **Automatic Deployments:**
    - Once set up, Vercel will automatically trigger a new deployment on every push to the `main` branch.

## Backend Deployment (AWS with Terraform)

The entire backend infrastructure is defined as code using Terraform. The GitHub Actions workflow automates the deployment.

### Prerequisites

- An **AWS Account** with programmatic access (Access Key ID and Secret Access Key).
- A configured **S3 bucket** to store the Terraform state remotely. This is defined in `infrastructure/backend.tf`.
- **GitHub Secrets:** Add your AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) and other necessary variables to your GitHub repository's secrets.

### Terraform Infrastructure

The Terraform configuration in the `infrastructure/` directory provisions the following resources:

- **VPC:** A custom Virtual Private Cloud for network isolation.
- **ECS Cluster:** A cluster to run the Docker containers.
- **ECS Task Definitions & Services:** Defines how each microservice container should run and ensures they are kept running.
- **RDS:** A managed PostgreSQL database instance.
- **S3 Bucket:** For media storage.
- **Application Load Balancer (ALB):** To distribute traffic to the API Gateway.
- **IAM Roles & Security Groups:** For secure access control.

### Deployment Steps (via GitHub Actions)

The `.github/workflows/terraform.yml` workflow automates the deployment. It is typically triggered on a push to the `main` branch.

1.  **Workflow Trigger:** A push to `main` starts the `terraform` job.
2.  **Terraform Plan:** The workflow runs `terraform plan` to show the expected changes.
3.  **Terraform Apply:** After manual approval (if configured), the workflow runs `terraform apply` to provision or update the infrastructure on AWS.

### Manual Deployment Steps

If you need to deploy manually:

1.  **Configure AWS Credentials:**
    ```sh
    export AWS_ACCESS_KEY_ID="YOUR_KEY"
    export AWS_SECRET_ACCESS_KEY="YOUR_SECRET"
    ```

2.  **Initialize Terraform:**
    Navigate to the infrastructure directory and initialize Terraform.
    ```sh
    cd infrastructure
    terraform init
    ```

3.  **Update Environment Variables:**
    The `infrastructure/env-files` module pushes the contents of your local `.env` files to a secure S3 bucket. ECS task definitions are configured to pull environment variables from this source. To update them:
    ```sh
    cd infrastructure/env-files
    terraform apply
    ```

4.  **Plan and Apply:**
    ```sh
    cd infrastructure
    terraform plan
    terraform apply
    ```

### Database Migrations in Production

After a deployment that includes schema changes, you must run the database migrations against the production RDS instance.

The `scripts/run-migrations.sh` script is designed for local development. For production, you would typically run migrations as part of your CI/CD pipeline using a bastion host or an ECS task with the necessary permissions.

A common approach:
1.  The CI/CD pipeline deploys the new version of a service.
2.  A subsequent step in the pipeline runs a one-off ECS task using the new container image.
3.  This task's command is overridden to execute the migration command (e.g., `npx prisma migrate deploy`).
4.  The task runs, applies the migration, and then stops.