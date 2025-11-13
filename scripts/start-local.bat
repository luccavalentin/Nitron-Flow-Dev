@echo off
REM Script para iniciar o projeto localmente no Windows
REM Uso: start-local.bat

echo 🚀 Iniciando NitronFlow Dev localmente...
echo.

REM Verificar se está no diretório correto
if not exist "frontend" (
    echo ❌ Erro: Execute este script da raiz do projeto
    exit /b 1
)

cd frontend

REM Verificar se .env.local existe
if not exist ".env.local" (
    echo ⚠️  Arquivo .env.local não encontrado!
    echo.
    echo 📝 Criando .env.local de exemplo...
    (
        echo NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
        echo NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
        echo NEXT_PUBLIC_API_URL=https://seu-projeto.supabase.co/functions/v1
    ) > .env.local
    echo.
    echo ✅ Arquivo .env.local criado!
    echo ⚠️  IMPORTANTE: Edite .env.local com suas credenciais do Supabase antes de continuar
    echo.
    pause
)

REM Verificar se node_modules existe
if not exist "node_modules" (
    echo 📥 Instalando dependências...
    call npm install
    echo.
)

echo 🌐 Iniciando servidor de desenvolvimento...
echo.
echo ✅ O projeto estará disponível em: http://localhost:3000
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

call npm run dev

