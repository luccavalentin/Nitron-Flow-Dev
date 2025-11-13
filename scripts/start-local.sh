#!/bin/bash

# Script para iniciar o projeto localmente
# Uso: ./start-local.sh

echo "🚀 Iniciando NitronFlow Dev localmente..."
echo ""

# Verificar se está no diretório correto
if [ ! -d "frontend" ]; then
  echo "❌ Erro: Execute este script da raiz do projeto"
  exit 1
fi

cd frontend

# Verificar se .env.local existe
if [ ! -f ".env.local" ]; then
  echo "⚠️  Arquivo .env.local não encontrado!"
  echo ""
  echo "📝 Criando .env.local de exemplo..."
  cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
NEXT_PUBLIC_API_URL=https://seu-projeto.supabase.co/functions/v1
EOF
  echo ""
  echo "✅ Arquivo .env.local criado!"
  echo "⚠️  IMPORTANTE: Edite .env.local com suas credenciais do Supabase antes de continuar"
  echo ""
  read -p "Pressione Enter após configurar o .env.local..."
fi

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
  echo "📥 Instalando dependências..."
  npm install
  echo ""
fi

echo "🌐 Iniciando servidor de desenvolvimento..."
echo ""
echo "✅ O projeto estará disponível em: http://localhost:3000"
echo ""
echo "Pressione Ctrl+C para parar o servidor"
echo ""

npm run dev

