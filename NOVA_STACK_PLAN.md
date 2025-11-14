# 🚀 PLANO COMPLETO - DoceGestot Stack Moderna

## 🎯 **ARQUITETURA FINAL**

### **Frontend:** React/Next.js → Vercel
### **Backend:** Supabase Self Hosted (Auth) + n8n Data Tables (Database)
### **IA:** n8n workflows
### **URLs:**
- **Frontend:** `https://docegestot.vercel.app`
- **n8n:** `https://workflow.eetadnucleopalmas.shop`
- **Supabase:** `https://your-supabase-domain.com`

---

## 📋 **ESTRUTURA DAS TABELAS - n8n Data Tables**

### **TABELA 1: usuarios**

**Configuração:**
```json
{
  "name": "usuarios",
  "description": "Usuários do sistema DoceGestot",
  "columns": [
    {
      "name": "id",
      "type": "integer",
      "primary_key": true,
      "auto_increment": true
    },
    {
      "name": "supabase_user_id", 
      "type": "uuid",
      "reference": "auth.users.id"
    },
    {
      "name": "nome_completo",
      "type": "string",
      "required": true,
      "max_length": 100
    },
    {
      "name": "email", 
      "type": "string",
      "required": true,
      "unique": true
    },
    {
      "name": "telefone",
      "type": "string", 
      "max_length": 20
    },
    {
      "name": "tipo_usuario",
      "type": "enum",
      "values": ["confeiteira", "admin", "vendedor"],
      "default": "confeiteira"
    },
    {
      "name": "ativo",
      "type": "boolean",
      "default": true
    },
    {
      "name": "created_at",
      "type": "timestamp",
      "default": "now()"
    },
    {
      "name": "updated_at",
      "type": "timestamp",
      "default": "now()"
    }
  ],
  "relations": [
    {
      "type": "hasMany",
      "target": "clientes"
    },
    {
      "type": "hasMany", 
      "target": "receitas"
    },
    {
      "type": "hasMany",
      "target": "pedidos"
    }
  ]
}
```

### **TABELA 2: clientes**

**Configuração:**
```json
{
  "name": "clientes",
  "description": "Clientes do sistema DoceGestot",
  "columns": [
    {
      "name": "id",
      "type": "integer", 
      "primary_key": true,
      "auto_increment": true
    },
    {
      "name": "nome",
      "type": "string",
      "required": true,
      "max_length": 80
    },
    {
      "name": "telefone",
      "type": "string",
      "max_length": 20
    },
    {
      "name": "email",
      "type": "string"
    },
    {
      "name": "observacoes",
      "type": "text"
    },
    {
      "name": "usuario_id",
      "type": "integer",
      "required": true,
      "reference": "usuarios.id"
    },
    {
      "name": "created_at",
      "type": "timestamp",
      "default": "now()"
    },
    {
      "name": "updated_at", 
      "type": "timestamp",
      "default": "now()"
    }
  ],
  "relations": [
    {
      "type": "belongsTo",
      "target": "usuarios"
    },
    {
      "type": "hasMany",
      "target": "pedidos"
    }
  ]
}
```

### **TABELA 3: receitas**

**Configuração:**
```json
{
  "name": "receitas",
  "description": "Receitas do sistema DoceGestot",
  "columns": [
    {
      "name": "id",
      "type": "integer",
      "primary_key": true,
      "auto_increment": true
    },
    {
      "name": "nome",
      "type": "string",
      "required": true,
      "max_length": 100
    },
    {
      "name": "descricao",
      "type": "text"
    },
    {
      "name": "categoria",
      "type": "enum",
      "values": ["bolo", "doce_fino", "torta"],
      "required": true
    },
    {
      "name": "custo_total",
      "type": "decimal",
      "precision": 2
    },
    {
      "name": "preco_sugerido",
      "type": "decimal", 
      "precision": 2
    },
    {
      "name": "instrucoes_preparo",
      "type": "rich_text"
    },
    {
      "name": "ingredientes",
      "type": "json"
    },
    {
      "name": "usuario_id",
      "type": "integer",
      "required": true,
      "reference": "usuarios.id"
    },
    {
      "name": "created_at",
      "type": "timestamp",
      "default": "now()"
    },
    {
      "name": "updated_at",
      "type": "timestamp", 
      "default": "now()"
    }
  ],
  "relations": [
    {
      "type": "belongsTo",
      "target": "usuarios"
    }
  ]
}
```

### **TABELA 4: pedidos**

