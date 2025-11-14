# Guia de Migração: MVP → Produção

## 📋 Resumo da Migração

**Situação Atual:**
- ✅ Frontend completo (HTML/CSS/JS)
- ✅ Funcionalidades 100% implementadas
- ✅ PWA básico com Service Worker
- ❌ Backend: localStorage apenas
- ❌ Autenticação: simulada
- ❌ Deploy: não configurado

**Objetivo:**
- ✅ Backend: Strapi + PostgreSQL
- ✅ Frontend: React/Next.js
- ✅ Automação: n8n + WhatsApp IA
- ✅ Deploy: Vercel + Railway

## 🔄 PLANO DE MIGRAÇÃO DETALHADO

### FASE 1: BACKEND STRAPI (1-2 semanas)

#### 1.1 Setup Inicial

```bash
# Instalar Strapi
npx create-strapi-app@latest docegestot-backend --quickstart
cd docegestot-backend

# Instalar dependências
npm install @strapi/plugin-i18n @strapi/plugin-users-permissions
npm install pg pg-connection-string bcryptjs

# Gerar content types
npm run strapi generate:content-types
```

#### 1.2 Criar Schemas (baseado no código atual)

**Migração da estrutura localStorage → Strapi:**

```javascript
// ./src/api/usuario/content-types/usuario/schema.json
// MIGRAÇÃO: dados locais → API REST
{
  "collectionName": "usuarios",
  "info": {
    "singularName": "usuario", 
    "pluralName": "usuarios",
    "displayName": "Usuário"
  },
  "attributes": {
    "nome_completo": { "type": "string", "required": true },
    "email": { "type": "email", "required": true, "unique": true },
    "telefone": { "type": "string" },
    "tipo_usuario": { 
      "type": "enumeration",
      "enum": ["confeiteira", "admin", "vendedor"],
      "default": "confeiteira"
    },
    "senha_hash": { "type": "password", "minLength": 6 }
    // Relations serão adicionadas após criar outros schemas
  }
}
```

**Schema Cliente (migração de `clientes: []`):**

```javascript
{
  "collectionName": "clientes",
  "info": { "displayName": "Cliente" },
  "attributes": {
    "nome": { "type": "string", "required": true },
    "telefone": { "type": "string" },
    "email": { "type": "email" },
    "observacoes": { "type": "text" },
    "usuario_dono": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::usuario.usuario",
      "inversedBy": "clientes"
    }
  }
}
```

**Schema Receita (migração de `receitas: []`):**

```javascript
{
  "collectionName": "receitas", 
  "info": { "displayName": "Receita" },
  "attributes": {
    "nome": { "type": "string", "required": true },
    "descricao": { "type": "text" },
    "categoria": {
      "type": "enumeration",
      "enum": ["bolo", "doce_fino", "torta"],
      "required": true
    },
    "custo_total": { "type": "decimal", "default": 0 },
    "preco_sugerido": { "type": "decimal", "default": 0 },
    "instrucoes_preparo": { "type": "richtext" },
    "ingredientes": { 
      "type": "json",
      "comment": "Array de ingredientes com nome, quantidade, unidade, custo_unitario"
    },
    "usuario_dono": {
      "type": "relation",
      "relation": "manyToOne", 
      "target": "api::usuario.usuario"
    }
  }
}
```

**Schema Pedido (migração de `pedidos: []`):**

```javascript
{
  "collectionName": "pedidos",
  "info": { "displayName": "Pedido" },
  "attributes": {
    "status": {
      "type": "enumeration",
      "enum": ["recebido", "em_producao", "entregue", "cancelado"],
      "default": "recebido"
    },
    "data_entrega": { "type": "date", "required": true },
    "total": { "type": "decimal", "default": 0 },
    "observacoes": { "type": "text" },
    "itens": {
      "type": "json",
      "comment": "Array de itens: {receita, quantidade, valor_unitario, valor_total}"
    },
    "cliente": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::cliente.cliente"
    },
    "usuario_dono": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::usuario.usuario"
    }
  }
}
```

#### 1.3 Controller de Autenticação (substituir login simulado)

**Migração da função `fazerLogin()` atual:**

```javascript
// ./src/api/usuario/controllers/usuario.js
module.exports = {
  async login(ctx) {
    const { email, senha } = ctx.request.body;
    
    // Migrar de: this.fazerLogin({ nome: "Maria Silva", tipo_usuario: "confeiteira" })
    try {
      const user = await strapi.entityService.findMany('api::usuario.usuario', {
        filters: { email },
      });
      
      if (!user[0] || !await bcrypt.compare(senha, user[0].senha_hash)) {
        return ctx.unauthorized('Credenciais inválidas');
      }
      
      // Gerar JWT (substitui sessão localStorage)
      const jwt = strapi.plugins['users-permissions'].services.jwt.sign({
        id: user[0].id,
        email: user[0].email
      });
      
      const userData = user[0];
      delete userData.senha_hash;
      
      ctx.send({
        jwt,
        user: userData
      });
      
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async me(ctx) {
    // Substitui: this.usuarioAtual = userData
    if (!ctx.state.user) {
      return ctx.unauthorized();
    }
    
    const user = await strapi.entityService.findOne('api::usuario.usuario', ctx.state.user.id);
    delete user.senha_hash;
    
    return user;
  }
};
```

