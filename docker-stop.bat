@echo off
echo ========================================
echo  Stopping Nelo Marketplace
echo ========================================
echo.

docker-compose down

if errorlevel 1 (
    echo.
    echo ERROR: Failed to stop containers!
    pause
    exit /b 1
)

echo.
echo All containers stopped successfully!
echo.
echo To remove database data as well, run:
echo   docker-compose down -v
echo.
pause
