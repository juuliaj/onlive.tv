# Activity database

PostgreSQL service `db-activity` (data persisted in the `activity-data` Docker volume).

Initialization scripts (`.sql` / `.sh`) will be added later to `init/`. That folder is mounted at `/docker-entrypoint-initdb.d` and runs only on first start with an empty volume (reset with `docker compose down -v`).

No schemas, data or replication exist yet.
