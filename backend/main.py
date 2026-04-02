from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import upload, cleaning, stats, normality, modeling, simulation, ai

app = FastAPI(title="SimuCast API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
