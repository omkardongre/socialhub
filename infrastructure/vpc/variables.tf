variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "vpc_name" {
  description = "Name for the VPC"
  type        = string
  default     = "socialhub-vpc"
}

variable "public_subnet_a_cidr" {
  description = "CIDR block for public subnet A"
  type        = string
  default     = "10.0.1.0/24"
}

variable "public_subnet_b_cidr" {
  description = "CIDR block for public subnet B"
  type        = string
  default     = "10.0.2.0/24"
}

variable "private_subnet_a_cidr" {
  description = "CIDR block for private subnet A"
  type        = string
  default     = "10.0.101.0/24"
}

variable "private_subnet_b_cidr" {
  description = "CIDR block for private subnet B"
  type        = string
  default     = "10.0.102.0/24"
}

variable "az_a" {
  description = "Availability zone for subnet A"
  type        = string
  default     = "us-east-1a"
}

variable "az_b" {
  description = "Availability zone for subnet B"
  type        = string
  default     = "us-east-1b"
}

variable "tags" {
  description = "Additional tags to add to all resources"
  type        = map(string)
  default     = {}
}