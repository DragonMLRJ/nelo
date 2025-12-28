@echo off
echo ========================================
echo  Rebuilding Nelo Marketplace
echo ========================================
echo.

echo Stopping containers...
docker-compose down

echo.
echo Rebuilding images...
docker-compose build --no-cache

if errorlevel 1 (
    echo.
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo Starting containers...
docker-compose up -d

if errorlevel 1 (
    echo.
    echo ERROR: Failed to start containers!
    pause
    exit /b 1
)

echo.
echo Rebuild complete! Services are starting...
echo.
echo Opening marketplace in browser...
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
pause
