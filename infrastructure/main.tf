module "vpc" {
  source = "./vpc"
}

module "ghcr_secret" {
  source = "./secrets"
  ghcr_username = var.ghcr_username
  ghcr_pat      = var.ghcr_pat
}