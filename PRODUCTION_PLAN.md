# DoceGestot - Plano de Produção Completo

## 🏗️ Arquitetura de Produção

### Stack Tecnológico
```
Frontend (Vercel)     ←→  Backend (Strapi)     ←→  Automação (n8n)
     ↓                      ↓                         ↓
   React/Vue             PostgreSQL              WhatsApp + IA
   PWA + HTTPS           REST API                Workflows
```

## 1. 🚀 BACKEND - STRAPI

### 1.1 Setup Inicial
```bash
# Instalar Strapi
npx create-strapi-app@latest docegestot-backend --quickstart

# Estrutura de dados
npm install @strapi/plugin-i18n @strapi/plugin-users-permissions

# Banco de dados
npm install pg  # PostgreSQL
npm install --save pg-connection-string  # Connection string
```

### 1.2 Schema do Banco de Dados

**Content Types:**

```javascript
// ./src/api/usuario/content-types/usuario/schema.json
{
  "collectionName": "usuarios",
  "info": {
    "singularName": "usuario",
    "pluralName": "usuarios",
    "displayName": "Usuário",
    "description": "Usuários do sistema"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "nome_completo": {
      "type": "string",
      "required": true,
      "maxLength": 255
    },
    "email": {
      "type": "email",
      "required": true,
      "unique": true
    },
    "telefone": {
      "type": "string",
      "maxLength": 20
    },
    "tipo_usuario": {
      "type": "enumeration",
      "enum": ["confeiteira", "admin", "vendedor"],
      "default": "confeiteira"
    },
    "senha_hash": {
      "type": "password",
      "minLength": 6
    },
    "clientes": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::cliente.cliente",
      "mappedBy": "usuario_dono"
    },
    "receitas": {
      "type": "relation",
      "relation": "oneToMany", 
      "target": "api::receita.receita",
      "mappedBy": "usuario_dono"
    },
    "pedidos": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::pedido.pedido", 
      "mappedBy": "usuario_dono"
    }
  }
}
```

```javascript
// ./src/api/cliente/content-types/cliente/schema.json
{
  "collectionName": "clientes",
  "info": {
    "singularName": "cliente",
    "pluralName": "clientes", 
    "displayName": "Cliente"
  },
  "attributes": {
    "nome": {
      "type": "string",
      "required": true,
      "maxLength": 255
    },
    "telefone": {
      "type": "string",
      "maxLength": 20
    },
    "email": {
      "type": "email"
    },
    "observacoes": {
      "type": "text"
    },
    "usuario_dono": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::usuario.usuario",
      "inversedBy": "clientes",
      "required": true
    },
    "pedidos": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::pedido.pedido",
      "mappedBy": "cliente"
    }
  }
}
```

```javascript
// ./src/api/receita/content-types/receita/schema.json
{
  "collectionName": "receitas",
  "info": {
    "singularName": "receita",
    "pluralName": "receitas",
    "displayName": "Receita"
  },
  "attributes": {
    "nome": {
      "type": "string",
      "required": true,
      "maxLength": 255
    },
    "descricao": {
      "type": "text"
    },
    "categoria": {
      "type": "enumeration",
      "enum": ["bolo", "doce_fino", "torta"],
      "required": true
    },
    "custo_total": {
      "type": "decimal",
      "default": 0
    },
    "preco_sugerido": {
      "type": "decimal", 
      "default": 0
    },
    "instrucoes_preparo": {
      "type": "richtext"
    },
    "ingredientes": {
      "type": "json"
    },
    "usuario_dono": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::usuario.usuario",
      "inversedBy": "receitas"
    }
  }
}
```

```javascript
// ./src/api/pedido/content-types/pedido/schema.json
{
  "collectionName": "pedidos",
  "info": {
    "singularName": "pedido",
    "pluralName": "pedidos",
    "displayName": "Pedido"
  },
  "attributes": {
    "status": {
      "type": "enumeration",
      "enum": ["recebido", "em_producao", "entregue", "cancelado"],
      "default": "recebido"
    },
    "data_entrega": {
      "type": "date",
      "required": true
    },
    "total": {
      "type": "decimal",
      "default": 0
    },
    "observacoes": {
      "type": "text"
    },
    "itens": {
      "type": "json"
    },
    "cliente": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::cliente.cliente",
      "inversedBy": "pedidos"
    },
    "usuario_dono": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::usuario.usuario",
      "inversedBy": "pedidos"
    }
  }
}
```

