# 🚀 DoceGestot - Integração com Strapi Existente

## 📋 SITUAÇÃO ATUAL CONFIRMADA

✅ **Strapi v3.6.8** já configurado no easypanel  
✅ **Banco de dados** já configurado  
✅ **Interface admin** funcional  
✅ **APIs REST** já disponíveis  

**SITUAÇÃO ANTERIOR**: Criar backend do zero (2-3 semanas)  
**SITUAÇÃO ATUAL**: Integrar com infraestrutura existente (1-2 dias)

---

## 🎯 PLANO SIMPLIFICADO

### FASE 1: VERIFICAR INFRAESTRUTURA EXISTENTE (1 hora)

#### 1.1 Acessar Strapi Admin

```bash
# No seu easypanel, acesso o Strapi:
URL: https://seu-strapi.easypanel.io/admin
# ou
URL: https://strapi.docegestot.com/admin

# Login com suas credenciais
```

#### 1.2 Verificar Estrutura Atual

```bash
# No Strapi Admin, verificar:

✅ Content Types existentes:
   - [ ] Users (Built-in)
   - [ ] Custom: Usuario, Cliente, Receita, Pedido?
   
✅ Campos disponíveis:
   - API Tokens configurados?
   - Permissions de API configuradas?
   
✅ Database Connection:
   - PostgreSQL/MySQL conectado?
   - Tabelas sendo criadas?
```

#### 1.3 Testar APIs Existentes

```bash
# No browser, testar:
GET https://seu-strapi.easypanel.io/api/usuarios
GET https://seu-strapi.easypanel.io/api/clientes
GET https://seu-strapi.easypanel.io/api/receitas
GET https://seu-strapi.easypanel.io/api/pedidos

# Se retornar 404, não há schemas ainda
# Se retornar [], schemas existem mas sem dados
```

---

### FASE 2: CRIAR SCHEMAS COMPATÍVEIS COM STRAPI v3.6.8 (2 horas)

#### 2.1 Criar Schema Usuário (opcional - usar Strapi built-in)

```javascript
// STRAPI v3.6.8 - Content Type: Usuario
// ./api/usuario/models/usuario.js

'use strict';

module.exports = {
  collectionName: 'usuarios',
  info: {
    name: 'Usuario',
    description: 'Usuários do sistema DoceGestot',
  },
  options: {
    timestamps: true,
  },
  attributes: {
    nome_completo: {
      type: 'string',
      required: true,
    },
    email: {
      type: 'email',
      required: true,
      unique: true,
    },
    telefone: {
      type: 'string',
    },
    tipo_usuario: {
      type: 'enumeration',
      enum: ['confeiteira', 'admin', 'vendedor'],
      default: 'confeiteira',
    },
    // Relação com modelos criados abaixo
  },
};
```

#### 2.2 Criar Schema Cliente

```javascript
// STRAPI v3.6.8 - Content Type: Cliente
// ./api/cliente/models/cliente.js

'use strict';

module.exports = {
  collectionName: 'clientes',
  info: {
    name: 'Cliente',
    description: 'Clientes do sistema DoceGestot',
  },
  options: {
    timestamps: true,
  },
  attributes: {
    nome: {
      type: 'string',
      required: true,
    },
    telefone: {
      type: 'string',
    },
    email: {
      type: 'email',
    },
    observacoes: {
      type: 'text',
    },
    usuario: {
      type: 'relation',
      model: 'usuario',
      via: 'clientes',
    },
    pedidos: {
      type: 'relation',
      model: 'pedido',
      via: 'cliente',
    },
  },
};
```

#### 2.3 Criar Schema Receita

```javascript
// STRAPI v3.6.8 - Content Type: Receita
// ./api/receita/models/receita.js

'use strict';

module.exports = {
  collectionName: 'receitas',
  info: {
    name: 'Receita',
    description: 'Receitas do sistema DoceGestot',
  },
  options: {
    timestamps: true,
  },
  attributes: {
    nome: {
      type: 'string',
      required: true,
    },
    descricao: {
      type: 'text',
    },
    categoria: {
      type: 'enumeration',
      enum: ['bolo', 'doce_fino', 'torta'],
      required: true,
    },
    custo_total: {
      type: 'decimal',
    },
    preco_sugerido: {
      type: 'decimal',
    },
    instrucoes_preparo: {
      type: 'richtext',
    },
    ingredientes: {
      type: 'json',
    },
    usuario: {
      type: 'relation',
      model: 'usuario',
      via: 'receitas',
    },
  },
};
```

