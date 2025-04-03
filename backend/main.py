from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import traceback
from app.api import chat, mcq
import uvicorn
import os
from pathlib import Path

# Create logs directory if it doesn't exist
logs_dir = Path("/tmp/logs")
logs_dir.mkdir(exist_ok=True)

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(logs_dir / "app.log")
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI()

# Get frontend URL from environment or use default for local development
frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")

# Add CORS middleware to allow frontend requests from various environments
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        frontend_url, 
        "https://chat-mcq-frontend.azurestaticapps.net", 
        "https://chat-mcq-app.vercel.app",
        "https://chat-mcq-app-*.vercel.app",  # Allow Vercel preview deployments
        "http://localhost:5173"  # Explicitly add local frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler
@app.middleware("http")
async def global_exception_middleware(request: Request, call_next):
    try:
        logger.debug(f"Processing request: {request.method} {request.url.path}")
        response = await call_next(request)
        logger.debug(f"Response status code: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Unhandled exception: {str(e)}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"detail": f"Internal server error: {str(e)}"}
        )

# Include the routers
app.include_router(chat.router, prefix="/api")
app.include_router(mcq.router, prefix="/api")

@app.get("/")
def read_root():
    logger.info("Root endpoint accessed")
    return {"message": "Welcome to the Chat MCQ App!"}

# Health check endpoint for debugging
@app.get("/api/health")
def health_check():
    logger.info("Health check endpoint accessed")
    return {"status": "ok", "message": "Backend is running"}

# Run the server when the script is executed directly (for local development)
if __name__ == "__main__":
    logger.info("Starting the Chat MCQ App server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)