variable "vpc_id" {
    description = "VPC ID for NGINX proxy"
    type        = string
}
variable "public_subnet_id" {
    description = "Public subnet ID for NGINX proxy"
    type        = string
}
variable "key_name" {
    description = "EC2 Key Pair name"
    type        = string
}
