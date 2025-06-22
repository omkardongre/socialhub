# --- Find Latest ECS-Optimized AMI ---
data "aws_ami" "ecs_ami" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["amzn2-ami-ecs-hvm-*-x86_64-ebs"]
  }
}

# --- EC2 Instance for ECS Cluster ---
# Uses latest ECS-optimized AMI, configurable instance type, key, and tags

resource "aws_instance" "ecs_instance" {
  ami           = data.aws_ami.ecs_ami.id
  instance_type = var.ecs_instance_type
  private_ip = "10.0.1.101"
  subnet_id     = var.public_subnet_a_id
  vpc_security_group_ids = [aws_security_group.ecs_instance_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.ecs_instance_profile.name
  key_name      = var.key_name
  associate_public_ip_address = true

  user_data = <<-EOF
              #!/bin/bash
              echo ECS_CLUSTER=${var.ecs_cluster_name} >> /etc/ecs/ecs.config
              EOF

  tags = {
    Name        = "ecs-instance"
    Project     = "socialhub"
    Environment = var.environment
  }
}
