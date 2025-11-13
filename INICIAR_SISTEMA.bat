@echo off
echo ========================================
echo   NITRONFLOW DEV - Iniciando Sistema
echo ========================================
echo.

cd frontend

echo Verificando dependencias...
if not exist node_modules (
    echo Instalando dependencias...
    call npm install
    echo.
)

echo Verificando arquivo .env.local...
if not exist .env.local (
    echo.
    echo ⚠️  ATENCAO: Arquivo .env.local nao encontrado!
    echo.
    echo Crie o arquivo frontend/.env.local com:
    echo   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
    echo   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
    echo   NEXT_PUBLIC_API_URL=https://seu-projeto.supabase.co/functions/v1
    echo.
    echo Pressione qualquer tecla para continuar mesmo assim...
    pause >nul
    echo.
)

echo.
echo Iniciando servidor Next.js...
echo.
echo ✅ Sistema iniciando em: http://localhost:3000
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

call npm run dev

