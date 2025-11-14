# 🏗️ CRIAR TABELAS NO SUPABASE

## 📋 **O QUE ESTE SCRIPT CRIA**

Este script cria **4 tabelas essenciais** para o DoceGestot:

| Tabela | Campos | Função |
|--------|--------|---------|
| `usuarios` | 8 campos | Perfis de usuários (admin/operador) |
| `clientes` | 10 campos | Clientes e fornecedores |
| `receitas` | 14 campos | Receitas com cálculos de custo |
| `pedidos` | 15 campos | Pedidos com fluxo completo |

---

## 🚀 **EXECUTAR O SCRIPT (5 MINUTOS)**

### **PASSO 1: Acessar Supabase**
1. **Abrir navegador**: `http://seu-ip:3000`
2. **Fazer login** no painel Supabase
3. **Ir em "SQL Editor"** (menu lateral)

### **PASSO 2: Executar Script**
1. **Abrir arquivo**: `tabelas-docegestot.sql`
2. **Copiar todo conteúdo** (239 linhas)
3. **Colar no SQL Editor**
4. **Clicar "RUN"** para executar

### **PASSO 3: Verificar Resultado**
Executar esta consulta no SQL Editor:

```sql
-- Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**✅ DEVE RETORNAR:**
```
clientes
pedidos
receitas
usuarios
```

---

## ✅ **FUNCIONALIDADES AUTOMÁTICAS**

### **🔐 SEGURANÇA RLS**
- **Usuários** veem apenas próprios dados
- **Admin** pode ver tudo (primeiro usuário)
- **Operadores** veem apenas dados próprios

### **👤 PERFIL AUTOMÁTICO**
- **Primeiro usuário** = admin automático
- **Outros usuários** = operador automático
- **Registro simples** = perfil criado

### **📅 TIMESTAMPS**
- **created_at** - data de criação
- **updated_at** - data de atualização (auto)

### **🗃️ NUMERAÇÃO**
- **Pedidos** com numeração automática
- **Formato**: PED-2025-1000, PED-2025-1001, etc.

---

## 📊 **ESTRUTURA DAS TABELAS**

### **USUARIOS** (8 campos)
```sql
- id (UUID, PK) - Referência auth.users
- nome_completo (TEXT) - Nome completo
- email (TEXT, UNIQUE) - Email único
- telefone (TEXT) - Telefone
- tipo_usuario (TEXT) - admin ou operador
- avatar_url (TEXT) - Foto do perfil
- ativo (BOOLEAN) - Usuário ativo
- created_at/updated_at (TIMESTAMP)
```

### **CLIENTES** (10 campos)
```sql
- id (UUID, PK)
- usuario_id (UUID, FK → usuarios)
- nome (TEXT) - Nome do cliente
- telefone (TEXT)
- email (TEXT)
- endereco (TEXT)
- observacoes (TEXT)
- tipo (TEXT) - cliente ou fornecedor
- ativo (BOOLEAN)
- created_at/updated_at
```

### **RECEITAS** (14 campos)
```sql
- id (UUID, PK)
- usuario_id (UUID, FK → usuarios)
- nome (TEXT) - Nome da receita
- descricao (TEXT)
- categoria (TEXT)
- tempo_preparo (INTEGER) - minutos
- temperatura (INTEGER) - Celsius
- custo_total (DECIMAL) - Custo calculado
- preco_sugerido (DECIMAL) - Preço sugerido
- ingredientes (JSONB) - Lista de ingredientes
- modo_preparo (TEXT) - Instruções
- rendimento (TEXT) - Quantas porções
- dificuldade (TEXT) - facil/medio/dificil
- ativo (BOOLEAN)
- created_at/updated_at
```

### **PEDIDOS** (15 campos)
```sql
- id (UUID, PK)
- usuario_id (UUID, FK → usuarios)
- cliente_id (UUID, FK → clientes)
- numero_pedido (TEXT, UNIQUE) - Auto-gerado
- status (TEXT) - pendente→confirmado→producao→pronto→entregue
- data_pedido (TIMESTAMP)
- data_entrega (TIMESTAMP)
- valor_total (DECIMAL)
- custo_total (DECIMAL)
- desconto (DECIMAL)
- observacoes (TEXT)
- itens_pedido (JSONB) - Lista de produtos
- metodo_pagamento (TEXT)
- status_pagamento (TEXT) - pendente/pago/parcial
- created_at/updated_at
```

---

## 🎯 **PRÓXIMOS PASSOS**

### **1. TESTAR CRIAÇÃO**
```sql
-- Inserir dados de teste
INSERT INTO public.clientes (usuario_id, nome, telefone, email) 
VALUES (
    (SELECT id FROM public.usuarios LIMIT 1),
    'Cliente Teste',
    '(11) 99999-9999',
    'cliente@teste.com'
);

-- Verificar se inseriu
SELECT * FROM public.clientes;
```

### **2. CRIAR PRIMEIRO USUÁRIO**
- Acesse sua aplicação
- **Registre primeiro usuário** (será admin automático)
- **Faça login** para testar

### **3. CONFIGURAR FRONTEND**
- Criar projeto React + TypeScript
- Instalar @supabase/supabase-js
- Configurar autenticação
- Implementar CRUD para cada tabela

---

## ⚠️ **SOLUÇÃO DE PROBLEMAS**

### **Erro: "permission denied"**
**Solução:** Verificar se está logado como admin no Supabase

### **Erro: "relation already exists"**
**Solução:** Normal! O script usa `IF NOT EXISTS`

### **Trigger não funcionando**
**Solução:** Registrar usuário na aplicação após executar script

### **Tabela não aparece**
**Solução:** Verificar se executou todo o script

---

## 🎉 **RESULTADO**

Após executar este script, você terá:

✅ **4 tabelas** funcionando no Supabase  
✅ **Relacionamentos** entre tabelas  
✅ **RLS ativo** - segurança básica  
✅ **Triggers** - perfil automático  
✅ **Base completa** para frontend React  

**⏰ Tempo: 5 minutos para base sólida!**

---

**🚀 Com estas tabelas criadas, o DoceGestot terá estrutura completa para desenvolvimento do frontend!**