### 1.3 Controllers Personalizados

```javascript
// ./src/api/usuario/controllers/usuario.js
module.exports = {
  async login(ctx) {
    const { email, senha } = ctx.request.body;
    
    try {
      // Verificar credenciais
      const user = await strapi.entityService.findMany('api::usuario.usuario', {
        filters: { email },
        populate: true
      });
      
      if (!user || !await bcrypt.compare(senha, user[0].senha_hash)) {
        return ctx.unauthorized('Credenciais inválidas');
      }
      
      // Gerar JWT
      const jwt = strapi.plugins['users-permissions'].services.jwt.sign({
        id: user[0].id,
        email: user[0].email
      });
      
      // Limpar senha da resposta
      const userData = user[0];
      delete userData.senha_hash;
      
      return {
        jwt,
        user: userData
      };
      
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async me(ctx) {
    if (!ctx.state.user) {
      return ctx.unauthorized();
    }
    
    const user = await strapi.entityService.findOne('api::usuario.usuario', ctx.state.user.id);
    delete user.senha_hash;
    
    return user;
  }
};
```

### 1.4 Middleware de Autenticação

```javascript
// ./src/middlewares/auth.js
module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    // Verificar token JWT
    const authHeader = ctx.request.header.authorization;
    
    if (!authHeader) {
      return ctx.unauthorized('Token de autenticação requerido');
    }
    
    try {
      const token = authHeader.split(' ')[1];
      const payload = await strapi.plugins['users-permissions'].services.jwt.verify(token);
      
      // Verificar se usuário ainda existe
      const user = await strapi.entityService.findOne('api::usuario.usuario', payload.id);
      if (!user) {
        return ctx.unauthorized('Usuário não encontrado');
      }
      
      ctx.state.user = payload;
      await next();
      
    } catch (error) {
      return ctx.unauthorized('Token inválido');
    }
  };
};
```

### 1.5 Configuração do Banco

```javascript
// ./config/database.js
module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', 'localhost'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'docegestot'),
      user: env('DATABASE_USERNAME', 'strapi'),
      password: env('DATABASE_PASSWORD', 'strapi'),
      ssl: env.bool('DATABASE_SSL', false),
    },
    debug: false,
  },
});
```

```javascript
// ./config/server.js
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  url: env('PUBLIC_URL', 'https://api.docegestot.com'),
});
```

### 1.6 Deploy Strapi (Railway)

```bash
# Criar projeto
railway login
railway init

# Adicionar PostgreSQL
railway add postgresql

# Configurar variáveis de ambiente
railway variables set APP_KEYS=key1,key2,key3,key4
railway variables set API_TOKEN_SALT=salt
railway variables set ADMIN_JWT_SECRET=jwtsecret
railway variables set JWT_SECRET=jwtsecret
railway variables set DATABASE_PASSWORD=postgres_password
railway variables set PUBLIC_URL=https://api.docegestot.com
```

## 2. 🎨 FRONTEND - VERCEL

### 2.1 Migração para React/Next.js

```bash
# Criar projeto Next.js
npx create-next-app@latest docegestot-frontend --typescript --tailwind --eslint --app

# Instalar dependências
npm install axios jwt-decode react-query @tanstack/react-query
npm install @heroicons/react
```

### 2.2 Configuração de APIs

```javascript
// ./lib/api.js
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.docegestot.com';

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
    config.headers.Authorization = `Bearer ${token}`;
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
```

```javascript
// ./hooks/useAuth.js
import { useContext, createContext } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const useAuthData = () => {
  const token = localStorage.getItem('auth_token');
  
  const { data: user, isLoading, error } = useQuery(
    ['auth', 'me'],
    async () => {
      const response = await api.get('/api/usuario/me');
      return response.data;
    },
    {
      enabled: !!token,
      retry: false,
    }
  );

  const loginMutation = useMutation(
    async (credentials) => {
      const response = await api.post('/api/usuario/login', credentials);
      const { jwt, user } = response.data;
      localStorage.setItem('auth_token', jwt);
      return user;
    }
  );

  const logout = () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!token && !error,
    login: loginMutation.mutate,
    logout,
    isLoggingIn: loginMutation.isLoading,
  };
};
```

