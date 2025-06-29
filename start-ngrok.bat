@echo off
echo 🚀 Starting EduPlatform Backend with Ngrok...
echo.

REM Start the backend server
echo 📡 Starting Backend Server on port 3009...
start "Backend Server" cmd /k "node server.js"

REM Wait a moment for server to start
timeout /t 3 /nobreak > nul

REM Start ngrok tunnel
echo 🌐 Starting Ngrok tunnel...
echo.
echo ⚠️  Make sure you have ngrok installed and authenticated!
echo 📝 Copy the ngrok URL and update your frontend .env file
echo.
ngrok http 3009

pause 