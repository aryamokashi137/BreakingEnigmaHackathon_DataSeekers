from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import connect_db, close_db
from routes import cases, ai
import os


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="Legal Workflow Assistant",
    description="AI-powered assistant for lawyers — case management, research, drafting, and more.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(cases.router)
app.include_router(ai.router)

# Serve frontend static files
frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend")
if os.path.exists(frontend_path):
    app.mount("/static", StaticFiles(directory=frontend_path, html=True), name="frontend")


@app.get("/")
async def root():
    return {"message": "Legal Workflow Assistant API", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