#### 1.4 Migrar Dados Existentes

**Script de migração do localStorage:**

```javascript
// ./scripts/migrate-localstorage.js
const fs = require('fs');

// Executar no console do navegador (localStorage → JSON)
console.log('Dados para migração:', JSON.stringify({
  clientes: JSON.parse(localStorage.getItem('docegestot_dados'))?.clientes || [],
  receitas: JSON.parse(localStorage.getItem('docegestot_dados'))?.receitas || [],
  pedidos: JSON.parse(localStorage.getItem('docegestot_dados'))?.pedidos || []
}, null, 2));
```

**Importar dados no Strapi Admin Panel:**
1. Acesse `/admin` do Strapi
2. Vá em Content Manager
3. Importe os dados via CSV ou create one by one
4. Verificar se relacionamentos estão corretos

#### 1.5 Deploy Backend (Railway)

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login e setup
railway login
railway init

# Adicionar PostgreSQL
railway add postgresql

# Configurar variáveis
railway variables set APP_KEYS=key1,key2,key3,key4
railway variables set API_TOKEN_SALT=salt123
railway variables set ADMIN_JWT_SECRET=secret123
railway variables set JWT_SECRET=secret123
railway variables set DATABASE_PASSWORD=postgres123
railway variables set PUBLIC_URL=https://api-docegestot-production.up.railway.app

# Deploy
railway up
```

**Resultado Fase 1:**
✅ Backend funcional em `https://api-docegestot-production.up.railway.app`  
✅ APIs REST para todos os endpoints  
✅ Dados migrados do localStorage  
✅ Autenticação JWT real  
✅ Banco PostgreSQL configurado  

### FASE 2: FRONTEND REACT (2-3 semanas)

#### 2.1 Migrar HTML/CSS/JS → React/Next.js

**Mapeamento dos componentes atuais:**

```javascript
// COMO O SISTEMA ATUAL ESTÁ ESTRUTURADO:
HTML: 
├── <nav class="sidebar"> → Sidebar.jsx
├── <div id="dashboard-page"> → Dashboard.jsx  
├── <div id="pedidos-page"> → PedidosManager.jsx
├── <div id="receitas-page"> → ReceitasManager.jsx
├── <div id="clientes-page"> → ClientesManager.jsx
└── modais → Modals.jsx

CSS:
├── .btn-primary → Tailwind Button
├── .card → Tailwind Card  
├── .modal → Tailwind Modal
└── responsividade → Tailwind responsive

JS:
├── class DoceGestot → React hooks + useContext
├── dados locais → APIs Strapi
├── this.dados → useState/useQuery
└── this.salvarDados() → API calls
```

#### 2.2 Criar Projeto Next.js

```bash
# Criar projeto com stack completa
npx create-next-app@latest docegestot-frontend --typescript --tailwind --eslint --app

# Instalar dependências específicas
npm install axios jwt-decode @tanstack/react-query @tanstack/react-query-devtools
npm install @heroicons/react react-hook-form @hookform/resolvers yup
npm install date-fns lucide-react
npm install @types/bcryptjs bcryptjs

# Estrutura de pastas
mkdir -p components/{Dashboard,Pedidos,Receitas,Clientes,Auth,Layout}
mkdir -p hooks lib contexts pages/api utils
```

#### 2.3 Context de Autenticação (substituir usuário simulado)

**Migração de `this.usuarioAtual` atual:**

```javascript
// ./contexts/AuthContext.jsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Substituir: this.fazerLogin({ nome: "Maria Silva", tipo_usuario: "confeiteira" })
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

  // Verificar autenticação ao carregar
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const payload = jwt_decode(token);
        api.get('/api/usuario/me')
          .then(response => {
            setUser(response.data);
            setIsAuthenticated(true);
          })
          .catch(() => {
            localStorage.removeItem('auth_token');
            setIsAuthenticated(false);
          })
          .finally(() => setLoading(false));
      } catch {
        localStorage.removeItem('auth_token');
        setLoading(false);
      }
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
```

#### 2.4 Migrar Gestão de Dados

**Hook para clientes (substituir `this.dados.clientes`):**

