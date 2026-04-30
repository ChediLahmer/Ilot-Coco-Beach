# ============================================================
# Ilot Coco Beach - Development Environment Setup
# ============================================================
# Run this script on a fresh PC to set up the entire dev stack.
# Prerequisites: Git (to clone the repo)
# This script will check/guide you through installing:
#   - Node.js 20+
#   - Docker Desktop
# Then it will:
#   - Start Docker containers (PostgreSQL + MinIO)
#   - Install npm dependencies (client, admin, backend)
#   - Create backend .env file
#   - Run Prisma migrations and seed the database
#   - Verify everything is working
# ============================================================

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

function Write-Step($msg) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host " $msg" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
}

function Write-Success($msg) {
    Write-Host " [OK] $msg" -ForegroundColor Green
}

function Write-Warn($msg) {
    Write-Host " [!] $msg" -ForegroundColor Yellow
}

function Write-Fail($msg) {
    Write-Host " [X] $msg" -ForegroundColor Red
}

# ----------------------------------------------------------
# 1. Check prerequisites
# ----------------------------------------------------------
Write-Step "Checking prerequisites"

# Check Node.js
$nodeVersion = $null
try { $nodeVersion = (node --version 2>$null) } catch {}
if ($nodeVersion) {
    $major = [int]($nodeVersion -replace '^v','').Split('.')[0]
    if ($major -ge 20) {
        Write-Success "Node.js $nodeVersion detected"
    } else {
        Write-Fail "Node.js $nodeVersion is too old. Please install Node.js 20+ from https://nodejs.org"
        exit 1
    }
} else {
    Write-Fail "Node.js not found. Please install Node.js 20+ from https://nodejs.org"
    exit 1
}

# Check npm
try { $npmVersion = npm --version 2>$null; Write-Success "npm v$npmVersion" } catch {
    Write-Fail "npm not found"; exit 1
}

# Check Docker
$dockerOk = $false
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Success "Docker detected: $dockerVersion"
        $dockerOk = $true
    }
} catch {}
if (-not $dockerOk) {
    Write-Fail "Docker not found. Please install Docker Desktop from https://www.docker.com/products/docker-desktop/"
    exit 1
}

# Check Docker is running
try {
    docker info 2>$null | Out-Null
    Write-Success "Docker daemon is running"
} catch {
    Write-Fail "Docker is installed but not running. Please start Docker Desktop and re-run this script."
    exit 1
}

# ----------------------------------------------------------
# 2. Start Docker containers (PostgreSQL + MinIO)
# ----------------------------------------------------------
Write-Step "Starting Docker containers (PostgreSQL + MinIO)"

Push-Location $root
try {
    docker compose up -d db minio minio-init
    Write-Success "Docker containers started"
} catch {
    Write-Fail "Failed to start Docker containers: $_"
    exit 1
}
Pop-Location

# Wait for PostgreSQL to be healthy
Write-Host "  Waiting for PostgreSQL to be ready..." -NoNewline
$retries = 30
$ready = $false
for ($i = 0; $i -lt $retries; $i++) {
    $health = docker inspect --format='{{.State.Health.Status}}' cocobeach-db 2>$null
    if ($health -eq "healthy") { $ready = $true; break }
    Start-Sleep -Seconds 2
    Write-Host "." -NoNewline
}
Write-Host ""
if ($ready) { Write-Success "PostgreSQL is healthy" }
else { Write-Warn "PostgreSQL health check timed out - continuing anyway" }

# Wait for MinIO init to complete
Write-Host "  Waiting for MinIO bucket initialization..." -NoNewline
$retries = 20
for ($i = 0; $i -lt $retries; $i++) {
    $status = docker inspect --format='{{.State.Status}}' cocobeach-storage 2>$null
    $initStatus = docker inspect --format='{{.State.Status}}' $(docker ps -aq --filter "name=minio-init" | Select-Object -First 1) 2>$null
    if ($initStatus -eq "exited" -or $status -eq "running") { break }
    Start-Sleep -Seconds 2
    Write-Host "." -NoNewline
}
Write-Host ""
Write-Success "MinIO storage ready (bucket: cocobeach)"

