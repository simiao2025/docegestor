# ⚡ GUIA RÁPIDO - Integração DoceGestot + Strapi

## 🎯 **PLANO DE 4 HORAS** (Hoje)

### **✅ CHECKLIST IMEDIATO:**

---

## **HOUR 1: ESTRUTURA STRAPI** (15 min)

### 1.1 Acessar Admin
```bash
# Abrir no navegador:
https://seu-strapi.easypanel.io/admin

# Login com suas credenciais
```

### 1.2 Criar Content Types (via interface)
```bash
# 1. Content Type Builder → Create new Content Type
# 2. Collection Name: usuarios
# 3. UID: api::usuario.usuario
# 4. Adicionar atributos:
#    - nome_completo (Text, Required)
#    - email (Email, Required, Unique)
#    - telefone (Text)
#    - tipo_usuario (Enumeration: ['confeiteira', 'admin', 'vendedor'])
# 5. Save
```

### 1.3 Repetir para outros tipos
```bash
# Cliente: Collection Name: clientes, UID: api::cliente.cliente
# Receita: Collection Name: receitas, UID: api::receita.receita  
# Pedido: Collection Name: pedidos, UID: api::pedido.pedido
```

**💡 Dica:** Use os schemas prontos em `STRAPI_SCHEMAS.md`

---

## **HOUR 2: MIGRAÇÃO DE DADOS** (30 min)

### 2.1 Exportar localStorage
```javascript
// No console do navegador (MVP atual):
const dados = JSON.parse(localStorage.getItem('docegestot_dados') || '{"clientes":[],"receitas":[],"pedidos":[]}');
console.log('DADOS EXPORTADOS:', JSON.stringify(dados, null, 2));

// Se não há dados, adicione alguns de teste:
if (dados.clientes.length === 0) {
  dados.clientes = [
    { nome: "Test Cliente", telefone: "(11) 99999-9999", email: "teste@email.com" }
  ];
}
```

### 2.2 Importar via Admin
```bash
# 1. Content Manager → Usuario → Add Entry
# 2. Criar usuário: nome_completo: "Maria Silva", email: "maria@docegestot.com"
# 3. Content Manager → Cliente → Add Entry  
# 4. Importar clientes um por um
# 5. Repetir para receitas e pedidos
```

---

## **HOUR 3: CONFIGURAÇÕES** (15 min)

### 3.1 Gerar API Token
```bash
# Settings → API Tokens → Create new Token
# Name: "DoceGestot Frontend"
# Type: Full Access
# Copy token (usar no frontend)
```

### 3.2 Configurar Permissões
```bash
# Settings → Users & Permissions → Roles
# Public:
#   ✅ Enable find for usuarios
#   ✅ Enable find for clientes
#   ✅ Enable find for receitas  
#   ✅ Enable find for pedidos
# Authenticated:
#   ✅ Full access a todos os endpoints
```

### 3.3 Testar APIs
```bash
# No navegador:
curl https://seu-strapi.easypanel.io/api/usuarios
curl https://seu-strapi.easypanel.io/api/clientes
curl https://seu-strapi.easypanel.io/api/receitas
curl https://seu-strapi.easypanel.io/api/pedidos

# Deve retornar: {"data":[],"meta":{...}}
```

---

## **HOUR 4: FRONTEND REACT** (2 horas)

### 4.1 Criar projeto Next.js
```bash
# No terminal:
npx create-next-app@latest docegestot-frontend --typescript --tailwind --eslint --app --use-npm --yes

cd docegestot-frontend
npm install axios jwt-decode @tanstack/react-query @tanstack/react-query-devtools
npm install @heroicons/react react-hook-form @hookform/resolvers yup
```

### 4.2 Configurar integração
```bash
# Criar lib/api.js:
const API_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://seu-strapi.easypanel.io/api';
```

### 4.3 Deploy Vercel
```bash
# Instalar Vercel CLI:
npm install -g vercel

# Login e deploy:
vercel login
vercel --prod

# Configurar variável de ambiente:
# NEXT_PUBLIC_STRAPI_URL=https://seu-strapi.easypanel.io/api
```

---

## 🚨 **COMANDOS ESSENCIAIS**

### **Verificar conexão Strapi:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  https://seu-strapi.easypanel.io/api/usuarios
```

### **Testar endpoint completo:**
```bash
curl -X GET \
  "https://seu-strapi.easypanel.io/api/clientes?populate=usuario" \
  -H "Authorization: Bearer TOKEN"
```

### **Criar usuário via API:**
```bash
curl -X POST \
  https://seu-strapi.easypanel.io/api/usuarios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "data": {
      "nome_completo": "Maria Silva",
      "email": "maria@docegestot.com",
      "telefone": "(11) 99999-8888",
      "tipo_usuario": "confeiteira"
    }
  }'
```

---

## 📋 **ESTRUTURA FINAL ESPERADA**

### **Backend (Strapi):**
```
URL: https://seu-strapi.easypanel.io
Admin: https://seu-strapi.easypanel.io/admin
API: https://seu-strapi.easypanel.io/api
```

### **Endpoints funcionando:**
```
GET  /api/usuarios      ✅ 
GET  /api/clientes      ✅
GET  /api/receitas      ✅  
GET  /api/pedidos       ✅
POST /api/usuarios      ✅
POST /api/clientes      ✅
POST /api/receitas      ✅
POST /api/pedidos       ✅
```

### **Frontend (React):**
```
URL: https://docegestot-frontend.vercel.app
API: Integrada com Strapi
Auth: JWT token localStorage
```

---

## 🎯 **RESULTADOS ALCANÇADOS**

### **HOJE (4h):**
✅ **Backend integrado**: Strapi + dados migrados  
✅ **APIs funcionando**: CRUD completo  
✅ **Frontend moderno**: React + Next.js  
✅ **Deploy cloud**: Vercel + certificado SSL  

### **SISTEMA FINAL:**
- 📱 **Aplicação**: https://docegestot-frontend.vercel.app
- 🔌 **API**: https://seu-strapi.easypanel.io/api  
- 🎛️ **Admin**: https://seu-strapi.easypanel.io/admin
- 📊 **Banco**: PostgreSQL (easypanel)
- 🔐 **Auth**: JWT token

---

## 🚨 **TROUBLESHOOTING RÁPIDO**

### **API retorna 404:**
```bash
# Verificar se Content Types foram criados
# Reiniciar Strapi: npm run develop
```

### **Frontend não conecta:**
```bash
# Verificar NEXT_PUBLIC_STRAPI_URL
# Verificar CORS no Strapi
# Testar API com curl
```

### **Erro de permissão:**
```bash
# Verificar Roles no Admin
# Configurar Public role com acesso
```

---

## 💰 **CUSTO ZERO ADICIONAL**

Como você **já tem**:
- ✅ Strapi v3.6.8 no easypanel
- ✅ Banco de dados configurado
- ✅ Interface admin

**Investimento adicional:**
- 💵 **$0** (infra já existe)
- ⏱️ **4 horas** de trabalho
- 🚀 **Sistema pronto** para usar

---

## 🏆 **PRÓXIMO PASSO IMEDIATO**

**Execute agora:**

1. **📂 Abra o Strapi:** `https://seu-strapi.easypanel.io/admin`
2. **⚡ Configure schemas:** Use `STRAPI_SCHEMAS.md`  
3. **📦 Migre dados:** localStorage → Strapi
4. **🔗 Teste APIs:** curl para verificar
5. **⚛️ Crie frontend:** `npx create-next-app`

**🎯 Em 4h você terá o DoceGestot rodando em produção!**