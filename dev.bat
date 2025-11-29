@echo off
echo.
echo 🚀 Starting Development Servers...
echo.

echo 📡 Starting Backend (FastAPI)...
start "Backend" cmd /k "cd backend && python main.py"

timeout /t 2 /nobreak >nul

echo 🎨 Starting Frontend (Next.js)...
start "Frontend" cmd /k "cd texy && npm run dev"

echo.
echo ✅ Both servers are running!
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Close the terminal windows to stop the servers
echo.