### 2.3 Componentes de Gestão

```javascript
// ./components/Orders/OrderManager.jsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { PlusIcon, PencilIcon } from '@heroicons/react/24/outline';

export default function OrderManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const queryClient = useQueryClient();

  // Carregar pedidos
  const { data: orders, isLoading } = useQuery(
    ['orders'],
    async () => {
      const response = await api.get('/api/pedidos?populate=cliente');
      return response.data;
    }
  );

  // Mutation para criar/editar pedido
  const orderMutation = useMutation(
    async (orderData) => {
      if (selectedOrder) {
        const response = await api.put(`/api/pedidos/${selectedOrder.id}`, {
          data: orderData
        });
        return response.data;
      } else {
        const response = await api.post('/api/pedidos', {
          data: orderData
        });
        return response.data;
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['orders']);
        setIsModalOpen(false);
        setSelectedOrder(null);
      }
    }
  );

  const handleSubmit = (formData) => {
    orderMutation.mutate(formData);
  };

  if (isLoading) return <div>Carregando pedidos...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Novo Pedido
        </button>
      </div>

      {/* Lista de pedidos */}
      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Entrega
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders?.data?.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {order.attributes.cliente?.data?.attributes?.nome}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    order.attributes.status === 'recebido' ? 'bg-yellow-100 text-yellow-800' :
                    order.attributes.status === 'em_producao' ? 'bg-blue-100 text-blue-800' :
                    order.attributes.status === 'entregue' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.attributes.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  R$ {order.attributes.total}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(order.attributes.data_entrega).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsModalOpen(true);
                    }}
                    className="text-pink-600 hover:text-pink-900"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de criação/edição */}
      {isModalOpen && (
        <OrderModal
          order={selectedOrder}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedOrder(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
```

### 2.4 Deploy no Vercel

```json
// ./vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.docegestot.com"
  },
  "functions": {
    "app/api/**/*.js": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options", 
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

```bash
# Deploy automático via GitHub
# 1. Conectar repositório
git init
git add .
git commit -m "Initial commit"
git push origin main

