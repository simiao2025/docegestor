# 🎯 PLANO DE AÇÃO IMEDIATO - DoceGestot Produção

## 📋 PRÓXIMOS 3 PASSOS (Hoje)

### 1️⃣ BACKEND STRAPI - Setup Inicial (2 horas)

```bash
# Comandos para executar HOJE:

# Instalar Strapi
npx create-strapi-app@latest docegestot-backend --quickstart
cd docegestot-backend

# Instalar dependências essenciais
npm install pg pg-connection-string bcryptjs

# Criar primeiro schema (Usuário)
npm run strapi generate:content-types
# Selecionar: api::usuario
# Atributos básicos: nome_completo, email, senha_hash, tipo_usuario
```

**Para Railway:**
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login e inicialização
railway login
railway init
railway add postgresql
```

**Resultado após 2h:**
✅ Strapi funcionando localmente  
✅ Database PostgreSQL no Railway  
✅ Schema de Usuário criado  

### 2️⃣ MIGRAR DADOS LOCALSTORAGE (30 minutos)

```javascript
// No console do navegador do MVP atual:
const dadosDoceGestot = JSON.parse(localStorage.getItem('docegestot_dados'));
console.log('DADOS PARA MIGRAR:', JSON.stringify(dadosDoceGestot, null, 2));

// Isso vai exportar:
// - Clientes: []  
// - Receitas: []
// - Pedidos: []
// - Ingredientes: []
```

**Criar arquivo JSON com os dados:**
```json
{
  "clientes": [
    {
      "nome": "Ana Paula Santos",
      "telefone": "(11) 99999-1111", 
      "email": "ana@email.com",
      "observacoes": "Prefere bolo de chocolate"
    }
  ],
  "receitas": [
    {
      "nome": "Bolo de Chocolate Premium",
      "descricao": "Bolo molhadinho com chocolate belga",
      "categoria": "bolo",
      "custo_total": 15.50,
      "preco_sugerido": 54.25,
      "ingredientes": [
        { "nome": "Chocolate", "quantidade": 200, "unidade": "g", "custo_unitario": 2.50 }
      ]
    }
  ]
}
```

### 3️⃣ DEPLOY BACKEND (1 hora)

```bash
# Configurar variáveis no Railway:
railway variables set APP_KEYS=key1,key2,key3,key4
railway variables set API_TOKEN_SALT=salt123
railway variables set ADMIN_JWT_SECRET=jwtsecret123
railway variables set JWT_SECRET=jwtsecret123

# Deploy
railway up

# Seu backend estará em:
# https://random-name.up.railway.app
```

**Resultado após 3h:**
✅ Backend Strapi online  
✅ API funcionando  
✅ Dados localStorage exportados  

---

## 📅 SEMANA 1 - BACKEND COMPLETO

### Dia 1: Schemas Completos
```bash
# Criar todos os schemas baseados no MVP:
# 1. Usuario ✅ (feito)
# 2. Cliente
# 3. Receita  
# 4. Pedido
# 5. Ingrediente
```

### Dia 2: Controllers e Auth
```javascript
// Implementar:
// - login.js (substituir login simulado)
// - usuarios.js (CRUD completo)
// - middlewares/auth.js (JWT verification)
```

### Dia 3: Importar Dados
```javascript
// Usar o admin do Strapi (/admin):
// 1. Criar usuários
// 2. Importar clientes
// 3. Importar receitas  
// 4. Importar pedidos
// 5. Verificar relações
```

### Dia 4: Testes API
```bash
# Testar endpoints:
curl -X GET https://api-docegestot.up.railway.app/api/usuarios
curl -X GET https://api-docegestot.up.railway.app/api/clientes
curl -X GET https://api-docegestot.up.railway.app/api/receitas
curl -X GET https://api-docegestot.up.railway.app/api/pedidos
```

### Dia 5: Deploy Final
```bash
# Configurar domínio personalizado:
railway domain add api.docegestot.com

# Backend final:
# https://api.docegestot.com ✅
```

---

## 📅 SEMANA 2-3 - FRONTEND REACT

### Início (Dia 8-10):
```bash
# Criar projeto Next.js
npx create-next-app@latest docegestot-frontend --typescript --tailwind --eslint --app

