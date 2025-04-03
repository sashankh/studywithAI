#!/usr/bin/env pwsh
# Azure deployment script for Chat MCQ App

# Read configuration files
$backendConfig = Get-Content -Path "./backend/azure-deploy.json" | ConvertFrom-Json
$frontendConfig = Get-Content -Path "./frontend/azure-deploy.json" | ConvertFrom-Json

Write-Host "=== Starting Azure Deployment ==="
Write-Host "This script will deploy the Chat MCQ app to Azure."

# Login to Azure
Write-Host "Logging in to Azure..."
az login

# Set variables from config
$resourceGroup = $backendConfig.resourceGroup
$location = "eastus"  # Default if not specified
$webAppName = $backendConfig.webAppName
$appServicePlan = $backendConfig.appServicePlan
$registry = $backendConfig.containerRegistry

# Create resource group if it doesn't exist
Write-Host "Creating resource group if it doesn't exist..."
az group create --name $resourceGroup --location $location

# Create container registry if it doesn't exist
Write-Host "Creating container registry if it doesn't exist..."
az acr create --name $registry --resource-group $resourceGroup --sku Basic --admin-enabled true

# Build and push backend Docker image
Write-Host "Building and pushing Docker image for backend..."
cd backend
docker build -t "$registry.azurecr.io/$($backendConfig.dockerImageName)" .

# Get ACR credentials
$acrCredentials = az acr credential show --name $registry | ConvertFrom-Json
$username = $acrCredentials.username
$password = $acrCredentials.passwords[0].value

# Login to ACR
Write-Host "Logging in to container registry..."
docker login "$registry.azurecr.io" -u $username -p $password

# Push the image
Write-Host "Pushing Docker image to registry..."
docker push "$registry.azurecr.io/$($backendConfig.dockerImageName)"

# Create App Service Plan if it doesn't exist
Write-Host "Creating App Service Plan if it doesn't exist..."
az appservice plan create --name $appServicePlan --resource-group $resourceGroup --sku B1 --is-linux --location $location

# Create Web App if it doesn't exist
Write-Host "Creating Web App if it doesn't exist..."
$webAppExists = $(az webapp list --resource-group $resourceGroup --query "[?name=='$webAppName'].name" -o tsv)

if ($webAppExists) {
    Write-Host "Web app $webAppName already exists. Updating..."
} else {
    Write-Host "Creating new web app $webAppName..."
    az webapp create --resource-group $resourceGroup --plan $appServicePlan --name $webAppName --deployment-container-image-name "$registry.azurecr.io/$($backendConfig.dockerImageName)"
}

# Configure environment variables for web app
Write-Host "Configuring Web App environment variables..."
az webapp config appsettings set --resource-group $resourceGroup --name $webAppName `
  --settings AZURE_OPENAI_API_KEY="$env:AZURE_OPENAI_API_KEY" `
  AZURE_OPENAI_API_BASE="$env:AZURE_OPENAI_API_BASE" `
  AZURE_OPENAI_API_VERSION="$env:AZURE_OPENAI_API_VERSION" `
  AZURE_OPENAI_DEPLOYMENT_NAME="$env:AZURE_OPENAI_DEPLOYMENT_NAME" `
  WEBSITES_PORT="8000"

# Update Web App with the latest image
Write-Host "Updating Web App with latest image..."
az webapp config container set --name $webAppName --resource-group $resourceGroup `
  --docker-custom-image-name "$registry.azurecr.io/$($backendConfig.dockerImageName)" `
  --docker-registry-server-url "https://$registry.azurecr.io" `
  --docker-registry-server-user $username `
  --docker-registry-server-password $password

# Deploy the frontend to Azure Static Web App
cd ../frontend
Write-Host "Building frontend for production..."
npm install
npm run build

$staticWebAppName = $frontendConfig.staticWebAppName

# Check if static web app exists
$staticAppExists = $(az staticwebapp list --resource-group $resourceGroup --query "[?name=='$staticWebAppName'].name" -o tsv)

if ($staticAppExists) {
    Write-Host "Static Web App $staticWebAppName already exists."
    # For existing apps, you need to deploy through GitHub Actions or the az staticwebapp cli
    Write-Host "For existing Static Web Apps, deployment is typically done via GitHub Actions."
    Write-Host "Manual deployment can be done via the Azure Portal or the az staticwebapp cli."
} else {
    Write-Host "Creating new Static Web App $staticWebAppName..."
    # This creates a new Static Web App linked to GitHub
    # Note: For first-time deployment, it's often easier to use the Azure Portal
    az staticwebapp create --name $staticWebAppName --resource-group $resourceGroup `
      --location $frontendConfig.location `
      --source . --output-location $frontendConfig.outputLocation `
      --branch main
}

# Configure environment variables for Static Web App
Write-Host "Configuring Static Web App environment variables..."
az staticwebapp appsettings set --name $staticWebAppName --resource-group $resourceGroup `
  --setting-names VITE_API_URL="https://$webAppName.azurewebsites.net/api"

Write-Host "=== Azure Deployment Complete ==="
Write-Host "Backend URL: https://$webAppName.azurewebsites.net"
Write-Host "Note: Frontend URL will be available in the Azure Portal under the Static Web App resource."