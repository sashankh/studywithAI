from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.cors import CORSMiddleware as StarletteCORSMiddleware
from fastapi.responses import JSONResponse
import logging
import traceback
from app.api import chat, mcq
import uvicorn
import os
from pathlib import Path

# Determine logs directory: use /tmp/logs if it exists, otherwise use logs
tmp_logs_dir = Path("/tmp/logs")
if tmp_logs_dir.exists() or Path("/tmp").exists():
    logs_dir = tmp_logs_dir
else:
    # Fall back to logs directory in the current path
    logs_dir = Path("logs")
    
# Create logs directory if it doesn't exist
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

# Remove any existing CORS middleware first (to avoid duplicates)
try:
    app.middleware_stack.middlewares = [
        m for m in app.middleware_stack.middlewares 
        if not isinstance(m, StarletteCORSMiddleware)
    ]
    logger.info("Removed existing CORS middleware")
except Exception as e:
    logger.warning(f"Could not remove existing CORS middleware: {str(e)}")

# Add CORS middleware with proper configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",  # Allow all origins 
        "http://localhost:5173",  # Explicitly allow local frontend development server
        "http://127.0.0.1:5173"   # Also allow access via IP address
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
logger.info("Added CORS middleware with wildcard origin and localhost development server")

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

# Add OPTIONS route handler for CORS preflight requests
@app.options("/{rest_of_path:path}")
async def options_route(rest_of_path: str):
    return {}  # Return empty response with 200 OK

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