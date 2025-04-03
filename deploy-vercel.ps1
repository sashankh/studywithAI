#!/usr/bin/env pwsh
# Vercel deployment script for Chat MCQ App

# Read configuration files
$backendConfig = Get-Content -Path "./backend/vercel-deploy.json" | ConvertFrom-Json
$frontendConfig = Get-Content -Path "./frontend/vercel-deploy.json" | ConvertFrom-Json

Write-Host "=== Starting Vercel Deployment ==="
Write-Host "This script will deploy the Chat MCQ app to Vercel."

# Check if Vercel CLI is installed
$vercelInstalled = $null
try {
    $vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
} catch {}

if (-not $vercelInstalled) {
    Write-Host "Vercel CLI is not installed. Installing..."
    npm install -g vercel
}

# Login to Vercel (if not already logged in)
Write-Host "Checking Vercel login status..."
$vercelLoginStatus = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Logging in to Vercel..."
    vercel login
}

# Deploy the backend
Write-Host "Deploying backend to Vercel..."
cd backend

# Set environment variables
foreach ($key in $backendConfig.env.PSObject.Properties.Name) {
    $value = $backendConfig.env.$key
    Write-Host "Setting environment variable: $key"
    vercel env add $key production $value
}

# Deploy the backend
Write-Host "Executing backend deployment..."
$backendDeployment = vercel --prod

if ($LASTEXITCODE -eq 0) {
    $backendUrl = ($backendDeployment | Select-String -Pattern "https://.+\.vercel\.app").Matches.Value
    Write-Host "Backend deployed successfully to: $backendUrl"
} else {
    Write-Host "Backend deployment failed. Please check the logs above for errors."
    exit 1
}

# Deploy the frontend
Write-Host "Deploying frontend to Vercel..."
cd ../frontend

# Update the API URL in the environment variables
$frontendConfig.env.VITE_API_URL = "$backendUrl/api"

# Set frontend environment variables
foreach ($key in $frontendConfig.env.PSObject.Properties.Name) {
    $value = $frontendConfig.env.$key
    Write-Host "Setting environment variable: $key = $value"
    vercel env add $key production $value
}

# Deploy the frontend
Write-Host "Executing frontend deployment..."
$frontendDeployment = vercel --prod

if ($LASTEXITCODE -eq 0) {
    $frontendUrl = ($frontendDeployment | Select-String -Pattern "https://.+\.vercel\.app").Matches.Value
    Write-Host "Frontend deployed successfully to: $frontendUrl"
} else {
    Write-Host "Frontend deployment failed. Please check the logs above for errors."
    exit 1
}

Write-Host "=== Vercel Deployment Complete ==="
Write-Host "Backend URL: $backendUrl"
Write-Host "Frontend URL: $frontendUrl"
Write-Host "Your Chat MCQ app is now live on Vercel!"