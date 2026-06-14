@echo off
echo ================================
echo   Stopping Development Services
echo ================================
echo.

echo Stopping Docker dependencies...
docker-compose -f docker-compose.dev.yml down

echo.
echo ✅ All services stopped!
echo.
pause
