#!/bin/bash

# Set your DATABASE_URL here (example format, any one DB is fine)
DATABASE_URL="postgresql://postgres:8446111598@socialhub-db.c6vgo2qoy65o.us-east-1.rds.amazonaws.com:5432/auth_db?sslmode=require"

# List all your databases here (from your Terraform)
DATABASES=(auth_db user_db post_db notification_db media_db chat_db)

# Parse the DATABASE_URL
regex="^postgres(ql)?://([^:]+):([^@]+)@([^:/]+):([0-9]+)/([^?]+)"
if [[ $DATABASE_URL =~ $regex ]]; then
  USER="${BASH_REMATCH[2]}"
  PASS="${BASH_REMATCH[3]}"
  HOST="${BASH_REMATCH[4]}"
  PORT="${BASH_REMATCH[5]}"
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