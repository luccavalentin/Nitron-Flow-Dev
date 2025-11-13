#!/bin/bash

# Script para iniciar o code-server localmente

echo "🚀 Iniciando Code-Server..."
echo ""

# Verificar se code-server está instalado
if ! command -v code-server &> /dev/null; then
    echo "❌ Code-server não encontrado!"
    echo ""
    echo "Instale com:"
    echo "  npm install -g code-server"
    echo "  OU"
    echo "  curl -fsSL https://code-server.dev/install.sh | sh"
    echo ""
    exit 1
fi

# Porta padrão
PORT=${1:-8080}

# Diretório de trabalho
WORK_DIR=${2:-$(pwd)}

echo "📁 Diretório: $WORK_DIR"
echo "🌐 Porta: $PORT"
echo "🔗 URL: http://localhost:$PORT"
echo ""
echo "⚠️  Pressione Ctrl+C para parar"
echo ""

# Iniciar code-server
code-server \
  --bind-addr 0.0.0.0:$PORT \
  --auth none \
  "$WORK_DIR"

