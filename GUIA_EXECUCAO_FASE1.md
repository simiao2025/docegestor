# GUIA DE EXECUÇÃO - FASE 1 SUPABASE

## 📋 PRÉ-REQUISITOS
- ✅ Supabase Self Hosted instalado
- ✅ n8n Data Tables acessível
- ✅ Script `supabase-setup.sql` criado

## 🚀 PASSO 1: EXECUTAR SCRIPT SQL

### 1.1 Acesse o Painel do Supabase
```
URL: http://seu-ip-supabase:3000
```

**Se não souber o IP, verifique com:**
```bash
# No terminal da sua VPS
docker ps | grep supabase
# ou
docker inspect seu-container-supabase | grep IPAddress
```

### 1.2 Executar o Script SQL
1. Faça login no painel Supabase
2. Vá em **"SQL Editor"** no menu lateral
3. Cole todo o conteúdo do arquivo `supabase-setup.sql`
4. Clique em **"RUN"** para executar

### 1.3 Verificar Execução
Execute esta consulta para verificar se tudo foi criado corretamente:

```sql
-- Verificar se tabela foi criada
SELECT COUNT(*) FROM public.usuarios;

-- Ver se há admin criado (deve ser 0 inicialmente)
SELECT COUNT(*) FROM public.usuarios WHERE tipo_usuario = 'admin';

-- Verificar policies
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- Verificar triggers
SELECT trigger_name, event_manipulation FROM information_schema.triggers 
WHERE event_object_table = 'usuarios';
```

## 📊 PRÓXIMOS PASSOS

### PASSO 2: Configurar Variáveis de Ambiente no Supabase

Acesse **"Settings"** → **"API"** no painel Supabase e anote:

1. **Project URL**: `https://project-id.supabase.co`
2. **API Key (anon)**: `eyJ...` (pública)
3. **API Key (service_role)**: `eyJ...` (privada)

### PASSO 3: Criar Usuário Admin

**IMPORTANTE:** O primeiro usuário registrado automaticamente será admin!

1. Acesse a interface de autenticação do seu app
2. Faça o primeiro registro de usuário
3. Este usuário será o **admin padrão**

### PASSO 4: Verificar n8n Data Tables

Verifique se consegue acessar:
```
URL: https://workflow.eetadnucleopalmas.shop
```

Deve aparecer:
- Menu lateral com **"Data Tables"**
- Opção **"Create new table"**

## 🎯 FASE 1 CONCLUÍDA QUANDO:

- [ ] Script SQL executado sem erros
- [ ] Tabela `usuarios` criada
- [ ] RLS (Row Level Security) ativo
- [ ] Políticas de segurança funcionando
- [ ] Primeiro usuário admin criado
- [ ] Variáveis de ambiente documentadas
- [ ] n8n Data Tables acessível

## ⚠️ POSSÍVEIS PROBLEMAS E SOLUÇÕES

### Erro: "relation auth.users does not exist"
**Solução:** O Supabase Auth precisa estar ativo
```sql
-- Verificar se auth schema existe
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'auth';
```

### Erro: "permission denied for schema auth"
**Solução:** Precisa ser executado pelo service_role

### Erro: "duplicate key value violates unique constraint"
**Solução:** Isso é normal se executar mais de uma vez

### Warning: "extension already exists"
**Solução:** Ignore, as extensões já estão instaladas

## 📝 COMANDOS ÚTEIS

### Verificar Configuração do Supabase
```sql
-- Ver versão do PostgreSQL
SELECT version();

-- Ver configurações ativas
SELECT name, setting FROM pg_settings WHERE name LIKE '%max%';

-- Ver schemas disponíveis
SELECT schema_name FROM information_schema.schemata;
```

### Limpar Dados (se necessário)
```sql
-- CUIDADO: Remove todos os dados
TRUNCATE public.usuarios RESTART IDENTITY CASCADE;
```

## 🔄 CONTINUAÇÃO

Após completar este passo, we'll:
1. **PASSO 5:** Criar tabelas no n8n Data Tables (clientes, receitas, pedidos)
2. **PASSO 6:** Configurar frontend React
3. **PASSO 7:** Integrar autenticação

---

**⏱️ Tempo estimado para FASE 1:** 30 minutos
**📦 Próxima entrega:** Tabelas n8n Data Tables criadas