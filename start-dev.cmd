@echo off
echo ================================
echo   Track Hire - Development Mode
echo ================================
echo.
echo [1/2] Starting dependencies (Redis + RabbitMQ)...
docker-compose -f docker-compose.dev.yml up -d

echo.
echo [2/2] Waiting for services to be ready...
timeout /t 5 /nobreak > nul

echo.
echo ✅ Dependencies Ready:
echo   - Redis: localhost:6379
echo   - RabbitMQ: localhost:5672
echo   - RabbitMQ Management UI: http://localhost:15672
echo.
echo ================================
echo   Starting Backend Server...
echo ================================
echo.

npm run dev
