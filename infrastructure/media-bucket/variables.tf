variable "bucket_name" {
  description = "Name of the S3 bucket"
  type        = string
}

variable "tags" {
  description = "Tags to apply to the bucket"
  type        = map(string)
  default     = {}
}

variable "enable_versioning" {
  description = "Enable versioning for the bucket"
  type        = bool
  default     = true
}

variable "allow_public_read" {
  description = "Allow public read access to bucket objects"
  type        = bool
  default     = false
}
