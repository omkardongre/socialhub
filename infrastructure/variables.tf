variable "ghcr_username" {
  description = "GitHub username for GHCR"
  type        = string
  sensitive   = true
}

variable "ghcr_pat" {
  description = "GitHub Personal Access Token for GHCR"
  type        = string
  sensitive   = true
}

variable "db_username" {
  description = "Master username for the RDS instance"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "Master password for the RDS instance"
  type        = string
  sensitive   = true
}

variable "auth_service_image_tag" {
  description = "Image tag for the auth service"
  type        = string
  default     = "217d18c0eba9997613eb5099f8edc4191e43c95c"
}

variable "user_service_image_tag" {
  description = "Image tag for the user service"
  type        = string
  default     = "217d18c0eba9997613eb5099f8edc4191e43c95c"
}

variable "post_service_image_tag" {
  description = "Image tag for the post service"
  type        = string
  default     = "217d18c0eba9997613eb5099f8edc4191e43c95c"
}

variable "notification_service_image_tag" {
  description = "Image tag for the notification service"
  type        = string
  default     = "217d18c0eba9997613eb5099f8edc4191e43c95c"
}

variable "chat_service_image_tag" {
  description = "Image tag for the chat service"
  type        = string
  default     = "217d18c0eba9997613eb5099f8edc4191e43c95c"
}

variable "media_service_image_tag" {
  description = "Image tag for the media service"
  type        = string
  default     = "217d18c0eba9997613eb5099f8edc4191e43c95c"
}

variable "api_gateway_image_tag" {
  description = "Image tag for the API gateway"
  type        = string
  default     = "217d18c0eba9997613eb5099f8edc4191e43c95c"
}

variable "key_name" {
  description = "EC2 Key Pair name"
  type        = string
  default     = "socialhub-key"
}