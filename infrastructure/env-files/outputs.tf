output "bucket_name" {
  value = aws_s3_bucket.env_files.id
}

output "env_file_keys" {
  value = [for obj in aws_s3_object.env_files : obj.key]
}
