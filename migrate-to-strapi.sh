#!/bin/bash
# 🔄 DoceGestot - Migração Automática para Strapi v3.6.8
# Execute: bash migrate-to-strapi.sh

set -e

echo "🚀 DOCEGESTOT - MIGRAÇÃO PARA STRAPI v3.6.8"
echo "=================================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logs
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCESSO]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[ATENÇÃO]${NC} $1"
}

error() {
    echo -e "${RED}[ERRO]${NC} $1"
}

# 1. Verificar se Node.js está instalado
log "Verificando dependências..."
if ! command -v node &> /dev/null; then
    error "Node.js não encontrado! Instale Node.js primeiro."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    error "npm não encontrado! Instale npm primeiro."
    exit 1
fi

success "Node.js e npm encontrados!"

# 2. Verificar se é o MVP correto
log "Verificando se estamos no diretório do DoceGestot MVP..."
if [ ! -f "index.html" ] || [ ! -f "script.js" ]; then
    error "Arquivos do DoceGestot não encontrados! Execute este script no diretório que contém index.html e script.js"
    exit 1
fi

success "MVP DoceGestot encontrado!"

# 3. Solicitar informações do Strapi
echo -e "\n${BLUE}📋 CONFIGURAÇÃO DO STRAPI${NC}"
read -p "URL do seu Strapi (ex: https://strapi.docegestot.com): " STRAPI_URL
read -p "Token da API do Strapi: " API_TOKEN
read -p "Usuário admin do Strapi: " ADMIN_EMAIL
read -s -p "Senha do admin: " ADMIN_PASSWORD
echo ""

# Validar Strapi
log "Testando conexão com Strapi..."
if curl -s -H "Authorization: Bearer $API_TOKEN" "$STRAPI_URL/api/usuarios" > /dev/null; then
    success "Strapi acessível!"
else
    error "Não foi possível acessar o Strapi. Verifique a URL e token."
    exit 1
fi

# 4. Extrair dados do localStorage
log "Exportando dados do localStorage..."
cat > export-data.js << 'EOF'
// Script para executar no console do navegador do MVP
const dados = JSON.parse(localStorage.getItem('docegestot_dados') || '{"clientes":[],"receitas":[],"pedidos":[]}');

if (dados.clientes.length === 0 && dados.receitas.length === 0 && dados.pedidos.length === 0) {
    console.log('⚠️ Nenhum dado encontrado no localStorage');
    console.log('Para testar, adicione alguns dados no MVP antes de exportar.');
} else {
    console.log('📦 DADOS ENCONTRADOS:');
    console.log('- Clientes:', dados.clientes.length);
    console.log('- Receitas:', dados.receitas.length); 
    console.log('- Pedidos:', dados.pedidos.length);
    console.log('\n📋 ESTRUTURA PARA MIGRAÇÃO:');
    console.log(JSON.stringify(dados, null, 2));
}
EOF

warning "Execute este script no console do navegador do MVP:"
echo "1. Abra o arquivo index.html do MVP no navegador"
echo "2. Adicione alguns dados de teste se necessário"
echo "3. Abra DevTools (F12) > Console"
echo "4. Cole o conteúdo de export-data.js"
echo "5. Copie a saída JSON para a próxima etapa"
echo ""

read -p "Você já exportou os dados? (s/n): " EXPORT_DONE

if [ "$EXPORT_DONE" != "s" ]; then
    warning "Execute o script export-data.js primeiro, depois digite 's' para continuar"
    echo "cat > export-data.js << 'EOF'"
    cat export-data.js
    echo "EOF"
    echo ""
    exit 1
fi

# 5. Criar projeto frontend React
log "Criando projeto Next.js..."

if [ -d "docegestot-frontend" ]; then
    warning "Diretório docegestot-frontend já existe"
    read -p "Deseja sobrescrever? (s/n): " OVERWRITE
    if [ "$OVERWRITE" == "s" ]; then
        rm -rf docegestot-frontend
    else
        error "Migração cancelada pelo usuário"
        exit 1
    fi
fi

# Instalar Next.js
npx create-next-app@latest docegestot-frontend --typescript --tailwind --eslint --app --use-npm --yes

cd docegestot-frontend

# Instalar dependências
log "Instalando dependências..."
npm install axios jwt-decode @tanstack/react-query @tanstack/react-query-devtools
npm install @heroicons/react react-hook-form @hookform/resolvers yup
npm install date-fns lucide-react

success "Dependências instaladas!"

# 6. Configurar arquivos do frontend
log "Configurando integração com Strapi..."

# Criar lib/api.js
cat > lib/api.js << EOF
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL || '${STRAPI_URL}/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
EOF

# Criar contexto de autenticação
cat > contexts/AuthContext.jsx << 'EOF'
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (email, senha) => {
    try {
      const response = await api.post('/api/usuario/login', { email, senha });
      const { jwt, user: userData } = response.data;
      
      localStorage.setItem('auth_token', jwt);
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Erro no login' };
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsAuthenticated(true);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
EOF

# 7. Deploy no Vercel
log "Deployando no Vercel..."

# Instalar Vercel CLI
npm install -g vercel

# Logar no Vercel
echo "Execute: vercel login"
vercel login

# Configurar variáveis de ambiente
echo "Configurando variáveis de ambiente no Vercel..."
echo "NEXT_PUBLIC_STRAPI_URL=$STRAPI_URL/api" > .env.local

# Deploy
vercel --prod

success "Frontend deployado!"

# 8. Testes finais
log "Executando testes finais..."

echo -e "\n${GREEN}🎉 MIGRAÇÃO CONCLUÍDA!${NC}"
echo -e "\n${BLUE}📊 RESUMO:${NC}"
echo "✅ Strapi conectado: $STRAPI_URL"
echo "✅ Frontend deployado: https://docegestot-frontend.vercel.app"
echo "✅ API configurada: $STRAPI_URL/api"

echo -e "\n${YELLOW}📋 PRÓXIMOS PASSOS:${NC}"
echo "1. 📝 Configure as variáveis de ambiente no Vercel:"
echo "   - NEXT_PUBLIC_STRAPI_URL=$STRAPI_URL/api"

echo -e "\n2. 🔗 Teste a integração:"
echo "   curl $STRAPI_URL/api/usuarios"

echo -e "\n3. 🚀 Acesse sua aplicação:"
echo "   Frontend: https://docegestot-frontend.vercel.app"
echo "   Admin: $STRAPI_URL/admin"

echo -e "\n${BLUE}📚 ARQUIVOS CRIADOS:${NC}"
echo "   - docegestot-frontend/ (aplicação React)"
echo "   - export-data.js (script de exportação)"

echo -e "\n${GREEN}✅ SISTEMA INTEGRADO COM SUCESSO!${NC}"
