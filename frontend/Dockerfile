# Development image for the Angular app.
# Expects package.json / package-lock.json in this folder (created by `ng new`).
FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
EXPOSE 4200

# --poll makes file watching work on bind mounts under Docker Desktop (Windows/macOS)
CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--poll", "2000"]
