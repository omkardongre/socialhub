# --- VPC and Subnets Data Sources ---
data "aws_vpc" "main" {
  filter {
    name   = "tag:Name"
    values = ["socialhub-vpc"]
  }
}

data "aws_subnet" "private_subnet_a" {
  filter {
    name   = "tag:Name"
    values = ["private-subnet-a"]
  }
}

data "aws_subnet" "public_subnet_a" {
  filter {
    name   = "tag:Name"
    values = ["public-subnet-a"]
  }
}
