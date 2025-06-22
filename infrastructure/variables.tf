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

variable "db_username" {
  description = "Master username for the RDS instance"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "Master password for the RDS instance"
  type        = string
  sensitive   = true
}