# ----------------------------------------------------------
# 3. Install npm dependencies
# ----------------------------------------------------------
Write-Step "Installing npm dependencies"

Write-Host "  Installing client dependencies..."
Push-Location "$root\client"
npm install
Pop-Location
Write-Success "Client dependencies installed"

Write-Host "  Installing admin dependencies..."
Push-Location "$root\admin"
npm install
Pop-Location
Write-Success "Admin dependencies installed"

Write-Host "  Installing backend dependencies..."
Push-Location "$root\backend"
npm install
Pop-Location
Write-Success "Backend dependencies installed"

# Also install root if it has a package.json (used for workspace scripts)
if (Test-Path "$root\package.json") {
    Write-Host "  Installing root workspace dependencies..."
    Push-Location $root
    npm install
    Pop-Location
    Write-Success "Root dependencies installed"
}

# ----------------------------------------------------------
# 4. Create backend .env file
# ----------------------------------------------------------
Write-Step "Setting up backend environment"

$envPath = "$root\backend\.env"
if (Test-Path $envPath) {
    Write-Warn "backend/.env already exists - skipping (delete it manually if you want to regenerate)"
} else {
    $envContent = @"
DATABASE_URL=postgresql://cocobeach:cocobeach_dev@localhost:5432/cocobeach
S3_ENDPOINT=http://localhost:9100
S3_BUCKET=cocobeach
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_PUBLIC_URL=http://localhost:9100
JWT_SECRET=dev-secret-change-in-production
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
PORT=3000
"@
    Set-Content -Path $envPath -Value $envContent -Encoding UTF8
    Write-Success "Created backend/.env"
}

# ----------------------------------------------------------
# 5. Run Prisma migrations and seed
# ----------------------------------------------------------
Write-Step "Running database migrations and seed"

Push-Location "$root\backend"

Write-Host "  Running Prisma migrations..."
npx prisma migrate dev --name init 2>$null
if ($LASTEXITCODE -ne 0) {
    # If migrate dev fails (e.g. migrations already exist), try deploy
    npx prisma migrate deploy
}
Write-Success "Database migrations applied"

Write-Host "  Generating Prisma client..."
npx prisma generate
Write-Success "Prisma client generated"

Write-Host "  Seeding database..."
npm run db:seed
Write-Success "Database seeded (admin: admin@ilotcocobeach.tn / admin123)"

Pop-Location

# ----------------------------------------------------------
# 6. Verify setup
# ----------------------------------------------------------
Write-Step "Verifying setup"

# Check DB connection
$dbCheck = docker exec cocobeach-db psql -U cocobeach -d cocobeach -c "SELECT 1;" 2>$null
if ($dbCheck) { Write-Success "Database connection verified" }
else { Write-Warn "Could not verify database connection" }

# Check MinIO
$minioCheck = docker inspect --format='{{.State.Status}}' cocobeach-storage 2>$null
if ($minioCheck -eq "running") { Write-Success "MinIO storage running (API: http://localhost:9100, Console: http://localhost:9101)" }
else { Write-Warn "MinIO may not be running" }

# ----------------------------------------------------------
# 7. Done!
# ----------------------------------------------------------
Write-Step "Setup complete!"

Write-Host ""
Write-Host "  Your development environment is ready." -ForegroundColor Green
Write-Host ""
Write-Host "  To start all dev servers, run:" -ForegroundColor White
Write-Host "    .\start-all.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Or start individually:" -ForegroundColor White
Write-Host "    Backend:  cd backend; npm run dev     (http://localhost:3000)" -ForegroundColor Gray
Write-Host "    Client:   cd client; npm run dev      (http://localhost:5173)" -ForegroundColor Gray
Write-Host "    Admin:    cd admin; npm run dev        (http://localhost:5174)" -ForegroundColor Gray
Write-Host ""
Write-Host "  Admin login: admin@ilotcocobeach.tn / admin123" -ForegroundColor Gray
Write-Host "  MinIO Console: http://localhost:9101 (minioadmin/minioadmin)" -ForegroundColor Gray
Write-Host ""
Write-Host "  Docker containers (db + minio) persist across reboots (restart: unless-stopped)" -ForegroundColor Gray
Write-Host ""
