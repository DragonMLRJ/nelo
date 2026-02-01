@echo off
cls
echo ========================================
echo   Get Supabase Database Password
echo ========================================
echo.
echo To get your Supabase database password:
echo.
echo 1. Go to: https://app.supabase.com/project/nzyuwfxghaujzzfjewze
echo 2. Click "Settings" (left sidebar)
echo 3. Click "Database"
echo 4. Scroll to "Connection string"
echo 5. Click "Show password" or copy the connection string
echo.
echo The password format is: [PASSWORD]
echo Example: StrongPass_Nelo_2026! or similar
echo.
echo ----------------------------------------
echo.
set /p password="Enter your Supabase password: "
echo.

REM Update .env file
echo Updating .env file...
powershell -Command "(Get-Content .env) -replace 'DATABASE_PASSWORD=.*', 'DATABASE_PASSWORD=%password%' | Set-Content .env"
echo.
echo [OK] Password updated in .env
echo.

REM Test connection
echo Testing database connection...
echo.
node scripts\test_db_connection.js
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   SUCCESS! Database connection works!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Run migrations: node scripts\run_all_migrations.js
    echo 2. Start Docker:   docker-start-local.bat
    echo.
) else (
    echo.
    echo ========================================
    echo   ERROR: Connection failed!
    echo ========================================
    echo.
    echo Please verify:
    echo  - Password is correct
    echo  - Supabase project is active
    echo  - Network connection is working
    echo.
)

pause
