@echo off
echo ========================================
echo   Nelo Marketplace - Docker Startup
echo ========================================
echo.

REM Check if Docker is running
docker ps >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Docker is already running!
    echo.
    goto :build
)

echo [!] Docker Desktop is not running.
echo.
echo Please start Docker Desktop manually:
echo 1. Press Windows key and search "Docker Desktop"
echo 2. Click to open Docker Desktop
echo 3. Wait for the Docker icon in system tray to show "Docker Desktop is running"
echo 4. Then run this script again
echo.
pause
exit /b 1

:build
echo ========================================
echo   Building Docker Containers
echo ========================================
echo.
docker-compose build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Docker build failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Starting Docker Containers
echo ========================================
echo.
docker-compose up -d
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Docker startup failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Docker Status
echo ========================================
echo.
docker-compose ps

echo.
echo ========================================
echo   SUCCESS!
echo ========================================
echo.
echo Your Nelo Marketplace is now running:
echo   - Frontend:     http://localhost:3000
echo   - PHP Backend:  http://localhost:8000
echo   - phpMyAdmin:   http://localhost:8080 (if enabled)
echo.
echo To view logs:    docker-compose logs -f
echo To stop:         docker-compose down
echo.
pause
