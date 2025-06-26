# Nginx Proxy EC2 Instance for HTTPS Reverse Proxy

resource "aws_security_group" "nginx_proxy" {
  name        = "nginx-proxy-sg"
  description = "Allow HTTP/HTTPS access to Nginx proxy"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

resource "aws_instance" "nginx_proxy" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t2.micro"
  subnet_id     = var.public_subnet_id
  vpc_security_group_ids = [aws_security_group.nginx_proxy.id]
  associate_public_ip_address = true
  key_name      = var.key_name

  tags = {
    Name = "nginx-proxy"
  }
}

resource "aws_eip" "nginx_proxy" {
  instance = aws_instance.nginx_proxy.id
}

