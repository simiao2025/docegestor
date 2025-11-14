# ⚡ GUIA DE IMPLEMENTAÇÃO - DoceGestot Stack Moderna

## 🎯 **EXECUÇÃO EM 4 FASES**

### **FASE 1: SUPABASE + TABELAS** (2 horas)
### **FASE 2: FRONTEND REACT** (3 horas)  
### **FASE 3: DEPLOY VERGEL** (30 min)
### **FASE 4: AUTOMATIZAÇÃO n8n** (1 hora)

---

## 🏗️ **FASE 1: SUPABASE + TABELAS**

### **PASSO 1: Configurar Supabase na VPS**

```bash
# 1. Acessar VPS
ssh usuario@your-vps-ip

# 2. Navegar para pasta Supabase
cd /path/to/supabase

# 3. Iniciar Supabase (se não estiver rodando)
supabase start

# 4. Verificar status
supabase status

# 5. Acessar Admin
# URL: http://localhost:54323
```

### **PASSO 2: Configurar Auth no Supabase**

**Acesse Supabase Admin: `http://localhost:54323`**

#### **Settings → Authentication → Settings:**
```javascript
{
  "SITE_URL": "http://localhost:3000", // URL local para teste
  "ADDITIONAL_REDIRECT_URLS": [
    "https://workflow.eetadnucleopalmas.shop",
    "http://localhost:3000",
    "http://localhost:54323"
  ],
  "JWT_EXPIRY": 3600,
  "REFRESH_TOKEN_ROTATION_ENABLED": true
}
```

#### **Settings → API:**
- **URL:** `http://localhost:54321`
- **anon key:** `eyJ...` (copie esta chave)
- **service_role key:** `eyJ...` (guarde esta chave)

### **PASSO 3: Criar Tabelas no n8n Data Tables**

**Acesse: `https://workflow.eetadnucleopalmas.shop`**

#### **3.1 Criar Tabela `usuarios`**

1. **Vá em Data Tables**
2. **Clique "Create Table"**
3. **Configurar:**
   - **Name:** `usuarios`
   - **Description:** `Usuários do sistema DoceGestot`

**Adicionar Colunas:**
```sql
id (integer, Primary Key, Auto Increment)
supabase_user_id (uuid, Unique)
nome_completo (string, Required, Max: 100)
email (string, Required, Unique, Max: 255)
telefone (string, Max: 20)
tipo_usuario (enum: ['confeiteira', 'admin', 'vendedor'], Default: 'confeiteira')
ativo (boolean, Default: true)
created_at (timestamp, Default: now())
updated_at (timestamp, Default: now())
```

#### **3.2 Criar Tabela `clientes`**

```sql
id (integer, Primary Key, Auto Increment)
nome (string, Required, Max: 80)
telefone (string, Max: 20)
email (string, Max: 255)
observacoes (text)
usuario_id (integer, Required, Reference: usuarios.id)
created_at (timestamp, Default: now())
updated_at (timestamp, Default: now())
```

#### **3.3 Criar Tabela `receitas`**

```sql
id (integer, Primary Key, Auto Increment)
nome (string, Required, Max: 100)
descricao (text)
categoria (enum: ['bolo', 'doce_fino', 'torta'], Required)
custo_total (decimal, Precision: 2)
preco_sugerido (decimal, Precision: 2)
instrucoes_preparo (rich_text)
ingredientes (json)
usuario_id (integer, Required, Reference: usuarios.id)
created_at (timestamp, Default: now())
updated_at (timestamp, Default: now())
```

#### **3.4 Criar Tabela `pedidos`**

```sql
id (integer, Primary Key, Auto Increment)
status (enum: ['recebido', 'em_producao', 'entregue', 'cancelado'], Default: 'recebido')
data_entrega (date, Required)
total (decimal, Precision: 2)
observacoes (text)
itens (json)
cliente_id (integer, Required, Reference: clientes.id)
usuario_id (integer, Required, Reference: usuarios.id)
created_at (timestamp, Default: now())
updated_at (timestamp, Default: now())
```

