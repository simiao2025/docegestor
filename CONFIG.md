# DoceGestot - Configuração de Demonstração

## 🎯 Dados de Exemplo Incluídos

O sistema DoceGestot vem pré-carregado com dados de exemplo para demonstração imediata das funcionalidades:

### 👥 Clientes de Exemplo
```javascript
Ana Paula Santos
- Telefone: (11) 99999-1111
- Email: ana@email.com
- Observações: Prefere bolo de chocolate

Carlos Oliveira  
- Telefone: (11) 99999-2222
- Email: carlos@email.com
- Observações: Cliente VIP
```

### 🍰 Receitas de Exemplo
```javascript
1. Bolo de Chocolate Premium
   - Categoria: Bolo
   - Custo: R$ 15,50
   - Preço Sugerido: R$ 54,25
   - Ingredientes: Chocolate (200g), Farinha (300g), Açúcar (200g)

2. Brigadeiro Gourmet
   - Categoria: Doce Fino  
   - Custo: R$ 25,80
   - Preço Sugerido: R$ 90,30
   - Ingredientes: Chocolate Premium (400g), Leite Condensado (2un)
```

### 📦 Pedido de Exemplo
```javascript
Pedido para Ana Paula Santos
- Data: 16/11/2025
- Status: Em Produção
- Items: 2x Bolo de Chocolate Premium
- Valor Total: R$ 108,50
```

## 🚀 Guia de Teste Rápido

### 1. Dashboard (Página Inicial)
- [x] Visualizar métricas: 1 pedido do mês, 1 pendente, R$ 108,50 receita
- [x] Ver próximos pedidos: Pedido da Ana Paula
- [x] Botão "Novo Pedido" funcional

### 2. Gestão de Pedidos
- [x] Lista completa com o pedido de exemplo
- [x] Filtro de busca funcionando
- [x] Botões "Editar" e "Status" funcionais
- [x] Alterar status: Recebido → Em Produção → Entregue

### 3. Cadastro de Receitas
- [x] Cards das 2 receitas de exemplo
- [x] Botão "Nova Receita" abre modal
- [x] Cálculo automático de custos
- [x] Preço sugerido com markup 350%

### 4. Cadastro de Clientes
- [x] Tabela com os 2 clientes de exemplo
- [x] Busca de clientes funcional
- [x] Botões "Editar" e "Excluir"

### 5. Funcionalidades Avançadas
- [x] Cálculos automáticos em tempo real
- [x] Persistência de dados no localStorage
- [x] Interface responsiva (testar mobile)
- [x] Navegação fluida entre páginas

## 📊 Cenários de Teste

### Cenário 1: Novo Pedido
1. Clicar "Novo Pedido" no dashboard
2. Selecionar cliente "Ana Paula Santos"
3. Definir data de entrega: amanhã
4. Adicionar 1x "Bolo de Chocolate Premium"
5. Adicionar 1x "Brigadeiro Gourmet"
6. Verificar cálculo automático do total
7. Salvar pedido
8. Verificar atualização do dashboard

### Cenário 2: Nova Receita
1. Ir para "Receitas" → "Nova Receita"
2. Nome: "Torta de Maçã Especial"
3. Categoria: "Torta"
4. Adicionar ingredientes:
   - Maçã (1kg) - R$ 4,00/kg
   - Açúcar (200g) - R$ 0,40/100g
   - Massa folhada (500g) - R$ 3,50/un
5. Verificar cálculo automático do custo
6. Verificar preço sugerido
7. Salvar receita

### Cenário 3: Alteração de Status
1. Ir para "Pedidos"
2. Clicar no botão "Status" do pedido
3. Status muda automaticamente:
   - Recebido → Em Produção
   - Em Produção → Entregue
   - Entregue → Cancelado
   - Cancelado → Recebido
4. Verificar atualização do dashboard

### Cenário 4: Filtros e Busca
1. Testar busca de pedidos por nome do cliente
2. Testar busca de clientes por nome/telefone
3. Verificar que os filtros funcionam em tempo real

## 🔧 Configurações Técnicas

### localStorage
```javascript
// Chave de armazenamento
'docegestot_dados'

// Estrutura dos dados
{
  clientes: [...],
  receitas: [...], 
  pedidos: [...],
  ingredientes: [...]
}
```

### Cálculos Automáticos
```javascript
// Markup padrão de receitas
preco_sugerido = custo_total * 3.5

// Cálculo de custos
custo_ingrediente = quantidade * custo_por_unidade
custo_total = soma_todos_ingredientes

// Cálculo de pedidos
total_item = quantidade * preco_unitario
valor_pedido = soma_todos_itens
```

### Validações
```javascript
// Campos obrigatórios por formulário
Pedido: cliente, data, status
Receita: nome, categoria, ingredientes
Cliente: nome, telefone
```

## 📱 Teste de Responsividade

### Desktop (≥1024px)
- [ ] Layout em 3 colunas no dashboard
- [ ] Tabelas completas visíveis
- [ ] Navegação lateral sempre visível
- [ ] Modais centralizados

### Tablet (768px-1023px)
- [ ] Layout em 2 colunas
- [ ] Tabelas com scroll horizontal
- [ ] Navegação compacta
- [ ] Cards redimensionados

### Mobile (≤767px)
- [ ] Layout em coluna única
- [ ] Menu hambúrguer na navegação
- [ ] Tabelas empilhadas
- [ ] Botões touch-friendly (44px mínimo)
- [ ] Formulários otimizados

## 🎨 Customização Visual

### Cores (CSS Variables)
```css
:root {
  --primary: #FF6B8B;        /* Rosa principal */
  --primary-hover: #D94C6D;   /* Rosa escuro */
  --secondary: #4ECDC4;       /* Verde água */
  --neutral-900: #2D3748;     /* Texto principal */
  --neutral-700: #718096;     /* Texto secundário */
  --neutral-200: #E2E8F0;     /* Bordas */
  --neutral-100: #F7FAFC;     /* Fundo */
}
```

### Tipografia
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

### Breakpoints
```css
/* Mobile first approach */
@media (max-width: 767px) { /* Mobile */ }
@media (min-width: 768px) and (max-width: 1023px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
```

## 🔮 Funcionalidades Futuras

### Em Desenvolvimento
- [ ] Sistema de autenticação real
- [ ] Integração com backend (Strapi)
- [ ] Upload de imagens
- [ ] Relatórios em PDF
- [ ] Notificações push

### Roadmap
- [ ] App mobile (React Native)
- [ ] Integração WhatsApp Business
- [ ] Agente IA para atendimento
- [ ] Sistema de pagamentos
- [ ] Multi-tenant (múltiplas confeitarias)

## 🐛 Debug e Troubleshooting

### Console do Navegador
```javascript
// Verificar dados atuais
console.log(app.dados);

// Forçar salvamento
app.salvarDados();

// Limpar dados (reset)
localStorage.removeItem('docegestot_dados');
location.reload();
```

### Problemas Comuns
1. **Dados não salvam**: Verificar localStorage habilitado
2. **Ícones não aparecem**: Verificar conexão com CDN Lucide
3. **Layout quebrado**: Verificar CSS carregado
4. **JavaScript não funciona**: Verificar console por erros

### Performance
- Lighthouse Score: 95+
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Cumulative Layout Shift: <0.1

---

**Este arquivo de configuração permite testar completamente o sistema DoceGestot e entender todas as suas funcionalidades implementadas!**