provider "aws" {
  region  = "us-east-1"  # Change if needed
  profile = "terraform"
}

resource "aws_s3_bucket" "env_files" {
  bucket = "socialhub-env-files"
  force_destroy = true
}

resource "aws_s3_object" "auth_env" {
  bucket = aws_s3_bucket.env_files.id
  key    = "auth-service.env"
  source = "${path.module}/../../apps/auth-service/.env"
  etag   = filemd5("${path.module}/../../apps/auth-service/.env")
}

resource "aws_s3_object" "user_env" {
  bucket = aws_s3_bucket.env_files.id
  key    = "user-service.env"
  source = "${path.module}/../../apps/user-service/.env"
  etag   = filemd5("${path.module}/../../apps/user-service/.env")
}

resource "aws_s3_object" "post_env" {
  bucket = aws_s3_bucket.env_files.id
  key    = "post-service.env"
  source = "${path.module}/../../apps/post-service/.env"
  etag   = filemd5("${path.module}/../../apps/post-service/.env")
}

resource "aws_s3_object" "chat_env" {
  bucket = aws_s3_bucket.env_files.id
  key    = "chat-service.env"
  source = "${path.module}/../../apps/chat-service/.env"
  etag   = filemd5("${path.module}/../../apps/chat-service/.env")
}

resource "aws_s3_object" "media_env" {
  bucket = aws_s3_bucket.env_files.id
  key    = "media-service.env"
  source = "${path.module}/../../apps/media-service/.env"
  etag   = filemd5("${path.module}/../../apps/media-service/.env")
}

resource "aws_s3_object" "notification_env" {
  bucket = aws_s3_bucket.env_files.id
  key    = "notification-service.env"
  source = "${path.module}/../../apps/notification-service/.env"
  etag   = filemd5("${path.module}/../../apps/notification-service/.env")
}

resource "aws_s3_object" "api_gateway_env" {
  bucket = aws_s3_bucket.env_files.id
  key    = "api-gateway.env"
  source = "${path.module}/../../api-gateway/.env"
  etag   = filemd5("${path.module}/../../api-gateway/.env")
}
