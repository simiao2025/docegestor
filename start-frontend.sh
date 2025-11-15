#!/bin/bash

# Script para configurar e executar o DoceGestot Frontend

echo "🎯 Configurando DoceGestot Frontend..."
echo "=================================="

# Verificar se estamos no diretório correto
if [ ! -f "frontend/package.json" ]; then
    echo "❌ Erro: Execute este script no diretório principal do projeto"
    echo "   Diretório atual: $(pwd)"
    echo "   Certifique-se de que o diretório 'frontend' existe"
    exit 1
fi

# Navegar para o diretório frontend
cd frontend

echo "📦 Instalando dependências..."
echo "=============================="
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependências instaladas com sucesso!"
else
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

echo ""
echo "🚀 Iniciando servidor de desenvolvimento..."
echo "========================================"
echo ""
echo "🌐 O projeto estará disponível em: http://localhost:3000"
echo ""
echo "📋 Para parar o servidor, pressione Ctrl+C"
echo ""

# Executar o servidor de desenvolvimento
npm run dev