# Instalar dependências
npm install axios jwt-decode @tanstack/react-query @tanstack/react-query-devtools
npm install @heroicons/react react-hook-form @hookform/resolvers yup
```

### Desenvolvimento (Dia 11-17):
```bash
# 1. Migrar autenticação
# 2. Criar context Auth
# 3. Implementar hooks (useClientes, usePedidos, etc.)
# 4. Migrar componentes um por um:
#    - Dashboard.jsx
#    - PedidosManager.jsx  
#    - ReceitasManager.jsx
#    - ClientesManager.jsx
```

### Deploy (Dia 18-21):
```bash
# Deploy no Vercel
npm install -g vercel
vercel login
vercel --prod

# Configurar domínio:
# https://app.docegestot.com ✅
```

---

## 📅 SEMANA 4 - AUTOMAÇÃO N8N

### Setup (Dia 22-24):
```bash
# Deploy n8n no Railway
railway add postgresql

# docker-compose.yml para n8n
# Configurar variáveis de ambiente
```

### Workflows (Dia 25-28):
```javascript
// Criar workflows:
# 1. WhatsApp - Status Updates
# 2. WhatsApp - Lembrete de Entrega  
# 3. AI Chatbot (WhatsApp)
# 4. Webhook - Strapi Integration
```

---

## 💰 BUDGET IMEDIATO (Primeiro Mês)

### Serviços Obrigatórios:
- **Railway Backend**: $20/mês
- **Railway PostgreSQL**: $15/mês
- **Railway n8n**: $10/mês
- **Vercel Pro**: $20/mês
- **Domínios**: $1/mês

**Total: ~$66/mês**

### Serviços Opcionais (Futuro):
- **WhatsApp Business API**: ~$5/mês (1000 msgs)
- **OpenAI API**: ~$20/mês (chatbot IA)
- **Monitoring (Sentry)**: $0 (plano gratuito)

---

## 🚨 CHECKLIST DIÁRIO

### Hoje:
- [ ] Strapi criado e funcionando
- [ ] Railway configurado  
- [ ] Dados localStorage exportados
- [ ] Backend online

### Esta Semana:
- [ ] Todos os schemas criados
- [ ] Dados importados no Strapi
- [ ] APIs testadas e funcionando
- [ ] Domínio api.docegestot.com configurado

### Próximas Semanas:
- [ ] Frontend React criado
- [ ] Componentes migrados
- [ ] Deploy Vercel funcionando
- [ ] n8n workflows ativos

---

## 🎯 PRIORIDADES ABSOLUTAS

### CRÍTICO (Fazer HOJE):
1. ✅ **Backend Strapi online**
2. ✅ **Dados exportados do localStorage**
3. ✅ **API funcionando**

### IMPORTANTE (Esta Semana):
4. ⏳ **Migrar dados para PostgreSQL**
5. ⏳ **Configurar domínio api.docegestot.com**
6. ⏳ **Testes completos das APIs**

### DESEJÁVEL (Próximas Semanas):
7. ⏰ **Frontend React** 
8. ⏰ **Automatização WhatsApp**
9. ⏰ **Monitoramento e logs**

---

## 🆘 SUPORTE DURANTE A MIGRAÇÃO

### Se algo não funcionar:

**Strapi não sobe:**
```bash
# Verificar logs
railway logs

# Reiniciar
railway restart
```

**API retorna 401:**
```bash
# Verificar JWT token
# Recriar usuário admin no Strapi
```

**Dados não aparecem:**
```bash
# Verificar relações entre schemas
# Importar dados novamente no admin
```

**Frontend não conecta:**
```javascript
// Verificar NEXT_PUBLIC_API_URL
// Testar curl para API
curl https://api.docegestot.com/api/usuarios
```

---

## 📞 CONTATO DE EMERGÊNCIA

**Railway Support:** https://railway.app/discord  
**Vercel Support:** https://vercel.com/support  
**Strapi Community:** https://strapi.io/community  

**Documentação:**
- Strapi: https://docs.strapi.io
- Next.js: https://nextjs.org/docs
- Railway: https://docs.railway.app
- Vercel: https://vercel.com/docs

---

## 🏆 RESULTADO ESPERADO (30 dias)

Ao final de 30 dias você terá:

✅ **Sistema Backend**: `https://api.docegestot.com`  
✅ **Sistema Frontend**: `https://app.docegestot.com`  
✅ **Automatização**: `https://automacao.docegestot.com`  
✅ **Banco PostgreSQL**: Dados seguros e escaláveis  
✅ **APIs REST**: Integração completa  
✅ **Autenticação JWT**: Segurança real  
✅ **Deploy Cloud**: 99.9% uptime  
✅ **WhatsApp Automation**: Notificações automáticas  

**🚀 DoceGestot estará COMPETINDO no mercado!**