**Configuração:**
```json
{
  "name": "pedidos",
  "description": "Pedidos do sistema DoceGestot",
  "columns": [
    {
      "name": "id",
      "type": "integer",
      "primary_key": true,
      "auto_increment": true
    },
    {
      "name": "status",
      "type": "enum",
      "values": ["recebido", "em_producao", "entregue", "cancelado"],
      "default": "recebido"
    },
    {
      "name": "data_entrega",
      "type": "date",
      "required": true
    },
    {
      "name": "total",
      "type": "decimal",
      "precision": 2
    },
    {
      "name": "observacoes",
      "type": "text"
    },
    {
      "name": "itens",
      "type": "json"
    },
    {
      "name": "cliente_id",
      "type": "integer",
      "required": true,
      "reference": "clientes.id"
    },
    {
      "name": "usuario_id", 
      "type": "integer",
      "required": true,
      "reference": "usuarios.id"
    },
    {
      "name": "created_at",
      "type": "timestamp",
      "default": "now()"
    },
    {
      "name": "updated_at",
      "type": "timestamp",
      "default": "now()"
    }
  ],
  "relations": [
    {
      "type": "belongsTo",
      "target": "clientes"
    },
    {
      "type": "belongsTo",
      "target": "usuarios"
    }
  ]
}
```

---

## 🔐 **CONFIGURAÇÃO SUPABASE - Autenticação**

### **1. Configurar Auth**

**Settings → Authentication → Settings:**
```javascript
{
  "SITE_URL": "https://docegestot.vercel.app",
  "ADDITIONAL_REDIRECT_URLS": [
    "https://workflow.eetadnucleopalmas.shop",
    "https://your-supabase-domain.com"
  ],
  "JWT_EXPIRY": 3600,
  "REFRESH_TOKEN_ROTATION_ENABLED": true,
  "SECURE_PASSWORD_CHANGE_ENABLED": true
}
```

### **2. Configurar RLS (Row Level Security)**

**Tabela usuarios:**
```sql
-- Políticas RLS para usuarios
CREATE POLICY "Users can view own profile" ON usuarios
  FOR SELECT USING (auth.uid() = supabase_user_id);

CREATE POLICY "Users can update own profile" ON usuarios  
  FOR UPDATE USING (auth.uid() = supabase_user_id);

CREATE POLICY "Authenticated users can create profile" ON usuarios
  FOR INSERT WITH CHECK (auth.uid() = supabase_user_id);
```

**Tabela clientes:**
```sql
-- Políticas RLS para clientes
CREATE POLICY "Users can view own clients" ON clientes
  FOR SELECT USING (auth.uid() = (SELECT supabase_user_id FROM usuarios WHERE id = usuario_id));

CREATE POLICY "Users can manage own clients" ON clientes
  FOR ALL USING (auth.uid() = (SELECT supabase_user_id FROM usuarios WHERE id = usuario_id));
```

### **3. Configurar Triggers**

```sql
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

---

## ⚛️ **FRONTEND REACT - Configuração**

### **1. Dependencies**

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.0.0",
    "@tanstack/react-query": "^4.0.0",
    "@heroicons/react": "^2.0.0",
    "react-hook-form": "^7.0.0",
    "@hookform/resolvers": "^3.0.0",
    "yup": "^1.0.0",
    "react-router-dom": "^6.0.0",
    "tailwindcss": "^3.0.0",
    "lucide-react": "^0.0.0"
  }
}
```

### **2. Estrutura de Pastas**

```
docegestot-frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   ├── clientes/
│   │   ├── receitas/
│   │   └── pedidos/
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useSupabase.js
│   │   └── useApi.js
│   ├── services/
│   │   ├── supabase.js
│   │   └── api.js
│   └── utils/
└── public/
```

---

## 🔗 **INTEGRAÇÃO COM n8n Data Tables**

### **1. Conector n8n Data Tables**

