@echo off
echo [INFO] Applying Phase 4 Migration (Rate Limits) to Docker Container...
docker exec nelo-php-backend php /var/www/html/apply_phase4_schema.php
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to apply migration. Check if container 'nelo-php-backend' is running.
) else (
    echo [SUCCESS] Database schema updated.
)
pause
