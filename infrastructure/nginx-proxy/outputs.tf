output "public_ip" {
  value = aws_eip.nginx_proxy.public_ip
}
output "instance_id" {
  value = aws_instance.nginx_proxy.id
}
