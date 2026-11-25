# Frontend

Angular application (to be added by the frontend developer).

The `Dockerfile` expects `package.json` and `package-lock.json` here (e.g. from `ng new`). The `frontend` service in `../docker-compose.yml` uses the `app` profile: `docker compose --profile app up -d --build`. Port: `FRONTEND_PORT` in `.env`.

**Creating the Angular app without Node.js installed:** run the Angular CLI in a temporary container from the project root (files appear in `frontend/`, the container is deleted afterwards). If you already have Node.js, `npx @angular/cli new` inside `frontend/` works too.

```bash
docker run --rm -v "$PWD/frontend":/app -w /app node:22-alpine npx @angular/cli new app-name --directory .
```

On Windows PowerShell `$PWD` works as above; in Command Prompt use `%cd%` instead. Pick the options you want when prompted, and keep the generated `package.json` and `package-lock.json` in `frontend/`.

## Declaration of AI Use

Google Gemini was used to assist in generating and troubleshooting boilerplate code for the Angular frontend (login/registration and video catalog components, routing, and auth services) and FastAPI backend endpoints (Argon2id/JWT authentication and catalog routers). All architectural decisions, integration, and final implementations were reviewed and adapted by the team.