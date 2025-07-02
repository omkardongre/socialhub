#!/bin/bash

# Set your DATABASE_URL here (example format, any one DB is fine)
# DATABASE_URL="postgresql://postgres:8446111598@socialhub-db.c6vgo2qoy65o.us-east-1.rds.amazonaws.com:5432/auth_db?sslmode=require"
DATABASE_URL="postgresql://neondb_owner:npg_UKna9Iit3cMD@ep-jolly-night-a8bmygrq.eastus2.azure.neon.tech/auth-service?sslmode=require&channel_binding=require"

# List all your databases here (from your Terraform)
DATABASES=(auth-service user-service post-service notification-service media-service chat-service)

# Parse the DATABASE_URL
regex="^postgres(ql)?://([^:]+):([^@]+)@([^:/]+)(:([0-9]+))?/([a-zA-Z0-9_-]+)(\\?.*)?$"
if [[ $DATABASE_URL =~ $regex ]]; then
  USER="${BASH_REMATCH[2]}"
  PASS="${BASH_REMATCH[3]}"
  HOST="${BASH_REMATCH[4]}"
  PORT="${BASH_REMATCH[6]:-5432}"
  DB="${BASH_REMATCH[7]}"
else
  echo "❌ Could not parse DATABASE_URL"
  exit 1
fi

export PGSSLMODE="require"

for DB in "${DATABASES[@]}"; do
  echo "Resetting all tables in database $DB on $HOST..."
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
  echo "✅ Database $DB reset complete"
  echo "----------------------------------------"
done

echo "✨ All databases reset successfully!"