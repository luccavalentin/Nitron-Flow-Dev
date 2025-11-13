#!/bin/bash

# Script para build local do NitronFlow Dev
# Uso: ./deploy.sh

echo "📦 Fazendo build do projeto localmente..."

# Verificar se está no diretório correto
if [ ! -d "frontend" ]; then
  echo "❌ Erro: Execute este script da raiz do projeto"
  exit 1
fi

# Build do frontend
echo "📦 Fazendo build do frontend..."
cd frontend

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
  echo "📥 Instalando dependências..."
  npm install
fi

echo "🔨 Compilando projeto..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Erro no build"
  exit 1
fi

echo "✅ Build concluído!"
echo ""
echo "🚀 Para executar o projeto em produção local:"
echo "   cd frontend && npm start"
echo ""
echo "💡 Para desenvolvimento com hot reload:"
echo "   cd frontend && npm run dev"

