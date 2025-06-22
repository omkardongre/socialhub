resource "null_resource" "create_databases" {
  depends_on = [aws_db_instance.postgres]

  provisioner "local-exec" {
    command = <<EOT
PGPASSWORD=${var.db_password} psql "host=${aws_db_instance.postgres.address} port=5432 user=${var.db_username} dbname=postgres sslmode=require" -c "CREATE DATABASE auth_db;"
PGPASSWORD=${var.db_password} psql "host=${aws_db_instance.postgres.address} port=5432 user=${var.db_username} dbname=postgres sslmode=require" -c "CREATE DATABASE user_db;"
PGPASSWORD=${var.db_password} psql "host=${aws_db_instance.postgres.address} port=5432 user=${var.db_username} dbname=postgres sslmode=require" -c "CREATE DATABASE post_db;"
PGPASSWORD=${var.db_password} psql "host=${aws_db_instance.postgres.address} port=5432 user=${var.db_username} dbname=postgres sslmode=require" -c "CREATE DATABASE notification_db;"
PGPASSWORD=${var.db_password} psql "host=${aws_db_instance.postgres.address} port=5432 user=${var.db_username} dbname=postgres sslmode=require" -c "CREATE DATABASE media_db;"
PGPASSWORD=${var.db_password} psql "host=${aws_db_instance.postgres.address} port=5432 user=${var.db_username} dbname=postgres sslmode=require" -c "CREATE DATABASE chat_db;"
EOT
  }
}
