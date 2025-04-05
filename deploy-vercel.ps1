#!/usr/bin/env pwsh
# Vercel deployment script for StudyBuddy App

# Function to ensure we're in the root directory of the project
function Ensure-RootDirectory {
    # Check if we're in the root directory by looking for key files/folders
    if (-not ((Test-Path "./frontend") -and (Test-Path "./backend"))) {
        # We might be in a subdirectory, try to navigate up
        if (Test-Path "../frontend" -and Test-Path "../backend") {
            Write-Host "Running script from subdirectory. Navigating to project root..." -ForegroundColor Yellow
            Set-Location ..
            return $true
        } else {
            Write-Host "Error: Could not locate project root directory. Please run this script from the project root or a direct subdirectory." -ForegroundColor Red
            return $false
        }
    }
    return $true
}

# Ensure we're in the root directory before proceeding
if (-not (Ensure-RootDirectory)) {
    exit 1
}

Write-Host "=== Starting Vercel Deployment ===" -ForegroundColor Green
Write-Host "This script will deploy the StudyBuddy app to Vercel."

# Check if configuration files exist
if (-not (Test-Path "./backend/vercel.json")) {
    Write-Host "Error: Backend vercel.json not found. Please ensure it exists before deployment." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "./backend/vercel-deploy.json")) {
    Write-Host "Error: Backend vercel-deploy.json not found. Please ensure it exists before deployment." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "./frontend/package.json")) {
    Write-Host "Error: Frontend package.json not found. Please ensure it exists before deployment." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "./frontend/vercel-deploy.json")) {
    Write-Host "Error: Frontend vercel-deploy.json not found. Please ensure it exists before deployment." -ForegroundColor Red
    exit 1
}

# Read configuration files
try {
    $backendConfig = Get-Content -Path "./backend/vercel-deploy.json" -ErrorAction Stop | ConvertFrom-Json
    $frontendConfig = Get-Content -Path "./frontend/vercel-deploy.json" -ErrorAction Stop | ConvertFrom-Json
    Write-Host "Configuration files loaded successfully." -ForegroundColor Green
} 
catch {
    Write-Host "Error reading configuration files: $_" -ForegroundColor Red
    exit 1
}

# Check if Vercel CLI is installed
$vercelInstalled = $null
try {
    $vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
} catch {}

if (-not $vercelInstalled) {
    Write-Host "Vercel CLI is not installed. Installing..."
    npm install -g vercel
    
    # Verify installation was successful
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install Vercel CLI. Please install it manually with 'npm install -g vercel'." -ForegroundColor Red
        exit 1
    }
    Write-Host "Vercel CLI installed successfully." -ForegroundColor Green
}

# Login to Vercel (if not already logged in)
Write-Host "Checking Vercel login status..."
$vercelLoginStatus = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Logging in to Vercel..."
    vercel login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to login to Vercel. Please try again." -ForegroundColor Red
        exit 1
    }
    Write-Host "Successfully logged in to Vercel." -ForegroundColor Green
}

# Deploy the backend
Write-Host "Deploying backend to Vercel..." -ForegroundColor Cyan
Set-Location -Path "./backend"

# Validate project name from config
$projectName = $backendConfig.projectName
if (-not $projectName) {
    $projectName = "studybuddy-backend"
}

# Sanitize project name to meet Vercel requirements
$projectName = $projectName.ToLower() -replace '[^a-z0-9\._-]', '' -replace '---', '--'
Write-Host "Using project name: $projectName" -ForegroundColor Cyan

# Set environment variables from vercel-deploy.json
Write-Host "Setting up backend environment variables..."
if ($backendConfig.env) {
    foreach ($prop in $backendConfig.env.PSObject.Properties) {
        $key = $prop.Name
        $value = $prop.Value
        Write-Host "  Setting $key"
        # Check if the environment variable already exists
        $envExists = vercel env ls | Select-String -Pattern "^$key" -Quiet
        if ($envExists) {
            Write-Host "    Variable $key already exists, skipping..." -ForegroundColor Yellow
        } else {
            # Use echo to pipe the value to vercel env add command
            $value | vercel env add $key production
        }
    }
}

# Deploy the backend with validated project name
Write-Host "Executing backend deployment..."
# Use --cwd . to ensure we're deploying the current directory, not the env subdirectory
$backendDeployOutput = vercel --cwd . --prod --name $projectName
$backendDeployment = $backendDeployOutput -join "`n"

