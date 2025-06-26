#!/bin/bash

# Define your service DBs with Neon.tech credentials
declare -A DBS=(
  # Format: [service_name]="db_name:user:password:host:port"
  [auth_service]="auth-service:neondb_owner:npg_UKna9Iit3cMD:ep-jolly-night-a8bmygrq.eastus2.azure.neon.tech:5432"
  [user_service]="user-service:neondb_owner:npg_UKna9Iit3cMD:ep-jolly-night-a8bmygrq.eastus2.azure.neon.tech:5432"
  [post_service]="post-service:neondb_owner:npg_UKna9Iit3cMD:ep-jolly-night-a8bmygrq.eastus2.azure.neon.tech:5432"
  [notification_service]="notification-service:neondb_owner:npg_UKna9Iit3cMD:ep-jolly-night-a8bmygrq.eastus2.azure.neon.tech:5432"
  [media_service]="media-service:neondb_owner:npg_UKna9Iit3cMD:ep-jolly-night-a8bmygrq.eastus2.azure.neon.tech:5432"
  [chat_service]="chat-service:neondb_owner:npg_UKna9Iit3cMD:ep-jolly-night-a8bmygrq.eastus2.azure.neon.tech:5432"
)

# Add SSL mode to connection string
export PGSSLMODE="require"

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
            RAISE NOTICE 'Truncated table: %', r.tablename;
        END LOOP;
    END \$\$;
  "
  echo "✅ $service reset complete"
  echo "----------------------------------------"
done

echo "✨ All databases reset successfully!"