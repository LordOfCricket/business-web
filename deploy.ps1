<#
.SYNOPSIS
  Deploy business-web directly to GCP Cloud Run from local machine.
.DESCRIPTION
  Builds the production Docker image, pushes to Artifact Registry, and deploys to Cloud Run.
  Prerequisites: gcloud CLI authenticated and Docker running.
#>

[CmdletBinding()]
param(
  [string]$ProjectId = "test-sports-509906",
  [string]$Region = "asia-south2",
  [string]$GarRepo = "newsports",
  [string]$ServiceName = "business-web",
  [string]$ServiceAccount = "981116867868-compute@developer.gserviceaccount.com",
  [switch]$SkipChecks = $false
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Deploying $ServiceName to GCP Cloud Run" -ForegroundColor Cyan
Write-Host " Project: $ProjectId | Region: $Region" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

if (-not $SkipChecks) {
  Write-Host "`n[1/5] Running local verification (lint, typecheck, tests)..." -ForegroundColor Yellow
  $env:PATH = "C:\Users\ASUS\AppData\Local\nvm\v24.19.0;" + $env:PATH
  npm run lint
  npm run typecheck
  npm test
}

Write-Host "`n[2/5] Configuring GCP project and Docker auth..." -ForegroundColor Yellow
gcloud config set project $ProjectId --quiet
gcloud config set run/region $Region --quiet
gcloud auth configure-docker "$Region-docker.pkg.dev" --quiet

$ImageTag = "$Region-docker.pkg.dev/$ProjectId/$GarRepo/${ServiceName}:latest"

Write-Host "`n[3/5] Building and pushing Docker container ($ImageTag)..." -ForegroundColor Yellow
docker build -t $ImageTag .
docker push $ImageTag

Write-Host "`n[4/5] Discovering Gateway URL..." -ForegroundColor Yellow
$GatewayUrl = (gcloud run services list --project=$ProjectId --region=$Region --filter="metadata.name:gateway" --format="value(status.url)")
if (-not $GatewayUrl) {
  $GatewayUrl = "https://gateway-981116867868.$Region.run.app"
}
Write-Host "  Found Gateway URL: $GatewayUrl" -ForegroundColor Green

$SelfUrl = (gcloud run services list --project=$ProjectId --region=$Region --filter="metadata.name:$ServiceName" --format="value(status.url)")
if (-not $SelfUrl) {
  $SelfUrl = "https://$ServiceName-981116867868.$Region.run.app"
}
Write-Host "  Service URL target: $SelfUrl" -ForegroundColor Green

$CustomerUrl = (gcloud run services list --project=$ProjectId --region=$Region --filter="metadata.name:customer-web" --format="value(status.url)")
if (-not $CustomerUrl) {
  $CustomerUrl = "https://customer-web-981116867868.$Region.run.app"
}

$AdminUrl = (gcloud run services list --project=$ProjectId --region=$Region --filter="metadata.name:admin-web" --format="value(status.url)")
if (-not $AdminUrl) {
  $AdminUrl = "https://admin-web-981116867868.$Region.run.app"
}

$LaunchedSports = "cricket,karate"

$EnvVars = "^|^GATEWAY_URL=$GatewayUrl|GATEWAY_IAM_AUDIENCE=$GatewayUrl|NEXT_PUBLIC_SITE_URL=$SelfUrl|CUSTOMER_SITE_URL=$CustomerUrl|ADMIN_SITE_URL=$AdminUrl|LAUNCHED_SPORTS=$LaunchedSports|FRONTEND_PROXY_KEY=local-frontend-proxy-key"

Write-Host "`n[5/5] Deploying $ServiceName to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $ServiceName `
  --project=$ProjectId `
  --image=$ImageTag `
  --region=$Region `
  --platform=managed `
  --service-account=$ServiceAccount `
  --allow-unauthenticated `
  --port=3000 `
  --memory=512Mi `
  --cpu=1 `
  --min-instances=0 `
  --max-instances=3 `
  --timeout=60s `
  --cpu-boost `
  --set-env-vars=$EnvVars `
  --quiet

$LiveUrl = (gcloud run services list --project=$ProjectId --region=$Region --filter="metadata.name:$ServiceName" --format="value(status.url)")
Write-Host "`n Deployment complete!" -ForegroundColor Green
Write-Host " Service URL: $LiveUrl" -ForegroundColor Cyan
Write-Host " Health check: $LiveUrl/api/health" -ForegroundColor Cyan
