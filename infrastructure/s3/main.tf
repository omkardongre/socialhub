provider "aws" {
  region  = "us-east-1"
  profile = "terraform"
}

resource "aws_s3_bucket" "media" {
  bucket = "socialhub-test"

  tags = {
    Name = "media-bucket"
  }
}

resource "aws_s3_bucket_versioning" "media_versioning" {
  bucket = aws_s3_bucket.media.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_policy" "restrict_public_access" {
  bucket = aws_s3_bucket.media.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid       = "DenyInsecureTransport",
        Effect    = "Deny",
        Principal = "*",
        Action    = "s3:GetObject",
        Resource  = "${aws_s3_bucket.media.arn}/*",
        Condition = {
          Bool = {
            "aws:SecureTransport" = "false"
          }
        }
      },
      {
        Sid       = "PublicRead",
        Effect    = "Allow",
        Principal = "*",
        Action    = "s3:GetObject",
        Resource  = "${aws_s3_bucket.media.arn}/*"
      }
    ]
  })
}