### **PASSO 4: Configurar SQL no Supabase**

**Execute no SQL Editor do Supabase:**

```sql
-- Criar schema público
CREATE SCHEMA IF NOT EXISTS public;

-- Configurar RLS para usuarios
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON usuarios
  FOR SELECT USING (auth.uid() = supabase_user_id);

CREATE POLICY "Users can update own profile" ON usuarios
  FOR UPDATE USING (auth.uid() = supabase_user_id);

CREATE POLICY "Authenticated users can create profile" ON usuarios
  FOR INSERT WITH CHECK (auth.uid() = supabase_user_id);

-- Configurar RLS para clientes
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clients" ON clientes
  FOR SELECT USING (auth.uid() = (
    SELECT supabase_user_id FROM usuarios WHERE id = usuario_id
  ));

CREATE POLICY "Users can manage own clients" ON clientes
  FOR ALL USING (auth.uid() = (
    SELECT supabase_user_id FROM usuarios WHERE id = usuario_id
  ));

-- Trigger para criar usuario no registro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.usuarios (supabase_user_id, nome_completo, email, tipo_usuario)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    'confeiteira'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### **PASSO 5: Testar APIs**

```bash
# Testar Supabase
curl -X GET "http://localhost:54321/rest/v1/usuarios" \
  -H "apikey: SEU_ANON_KEY" \
  -H "Authorization: Bearer SEU_ANON_KEY"

# Testar n8n Data Tables
curl -X GET "https://workflow.eetadnucleopalmas.shop/api/rest/tables/usuarios"
```

---

## ⚛️ **FASE 2: FRONTEND REACT**

### **PASSO 1: Criar Projeto Next.js**

```bash
# 1. Criar projeto
npx create-next-app@latest docegestot-frontend --typescript --tailwind --eslint --app --use-npm --yes

# 2. Navegar para pasta
cd docegestot-frontend

# 3. Instalar dependências
npm install @supabase/supabase-js @tanstack/react-query @heroicons/react lucide-react

# 4. Instalar dev tools
npm install -D @types/node
```

### **PASSO 2: Configurar Ambiente**

**Criar `.env.local`:**
```javascript
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...sua_chave_aqui
NEXT_PUBLIC_N8N_URL=https://workflow.eetadnucleopalmas.shop

# Para deploy (Vercel vai sobrescrever)
# NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-domain.com
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...production_key
```

### **PASSO 3: Configurar Supabase Client**

**Criar `lib/supabase.js`:**
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Hook para auth
export const useAuth = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pegar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Escutar mudanças de auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, loading };
};
```

### **PASSO 4: Configurar n8n API Client**

**Criar `lib/n8n.js`:**
```javascript
const n8nBaseUrl = process.env.NEXT_PUBLIC_N8N_URL;

export class N8nApiClient {
  constructor() {
    this.baseUrl = n8nBaseUrl;
    this.token = localStorage.getItem('supabase_session');
  }

  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token?.access_token}`
    };
  }

  // CRUD Operations
  async get(table, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseUrl}/api/rest/tables/${table}?${queryString}`, {
      headers: this.getAuthHeaders()
    });
    return await response.json();
  }

  async post(table, data) {
    const response = await fetch(`${this.baseUrl}/api/rest/tables/${table}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return await response.json();
  }

  async put(table, id, data) {
    const response = await fetch(`${this.baseUrl}/api/rest/tables/${table}/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return await response.json();
  }

  async delete(table, id) {
    const response = await fetch(`${this.baseUrl}/api/rest/tables/${table}/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return await response.json();
  }
}

