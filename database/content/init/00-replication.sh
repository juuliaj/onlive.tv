#!/bin/sh
set -e
echo "host replication all all trust" >> "$PGDATA/pg_hba.conf"
pg_ctl -D "$PGDATA" reload
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  SELECT pg_create_physical_replication_slot('content_replica_slot')
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_replication_slots WHERE slot_name = 'content_replica_slot'
  );
EOSQL