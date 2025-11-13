#!/bin/bash

# Script de deploy para NitronFlow Dev
# Uso: ./deploy.sh [environment]

ENVIRONMENT=${1:-production}
PROJECT_NAME="nitronflow-dev"

echo "🚀 Iniciando deploy para $ENVIRONMENT..."

# Verificar se está no diretório correto
if [ ! -d "frontend" ]; then
  echo "❌ Erro: Execute este script da raiz do projeto"
  exit 1
fi

# Build do frontend
echo "📦 Fazendo build do frontend..."
cd frontend
npm install
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Erro no build"
  exit 1
fi

echo "✅ Build concluído!"

# Deploy baseado no ambiente
if [ "$ENVIRONMENT" = "production" ]; then
  echo "🌐 Deploy em produção..."
  
  # Verificar se Vercel CLI está instalado
  if command -v vercel &> /dev/null; then
    vercel --prod
  else
    echo "⚠️  Vercel CLI não encontrado. Instale com: npm i -g vercel"
    echo "📝 Ou faça deploy manualmente na Vercel"
  fi
else
  echo "🧪 Deploy em staging..."
  
  if command -v vercel &> /dev/null; then
    vercel
  else
    echo "⚠️  Vercel CLI não encontrado"
  fi
fi

echo "✅ Deploy concluído!"

