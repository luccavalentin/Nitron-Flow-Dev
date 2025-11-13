@echo off
chcp 65001 >nul
echo ========================================
echo   NITRONFLOW DEV - Iniciando Sistema
echo ========================================
echo.

cd /d "%~dp0frontend"

if not exist "%~dp0frontend" (
    echo ERRO: Pasta frontend nao encontrada!
    echo Certifique-se de estar na pasta raiz do projeto.
    pause
    exit /b 1
)

echo [1/3] Verificando dependencias...
if not exist node_modules (
    echo Instalando dependencias (pode demorar 1-2 minutos)...
    call npm install
    if errorlevel 1 (
        echo.
        echo ERRO ao instalar dependencias!
        pause
        exit /b 1
    )
    echo.
) else (
    echo Dependencias ja instaladas.
    echo.
)

echo [2/3] Verificando arquivo .env.local...
if not exist .env.local (
    echo.
    echo ⚠️  ATENCAO: Arquivo .env.local nao encontrado!
    echo.
    echo O sistema vai iniciar mesmo assim, mas algumas funcionalidades
    echo podem nao funcionar sem as credenciais do Supabase.
    echo.
    echo Para configurar depois, crie: frontend/.env.local
    echo.
    timeout /t 3 >nul
    echo.
)

echo [3/3] Iniciando servidor Next.js...
echo.
echo ========================================
echo   ✅ SERVIDOR INICIANDO
echo ========================================
echo.
echo 📍 Acesse: http://localhost:3000
echo.
echo ⚠️  IMPORTANTE: Mantenha esta janela aberta!
echo    Se fechar, o servidor para.
echo.
echo Pressione Ctrl+C para parar o servidor
echo.
echo ========================================
echo.

call npm run dev

if errorlevel 1 (
    echo.
    echo ========================================
    echo   ERRO ao iniciar o servidor
    echo ========================================
    echo.
    echo Possiveis causas:
    echo - Porta 3000 ja esta em uso
    echo - Dependencias nao instaladas corretamente
    echo.
    echo Tente:
    echo   1. Feche outros programas usando a porta 3000
    echo   2. Execute: npm install
    echo   3. Execute: npm run dev
    echo.
    pause
)

