module "vpc" {
  source = "./vpc"
}

module "ghcr_secret" {
  source = "./secrets"
  ghcr_username = var.ghcr_username
  ghcr_pat      = var.ghcr_pat
}

module "rds" {
  source              = "./rds"
  vpc_id              = module.vpc.vpc_id
  subnet_ids          = [module.vpc.public_subnet_a_id, module.vpc.public_subnet_b_id]
  db_username         = var.db_username
  db_password         = var.db_password
  db_name             = "postgres"
  db_instance_class   = "db.t3.micro"
  db_engine           = "postgres"
  db_engine_version   = "17.4"
  allowed_cidr        = "0.0.0.0/0"
}
