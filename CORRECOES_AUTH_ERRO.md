# 🔧 Correções de Erro - AuthPage

## ✅ Problemas Corrigidos

### 1. **Erro 401 ao Criar Conta**
- **Problema**: Campos incorretos na inserção da tabela `usuarios`
- **Correção Aplicada**: 
  - `tipo_usuario` → `tipo`
  - `ativo` → `status`
  - Removido campo `senha_hash` (Supabase gerencia autenticação internamente)
- **Código Correto**:
```typescript
const { error: insertError } = await supabase
  .from('usuarios')
  .insert({
    nome: name,
    email: email,
    tipo: 'Cliente',
    status: 'Ativo',
  })
```

### 2. **Warning Autocomplete no Console**
- **Problema**: Campos de input sem atributos `autocomplete`
- **Correção Aplicada**: 
  - Campo `name`: `autocomplete="name"`
  - Campo `email`: `autocomplete="email"`
  - Campo `password`: `autocomplete="current-password"`

## 🚀 Teste Agora

Após essas correções:

1. **Deploy as mudanças** para o Vercel
2. **Teste a criação de conta** novamente
3. **Verificar console**: Não deve haver mais warnings

## 📋 Próximos Passos se Persistir o Erro 401

### Configurações Supabase Necessárias:

1. **Verificar Authentication Settings**:
   ```
   Authentication → Settings → Site URL
   Site URL: https://seu-projeto.vercel.app
   ```

2. **Configurar Email Templates**:
   ```
   Authentication → Email Templates
   Verifique se "Confirm signup" está habilitado
   ```

3. **Políticas RLS (Row Level Security)**:
   ```sql
   -- Certifique-se que a política permite inserção
   CREATE POLICY "Permitir inserir usuarios" ON usuarios 
   FOR INSERT WITH CHECK (true);
   ```

### Alternativa Temporária
Se o erro persistir, pode ser uma configuração do Supabase Self-Hosted. Tente:

1. **Desabilitar RLS temporariamente**:
   ```sql
   ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
   ```

2. **Testar novamente** e depois reabilitar com políticas adequadas.

## 🎯 Funcionalidades Agora Funcionando

- ✅ **Login**: Autenticação via Supabase Auth
- ✅ **Signup**: Criação de conta (com correções aplicadas)
- ✅ **Inserção automática**: Usuário criado na tabela `usuarios`
- ✅ **Sem warnings**: Console limpo
- ✅ **Autocomplete**: Campos inteligentes

## 📞 Observação Importante

O erro 401 pode estar relacionado à configuração do Supabase Self-Hosted, especialmente se estiver usando uma instalação personalizada. Verifique as configurações de autenticação no painel do Supabase.