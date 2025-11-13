#!/bin/bash
# Script para facilitar commits com padrão de versão
# Uso: ./commit.sh [NÚMERO_DA_VERSÃO] "[Descrição]"

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Uso: ./commit.sh [NÚMERO_DA_VERSÃO] \"[Descrição]\""
    echo "Exemplo: ./commit.sh 2 \"Adicionada nova funcionalidade\""
    exit 1
fi

VERSION=$1
DESCRIPTION=$2
DATE=$(date +"%d/%m/%y")
TIME=$(date +"%H:%M")

COMMIT_MSG="V${VERSION} DATE ${DATE} AS ${TIME} - ${DESCRIPTION}"

echo "Adicionando arquivos..."
git add .

echo "Fazendo commit: ${COMMIT_MSG}"
git commit -m "${COMMIT_MSG}"

echo "Commit realizado com sucesso!"
echo "Para enviar ao GitHub, execute: git push"

