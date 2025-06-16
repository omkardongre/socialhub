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
resource "aws_instance" "ecs_instance" {
  ami           = data.aws_ami.ecs_ami.id
  instance_type = "t2.micro"
  subnet_id     = data.aws_subnet.public_subnet_a.id
  vpc_security_group_ids = [aws_security_group.ecs_instance_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.ecs_instance_profile.name
  key_name      = "socialhub-key"
  associate_public_ip_address = true

  user_data = <<-EOF
              #!/bin/bash
              echo ECS_CLUSTER=${aws_ecs_cluster.main.name} >> /etc/ecs/ecs.config
              EOF

  tags = {
    Name = "ecs-instance"
  }
}