```javascript
// ./hooks/useClientes.js
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export const useClientes = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Carregar clientes (substitui: this.dados.clientes = [])
  const { data: clientes, isLoading, error } = useQuery(
    ['clientes', user?.id],
    async () => {
      const response = await api.get('/api/clientes', {
        params: {
          'filters[usuario_dono][id][$eq]': user?.id,
          'populate': '*'
        }
      });
      return response.data.data.map(item => ({
        id: item.id,
        ...item.attributes
      }));
    },
    {
      enabled: !!user?.id
    }
  );

  // Criar cliente (substitui: this.dados.clientes.push(cliente))
  const criarCliente = useMutation(
    async (clienteData) => {
      const response = await api.post('/api/clientes', {
        data: {
          ...clienteData,
          usuario_dono: user.id
        }
      });
      return response.data.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['clientes']);
      }
    }
  );

  // Editar cliente
  const editarCliente = useMutation(
    async ({ id, ...clienteData }) => {
      const response = await api.put(`/api/clientes/${id}`, {
        data: clienteData
      });
      return response.data.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['clientes']);
      }
    }
  );

  // Excluir cliente
  const excluirCliente = useMutation(
    async (clienteId) => {
      await api.delete(`/api/clientes/${clienteId}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['clientes']);
      }
    }
  );

  return {
    clientes: clientes || [],
    isLoading,
    error,
    criarCliente: criarCliente.mutate,
    editarCliente: editarCliente.mutate,
    excluirCliente: excluirCliente.mutate,
    isCreating: criarCliente.isLoading,
    isUpdating: editarCliente.isLoading,
    isDeleting: excluirCliente.isLoading
  };
};
```

#### 2.5 Migrar Dashboard (substituir `this.atualizarDashboard()`)

```javascript
// ./components/Dashboard/Dashboard.jsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../Layout/Card';
import { CalendarIcon, UsersIcon, ShoppingBagIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { user } = useAuth();

  // Migrar métricas do dashboard atual
  const { data: metricas, isLoading } = useQuery(
    ['dashboard-metrics', user?.id],
    async () => {
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

      // Buscar pedidos do mês
      const pedidosResponse = await api.get('/api/pedidos', {
        params: {
          'filters[usuario_dono][id][$eq]': user?.id,
          'filters[data_entrega][$gte]': inicioMes.toISOString().split('T')[0],
          'filters[data_entrega][$lte]': fimMes.toISOString().split('T')[0]
        }
      });

      const pedidos = pedidosResponse.data.data.map(p => ({
        id: p.id,
        ...p.attributes
      }));

      // Calcular métricas (como no código atual)
      const pedidosMes = pedidos.length;
      const pedidosPendentes = pedidos.filter(p => 
        ['recebido', 'em_producao'].includes(p.status)
      ).length;
      const receitaMes = pedidos.reduce((total, p) => total + parseFloat(p.total || 0), 0);

      return {
        pedidosMes,
        pedidosPendentes, 
        receitaMes,
        totalClientes: 0 // Buscar separadamente se necessário
      };
    },
    {
      enabled: !!user?.id,
      refetchInterval: 30000 // Atualizar a cada 30s como no MVP
    }
  );

  if (isLoading) {
    return <div className="p-6">Carregando dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Olá, {user?.nome_completo}! 👋
        </h1>
        <p className="text-gray-600">Aqui está o resumo do seu negócio hoje.</p>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <ShoppingBagIcon className="w-8 h-8 text-pink-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pedidos do Mês</p>
              <p className="text-2xl font-bold text-gray-900">
                {metricas?.pedidosMes || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <CalendarIcon className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">
                {metricas?.pedidosPendentes || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <CurrencyDollarIcon className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Receita Mensal</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {metricas?.receitaMes?.toFixed(2) || '0,00'}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <UsersIcon className="w-8 h-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Clientes</p>
              <p className="text-2xl font-bold text-gray-900">
                {metricas?.totalClientes || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
```

#### 2.6 Deploy Frontend (Vercel)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login e deploy
vercel login
vercel --prod

# Configurar variáveis de ambiente no Vercel Dashboard:
# NEXT_PUBLIC_API_URL=https://api-docegestot-production.up.railway.app
```

**Resultado Fase 2:**
✅ Frontend React/Next.js funcional  
✅ APIs integradas com Strapi  
✅ Autenticação JWT implementada  
✅ Deploy em `https://docegestot-frontend.vercel.app`  
✅ Performance otimizada com React Query  

### FASE 3: AUTOMATIZAÇÃO N8N (1-2 semanas)

#### 3.1 Setup n8n

```bash
# Deploy via Railway (mais simples que Docker local)
railway login
railway init
railway add postgresql

# Adicionar container n8n
echo 'version: "3.7"
services:
  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=senha123
      - N8N_HOST=docegestot-n8n.up.railway.app
      - WEBHOOK_URL=https://docegestot-n8n.up.railway.app/
    volumes:
      - n8n_data:/home/node/.n8n
    restart: unless-stopped

volumes:
  n8n_data:' > docker-compose.yml

railway up
```

#### 3.2 Workflows Automatizados

**Webhook para Status Updates:**

```javascript
// Configurar no Strapi (afterUpdate hook)
./src/api/pedido/content-types/pedido/lifecycles.js

module.exports = {
  async afterUpdate(event) {
    const { result, params } = event;
    
    // Disparar webhook para n8n quando status muda
    if (params.data.status) {
      await strapi.service('api::webhook.webhook').sendStatusUpdate({
        pedido_id: result.id,
        status_anterior: params.data.status_anterior,
        status_novo: result.status,
        cliente_id: result.cliente,
        telefone_cliente: '5511999999999', // Buscar do cliente
        data_entrega: result.data_entrega,
        total: result.total
      });
    }
  }
};
```

**Workflow WhatsApp no n8n:**

1. **Acessar n8n Editor:** `https://docegestot-n8n.up.railway.app`
2. **Criar workflow:** "WhatsApp Notifications"
3. **Nó 1 - Webhook:** 
   - Path: `pedido-status-update`
   - Method: POST
4. **Nó 2 - Condition:**
   - Check: `status_novo === "entregue"`
5. **Nó 3 - WhatsApp:**
   - Phone: `telefone_cliente`
   - Message: `🍰 Pedido entregue! Pedido #${pedido_id} - Total: R$ ${total}`

#### 3.3 Deploy Automação

```bash
# URL do n8n deployment
https://docegestot-n8n.up.railway.app

# Webhook principal:
https://docegestot-n8n.up.railway.app/webhook/pedido-status-update
```

**Resultado Fase 3:**
✅ n8n deployado e funcionando  
✅ Webhooks configurados  
✅ WhatsApp Business API integrada  
✅ Workflows de automação ativos  

### FASE 4: CONFIGURAÇÃO FINAL (1 semana)

#### 4.1 Domínios e SSL

```bash
# Configurar domínios no Railway:
API Backend: api.docegestot.com → Railway domain
n8n Automação: automacao.docegestot.com → Railway domain

# Configurar no Vercel:
Frontend: app.docegestot.com → Vercel domain

# SSL automático via Let's Encrypt (Railway + Vercel)
```

#### 4.2 Testes Finais

**Checklist de Testes:**

```bash
# 1. Autenticação
- [ ] Login com credenciais reais
- [ ] Logout funciona
- [ ] JWT token válido
- [ ] Redirecionamento correto

# 2. CRUD Operações
- [ ] Criar cliente → aparece na lista
- [ ] Editar cliente → dados atualizados
- [ ] Excluir cliente → removido da lista
- [ ] Criar pedido → vinculado ao cliente
- [ ] Alterar status → webhook dispara

# 3. Integrações
- [ ] WhatsApp receives notification
- [ ] n8n workflow triggers
- [ ] Database saves all changes
- [ ] Frontend shows real-time updates

# 4. Performance
- [ ] Page load < 3s
- [ ] API response < 500ms
- [ ] Mobile responsive
- [ ] PWA installable
```

## 📊 COMPARAÇÃO: ANTES vs DEPOIS

| Aspecto | MVP Atual | Produção Final |
|---------|-----------|----------------|
| **Backend** | localStorage | Strapi + PostgreSQL |
| **Frontend** | HTML/CSS/JS | React + Next.js |
| **Autenticação** | Simulado | JWT real |
| **Dados** | Navegador | Banco PostgreSQL |
| **Deploy** | Local apenas | Cloud (Railway + Vercel) |
| **Automação** | Nenhuma | WhatsApp + IA |
| **Escalabilidade** | 1 usuário | 1000+ usuários |
| **Confiabilidade** | Baixa | Alta (99.9%) |
| **Backup** | Manual | Automático |
| **Monitoramento** | Console | Métricas + Logs |

## 🎯 RESULTADO FINAL

Após a migração completa, você terá:

✅ **Sistema Empresarial** com arquitetura moderna  
✅ **Backend Robusto** com APIs REST completas  
✅ **Frontend Responsivo** com React e TypeScript  
✅ **Automação Inteligente** com WhatsApp IA  
✅ **Deploy Cloud** com alta disponibilidade  
✅ **Escalabilidade** para crescimento futuro  

**Tempo Total de Migração:** 5-6 semanas  
**Investimento:** ~$115/mês em infraestrutura  
**ROI:** Sistema profissional para múltiplos usuários e integrações  

🚀 **DoceGestot estará pronto para competir no mercado!**