# Backend

Python FastAPI application exposing authentication, content catalog, and administrator
monitoring APIs.

The `backend` service in `../docker-compose.yml` uses the `app` profile:
`docker compose --profile app up -d --build`. Port: `BACKEND_PORT` in `.env`. Database
hosts inside Compose: `db-users`, `db-content`, and `db-activity` (port 5432).

`GET /admin/dashboard` returns independent health checks and aggregate metrics across all
three databases. It requires a bearer token for an administrator account. A database
failure is logged and returned as an unavailable service while the other database metrics
remain available.
