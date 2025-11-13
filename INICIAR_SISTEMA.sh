#!/bin/bash

echo "========================================"
echo "  NITRONFLOW DEV - Iniciando Sistema"
echo "========================================"
echo ""

cd frontend

echo "Verificando dependências..."
if [ ! -d "node_modules" ]; then
    echo "Instalando dependências..."
    npm install
    echo ""
fi

echo "Verificando arquivo .env.local..."
if [ ! -f ".env.local" ]; then
    echo ""
    echo "⚠️  ATENÇÃO: Arquivo .env.local não encontrado!"
    echo ""
    echo "Crie o arquivo frontend/.env.local com:"
    echo "  NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co"
    echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui"
    echo "  NEXT_PUBLIC_API_URL=https://seu-projeto.supabase.co/functions/v1"
    echo ""
    read -p "Pressione Enter para continuar mesmo assim..."
    echo ""
fi

echo ""
echo "Iniciando servidor Next.js..."
echo ""
echo "✅ Sistema iniciando em: http://localhost:3000"
echo ""
echo "Pressione Ctrl+C para parar o servidor"
echo ""

npm run dev