# 2. Conectar no Vercel
npm install -g vercel
vercel login
vercel --prod
```

## 3. 🤖 AUTOMATIZAÇÃO - n8n

### 3.1 Workflows Principais

```javascript
// ./n8n/workflows/whatsapp-notifications.json
{
  "name": "WhatsApp - Notificações de Pedido",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "pedido-status-update",
        "options": {}
      },
      "name": "Webhook - Status Update",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300],
      "webhookId": "pedido-status-update"
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
          },
          "conditions": [
            {
              "leftValue": "={{ $json.status_anterior }}",
              "rightValue": "entregue",
              "operator": {
                "type": "string",
                "operation": "equals",
              }
            }
          ],
          "combinator": "and",
        },
      },
      "name": "Verificar Status",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "resource": "message",
        "operation": "send",
        "text": "🍰 Seu pedido DoceGestot foi ENTREGUE!\n\nPedido: {{ $json.pedido_id }}\nTotal: R$ {{ $json.total }}\n\nObrigado pela preferência! 💕",
        "phone": "={{ $json.telefone_cliente }}",
        "options": {}
      },
      "name": "WhatsApp - Notificação",
      "type": "n8n-nodes-base.whatsappBusiness",
      "typeVersion": 1,
      "position": [650, 200]
    },
    {
      "parameters": {
        "resource": "message",
        "operation": "send", 
        "text": "🕒 Lembrete: Seu pedido DoceGestot será entregue hoje!\n\nPedido: {{ $json.pedido_id }}\nEntrega: {{ $json.data_entrega }}\nTotal: R$ {{ $json.total }}\n\nEstamos quase lá! 🎂",
        "phone": "={{ $json.telefone_cliente }}",
        "options": {}
      },
      "name": "WhatsApp - Lembrete",
      "type": "n8n-nodes-base.whatsappBusiness",
      "typeVersion": 1,
      "position": [650, 400]
    }
  ],
  "connections": {
    "Webhook - Status Update": {
      "main": [
        [
          {
            "node": "Verificar Status",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Verificar Status": {
      "main": [
        [
          {
            "node": "WhatsApp - Notificação",
            "type": "main", 
            "index": 0
          }
        ],
        [
          {
            "node": "WhatsApp - Lembrete",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

```javascript
// ./n8n/workflows/ai-chatbot.json
{
  "name": "WhatsApp - AI Chatbot",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "whatsapp-webhook",
        "options": {}
      },
      "name": "WhatsApp Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "resource": "message",
        "operation": "send",
        "text": "🤖 Nossa assistente IA está processando sua mensagem...",
        "phone": "={{ $json.from }}",
        "options": {}
      },
      "name": "IA - Processando",
      "type": "n8n-nodes-base.openai",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "resource": "chat",
        "operation": "message",
        "messages": {
          "messageType": "multipleMessages",
          "multipleMessages": [
            {
              "messageType": "textMessage",
              "content": "Você é a assistente IA do DoceGestot. Responda perguntas sobre:\n\n🍰 Receitas disponíveis\n📦 Status de pedidos\n💰 Preços\n📍 Localização\n\nPergunta: {{ $json.message.text }}",
              "role": "system"
            },
            {
              "messageType": "textMessage", 
              "content": "{{ $json.message.text }}",
              "role": "user"
            }
          ]
        },
        "options": {
          "model": "gpt-3.5-turbo"
        }
      },
      "name": "OpenAI - Análise",
      "type": "n8n-nodes-base.openai",
      "typeVersion": 1,
      "position": [650, 300]
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
          },
          "conditions": [
            {
              "leftValue": "={{ $json.message.text }}",
              "rightValue": "pedido|status|meu pedido",
              "operator": {
                "type": "string", 
                "operation": "contains"
              }
            }
          ],
          "combinator": "and",
        },
      },
      "name": "Verificar Intent",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [850, 300]
    },
    {
      "parameters": {
        "httpMethod": "POST",
        "url": "https://api.docegestot.com/api/pedidos",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "httpHeaderAuth",
        "options": {},
        "jsonParameters": true,
        "bodyParametersJson": "={{ JSON.stringify({ filters: { usuario_dono: { email: { $eq: \"{{ $json.from }}\" } } } }) }}"
      },
      "name": "API - Buscar Pedidos",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [1050, 200]
    }
  ]
}
```

### 3.2 Deploy n8n (Railway)

```bash
# Instalar n8n via Docker
railway login
railway init
railway add

# Criar docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.7'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: docegestot-n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=seu_password_seguro
      - N8N_HOST=automacao.docegestot.com
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://automacao.docegestot.com/
      - N8N_EDITOR_BASE_URL=https://automacao.docegestot.com
      - GENERIC_TIMEZONE=America/Sao_Paulo
      - TZ=America/Sao_Paulo
      - N8N_DIAGNOSTICS_ENABLED=false
      - N8N_PERSONALIZATION_ENABLED=false
      - N8N_VERSION_NOTIFICATIONS_ENABLED=false
      - N8N_TEMPLATES_ENABLED=false
      - N8N_USER_FOLDER=/home/node/.n8n
    volumes:
      - n8n_data:/home/node/.n8n
    restart: unless-stopped

volumes:
  n8n_data:

networks:
  default:
    name: docegestot-network
EOF

# Deploy
railway up
```

## 4. 🔗 INTEGRAÇÃO COMPLETA

### 4.1 Variáveis de Ambiente

```bash
# .env.production
# API Base
NEXT_PUBLIC_API_URL=https://api.docegestot.com
N8N_WEBHOOK_URL=https://automacao.docegestot.com

# Strapi
STRAPI_HOST=https://api.docegestot.com
STRAPI_PORT=443

# WhatsApp Business
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_whatsapp_token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token

# OpenAI
OPENAI_API_KEY=your_openai_key

# Database (Railway)
DATABASE_URL=postgresql://user:pass@host:port/db
```

### 4.2 Domínios e SSL

```
Produção:
├── App Principal: https://app.docegestot.com (Vercel)
├── API Backend: https://api.docegestot.com (Railway)
├── Automação: https://automacao.docegestot.com (Railway)
└── WhatsApp Webhook: https://webhook.docegestot.com (n8n)

Staging:
├── App: https://staging.docegestot.com (Vercel)
├── API: https://staging-api.docegestot.com (Railway)
└── Automação: https://staging-automacao.docegestot.com (Railway)
```

### 4.3 Monitoramento

```javascript
// ./lib/monitoring.js
import { api } from './api';

// Log de erros
export const logError = async (error, context) => {
  try {
    await api.post('/api/monitoring/log', {
      level: 'error',
      message: error.message,
      stack: error.stack,
      context: context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  } catch (e) {
    console.error('Erro ao enviar log:', e);
  }
};

// Métricas de performance
export const logPerformance = async (metricName, value) => {
  try {
    await api.post('/api/monitoring/performance', {
      metric: metricName,
      value: value,
      timestamp: new Date().toISOString(),
      url: window.location.href
    });
  } catch (e) {
    console.error('Erro ao enviar métrica:', e);
  }
};

// Web Vitals
export const trackWebVitals = () => {
  if ('performance' in window) {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        logPerformance(entry.name, entry.value);
      }
    }).observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
  }
};
```

## 5. 🚀 CRONOGRAMA DE IMPLEMENTAÇÃO

### Fase 1: Backend (Semana 1-2)
- [ ] Configurar Strapi no Railway
- [ ] Criar schemas do banco
- [ ] Implementar controllers de autenticação
- [ ] Testar APIs REST
- [ ] Deploy e configuração de domínio

### Fase 2: Frontend (Semana 3-4)  
- [ ] Migrar para Next.js + TypeScript
- [ ] Implementar autenticação JWT
- [ ] Criar componentes de gestão
- [ ] Integrar com APIs do Strapi
- [ ] Deploy no Vercel

### Fase 3: Automação (Semana 5-6)
- [ ] Instalar n8n no Railway
- [ ] Criar workflows WhatsApp
- [ ] Implementar chatbot IA
- [ ] Configurar webhooks
- [ ] Testes de integração

### Fase 4: Produção (Semana 7-8)
- [ ] Configurar domínios e SSL
- [ ] Implementar monitoramento
- [ ] Testes de carga
- [ ] Documentação final
- [ ] Treinamento da equipe

## 6. 💰 ESTIMATIVA DE CUSTOS

### Serviços (Mensal)
- **Railway Backend**: $20/mês (5GB RAM, 2 vCPU)
- **Railway PostgreSQL**: $15/mês (1GB RAM, 1 vCPU)  
- **Railway n8n**: $10/mês (512MB RAM)
- **Vercel Pro**: $20/mês (50GB bandwidth)
- **Domínios**: $12/ano
- **WhatsApp Business API**: $0.005 por mensagem
- **OpenAI API**: ~$50/mês (1000 consultas/dia)

**Total: ~$115/mês**

### Escalabilidade
- ** até 100 usuários**: Plano atual
- ** 100-500 usuários**: +$50/mês (server upgrade)  
- ** 500+ usuários**: +$200/mês (load balancing)

## 7. ✅ CHECKLIST FINAL

### Segurança
- [ ] SSL/HTTPS em todos os domínios
- [ ] Autenticação JWT implementada
- [ ] Validação de entrada em todas as APIs
- [ ] Rate limiting configurado
- [ ] Backup automático do banco

### Performance  
- [ ] CDN configurado no Vercel
- [ ] Compressão gzip habilitada
- [ ] Imagens otimizadas
- [ ] Lazy loading implementado
- [ ] Cache estratégias definidas

### Monitoramento
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (Web Vitals)
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Database monitoring
- [ ] Log aggregation

---

## 🎯 RESULTADO FINAL

Com esta implementação completa, você terá:

✅ **Sistema escalável** para confeitarias profissionais  
✅ **Backend robusto** com Strapi + PostgreSQL  
✅ **Frontend moderno** com Next.js + TypeScript  
✅ **Automação inteligente** com n8n + WhatsApp IA  
✅ **Monitoramento completo** de performance e erros  
✅ **Arquitetura cloud** pronta para escalar  

O DoceGestot será transformado de um MVP localStorage para uma **solução empresarial completa**! 🚀