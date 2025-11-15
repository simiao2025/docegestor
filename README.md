# 🍰 DoceGestot - Sistema de Gestão para Doces

Sistema completo de gestão para empresas de doces, desenvolvido com React + Supabase.

## 🚀 **Como Executar**

### Rápido (Recomendado)
```bash
bash start-frontend.sh
```

### Manual
```bash
cd frontend
npm install
npm run dev
```

**🌐 Acesse:** http://localhost:3000

## 📋 **Primeiro Acesso**

1. **Crie uma conta:** Acesse http://localhost:3000 e clique em "Criar Conta"
2. **Preencha os dados:**
   - Nome: Seu nome completo
   - Email: Seu email
   - Senha: Escolha uma senha segura
3. **Faça login** com suas credenciais
4. **Cadastre dados de teste** usando o arquivo `DADOS_DEMONSTRACAO.md`

## 🎯 **Funcionalidades**

### 📊 **Dashboard**
- Métricas em tempo real
- Gráficos de vendas e pedidos
- Resumo completo do sistema

### 👥 **Usuários**
- Cadastro e gerenciamento
- Tipos: Admin, Funcionário, Cliente
- Status ativo/inativo

### 👤 **Clientes**
- Cadastro completo com endereço
- Contatos e observações
- Busca avançada

### 🍰 **Receitas**
- Ingredientes e modo de preparo
- Controle de custos e preços
- Categorização
- Grid visual com cards

### 📦 **Pedidos**
- Relacionamento completo (cliente + receita)
- Cálculo automático de valores
- Controle de status
- Timeline de produção

## 🛠️ **Tecnologias**

- **Frontend:** React 18 + TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth)
- **Build:** Vite
- **Charts:** Recharts
- **Icons:** Lucide React

## 📁 **Estrutura**

```
📦 DoceGestot
├── 🚀 start-frontend.sh           # Script de inicialização
├── 📋 INSTRUCOES_FRONTEND.md      # Guia detalhado
├── 📊 DADOS_DEMONSTRACAO.md       # Dados para teste
├── 📖 README.md                   # Este arquivo
└── 🎨 frontend/                   # Aplicação React
    ├── src/
    │   ├── components/            # Componentes reutilizáveis
    │   ├── contexts/             # Contextos React
    │   ├── lib/                  # Configurações (Supabase)
    │   └── pages/                # Páginas da aplicação
    └── package.json              # Dependências
```

## 🔐 **Configuração Supabase**

**Credenciais já configuradas:**
- **URL:** `https://manager-1-supabase.7sydhv.easypanel.host/project/default`
- **Tabelas:** usuarios, clientes, receitas, pedidos
- **Status:** ✅ Funcionando

## 📱 **Design Responsivo**

O sistema funciona perfeitamente em:
- 💻 **Desktop**
- 📱 **Tablet**
- 📱 **Mobile**

## 🆘 **Suporte**

**Problemas comuns:**
1. **Erro ao instalar:** Verifique se tem Node.js 16+ instalado
2. **Não conecta ao Supabase:** Confirme se a internet está funcionando
3. **Erro 404:** Certifique-se de estar no diretório `frontend/`

## 🚀 **Deploy**

### Vercel (Recomendado)
1. Conecte o repositório ao Vercel
2. Deploy automático

### Netlify
1. Execute `npm run build` em `frontend/`
2. Faça upload da pasta `dist/`

---

**🎉 Seu sistema está pronto para uso! Execute `bash start-frontend.sh` para começar.**