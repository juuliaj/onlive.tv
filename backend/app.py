from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import admin, auth, content

app = FastAPI(
    title="Onlive.tv API",
    description="Distributed Video Streaming Platform Backend (Prototype)",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(content.router)
app.include_router(admin.router)


@app.get("/")
async def hello_world():
    return {"message": "Hello, World!"}


@app.get("/health", tags=["Health"])
def health_check() -> dict[str, str]:
    """Returns basic service health status."""
    return {"status": "ok"}