#### 2.4 Criar Schema Pedido

```javascript
// STRAPI v3.6.8 - Content Type: Pedido
// ./api/pedido/models/pedido.js

'use strict';

module.exports = {
  collectionName: 'pedidos',
  info: {
    name: 'Pedido',
    description: 'Pedidos do sistema DoceGestot',
  },
  options: {
    timestamps: true,
  },
  attributes: {
    status: {
      type: 'enumeration',
      enum: ['recebido', 'em_producao', 'entregue', 'cancelado'],
      default: 'recebido',
    },
    data_entrega: {
      type: 'date',
      required: true,
    },
    total: {
      type: 'decimal',
    },
    observacoes: {
      type: 'text',
    },
    itens: {
      type: 'json',
    },
    cliente: {
      type: 'relation',
      model: 'cliente',
      via: 'pedidos',
    },
    usuario: {
      type: 'relation',
      model: 'usuario',
      via: 'pedidos',
    },
  },
};
```

#### 2.5 Criar Controllers Básicos

```javascript
// STRAPI v3.6.8 - Controller Usuario
// ./api/usuario/controllers/usuario.js

'use strict';

module.exports = {
  async login(ctx) {
    const { email, senha } = ctx.request.body;
    
    try {
      // Buscar usuário
      const usuario = await strapi.query('usuario').findOne({
        email: email,
      });
      
      if (!usuario) {
        return ctx.badRequest('Usuário não encontrado');
      }
      
      // Verificar senha (se necessário)
      const bcrypt = require('bcryptjs');
      const valid = await bcrypt.compare(senha, usuario.senha);
      
      if (!valid) {
        return ctx.badRequest('Senha incorreta');
      }
      
      // Gerar token JWT
      const jwt = strapi.plugins['users-permissions'].services.jwt.sign({
        id: usuario.id,
        email: usuario.email,
      });
      
      // Remover senha da resposta
      delete usuario.senha;
      
      ctx.send({
        jwt,
        user: usuario,
      });
      
    } catch (error) {
      ctx.throw(500, error);
    }
  },
};
```

---

### FASE 3: MIGRAR DADOS DO LOCALSTORAGE (30 minutos)

#### 3.1 Exportar Dados do MVP

```javascript
// No console do navegador (MVP atual):
const dadosDoceGestot = JSON.parse(localStorage.getItem('docegestot_dados'));

// Criar estrutura para Strapi:
const dadosMigracao = {
  usuarios: [
    {
      nome_completo: "Maria Silva",
      email: "maria@docegestot.com",
      telefone: "(11) 99999-8888",
      tipo_usuario: "confeiteira"
    }
  ],
  clientes: dadosDoceGestot.clientes || [],
  receitas: dadosDoceGestot.receitas || [],
  pedidos: dadosDoceGestot.pedidos || []
};

console.log('DADOS PARA IMPORTAR:', JSON.stringify(dadosMigracao, null, 2));
```

#### 3.2 Importar no Strapi Admin

```bash
# 1. Acesse: https://seu-strapi.easypanel.io/admin
# 2. Vá em: Content Manager → Usuario → Add
# 3. Criar usuário admin
# 4. Criar clientes um por um
# 5. Criar receitas um por um  
# 6. Criar pedidos um por um

# OU usar API diretamente:
POST https://seu-strapi.easypanel.io/api/usuarios
Content-Type: application/json

{
  "nome_completo": "Maria Silva",
  "email": "maria@docegestot.com", 
  "telefone": "(11) 99999-8888",
  "tipo_usuario": "confeiteira"
}
```

---

### FASE 4: CONFIGURAR PERMISSÕES E TOKENS (1 hora)

#### 4.1 Gerar API Token

```bash
# No Strapi Admin:
1. Settings → API Tokens
2. Create new Token
3. Name: "DoceGestot Frontend"
4. Description: "Token para integração frontend"
5. Permissions: Full Access
6. Copy token (usar no frontend)
```

#### 4.2 Configurar Permissions

```bash
# No Strapi Admin:
1. Settings → Users & Permissions → Roles
2. Public:
   - ✅ API Access: Yes
   - ✅ Enable find for all models
3. Authenticated:
   - ✅ Full access para todos os endpoints
```

#### 4.3 Testar APIs

