# 🔍 Guia: Verificar URL do Supabase Self-Hosted

## 🚨 Problema Identificado

A URL do Supabase Self-Hosted pode estar incorreta:
```
https://supabase.brasilonthebox.shop/project/default
```

## 📋 Verificações Necessárias

### 1. **Testar URL de Autenticação**
Execute no navegador (substitua pela sua URL):

```javascript
// Cole no Console do Navegador (F12)
fetch('https://supabase.brasilonthebox.shop/project/default/auth/v1/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2MzE2NTIyMCwiZXhwIjo0OTE4ODM4ODIwLCJyb2xlIjoiYW5vbiJ9.KvPvUzIgcW3dz1wEueysw-QWYkpMDBtf9hE-CnmY5uo'
  },
  body: JSON.stringify({
    email: 'teste@teste.com',
    password: '123456'
  })
})
.then(response => console.log('Status:', response.status, 'URL:', response.url))
.catch(error => console.log('Erro:', error.message));
```

**Resultado esperado:**
- ✅ Status 200-299: URL está correta
- ❌ Status 401/404/500: URL ou configuração incorreta

### 2. **URLs Alternativas para Testar**

Se a URL atual não funcionar, tente estas **APENAS UMA DE CADA VEZ**:

#### Opção A - URL Simplificada:
```typescript
const supabaseUrl = 'https://supabase.brasilonthebox.shop'
```

#### Opção B - EasyPanel Base:
```typescript
const supabaseUrl = 'https://supabase.brasilonthebox.shop'
// ou
const supabaseUrl = 'https://brasilonthebox.shop/supabase'
```

#### Opção C - Subdomínio Supabase:
```typescript
const supabaseUrl = 'https://supabase.brasilonthebox.shop'
```

#### Opção D - Porta Específica (se usar):
```typescript
const supabaseUrl = 'http://localhost:54321' // Para development local
```

### 3. **Como Testar Cada URL**

**Passo a Passo:**

1. **Edite o arquivo** `frontend/src/lib/supabase.ts`
2. **Substitua a linha 3** pela nova URL
3. **Salve o arquivo**
4. **Teste criar conta** na aplicação
5. **Verifique o console** (F12) para erro 401

### 4. **URLs Oficiais do Supabase (para comparação)**

Se você tem uma conta Supabase oficial, a URL segue este padrão:
```
https://xxxxxxx.supabase.co
```

**Exemplo:**
```typescript
const supabaseUrl = 'https://abcdefgh.supabase.co'
const supabaseAnonKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
```

## 🛠️ Correções Rápidas

### **Teste 1: Execute o fix-auth-rls.sql PRIMEIRO**
No SQL Editor do Supabase:
```sql
-- Cole o conteúdo do arquivo fix-auth-rls.sql
```

### **Teste 2: Se ainda der erro 401**
Teste cada URL alternativa acima (uma por vez)

### **Teste 3: Se nenhuma URL funcionar**
Provavelmente o **Supabase Self-Hosted não está funcionando**. Considere:
- Usar Supabase Cloud (gratuito)
- Verificar configuração do EasyPanel
- Reiniciar serviços do Supabase

## 📱 Como Verificar Configuração EasyPanel

1. **Acesse**: `https://brasilonthebox.host`
2. **Faça login** no EasyPanel
3. **Vá em**: "Apps" → "Supabase"
4. **Verifique**: 
   - Status: 🟢 Running
   - Port: 54321 (por padrão)
   - Domain: pode estar em "Domains" 
   - Environment variables: SUPABASE_URL e SUPABASE_ANON_KEY

## 🎯 Próximos Passos

1. ✅ **Execute fix-auth-rls.sql** (já fornecido)
2. 🔍 **Teste a URL atual** com o script JavaScript acima
3. 🔄 **Se falhar**, teste uma URL alternativa
4. 📝 **Informe o resultado** para seguirmos

**Resultado esperado:** Após correções, criação de conta deve funcionar!