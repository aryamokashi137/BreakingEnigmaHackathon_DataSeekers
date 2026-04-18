from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time
import logging
from database import connect_db, close_db
from routes import cases, research
import os
from config import settings

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up Legal Workflow Agent...")
    await connect_db()
    # Note: We initialize Vector DB on first request to avoid blocking startup if API key is missing
    yield
    # Shutdown
    logger.info("Shutting down...")
    await close_db()

app = FastAPI(
    title="Legal Workflow Agent",
    description="Backend Service for Legal Research and Case Management",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Bonus: Logging Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"{request.method} {request.url.path} - Status: {response.status_code} - Time: {process_time:.4f}s")
    return response

# Bonus: Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global Exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"message": "An internal server error occurred.", "details": str(exc)},
    )

# Register routes
from routes import ai
app.include_router(cases.router, prefix="/api")
app.include_router(research.router, prefix="/api")
app.include_router(ai.router) # ai.router already has /api/ai prefix

@app.get("/")
async def root():
    return {"message": "Legal Workflow Agent API is running.", "docs": "/docs"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
