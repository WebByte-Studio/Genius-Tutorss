@echo off
echo Starting Tutor Connect Development Environment...
echo.
echo Starting Backend on port 5000...
start "Backend" cmd /k "cd backend && npm run dev"
echo.
echo Starting Frontend on port 3000...
start "Frontend" cmd /k "npm run dev"
echo.
echo Both applications are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
