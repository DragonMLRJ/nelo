@echo off
echo ========================================
echo  Starting Nelo Marketplace with Docker
echo ========================================
echo.

echo Checking if Docker is running...
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo Docker is running!
echo.

echo Building and starting containers...
docker-compose up -d --build

if errorlevel 1 (
    echo.
    echo ERROR: Failed to start containers!
    echo Check the error messages above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo  Nelo Marketplace is starting up!
echo ========================================
echo.
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo.
echo Services:
echo   Marketplace:  http://localhost:3000
echo   phpMyAdmin:   http://localhost:8080
echo.
echo Database credentials:
echo   Username: root
echo   Password: admin123
echo.
echo To view logs: docker-compose logs -f
echo To stop:      docker-compose down
echo.

echo Opening marketplace in browser...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo Press any key to view logs (Ctrl+C to exit logs)...
pause >nul

docker-compose logs -f
