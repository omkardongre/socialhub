#!/bin/bash

# Define your service DBs and credentials here
declare -A DBS=(
  # Format: [service_name]="db_name:user:password:host:port"
  [auth_service]="auth_db:admin:admin123:localhost:5432"
  [user_service]="user_db:admin:admin123:localhost:5432"
  [post_service]="post_db:admin:admin123:localhost:5432"
  [notification_service]="notification_db:admin:admin123:localhost:5432"
#   [media_service]="media_db:admin:admin123:localhost:5432"
#   [chat_service]="chat_db:admin:admin123:localhost:5432"
)

for service in "${!DBS[@]}"; do
  IFS=':' read -r DB USER PASS HOST PORT <<< "${DBS[$service]}"
  echo "Resetting $service ($DB)..."
  PGPASSWORD="$PASS" psql -h "$HOST" -U "$USER" -d "$DB" -p "$PORT" -c "
    DO \$\$ DECLARE
        r RECORD;
    BEGIN
        FOR r IN (
            SELECT tablename FROM pg_tables
            WHERE schemaname = 'public'
              AND tablename NOT IN ('_prisma_migrations')
        ) LOOP
            EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE;';
        END LOOP;
    END \$\$;
  "
done

echo "All databases reset!"