export const n8nApi = new N8nApiClient();
```

### **PASSO 5: Criar Componentes Principais**

**Criar `components/auth/LoginForm.js`:**
```javascript
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Login realizado com sucesso!');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: '',
          tipo_usuario: 'confeiteira'
        }
      }
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Cadastro realizado com sucesso! Verifique seu email.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">DoceGestot</h2>
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {message && (
          <div className={`p-2 rounded ${message.includes('sucesso') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Carregando...' : 'Entrar'}
        </button>
        
        <button
          type="button"
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          Cadastrar
        </button>
      </form>
    </div>
  );
}
```

**Criar `components/dashboard/Dashboard.js`:**
```javascript
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { n8nApi } from '@/lib/n8n';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [receitas, setReceitas] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pegar usuário atual
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        loadData();
      }
    });
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados das APIs n8n
      const [clientesData, receitasData, pedidosData] = await Promise.all([
        n8nApi.get('clientes'),
        n8nApi.get('receitas'),
        n8nApi.get('pedidos')
      ]);

      setClientes(clientesData);
      setReceitas(receitasData);
      setPedidos(pedidosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">DoceGestot</h1>
        <div>
          <span className="mr-4">Olá, {user?.email}</span>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-500 text-white p-4 rounded">
          <h3 className="text-lg font-semibold">Clientes</h3>
          <p className="text-2xl">{clientes.length}</p>
        </div>
        <div className="bg-green-500 text-white p-4 rounded">
          <h3 className="text-lg font-semibold">Receitas</h3>
          <p className="text-2xl">{receitas.length}</p>
        </div>
        <div className="bg-yellow-500 text-white p-4 rounded">
          <h3 className="text-lg font-semibold">Pedidos</h3>
          <p className="text-2xl">{pedidos.length}</p>
        </div>
        <div className="bg-purple-500 text-white p-4 rounded">
          <h3 className="text-lg font-semibold">Status</h3>
          <p className="text-sm">Ativo</p>
        </div>
      </div>

      {/* Navegação */}
      <div className="flex space-x-4 mb-6">
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Clientes
        </button>
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Receitas
        </button>
        <button className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
          Pedidos
        </button>
      </div>

      {/* Lista de pedidos recentes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Pedidos Recentes</h2>
        {pedidos.length === 0 ? (
          <p className="text-gray-500">Nenhum pedido encontrado.</p>
        ) : (
          <div className="space-y-2">
            {pedidos.slice(0, 5).map((pedido) => (
              <div key={pedido.id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <span className="font-medium">Pedido #{pedido.id}</span>
                  <span className="ml-2 text-gray-500">{pedido.status}</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">R$ {pedido.total}</span>
                  <div className="text-sm text-gray-500">{pedido.data_entrega}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

### **PASSO 6: Configurar App Principal**

**Editar `app/page.js`:**
```javascript
'use client';

import { useAuth } from '@/lib/supabase';
import LoginForm from '@/components/auth/LoginForm';
import Dashboard from '@/components/dashboard/Dashboard';

export default function Home() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {session ? (
        <Dashboard />
      ) : (
        <div className="flex justify-center items-center min-h-screen">
          <LoginForm />
        </div>
      )}
    </div>
  );
}
```

### **PASSO 7: Configurar Tailwind**

**Editar `tailwind.config.js`:**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
    },
  },
  plugins: [],
};
```

### **PASSO 8: Testar Localmente**

```bash
# Executar localmente
npm run dev

# Acessar: http://localhost:3000
# Testar:
# 1. Registro de novo usuário
# 2. Login
# 3. Ver dados do dashboard
# 4. Conectar com n8n APIs
```

---

## 🚀 **FASE 3: DEPLOY VERGEL**

### **PASSO 1: Preparar para Deploy**

**Editar `next.config.js`:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'workflow.eetadnucleopalmas.shop',
      },
    ],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = nextConfig;
```

**Atualizar `.env.local` para produção:**
```javascript
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-domain.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...production_key
NEXT_PUBLIC_N8N_URL=https://workflow.eetadnucleopalmas.shop
```

### **PASSO 2: Deploy no Vercel**

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login no Vercel
vercel login

# 3. Deploy (na pasta do projeto)
vercel --prod

# 4. Configurar variáveis de ambiente no Vercel Dashboard:
# NEXT_PUBLIC_SUPABASE_URL: https://your-supabase-domain.com
# NEXT_PUBLIC_SUPABASE_ANON_KEY: eyJ...production_key
# NEXT_PUBLIC_N8N_URL: https://workflow.eetadnucleopalmas.shop
```

