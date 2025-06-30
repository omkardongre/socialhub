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

module "media_bucket" {
  source            = "./media-bucket"
  bucket_name       = "socialhub-media-bucket-1"
  tags              = { Name = "media-bucket" }
  enable_versioning = true
  allow_public_read = true
}

module "ecs" {
  source             = "./ecs"
  vpc_id             = module.vpc.vpc_id
  vpc_cidr_block     = module.vpc.vpc_cidr_block
  public_subnet_a_id = module.vpc.public_subnet_a_id
  env_files_bucket   = "socialhub-env-files"
  repo_creds_arn     = module.ghcr_secret.arn
  key_name           = var.key_name
  auth_service_image_tag         = var.auth_service_image_tag
  user_service_image_tag         = var.user_service_image_tag
  post_service_image_tag         = var.post_service_image_tag
  notification_service_image_tag = var.notification_service_image_tag
  chat_service_image_tag         = var.chat_service_image_tag
  api_gateway_image_tag          = var.api_gateway_image_tag
  media_service_image_tag        = var.media_service_image_tag
}

module "nginx_proxy" {
  source           = "./nginx-proxy"
  vpc_id           = module.vpc.vpc_id
  public_subnet_id = module.vpc.public_subnet_a_id
  key_name         = var.key_name
}
