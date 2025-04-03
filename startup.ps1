# PowerShell script to start the Chat MCQ Application
Write-Host "Starting Chat MCQ Application..." -ForegroundColor Cyan

# Ensure script is run as administrator for Node.js installation
function Test-Admin {
    $currentUser = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    return $currentUser.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Function to check if a command exists
function Test-CommandExists {
    param ($command)
    $exists = $false
    try {
        if (Get-Command $command -ErrorAction Stop) {
            $exists = $true
        }
    } catch {}
    return $exists
}

# Function to install Node.js using winget
function Install-NodeJS {
    Write-Host "`nAttempting to install Node.js automatically..." -ForegroundColor Cyan
    
    # Check if winget is available
    $wingetAvailable = Test-CommandExists winget
    if (-not $wingetAvailable) {
        Write-Host "Error: Could not find winget package manager." -ForegroundColor Red
        Write-Host "Please install Node.js manually from https://nodejs.org/" -ForegroundColor Yellow
        return $false
    }
    
    # Check if running as admin
    if (-not (Test-Admin)) {
        Write-Host "Administrator privileges are required to install Node.js." -ForegroundColor Yellow
        Write-Host "Please run this script as an Administrator." -ForegroundColor Yellow
        return $false
    }
    
    Write-Host "Installing Node.js using winget..." -ForegroundColor Cyan
    try {
        # Install Node.js LTS
        winget install -e --id OpenJS.NodeJS.LTS
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Error: Failed to install Node.js." -ForegroundColor Red
            return $false
        }
        
        Write-Host "Node.js installed successfully!" -ForegroundColor Green
        Write-Host "You may need to restart your PowerShell window to use Node.js." -ForegroundColor Yellow
        
        $restartChoice = Read-Host "Do you want to restart this script now to continue installation? (y/n)"
        if ($restartChoice -eq "y") {
            # Restart the script
            Write-Host "Restarting script..." -ForegroundColor Cyan
            Start-Process powershell.exe -ArgumentList "-File `"$PSCommandPath`"" -Verb RunAs
            exit 0
        }
        return $false
    }
    catch {
        Write-Host "Error: Failed to install Node.js: $_" -ForegroundColor Red
        return $false
    }
}

# Check for Python
if (-not (Test-CommandExists python)) {
    Write-Host "Error: Python is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Python from https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host "Make sure to check 'Add Python to PATH' during installation." -ForegroundColor Yellow
    exit 1
}

# Check Python version
$pythonVersion = python --version
Write-Host "Found $pythonVersion" -ForegroundColor Green

# Check for Node.js
$nodeInstalled = Test-CommandExists node
if (-not $nodeInstalled) {
    Write-Host "`nWarning: Node.js was not detected in your PATH." -ForegroundColor Yellow
    Write-Host "`nYou have three options:"
    Write-Host "1. Let this script attempt to install Node.js automatically"
    Write-Host "2. Install Node.js manually from https://nodejs.org/"
    Write-Host "   (Make sure to check the option to add it to your PATH)"
    Write-Host "3. Continue with backend-only mode (you won't be able to run the frontend)"
    
    $nodeChoice = Read-Host "`nWhat would you like to do? (1/2/3)"
    
    switch ($nodeChoice) {
        "1" {
            $success = Install-NodeJS
            if (-not $success) {
                $backendOnlyChoice = Read-Host "`nDo you want to continue with backend-only mode? (y/n)"
                if ($backendOnlyChoice -ne "y") {
                    exit 1
                }
                $nodeInstalled = $false
                Write-Host "`nContinuing with backend-only mode..." -ForegroundColor Cyan
            }
            else {
                # Try to detect Node.js again after installation
                $nodeInstalled = Test-CommandExists node
                if ($nodeInstalled) {
                    $nodeVersion = node --version
                    Write-Host "Found Node.js $nodeVersion" -ForegroundColor Green
                }
            }
        }
        "2" {
            Write-Host "Please install Node.js and then run this script again." -ForegroundColor Yellow
            exit 1
        }
        "3" {
            Write-Host "`nContinuing with backend-only mode..." -ForegroundColor Cyan
            $nodeInstalled = $false
        }
        default {
            Write-Host "Invalid choice, exiting." -ForegroundColor Red
            exit 1
        }
    }
} else {
    $nodeVersion = node --version
    Write-Host "Found Node.js $nodeVersion" -ForegroundColor Green
    
    # Check for npm
    if (-not (Test-CommandExists npm)) {
        Write-Host "Warning: npm was not found. It should come with Node.js." -ForegroundColor Yellow
        Write-Host "You may need to reinstall Node.js." -ForegroundColor Yellow
        $backendOnly = $true
    } else {
        $npmVersion = npm --version
        Write-Host "Found npm $npmVersion" -ForegroundColor Green
    }
}

# Setup backend
Write-Host "`nSetting up backend..." -ForegroundColor Cyan
Set-Location -Path ".\backend"

# Create virtual environment if it doesn't exist
if (-not (Test-Path -Path ".\venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Cyan
    python -m venv venv

    if (-not (Test-Path -Path ".\venv")) {
        Write-Host "Error: Failed to create virtual environment." -ForegroundColor Red
        exit 1
    }
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
if ($PSVersionTable.PSVersion.Major -ge 6) {
    # PowerShell Core
    if ($IsWindows) {
        .\venv\Scripts\Activate.ps1
    } else {
        # For Linux/MacOS
        .\venv\bin\Activate.ps1
    }
} else {
    # Windows PowerShell
    .\venv\Scripts\Activate.ps1
}

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
pip install -r requirements.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to install backend dependencies." -ForegroundColor Red
    exit 1
}

# Start backend server
Write-Host "Starting backend server..." -ForegroundColor Green

# Create or clear logs directory
if (-not (Test-Path -Path ".\logs")) {
    New-Item -ItemType Directory -Path ".\logs" -Force | Out-Null
} else {
    # Clear existing log files
    Remove-Item -Path ".\logs\*" -Force -ErrorAction SilentlyContinue
}

# Start the backend server in a separate window so logs are visible
$backendWindow = Start-Process cmd -ArgumentList "/k", "cd /d `"$PWD`" && .\venv\Scripts\python -m uvicorn main:app --reload" -PassThru

Write-Host "Backend server starting at http://localhost:8000" -ForegroundColor Green
Write-Host "Log files will be written to ./logs/app.log" -ForegroundColor Cyan

# Check if we're in backend-only mode
if (-not $nodeInstalled) {
    Write-Host "`nBackend is now running at http://localhost:8000" -ForegroundColor Green
    Write-Host "`nTo run the frontend later, you'll need to:" -ForegroundColor Yellow
    Write-Host "1. Install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "2. Open a PowerShell prompt in the frontend directory" -ForegroundColor Yellow
    Write-Host "3. Run: npm install" -ForegroundColor Yellow
    Write-Host "4. Run: npm run dev" -ForegroundColor Yellow
    
    Write-Host "`nPress Ctrl+C to stop the backend server when finished." -ForegroundColor Yellow
    
    try {
        # Keep the script running until Ctrl+C or backend window is closed
        while ($true) {
            Start-Sleep -Seconds 1
            if ($backendWindow.HasExited) {
                Write-Host "Backend server has stopped." -ForegroundColor Red
                break
            }
        }
    } finally {
        # Clean up when exiting
        if (-not $backendWindow.HasExited) {
            Stop-Process -Id $backendWindow.Id -Force -ErrorAction SilentlyContinue
        }
    }
    
    exit 0
}

# Setup frontend
Write-Host "`nSetting up frontend..." -ForegroundColor Cyan
Set-Location -Path "..\frontend"

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to install frontend dependencies." -ForegroundColor Red
    exit 1
}

# Start frontend development server in a new window
$frontendWindow = Start-Process cmd -ArgumentList "/k", "cd /d `"$PWD`" && npm run dev" -PassThru

Set-Location -Path ".."

Write-Host "`nChat MCQ Application is now starting:" -ForegroundColor Green
Write-Host "- Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "- Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "`nNote: It may take a moment for both servers to fully start." -ForegroundColor Yellow

Write-Host "`nPress Ctrl+C to stop all servers when finished." -ForegroundColor Yellow

try {
    # Keep the script running until Ctrl+C or either window is closed
    while ($true) {
        Start-Sleep -Seconds 1
        
        # Check if windows are still running
        if ($backendWindow.HasExited -and $frontendWindow.HasExited) {
            Write-Host "Both servers have stopped." -ForegroundColor Red
            break
        }
    }
} finally {
    # Clean up when exiting
    if (-not $backendWindow.HasExited) {
        Stop-Process -Id $backendWindow.Id -Force -ErrorAction SilentlyContinue
    }
    
    if (-not $frontendWindow.HasExited) {
        Stop-Process -Id $frontendWindow.Id -Force -ErrorAction SilentlyContinue
    }
}