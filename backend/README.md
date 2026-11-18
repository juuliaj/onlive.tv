# Backend

Python FastAPI application (to be added by the backend developer).

The `Dockerfile` expects `requirements.txt` (with `fastapi` and `uvicorn`) and `app/main.py` exposing `app`. The `backend` service in `../docker-compose.yml` uses the `app` profile: `docker compose --profile app up -d --build`. Port: `BACKEND_PORT` in `.env`. Database hosts inside Compose: `db-users`, `db-content`, `db-activity` (port 5432).
