@echo off
chcp 65001 >nul
echo ========================================
echo   Iniciando Code-Server
echo ========================================
echo.

REM Verificar se code-server está instalado
where code-server >nul 2>&1
if errorlevel 1 (
    echo ❌ Code-server não encontrado!
    echo.
    echo Instale com:
    echo   npm install -g code-server
    echo.
    pause
    exit /b 1
)

REM Porta padrão
set PORT=%1
if "%PORT%"=="" set PORT=8080

REM Diretório de trabalho
set WORK_DIR=%2
if "%WORK_DIR%"=="" set WORK_DIR=%CD%

echo 📁 Diretório: %WORK_DIR%
echo 🌐 Porta: %PORT%
echo 🔗 URL: http://localhost:%PORT%
echo.
echo ⚠️  Pressione Ctrl+C para parar
echo.

REM Iniciar code-server
code-server --bind-addr 0.0.0.0:%PORT% --auth none "%WORK_DIR%"

