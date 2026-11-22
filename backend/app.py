from fastapi import FastAPI

app = FastAPI(title="FastAPI Test", version="1.0.0")

@app.get("/")

async def hello_world():
    return {"message": "Hello, World!"}