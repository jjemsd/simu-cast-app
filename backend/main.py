import logging
import os
import traceback

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from database import init_db
from routers import ai, cleaning, modeling, normality, simulation, stats, upload

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s - %(message)s")
logger = logging.getLogger("simucast")

# Comma-separated list in env; defaults to the local Vite dev server.
CORS_ORIGINS = [o.strip() for o in os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]

app = FastAPI(title="SimuCast API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # Log the full traceback server-side, return a clean JSON body to the client.
    logger.error("Unhandled error on %s %s\n%s", request.method, request.url.path, traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc)},
    )


app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(cleaning.router, prefix="/api/cleaning", tags=["Cleaning"])
app.include_router(stats.router, prefix="/api/stats", tags=["Statistics"])
app.include_router(normality.router, prefix="/api/normality", tags=["Normality"])
app.include_router(modeling.router, prefix="/api/modeling", tags=["Modeling"])
app.include_router(simulation.router, prefix="/api/simulation", tags=["Simulation"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])


@app.get("/")
def root():
    return {"message": "SimuCast API is running"}
