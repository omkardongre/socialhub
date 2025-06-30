variable "bucket_name" {
  description = "Name of the S3 bucket to store env files"
  type        = string
  default     = "socialhub-env-files"
}

variable "env_files" {
  description = "List of env file objects to upload"
  type = list(object({
    s3_key    = string
    file_path = string
  }))
}
