# 📋 EXECUTAR FASE 1 - SUPABASE + n8n DATA TABLES

## 🎯 OBJETIVO
Configurar autenticação no Supabase Self Hosted e criar 4 tabelas no n8n Data Tables para o DoceGestot.

---

## 📁 ARQUIVOS CRIADOS

### 1. **supabase-setup.sql** 
- Script completo para configurar autenticação Supabase
- Cria tabela `usuarios` com RLS (Row Level Security)
- Configura políticas de segurança
- Implementa triggers automáticos
- **Executar primeiro!**

### 2. **GUIA_EXECUCAO_FASE1.md**
- Passo a passo detalhado para executar o script
- Solução para problemas comuns
- Verificações de sucesso
- **Seguir este guia!**

### 3. **n8n-tabelas-setup.sql**
- Especificações para 3 tabelas adicionais
- Estrutura: `clientes`, `receitas`, `pedidos`
- Relacionamentos entre tabelas
- **Executar via interface n8n**

---

## 🚀 COMO EXECUTAR (25 minutos)

### PASSO 1: Configurar Supabase (10 min)
1. **Acesse o painel Supabase**: `http://seu-ip:3000`
2. **Vá em "SQL Editor"**
3. **Execute o `supabase-setup.sql`**
4. **Verifique se executou sem erros**

### PASSO 2: Criar Usuário Admin (2 min)
1. **Acesse sua aplicação** (onde quer fazer login)
2. **Registre o primeiro usuário** (será automaticamente admin)
3. **Confirme que funciona**

### PASSO 3: Configurar n8n Data Tables (13 min)
1. **Acesse**: https://workflow.eetadnucleopalmas.shop
2. **Vá em "Data Tables"**
3. **Crie 3 tabelas conforme especificações**:
   - **Tabela 1: clientes** (11 campos)
   - **Tabela 2: receitas** (17 campos)  
   - **Tabela 3: pedidos** (17 campos)
4. **Use nomes de campos EXATOS** do arquivo `n8n-tabelas-setup.sql`

---

## ✅ CRITÉRIOS DE SUCESSO

### Supabase Configurado:
- [ ] Script SQL executado sem erros
- [ ] Tabela `usuarios` existe
- [ ] Primeiro usuário registrado como admin
- [ ] Row Level Security (RLS) ativo
- [ ] Políticas de segurança funcionando

### n8n Data Tables Configurado:
- [ ] 3 tabelas criadas: clientes, receitas, pedidos
- [ ] Todos os campos presentes conforme especificação
- [ ] Consegue inserir e listar dados
- [ ] Relacionamentos funcionando

### Próxima Fase Preparada:
- [ ] Variáveis do Supabase anotadas
- [ ] n8n acessível
- [ ] Estrutura de dados completa

---

## ⚠️ SE TIVER PROBLEMAS

### Problema: Não acessa painel Supabase
```bash
# Verificar se está rodando
docker ps | grep supabase

# Verificar logs
docker logs nome-do-container-supabase
```

### Problema: Script SQL dá erro
- **Leia cuidadosamente** o `GUIA_EXECUCAO_FASE1.md`
- **Ignore warnings** sobre extensões existentes
- **Verifique se está logado** no Supabase com permissões

### Problema: n8n Data Tables não acessível
- **URL correta**: https://workflow.eetadnucleopalmas.shop
- **Menu lateral** deve ter "Data Tables"
- **Conecte se necessário** com credenciais

### Problema: Campo não existe no n8n
- **Use nomes EXATOS** do arquivo `n8n-tabelas-setup.sql`
- **Tipos corretos**: UUID, TEXT, BOOLEAN, JSONB, TIMESTAMP
- **Campo obrigatório**: UUID com auto-increment como primary key

---

## 📞 PRÓXIMOS PASSOS

Após completar a FASE 1, vamos para:

### FASE 2: Frontend React (3 horas)
1. **Configurar projeto Next.js + TypeScript**
2. **Instalar dependências**: Supabase client, Tailwind CSS
3. **Criar componentes de autenticação**
4. **Implementar páginas CRUD**

### FASE 3: Deploy Vercel (30 min)
1. **Configurar variáveis de ambiente**
2. **Deploy automático**
3. **Testar em produção**

### FASE 4: Integração n8n (1 hora)
1. **Criar workflows de automação**
2. **Conectar n8n Data Tables**
3. **Testar fluxo completo**

---

## 🎉 RESULTADO FINAL

Ao final da FASE 1, você terá:
- ✅ **Autenticação segura** funcionando no Supabase
- ✅ **4 tabelas criadas** no n8n Data Tables
- ✅ **Estrutura completa** para o DoceGestot
- ✅ **Base sólida** para o frontend React

**⏰ Tempo total: 25 minutos**
**🎯 Próxima entrega: Frontend React funcionando**

---

**💬 Quando terminar a FASE 1, me avise! Vou iniciar a FASE 2 (Frontend React).**