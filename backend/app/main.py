from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth import router as auth_router
from app.routes.simple_progress import router as progress_router
from app.routes.quiz import router as quiz_router
from app.routes.ai import router as ai_router
from app.routes.blockchain import router as blockchain_router
from app.routes.coding_challenge import router as coding_challenge_router

app = FastAPI(title="Signum Learning Platform API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(progress_router, prefix="/progress", tags=["Progress"])
app.include_router(quiz_router, prefix="/api", tags=["Quiz Management"])
app.include_router(ai_router, prefix="/ai", tags=["AI Assistant"])
app.include_router(blockchain_router, prefix="/blockchain", tags=["Blockchain & NFT"])
app.include_router(coding_challenge_router, tags=["Coding Challenge"])

@app.get("/")
async def root():
    return {"message": "Signum Learning Platform API", "status": "running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "signum-api", "uptime": "running"}