if ($LASTEXITCODE -eq 0) {
    $backendUrl = [regex]::Match($backendDeployment, "https://[^\s]+\.vercel\.app").Value
    if ([string]::IsNullOrEmpty($backendUrl)) {
        Write-Host "Warning: Could not extract backend URL from deployment output." -ForegroundColor Yellow
        $backendUrl = Read-Host "Please enter the deployed backend URL"
    }
    Write-Host "Backend deployed successfully to: $backendUrl" -ForegroundColor Green
} else {
    Write-Host "Backend deployment failed. Please check the logs above for errors." -ForegroundColor Red
    exit 1
}

# After backend deployment, update vite.config.ts with the backend URL
Write-Host "Updating vite.config.ts with backend URL..." -ForegroundColor Cyan
$viteConfigPath = "../frontend/vite.config.ts"

if (Test-Path $viteConfigPath) {
    (Get-Content $viteConfigPath) -replace 'http://localhost:9000', '$backendUrl' | Set-Content $viteConfigPath
    Write-Host "vite.config.ts updated successfully with backend URL: $backendUrl" -ForegroundColor Green
} else {
    Write-Host "vite.config.ts not found at $viteConfigPath. Skipping update." -ForegroundColor Yellow
}

# Deploy the frontend
Write-Host "`nDeploying frontend to Vercel..." -ForegroundColor Cyan
Set-Location -Path "../frontend"

# Create or update .env file with API URL
$envContent = "VITE_API_URL=$backendUrl/api"
Set-Content -Path ".env" -Value $envContent
Write-Host "Created .env file with API URL: $backendUrl/api"

# Validate project name from config
$projectName = $frontendConfig.projectName
if (-not $projectName) {
    $projectName = "studybuddy"
}

# Sanitize project name to meet Vercel requirements
$projectName = $projectName.ToLower() -replace '[^a-z0-9\._-]', '' -replace '---', '--'
Write-Host "Using project name: $projectName" -ForegroundColor Cyan

# Set frontend environment variables
Write-Host "Setting up frontend environment variables..."
if ($frontendConfig.env) {
    foreach ($prop in $frontendConfig.env.PSObject.Properties) {
        $key = $prop.Name
        # If we're setting the API URL, use the one from the backend
        if ($key -eq "VITE_API_URL") {
            $value = "$backendUrl/api"
        } else {
            $value = $prop.Value
        }
        Write-Host "  Setting $key"
        # Check if the environment variable already exists
        $envExists = vercel env ls | Select-String -Pattern "^$key" -Quiet
        if ($envExists) {
            Write-Host "    Variable $key already exists, skipping..." -ForegroundColor Yellow
        } else {
            # Use echo to pipe the value to vercel env add command
            $value | vercel env add $key production
        }
    }
}

# Build the frontend
Write-Host "Building frontend..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install frontend dependencies. Please check for errors." -ForegroundColor Red
    exit 1
}

npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build frontend. Please check for errors." -ForegroundColor Red
    exit 1
}

# Deploy the frontend with validated project name
Write-Host "Executing frontend deployment..."
# Use --cwd . to ensure we're deploying the current directory, not the env subdirectory
$frontendDeployOutput = vercel --cwd . --prod --name $projectName
$frontendDeployment = $frontendDeployOutput -join "`n"

if ($LASTEXITCODE -eq 0) {
    $frontendUrl = [regex]::Match($frontendDeployment, "https://[^\s]+\.vercel\.app").Value
    if ([string]::IsNullOrEmpty($frontendUrl)) {
        Write-Host "Warning: Could not extract frontend URL from deployment output." -ForegroundColor Yellow
        $frontendUrl = Read-Host "Please enter the deployed frontend URL"
    }
    Write-Host "Frontend deployed successfully to: $frontendUrl" -ForegroundColor Green
} else {
    Write-Host "Frontend deployment failed. Please check the logs above for errors." -ForegroundColor Red
    exit 1
}

# Return to root directory
Set-Location -Path ".."

Write-Host "`n=== Vercel Deployment Complete ===" -ForegroundColor Green
Write-Host "Backend URL: $backendUrl" -ForegroundColor Cyan
Write-Host "Frontend URL: $frontendUrl" -ForegroundColor Cyan
Write-Host "Your StudyBuddy app is now live on Vercel!" -ForegroundColor Green

# Optional: Try accessing the deployed app to verify it's working
try {
    Write-Host "`nVerifying deployment..."
    $null = Invoke-WebRequest -Uri $frontendUrl -Method Head -TimeoutSec 10
    Write-Host "Frontend is accessible ✓" -ForegroundColor Green
    
    $null = Invoke-WebRequest -Uri "$backendUrl/api" -Method Head -TimeoutSec 10
    Write-Host "Backend API is accessible ✓" -ForegroundColor Green
}
catch {
    Write-Host "Note: Could not verify deployment. This doesn't mean deployment failed - your app might just need a few minutes to finish initializing." -ForegroundColor Yellow
}