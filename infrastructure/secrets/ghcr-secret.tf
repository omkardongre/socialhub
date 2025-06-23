# --- AWS Secrets Manager for GHCR (GitHub Container Registry) Credentials ---
# Store your GitHub username and PAT (Personal Access Token) for ECS to pull images from GHCR

variable "ghcr_username" {
  description = "GitHub username for GHCR"
  type        = string
  sensitive   = true
}

variable "ghcr_pat" {
  description = "GitHub Personal Access Token for GHCR"
  type        = string
  sensitive   = true
}

resource "aws_secretsmanager_secret" "ghcr" {
  name = "ghcr-credentials-test-4"
}

resource "aws_secretsmanager_secret_version" "ghcr" {
  secret_id     = aws_secretsmanager_secret.ghcr.id
  secret_string = jsonencode({
    username = var.ghcr_username
    password = var.ghcr_pat
  })
}
