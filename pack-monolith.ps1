Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Smart Transport Monolith Builder" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$FRONTEND_DIR = "$PSScriptRoot\frontend"
$BACKEND_DIR = "$PSScriptRoot\backend"
$STATIC_DIR = "$BACKEND_DIR\src\main\resources\static"

Write-Host "Building React Frontend..." -ForegroundColor Yellow
Set-Location -Path $FRONTEND_DIR
npm install
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend build failed" -ForegroundColor Red
    exit 1
}

Write-Host "Transferring frontend build to Spring Boot..." -ForegroundColor Yellow
if (Test-Path -Path $STATIC_DIR) {
    Remove-Item -Recurse -Force "$STATIC_DIR\*"
}
if (!(Test-Path -Path $STATIC_DIR)) {
    New-Item -ItemType Directory -Force -Path $STATIC_DIR
}
Copy-Item -Recurse -Force "$FRONTEND_DIR\dist\*" -Destination $STATIC_DIR

Write-Host "Compiling Spring Boot Backend JAR..." -ForegroundColor Yellow
Set-Location -Path $BACKEND_DIR
$env:JAVA_HOME = "C:\Users\DELL\.vscode\extensions\redhat.java-1.55.0-win32-x64\jre\21.0.11-win32-x86_64"
.\mvnw clean package -DskipTests

Write-Host "SUCCESS Your monolithic App has been packed." -ForegroundColor Green
