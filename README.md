# Distributed Video Streaming Platform

University group project: a video streaming platform where users can register, log in, browse and stream videos, keep watchlists and continue watching, and rate/like videos. Creators upload videos; administrators manage users and content. Data is spread over separate databases (users, content, activity).

## Technologies

- Frontend: Angular (not yet implemented)
- Backend: Python, FastAPI (not yet implemented)
- Databases: PostgreSQL 16, one container each for users, content and activity
- Docker and Docker Compose, GitHub

## Prerequisites

- Git
- Docker Desktop (macOS, Windows) or Docker Engine with the Compose plugin (Linux)

Nothing else (PostgreSQL, Python, Node.js) needs to be installed on your machine. Images are multi-arch (Apple Silicon, Intel, Linux).

## Getting started

```bash
git clone https://github.com/juuliaj/onlive.tv.git
cd onlive.tv
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
# edit .env and set passwords
docker compose up -d
docker compose ps
```

Currently only the three PostgreSQL databases start (empty). The `frontend` and `backend` services are defined in `docker-compose.yml` behind the `app` profile, so they are skipped until their code exists. Once it does:

```bash
docker compose --profile app up -d --build
```

## Configuring `.env`

`.env` is git-ignored. Defaults in `.env.example`:

| Variable | Meaning |
|----------|---------|
| `FRONTEND_PORT`, `BACKEND_PORT` | planned host ports (4200, 8000) |
| `*_DB_NAME`, `*_DB_USER`, `*_DB_PASSWORD` | credentials per database (`USERS`, `CONTENT`, `ACTIVITY`) |
| `*_DB_PORT` | host ports 5433 / 5434 / 5435 (containers use 5432) |

Changing database credentials after the first start has no effect on existing volumes; remove the volumes (see below) to re-initialize.

## Stopping

```bash
docker compose stop     # stop, keep containers
docker compose down     # remove containers, keep data
```

## Removing containers and volumes

```bash
docker compose down -v
```

> **Warning:** `-v` deletes all persistent local database data. Do not use it unless you want a clean slate.

## Project structure

```text
docker-compose.yml   services and volumes
.env.example         configuration template
frontend/            Angular app (to be added) + Dockerfile
backend/             FastAPI app (to be added) + Dockerfile
database/<name>/     per-database docs and init/ scripts folder
docs/architecture.md overview
```

## Database initialization

Initialization scripts are not written yet. Each `database/<name>/init/` folder is mounted into its PostgreSQL container at `/docker-entrypoint-initdb.d`, so scripts added there run automatically on the first start with an empty volume.

## Adding frontend / backend

Both folders already contain a development `Dockerfile` and a Compose service (profile `app`). Add the code and adjust the Dockerfile if needed:

- `frontend/`: Angular app with `package.json` and `package-lock.json` (e.g. `ng new`), served on port 4200.
- `backend/`: `requirements.txt` and `app/main.py` exposing `app`, served by uvicorn on port 8000.

Then run `docker compose --profile app up -d --build`. Use `--profile app` with `stop`/`down` too to include these services.

No Node.js installed? See `frontend/README.md` for creating the Angular app through Docker.
