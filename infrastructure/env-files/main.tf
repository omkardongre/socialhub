resource "aws_s3_bucket" "env_files" {
  bucket        = var.bucket_name
  force_destroy = true
}

resource "aws_s3_object" "env_files" {
  for_each = { for f in var.env_files : f.s3_key => f }
  bucket   = aws_s3_bucket.env_files.id
  key      = each.value.s3_key
  source   = each.value.file_path
  etag     = filemd5(each.value.file_path)
}
