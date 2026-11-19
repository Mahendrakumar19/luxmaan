# AI Job Agent Platform - All-in-One Container Runner (Windows PowerShell)
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Building & Running AI Job Agent in a Single Container" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

# Check if Docker is running
try {
    docker info > $null 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Docker daemon is not responding. Please make sure Docker Desktop is started." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Docker CLI not found in PATH. Please install or launch Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host "`n[1/2] Building All-in-One Docker Image..." -ForegroundColor Yellow
docker build -t nilam-jobagent:latest .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker build failed." -ForegroundColor Red
    exit 1
}

Write-Host "`n[2/2] Running All-in-One Container..." -ForegroundColor Yellow
# Stop existing container if running
docker rm -f nilam_all_in_one 2>$null

docker run -d `
    --name nilam_all_in_one `
    -p 80:80 `
    -p 3000:3000 `
    -p 5000:5000 `
    -p 8000:8000 `
    -p 5432:5432 `
    -p 6379:6379 `
    -v nilam_pgdata:/var/lib/postgresql `
    -v nilam_redisdata:/var/lib/redis `
    nilam-jobagent:latest

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " Container started successfully! Everything is running." -ForegroundColor Green
Write-Host " - Frontend UI:              http://localhost:3000" -ForegroundColor Cyan
Write-Host " - Unified Gateway (Nginx):  http://localhost" -ForegroundColor Cyan
Write-Host " - Backend REST API:         http://localhost:5000/api/v1" -ForegroundColor Cyan
Write-Host " - AI Microservice:          http://localhost:8000/health" -ForegroundColor Cyan
Write-Host " - View logs:                docker logs -f nilam_all_in_one" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Green