```javascript
// n8nApi.js
import { createClient } from '@supabase/supabase-js';

const n8nClient = {
  baseUrl: 'https://workflow.eetadnucleopalmas.shop',
  
  // CRUD Users (via Supabase Auth)
  async createUser(userData) {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.nome_completo,
          telefone: userData.telefone,
          tipo_usuario: userData.tipo_usuario
        }
      }
    });
    return { data, error };
  },

  // CRUD via n8n Data Tables
  async get(table, filters = {}) {
    const response = await fetch(`${this.baseUrl}/api/rest/tables/${table}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`,
        'Content-Type': 'application/json'
      }
    });
    return await response.json();
  },

  async post(table, data) {
    const response = await fetch(`${this.baseUrl}/api/rest/tables/${table}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  },

  async put(table, id, data) {
    const response = await fetch(`${this.baseUrl}/api/rest/tables/${table}/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  },

  async delete(table, id) {
    const response = await fetch(`${this.baseUrl}/api/rest/tables/${table}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`
      }
    });
    return await response.json();
  }
};

export default n8nClient;
```

---

## 🤖 **WORKFLOWS n8n - Automação**

### **1. Workflow: Novo Pedido → Notificação**

```javascript
// n8n Workflow Configuration
{
  "name": "Novo Pedido - Notificação",
  "nodes": [
    {
      "type": "HTTP Request",
      "parameters": {
        "method": "POST",
        "url": "https://your-supabase-domain.com/rest/v1/pedidos",
        "authentication": "predefinedCredentialType",
        "predefinedCredentialType": "httpHeaderAuth"
      }
    },
    {
      "type": "IF",
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{$json.total}}",
              "operation": "larger",
              "value2": 100
            }
          ]
        }
      }
    },
    {
      "type": "Send Email",
      "parameters": {
        "to": "admin@docegestot.com",
        "subject": "Pedido Grande Recebido",
        "body": "Novo pedido de {{$json.cliente.nome}} no valor de R$ {{$json.total}}"
      }
    }
  ]
}
```

### **2. Workflow: Análise de Performance**

```javascript
{
  "name": "Análise Mensal",
  "nodes": [
    {
      "type": "Cron",
      "parameters": {
        "rule": {
          "interval": [{"field": "cronExpression", "valueExpression": "0 9 1 * *"}]
        }
      }
    },
    {
      "type": "HTTP Request",
      "parameters": {
        "method": "GET",
        "url": "https://workflow.eetadnucleopalmas.shop/api/rest/tables/pedidos"
      }
    },
    {
      "type": "Function",
      "parameters": {
        "functionCode": `
          const pedidos = $input.all();
          const total = pedidos.reduce((sum, pedido) => sum + parseFloat(pedido.total), 0);
          const media = total / pedidos.length;
          
          return [{
            mes: new Date().toISOString().substring(0, 7),
            total_pedidos: pedidos.length,
            valor_total: total,
            valor_medio: media
          }];
        `
      }
    }
  ]
}
```

---

## 🚀 **DEPLOY E CONFIGURAÇÃO FINAL**

### **1. Deploy Frontend (Vercel)**

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Configurar variáveis de ambiente no Vercel:
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-domain.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_N8N_URL=https://workflow.eetadnucleopalmas.shop
```

### **2. Configurar DNS**

```
# Apontar para Vercel:
A    docegestot.vercel.app    76.76.19.61

# SSL automático configurado
```

---

## ✅ **CHECKLIST FINAL**

### **Fase 1: Backend (2 horas)**
- ✅ Configurar Supabase Auth
- ✅ Criar tabelas no n8n Data Tables
- ✅ Configurar RLS e triggers
- ✅ Testar APIs com curl

### **Fase 2: Frontend (3 horas)**
- ✅ Criar projeto Next.js
- ✅ Implementar auth com Supabase
- ✅ Conectar APIs do n8n
- ✅ Criar componentes do DoceGestot

### **Fase 3: Deploy (30 min)**
- ✅ Deploy no Vercel
- ✅ Configurar variáveis de ambiente
- ✅ Teste end-to-end

### **Fase 4: Automação (1 hora)**
- ✅ Workflows n8n para notificações
- ✅ Relatórios automáticos
- ✅ Análise de performance

---

## 🎯 **RESULTADO FINAL**

### **URLs Funcionando:**
- **Frontend:** `https://docegestot.vercel.app`
- **Admin n8n:** `https://workflow.eetadnucleopalmas.shop`
- **Supabase Admin:** `https://your-supabase-domain.com/admin`

### **Funcionalidades:**
- 🔐 **Auth moderna** (email + social)
- 📊 **Interface visual** para dados (n8n Data Tables)
- 🤖 **IA integrada** (n8n workflows)
- 📱 **Responsive** (React + Tailwind)
- ⚡ **Performance** (Vercel Edge)
- 🔒 **Segurança** (Row Level Security)

---

## 💰 **CUSTOS**

- **Vercel:** $0 (Hobby plan)
- **n8n:** Já instalado
- **Supabase:** $0 (Self hosted)
- **VPS:** Já existente

**Total:** $0/mês adicional!

---

## 🏆 **PRÓXIMOS PASSOS**

1. **Configurar Supabase** na VPS
2. **Criar tabelas** no n8n Data Tables  
3. **Criar frontend** React
4. **Deploy** tudo
5. **Testar** integração completa

**Tempo estimado total: 6 horas** ⏱️