```bash
# Testar endpoints funcionando:
curl -X GET https://seu-strapi.easypanel.io/api/usuarios
curl -X GET https://seu-strapi.easypanel.io/api/clientes  
curl -X GET https://seu-strapi.easypanel.io/api/receitas
curl -X GET https://seu-strapi.easypanel.io/api/pedidos

# Com autenticação:
curl -X GET https://seu-strapi.easypanel.io/api/usuarios \
  -H "Authorization: Bearer [SEU_API_TOKEN]"
```

---

### FASE 5: FRONTEND INTEGRADO (1-2 dias)

#### 5.1 Configurar API Client

```javascript
// ./lib/api.js - Adaptação para Strapi v3.6.8
const API_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://seu-strapi.easypanel.io';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adicionar token se existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Para Strapi v3.6.8 - adaptar resposta
api.interceptors.response.use(
  (response) => {
    // Strapi v3.6.8 retorna { data: [...] }
    return {
      ...response,
      data: response.data.data || response.data
    };
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

#### 5.2 Hooks de Integração

```javascript
// ./hooks/useClientesStrapi.js
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export const useClientesStrapi = () => {
  const { user } = useAuth();

  // Carregar clientes - Strapi v3.6.8 format
  const { data: clientes, isLoading } = useQuery(
    ['clientes'],
    async () => {
      const response = await api.get('/clientes', {
        params: {
          populate: '*',
          'filters[usuario][id][$eq]': user?.id
        }
      });
      
      // Adaptar estrutura do Strapi v3.6.8
      return response.data.map(item => ({
        id: item.id,
        ...item.attributes
      }));
    },
    {
      enabled: !!user?.id
    }
  );

  // Criar cliente - Strapi v3.6.8
  const criarCliente = useMutation(
    async (clienteData) => {
      const response = await api.post('/clientes', {
        data: {
          ...clienteData,
          usuario: user.id // Strapi v3.6.8 relation
        }
      });
      return response.data;
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
    criarCliente: criarCliente.mutate,
    isCreating: criarCliente.isLoading
  };
};
```

---

## 🔧 DIFERENÇAS STRAPI v3.6.8 vs v4+

| Aspecto | Strapi v3.6.8 | Strapi v4+ |
|---------|----------------|------------|
| **URLs** | `/api/modelos` | `/api/modelos?populate=*` |
| **Estrutura** | `data: [{id, attributes}]` | `{ data: [{id, attributes}] }` |
| **Relacionamentos** | `modelo: id` | `modelo: {data: {id}}` |
| **Controllers** | `strapi.query('modelo')` | `strapi.entityService` |
| **Populate** | Params `populate: *` | Query `populate=*` |

---

## ⚡ COMANDOS RESUMIDOS

### **HOJE (4 horas total):**

```bash
# 1. Verificar Strapi (30 min)
# - Acessar: https://seu-strapi.easypanel.io/admin
# - Testar: GET /api/usuarios
# - Criar schemas se não existirem

# 2. Migrar dados (30 min)  
# - Exportar: localStorage.getItem('docegestot_dados')
# - Importar via admin: Cliente por Cliente

# 3. Configurar API (1 hora)
# - Gerar API Token
# - Configurar permissions
# - Testar endpoints

# 4. Criar frontend React (2 horas)
# - npx create-next-app@latest docegestot-frontend --typescript --tailwind --app
# - Implementar integração com Strapi
# - Deploy Vercel
```

---

## 🎯 RESULTADO FINAL

**HOJE após 4h:**
✅ **Backend Strapi**: Integrado e funcionando  
✅ **APIs funcionais**: GET/POST/PUT/DELETE  
✅ **Dados migrados**: localStorage → PostgreSQL  
✅ **Frontend React**: Deployed em Vercel  

**Esta semana:**
✅ **Autenticação JWT**: Implementada  
✅ **Sistema completo**: Funcionando 100%  
✅ **PWA Features**: Mantidas  
✅ **Performance**: Otimizada  

---

## 💰 ECONOMIA DE TEMPO

**Cenário anterior** (criar Strapi do zero):
- ⏱️ **2-3 semanas** de desenvolvimento
- 💰 **$0** (infra já existe)
- 🔧 **Configuração completa** manual

**Cenário atual** (integrar Strapi existente):
- ⏱️ **4 horas** de integração
- 💰 **$0** (sem mudanças)
- ⚡ **Deploy imediato**

**RESULTADO**: Economia de **2 semanas** de trabalho! 🚀