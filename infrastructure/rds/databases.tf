resource "null_resource" "create_databases" {
  depends_on = [aws_db_instance.postgres]

  provisioner "local-exec" {
    command = <<EOT
PGPASSWORD=8446111598 psql "host=${aws_db_instance.postgres.address} port=5432 user=postgres dbname=postgres sslmode=require" -c "CREATE DATABASE auth_db;"
PGPASSWORD=8446111598 psql "host=${aws_db_instance.postgres.address} port=5432 user=postgres dbname=postgres sslmode=require" -c "CREATE DATABASE user_db;"
PGPASSWORD=8446111598 psql "host=${aws_db_instance.postgres.address} port=5432 user=postgres dbname=postgres sslmode=require" -c "CREATE DATABASE post_db;"
PGPASSWORD=8446111598 psql "host=${aws_db_instance.postgres.address} port=5432 user=postgres dbname=postgres sslmode=require" -c "CREATE DATABASE notification_db;"
PGPASSWORD=8446111598 psql "host=${aws_db_instance.postgres.address} port=5432 user=postgres dbname=postgres sslmode=require" -c "CREATE DATABASE media_db;"
PGPASSWORD=8446111598 psql "host=${aws_db_instance.postgres.address} port=5432 user=postgres dbname=postgres sslmode=require" -c "CREATE DATABASE chat_db;"
EOT
  }
}
