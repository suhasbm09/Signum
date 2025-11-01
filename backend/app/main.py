from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# New domain-based routers
from app.domains.auth.routes import router as auth_router
from app.domains.progress.routes import router as progress_router
from app.domains.assessment.routes import router as assessment_router
from app.domains.certification.routes import router as certification_router
from app.domains.ai.routes import router as ai_router

app = FastAPI(title="Signum Learning Platform API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# New optimized route structure
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(progress_router, prefix="/progress", tags=["Progress"])
app.include_router(assessment_router, prefix="/assessment", tags=["Assessment"])
app.include_router(certification_router, prefix="/certification", tags=["Certification"])
app.include_router(ai_router, prefix="/ai", tags=["AI Assistant"])

@app.get("/")
async def root():
    return {
        "message": "Signum Learning Platform API v2.0",
        "status": "running",
        "version": "2.0.0",
        "architecture": "Domain-Driven Design",
        "endpoints": {
            "auth": "/auth",
            "progress": "/progress",
            "assessment": "/assessment",
            "certification": "/certification",
            "ai": "/ai"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "signum-api", "version": "2.0.0"}
