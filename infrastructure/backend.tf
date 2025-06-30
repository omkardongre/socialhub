terraform {
  backend "s3" {
    bucket = "socialhub-terraform-state"           # Your S3 bucket name
    key    = "global/s3/terraform.tfstate"        # Path within the bucket
    region = "us-east-1"
    encrypt = true
    # dynamodb_table is optional and skipped for now
  }
}
