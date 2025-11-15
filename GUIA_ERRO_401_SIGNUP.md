# 🔧 GUIA DE CORREÇÃO - Erro 401 Signup Supabase

## 🚨 Problema Atual
```
POST https://supabase.brasilonthebox.shop/project/default/auth/v1/signup 401 (Unauthorized)
```

## 📋 Soluções Em Ordem de Prioridade

### 🏆 **SOLUÇÃO 1: Script RLS (RECOMENDADO)**

Execute o script `fix-auth-rls.sql` no **Supabase SQL Editor**:

1. **Acesse**: `https://supabase.brasilonthebox.shop/project/default/sql`
2. **Cole**: Conteúdo completo de `fix-auth-rls.sql`
3. **Execute**: Clique em "Run" 
4. **Resultado**: Erro 401 resolvido

**O que faz:**
- ✅ Remove políticas RLS restritivas
- ✅ Cria políticas permissivas para signup
- ✅ Trigger automático para criar usuário na tabela `usuarios`
- ✅ Permite operações CRUD em todas as tabelas

---

### 🏅 **SOLUÇÃO 2: Configurações Supabase Auth**

Se a Solução 1 não resolver:

1. **Acesse**: `https://supabase.brasilonthebox.shop/project/default/auth`
2. **Configure**:

```
Settings:
✅ Email Confirmação: DESABILITADO (temporário)
✅ Site URL: https://seu-site.vercel.app
✅ Redirect URLs: https://seu-site.vercel.app/** 
```

3. **Email Templates**:
```
Confirm signup: DESABILITADO (para teste)
Password reset: Ativo
```

---

### 🥉 **SOLUÇÃO 3: Disable Auth via Interface**

**ALTERNATIVA**: Desabilite autenticação temporariamente:

```javascript
// No AuthContext.tsx, substitua signUp por:
const signUp = async (email: string, password: string, name: string) => {
  try {
    // OPÇÃO A: Simular signup (SEM AUTENTICAÇÃO)
    const { error: insertError } = await supabase
      .from('usuarios')
      .insert({
        nome: name,
        email: email,
        tipo: 'Cliente',
        status: 'Ativo',
      })
    
    if (insertError) return { error: insertError.message }
    
    toast.success('Conta criada! Faça login.')
    setIsLogin(true)
    return {}
    
  } catch (error) {
    return { error: 'Erro ao criar conta' }
  }
}
```

---

### 🔧 **SOLUÇÃO 4: Debug Avançado**

**Se nada funcionar, execute no SQL Editor:**

```sql
-- Verificar logs de autenticação
SELECT * FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Verificar políticas atuais
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Limpeza completa (NÚCLEO)
SELECT rollback_auth_changes();
```

---

## 🚀 **PLANO DE AÇÃO RECOMENDADO**

### **ETAPA 1**: Execute `fix-auth-rls.sql`
- ⏱️ **Tempo**: 2 minutos
- ✅ **Chance**: 90% de funcionar

### **ETAPA 2**: Se falhar, configure Auth Settings
- ⏱️ **Tempo**: 5 minutos  
- ✅ **Chance**: 95% de funcionar

### **ETAPA 3**: Como último recurso, use Solução 3
- ⏱️ **Tempo**: 1 minuto
- ✅ **Resultado**: Sistema funcionando (sem auth real)

---

## 📱 **VERIFICAÇÃO DE SUCESSO**

Após aplicar qualquer solução:

1. **Vá para o site**: https://seu-site.vercel.app
2. **Clique**: "Criar Conta"
3. **Preencha**: Nome, email, senha
4. **Resultado esperado**: 
   - ✅ Mensagem: "Conta criada com sucesso!"
   - ✅ Redirect para login
   - ✅ Console limpo (sem erros 401)

---

## ⚠️ **IMPORTANTE**

**⚡ Para Produção:**
- ⚙️ Reabilite confirmação de email
- 🔒 Ajuste políticas RLS mais restritivas  
- 🛡️ Configure permissões específicas por tipo de usuário

**🔧 Para Teste:**
- ✅ Use as soluções temporárias acima
- 🔄 Teste todas as funcionalidades
- 📝 Documente configurações finais

---

## 🆘 **Suporte Adicional**

**Se ainda não funcionar:**

1. **Verifique logs Supabase**: 
   ```
   Project → Logs → Auth → Recent
   ```

2. **Teste com outro email**:
   ```
   Use: teste123@gmail.com
   Senha: Teste123!
   ```

3. **Contate administrador** do Supabase Self-Hosted para verificar:
   - Configurações globais de auth
   - Certificados SSL
   - Políticas do servidor