### **PASSO 3: Configurar Domínio**

```bash
# Acessar Vercel Dashboard
# Project → Settings → Domains
# Adicionar domínio personalizado se necessário
```

### **PASSO 4: Teste Final**

```bash
# Acessar: https://docegestot.vercel.app
# Testar:
# 1. Interface carregando
# 2. Autenticação funcionando
# 3. APIs conectando
# 4. Dados aparecendo
```

---

## 🤖 **FASE 4: AUTOMATIZAÇÃO n8n**

### **PASSO 1: Workflow - Notificação de Pedidos**

**Acesse: `https://workflow.eetadnucleopalmas.shop/workflows`**

1. **Criar novo workflow:**
   - **Name:** "Novo Pedido - Notificação"
   - **Trigger:** HTTP Request (POST)

2. **Configurar Trigger:**
```javascript
{
  "method": "POST",
  "path": "/webhook/novo-pedido",
  "responseMode": "responseNode"
}
```

3. **Adicionar nós:**
   - **IF:** `{{$json.total}} > 100`
   - **Send Email:** Admin notification

### **PASSO 2: Workflow - Relatório Mensal**

1. **Criar novo workflow:**
   - **Name:** "Relatório Mensal"
   - **Trigger:** Cron (1º dia do mês às 9h)

2. **Configurar nodes:**
   - **HTTP Request:** Buscar pedidos do mês
   - **Function:** Calcular totais e médias
   - **Send Email:** Enviar relatório para admin

### **PASSO 3: Conectar Frontend com Workflows**

**Criar webhook triggers no frontend:**

```javascript
// services/webhooks.js
export const triggerPedidoWebhook = async (pedidoData) => {
  await fetch('https://workflow.eetadnucleopalmas.shop/webhook/novo-pedido', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('supabase_session')?.access_token}`
    },
    body: JSON.stringify(pedidoData)
  });
};

export const requestRelatorio = async () => {
  await fetch('https://workflow.eetadnucleopalmas.shop/webhook/relatorio-mensal', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('supabase_session')?.access_token}`
    }
  });
};
```

---

## ✅ **CHECKLIST FINAL DE FUNCIONAMENTO**

### **Backend:**
- ✅ Supabase rodando na VPS
- ✅ 4 tabelas criadas no n8n Data Tables
- ✅ RLS configurado no Supabase
- ✅ APIs respondendo com curl

### **Frontend:**
- ✅ Next.js rodando localmente
- ✅ Auth Supabase funcionando
- ✅ APIs n8n conectadas
- ✅ Interface responsiva

### **Deploy:**
- ✅ Deploy no Vercel completo
- ✅ Variáveis de ambiente configuradas
- ✅ Domínio funcionando

### **Automação:**
- ✅ Workflows n8n ativos
- ✅ Webhooks conectados
- ✅ Notificações funcionando

---

## 🎯 **TEMPO TOTAL: 6 HORAS**

**Hora 1-2:** Supabase + Tabelas  
**Hora 3-5:** Frontend React  
**Hora 5.5:** Deploy Vercel  
**Hora 6:** Workflows n8n  

---

## 🏆 **RESULTADO FINAL**

**URLs funcionando:**
- **Frontend:** `https://docegestot.vercel.app`
- **Admin n8n:** `https://workflow.eetadnucleopalmas.shop`
- **Admin Supabase:** `https://your-supabase-domain.com/admin`

**Funcionalidades ativas:**
- 🔐 Auth moderna
- 📊 CRUD completo
- 🤖 IA integrada
- 📱 Interface moderna
- ⚡ Performance otimizada

**Vamos começar a FASE 1?** 🚀