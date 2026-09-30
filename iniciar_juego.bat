@echo off
title Pixel Quest: Echoes of Fate
cls
echo ===================================================================
echo             PIXEL QUEST: ECHOES OF FATE - JRPG
echo ===================================================================
echo.
echo Iniciando juego desde consola y abriendo pestana en tu navegador...
echo.

where python >nul 2>nul
if %errorlevel% equ 0 (
    python main.py
    if %errorlevel% equ 0 goto fin
)

echo [Info] Iniciando mediante servidor Vite...
call npm run dev -- --open

:fin
echo.
echo ===================================================================
echo Servidor finalizado.
pause
