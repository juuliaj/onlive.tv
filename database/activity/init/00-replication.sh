#!/bin/bash
set -e

echo "host replication ${POSTGRES_USER} 0.0.0.0/0 scram-sha-256" >> "$PGDATA/pg_hba.conf"
pg_ctl -D "$PGDATA" -m fast -w reload

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    SELECT pg_create_physical_replication_slot('activity_replica_slot')
    WHERE NOT EXISTS (
        SELECT 1 FROM pg_replication_slots WHERE slot_name = 'activity_replica_slot'
    );
EOSQL