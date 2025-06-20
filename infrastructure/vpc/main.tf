resource "aws_vpc" "main" {
  cidr_block = var.vpc_cidr
  enable_dns_hostnames = true
  tags = merge({
    Name = var.vpc_name
  }, var.tags)
}

# Public Subnet A
resource "aws_subnet" "public_subnet_a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_a_cidr
  availability_zone       = var.az_a
  map_public_ip_on_launch = true
  tags = merge({ Name = "public-subnet-a" }, var.tags)
}

# Public Subnet B
resource "aws_subnet" "public_subnet_b" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_b_cidr
  availability_zone       = var.az_b
  map_public_ip_on_launch = true
  tags = merge({ Name = "public-subnet-b" }, var.tags)
}

# Private Subnet A
resource "aws_subnet" "private_subnet_a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_a_cidr
  availability_zone = var.az_a
  tags = merge({ Name = "private-subnet-a" }, var.tags)
}

# Private Subnet B
resource "aws_subnet" "private_subnet_b" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_b_cidr
  availability_zone = var.az_b
  tags = merge({ Name = "private-subnet-b" }, var.tags)
}

# Internet Gateway
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
  tags = merge({ Name = "main-igw" }, var.tags)
}


# Route Table for Public Subnets
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
  tags = merge({ Name = "public-rt" }, var.tags)
}

# Route Table Association for Public Subnet A
resource "aws_route_table_association" "public_a" {
  subnet_id      = aws_subnet.public_subnet_a.id
  route_table_id = aws_route_table.public.id
}

# Route Table Association for Public Subnet B
resource "aws_route_table_association" "public_b" {
  subnet_id      = aws_subnet.public_subnet_b.id
  route_table_id = aws_route_table.public.id
}

# Route Table for Private Subnets (no internet access in free tier)
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id
  # No default route to NAT Gateway, private subnets will not have internet access
  tags = merge({ Name = "private-rt" }, var.tags)
}

# Route Table Association for Private Subnet A
resource "aws_route_table_association" "private_a" {
  subnet_id      = aws_subnet.private_subnet_a.id
  route_table_id = aws_route_table.private.id
}

# Route Table Association for Private Subnet B
resource "aws_route_table_association" "private_b" {
  subnet_id      = aws_subnet.private_subnet_b.id
  route_table_id = aws_route_table.private.id
}

