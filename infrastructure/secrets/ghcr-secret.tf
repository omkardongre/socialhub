# --- AWS Secrets Manager for GHCR (GitHub Container Registry) Credentials ---
# Store your GitHub username and PAT (Personal Access Token) for ECS to pull images from GHCR

resource "aws_secretsmanager_secret" "ghcr" {
  name = "ghcr-credentials-alt"
}

resource "aws_secretsmanager_secret_version" "ghcr" {
  secret_id     = aws_secretsmanager_secret.ghcr.id
  secret_string = jsonencode({
    username = ""
    password = ""
  })
}
