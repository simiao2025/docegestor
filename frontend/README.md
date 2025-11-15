# DoceGestot Frontend

Sistema de gestão completo para empresa de doces, integrado com Supabase.

## 🚀 Tecnologias

- **React 18** + TypeScript
- **Vite** para build otimizado
- **Tailwind CSS** para estilização
- **Supabase** para backend e autenticação
- **React Router** para navegação
- **Recharts** para gráficos
- **Lucide React** para ícones
- **React Hot Toast** para notificações
- **date-fns** para manipulação de datas

## 📦 Instalação

1. **Instale as dependências:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure as variáveis de ambiente:**
   As credenciais do Supabase já estão configuradas no arquivo `src/lib/supabase.ts`

3. **Execute o projeto:**
   ```bash
   npm run dev
   ```

4. **Acesse:** http://localhost:3000

## 🏗️ Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   └── Layout.tsx       # Layout principal
│   ├── contexts/            # Contextos React
│   │   └── AuthContext.tsx  # Contexto de autenticação
│   ├── lib/                 # Configurações e utilitários
│   │   └── supabase.ts      # Cliente Supabase e tipos
│   ├── pages/               # Páginas da aplicação
│   │   ├── AuthPage.tsx     # Página de login/registro
│   │   ├── Dashboard.tsx    # Dashboard principal
│   │   ├── Usuarios.tsx     # Gerenciamento de usuários
│   │   ├── Clientes.tsx     # Gerenciamento de clientes
│   │   ├── Receitas.tsx     # Gerenciamento de receitas
│   │   └── Pedidos.tsx      # Gerenciamento de pedidos
│   ├── App.tsx              # Componente principal
│   ├── main.tsx             # Ponto de entrada
│   └── index.css            # Estilos globais
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## 🔐 Sistema de Autenticação

### Primeiro Acesso

1. Acesse http://localhost:3000
2. Clique em "Criar Conta"
3. Preencha os dados:
   - Nome: Seu nome completo
   - Email: Seu email
   - Senha: Escolha uma senha segura
4. Verifique seu email (se necessário)
5. Faça login com as credenciais

### Gestão de Usuários

Após o primeiro login, você pode gerenciar outros usuários através do menu "Usuários".

## 📊 Funcionalidades

### Dashboard
- Métricas em tempo real
- Gráficos de vendas e pedidos
- Resumo do sistema

### Usuários
- Cadastro de usuários
- Gerenciamento de tipos (admin, funcionário, cliente)
- Controle de status (ativo/inativo)

### Clientes
- Cadastro completo de clientes
- Endereço e contatos
- Campo de observações

### Receitas
- Cadastro de receitas com ingredientes
- Modo de preparo detalhado
- Controle de custos e preços
- Categorização

### Pedidos
- Gestão completa de pedidos
- Cálculo automático de valores
- Controle de status
- Relacionamento com clientes e receitas

## 🎨 Design System

### Cores
- **Primary:** Tons de laranja (#f1760a)
- **Sucesso:** Verde (#10B981)
- **Erro:** Vermelho (#EF4444)
- **Aviso:** Amarelo (#F59E0B)

### Componentes
- Botões: `.btn-primary`, `.btn-secondary`, `.btn-danger`
- Inputs: `.input-field`
- Cards: `.card`

## 🔧 Scripts Disponíveis

```bash
npm run dev      # Executar em desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build
npm run lint     # Verificar código
```

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop
- Tablet
- Mobile

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente se necessário
3. Deploy automático

### Build Manual

```bash
npm run build
# Os arquivos ficam em dist/
```

## 📋 Próximos Passos

1. **Configuração do Supabase:**
   - Verificar se as tabelas foram criadas
   - Configurar políticas RLS se necessário

2. **Personalização:**
   - Adaptar cores da marca
   - Adicionar logo da empresa

3. **Recursos Avançados:**
   - Impressão de pedidos
   - Relatórios em PDF
   - Notificações por email

## 🆘 Suporte

Em caso de problemas:

1. Verifique se o Supabase está funcionando
2. Confirme se as tabelas foram criadas
3. Verifique o console do navegador para erros

## 📄 Licença

Este projeto é privado e confidential.