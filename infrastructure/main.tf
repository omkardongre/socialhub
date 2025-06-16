module "vpc" {
  source = "./vpc"
}

module "s3" {
  source = "./s3"
}

module "ecs" {
  source = "./ecs"
}