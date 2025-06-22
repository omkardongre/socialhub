# --- Security Group for ECS EC2 Instance ---
resource "aws_security_group" "ecs_instance_sg" {
  name        = "ecs-instance-sg"
  description = "Security group for ECS EC2 instance"
  vpc_id      = var.vpc_id

  # Allow API Gateway port (8082) from anywhere
  ingress {
    from_port   = 8082
    to_port     = 8082
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow internal service ports from within VPC
  ingress {
    from_port   = 3000
    to_port     = 3006
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr_block]
  }

  # Allow WebSocket port (3004) from within VPC
  ingress {
    from_port   = 3004
    to_port     = 3004
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr_block]
  }

  # Allow SSH access from your IP only
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
