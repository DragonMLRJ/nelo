@echo off
echo ========================================
echo   Nelo Marketplace - GitHub Push
echo ========================================
echo.
echo This will commit and push your code to GitHub
echo for deployment to Render.com
echo.
pause

echo.
echo Adding files...
git add .

echo.
echo Committing...
git commit -m "Complete Supabase PostgreSQL setup and Render deployment config"

echo.
echo Pushing to GitHub...
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   SUCCESS! Code pushed to GitHub
    echo ========================================
    echo.
    echo Next steps:
    echo.
    echo 1. Go to: https://dashboard.render.com
    echo 2. Click "New" then "Blueprint"
    echo 3. Select your GitHub repository
    echo 4. Choose "render.yaml"
    echo 5. Enter environment variables when prompted:
    echo    - DB_PASS: Your Supabase database password
    echo    - VITE_SUPABASE_ANON_KEY: From .env file
    echo    - FLW_PUBLIC_KEY: Your Flutterwave key
    echo    - FLW_SECRET_HASH: Your Flutterwave secret
    echo    - SMTP credentials: Your email settings
    echo.
    echo 6. Click "Create Services"
    echo 7. Wait 5-10 minutes for deployment
    echo 8. Test your live URL!
    echo.
) else (
    echo.
    echo ========================================
    echo   ERROR: Git push failed!
    echo ========================================
    echo.
    echo Possible issues:
    echo  - Not connected to internet
    echo  - No remote repository configured
    echo  - Authentication failed
    echo.
    echo Run these commands to set up Git remote:
    echo   git remote add origin YOUR_GITHUB_REPO_URL
    echo   git push -u origin main
    echo.
)

pause
