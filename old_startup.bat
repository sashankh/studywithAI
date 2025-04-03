@echo off
echo Starting Chat MCQ Application...

REM Check for Python
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: Python is not installed or not in PATH.
    echo Please install Python from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation.
    exit /b 1
)

REM Check for Node.js with better detection
where node >nul 2>nul
SET NODE_INSTALLED=%ERRORLEVEL%
if %NODE_INSTALLED% neq 0 (
    echo.
    echo Warning: Node.js was not detected in your PATH.
    echo.
    echo You have two options:
    echo 1. Install Node.js from https://nodejs.org/
    echo    Make sure to check the option to add it to your PATH.
    echo.
    echo 2. Continue with backend-only mode (you won't be able to run the frontend)
    echo.
    set /p CONTINUE_CHOICE="Do you want to continue with backend-only mode? (y/n): "
    if /i "%CONTINUE_CHOICE%" neq "y" exit /b 1
    echo.
    echo Continuing with backend-only mode...
    echo.
)

echo Setting up backend...
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate
echo Installing backend dependencies...
pip install -r requirements.txt

echo Starting backend server...
start cmd /k "venv\Scripts\activate && uvicorn main:app --reload"

if %NODE_INSTALLED% neq 0 (
    echo.
    echo Backend is now running at http://localhost:8000
    echo.
    echo To run the frontend later, you'll need to:
    echo 1. Install Node.js from https://nodejs.org/
    echo 2. Open a command prompt in the frontend directory
    echo 3. Run: npm install
    echo 4. Run: npm run dev
    echo.
    cd ..
    exit /b 0
)

echo Setting up frontend...
cd ..\frontend
echo Installing frontend dependencies...
call npm install

echo Starting frontend development server...
start cmd /k "npm run dev"

echo.
echo Chat MCQ Application is now starting:
echo - Backend: http://localhost:8000
echo - Frontend: http://localhost:5173
echo.
echo Note: It may take a moment for both servers to fully start.
echo.

cd ..