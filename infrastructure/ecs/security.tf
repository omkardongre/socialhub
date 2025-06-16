# --- Security Group for ECS EC2 Instance ---
resource "aws_security_group" "ecs_instance_sg" {
  name        = "ecs-instance-sg"
  description = "Security group for ECS EC2 instance"
  vpc_id      = data.aws_vpc.main.id

  # Allow API Gateway port (8082) from anywhere
  ingress {
    from_port   = 8082
    to_port     = 8082
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow internal service ports only from localhost
  ingress {
    from_port   = 3000
    to_port     = 3006
    protocol    = "tcp"
    cidr_blocks = ["127.0.0.1/32"]
  }

  # Allow WebSocket port (3004) from localhost
  ingress {
    from_port   = 3004
    to_port     = 3004
    protocol    = "tcp"
    cidr_blocks = ["127.0.0.1/32"]
  }

  # Allow SSH access from your IP (replace with your actual IP)
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Replace with your IP
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
