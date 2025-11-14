# 📋 STRAPI v3.6.8 - Schemas Prontos para Copiar

## 🎯 QUICK SETUP (5 minutos)

### 1. CRIAR USUARIO SCHEMA

**Caminho:** `./api/usuario/models/usuario.js`

```javascript
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
    senha: {
      type: 'password',
    },
  },
};
```

### 2. CRIAR CLIENTE SCHEMA

**Caminho:** `./api/cliente/models/cliente.js`

```javascript
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

### 3. CRIAR RECEITA SCHEMA

**Caminho:** `./api/receita/models/receita.js`

```javascript
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

### 4. CRIAR PEDIDO SCHEMA

**Caminho:** `./api/pedido/models/pedido.js`

```javascript
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

### 5. ATUALIZAR USUARIO SCHEMA (com relations)

**Adicionar ao schema do Usuario:**

```javascript
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
    senha: {
      type: 'password',
    },
    // ADICIONAR ESTAS RELATIONS:
    clientes: {
      type: 'relation',
      model: 'cliente',
    },
    receitas: {
      type: 'relation',
      model: 'receita',
    },
    pedidos: {
      type: 'relation',
      model: 'pedido',
    },
  },
};
```

---

## 🔄 MÉTODO DE CRIAÇÃO

### Opção A: Via Interface Admin (Recomendado)

1. **Acesse:** `https://seu-strapi.easypanel.io/admin`
2. **Vá em:** Content Type Builder
3. **Crie cada schema:**
   - Create new Content Type
   - Collection Name: `usuarios`
   - UID: `api::usuario.usuario`
   - Adicione os atributos
   - Save

### Opção B: Via Arquivos

1. **Criar estrutura:**
   ```bash
   cd seu-projeto-strapi
   mkdir -p api/usuario/models
   mkdir -p api/cliente/models
   mkdir -p api/receita/models
   mkdir -p api/pedido/models
   ```

2. **Copiar schemas** (conteúdo acima)

3. **Reiniciar Strapi:**
   ```bash
   npm run develop
   ```

---

## 📊 ESTRUTURA DE DADOS

### Usuário
```
{
  "id": 1,
  "nome_completo": "Maria Silva",
  "email": "maria@docegestot.com",
  "telefone": "(11) 99999-8888",
  "tipo_usuario": "confeiteira",
  "createdAt": "2025-01-14T10:00:00.000Z",
  "updatedAt": "2025-01-14T10:00:00.000Z"
}
```

### Cliente
```
{
  "id": 1,
  "nome": "Ana Paula Santos",
  "telefone": "(11) 99999-1111",
  "email": "ana@email.com",
  "observacoes": "Prefere bolo de chocolate",
  "usuario": 1,  // relation
  "createdAt": "2025-01-14T10:00:00.000Z",
  "updatedAt": "2025-01-14T10:00:00.000Z"
}
```

### Receita
```
{
  "id": 1,
  "nome": "Bolo de Chocolate Premium",
  "descricao": "Bolo molhadinho com chocolate belga",
  "categoria": "bolo",
  "custo_total": 15.50,
  "preco_sugerido": 54.25,
  "instrucoes_preparo": "Bater ovos com açúcar...",
  "ingredientes": [
    { "nome": "Chocolate", "quantidade": 200, "unidade": "g", "custo_unitario": 2.50 }
  ],
  "usuario": 1,  // relation
  "createdAt": "2025-01-14T10:00:00.000Z",
  "updatedAt": "2025-01-14T10:00:00.000Z"
}
```

### Pedido
```
{
  "id": 1,
  "status": "recebido",
  "data_entrega": "2025-01-20",
  "total": 120.00,
  "observacoes": "Entregar no período da manhã",
  "itens": [
    {
      "receita": 1,
      "quantidade": 2,
      "valor_unitario": 54.25,
      "valor_total": 108.50
    }
  ],
  "cliente": 1,  // relation
  "usuario": 1,  // relation
  "createdAt": "2025-01-14T10:00:00.000Z",
  "updatedAt": "2025-01-14T10:00:00.000Z"
}
```

---

## 🔗 APIS DISPONÍVEIS

### Usuários
```
GET    /api/usuarios           # Listar usuários
GET    /api/usuarios/:id       # Usuário específico
POST   /api/usuarios           # Criar usuário
PUT    /api/usuarios/:id       # Atualizar usuário
DELETE /api/usuarios/:id       # Deletar usuário
```

### Clientes
```
GET    /api/clientes                    # Listar clientes
GET    /api/clientes/:id                # Cliente específico
GET    /api/clientes?populate=usuario   # Com relação
POST   /api/clientes                    # Criar cliente
PUT    /api/clientes/:id                # Atualizar cliente
DELETE /api/clientes/:id                # Deletar cliente
```

### Receitas
```
GET    /api/receitas                    # Listar receitas
GET    /api/receitas/:id                # Receita específica
GET    /api/receitas?populate=usuario   # Com relação
POST   /api/receitas                    # Criar receita
PUT    /api/receitas/:id                # Atualizar receita
DELETE /api/receitas/:id                # Deletar receita
```

### Pedidos
```
GET    /api/pedidos                           # Listar pedidos
GET    /api/pedidos/:id                       # Pedido específico
GET    /api/pedidos?populate=cliente,usuario  # Com relações
POST   /api/pedidos                           # Criar pedido
PUT    /api/pedidos/:id                       # Atualizar pedido
DELETE /api/pedidos/:id                       # Deletar pedido
```

---

## 🔧 CONFIGURAÇÕES

### 1. Permissões (Settings → Roles)

**Public Role:**
- ✅ Users-permissions: Authenticated (only if needed)
- ✅ Custom APIs: Find all

**Authenticated Role:**
- ✅ Full access to all endpoints

### 2. API Token (Settings → API Tokens)

1. Create new token
2. Name: "DoceGestot Frontend"
3. Type: Full Access
4. Copy token

---

## ✅ TESTE DE CONEXÃO

```bash
# Testar token
curl -X GET "https://seu-strapi.easypanel.io/api/usuarios" \
  -H "Authorization: Bearer SEU_TOKEN"

# Resposta esperada:
{
  "data": [],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 0,
      "total": 0
    }
  }
}
```

---

## 🚨 TROUBLESHOOTING

**Erro 404 nas APIs:**
```bash
# Verificar se schema foi criado corretamente
# Reiniciar Strapi: npm run develop
```

**Erro de permissão:**
```bash
# Verificar Roles no Admin
# Configurar Public e Authenticated roles
```

**Erro de relação:**
```bash
# Verificar se todos os schemas foram criados
# Ordem de criação: Usuario → Cliente, Receita, Pedido
```

---

**⏱️ Tempo estimado:** 15 minutos para configurar todos os schemas!