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

module "env_files" {
  source      = "./env-files"
  bucket_name = "socialhub-env-files"
  env_files = [
    { s3_key = "auth-service.env", file_path = "${path.module}/../../apps/auth-service/.env" },
    { s3_key = "user-service.env", file_path = "${path.module}/../../apps/user-service/.env" },
    { s3_key = "post-service.env", file_path = "${path.module}/../../apps/post-service/.env" },
    { s3_key = "chat-service.env", file_path = "${path.module}/../../apps/chat-service/.env" },
    { s3_key = "media-service.env", file_path = "${path.module}/../../apps/media-service/.env" },
    { s3_key = "notification-service.env", file_path = "${path.module}/../../apps/notification-service/.env" },
    { s3_key = "api-gateway.env", file_path = "${path.module}/../api-gateway/.env" }
  ]
}

module "media_bucket" {
  source            = "./media-bucket"
  bucket_name       = "socialhub-media-bucket"
  tags              = { Name = "media-bucket" }
  enable_versioning = true
  allow_public_read = true
}

module "ecs" {
  source             = "./ecs"
  vpc_id             = module.vpc.vpc_id
  vpc_cidr_block     = module.vpc.vpc_cidr_block
  public_subnet_a_id = module.vpc.public_subnet_a_id
  env_files_bucket   = module.env_files.bucket_name
}
