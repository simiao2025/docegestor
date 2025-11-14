// DoceGestot - Sistema de Gestão para Confeitarias
// JavaScript Principal

class DoceGestot {
    constructor() {
        this.usuarioAtual = null;
        this.dados = {
            clientes: [],
            receitas: [],
            pedidos: [],
            ingredientes: []
        };
        
        this.init();
    }

    init() {
        this.carregarDados();
        this.configurarNavegacao();
        this.configurarModais();
        this.configurarFormularios();
        this.inicializarIcones();
        this.atualizarDashboard();
        
        // Simular usuário logado
        this.fazerLogin({ nome: "Maria Silva", tipo_usuario: "confeiteira" });
    }

    // INICIALIZAÇÃO
    inicializarIcones() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    configurarNavegacao() {
        const navItems = document.querySelectorAll('.nav-item');
        const pages = document.querySelectorAll('.page');

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const pageName = item.dataset.page;
                
                // Atualizar navegação ativa
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // Mostrar página correspondente
                pages.forEach(page => page.classList.remove('active'));
                document.getElementById(`${pageName}-page`).classList.add('active');
                
                // Carregar dados da página
                this.carregarDadosPagina(pageName);
            });
        });
    }

    configurarModais() {
        // Abrir modais
        document.getElementById('btn-novo-pedido')?.addEventListener('click', () => this.abrirModal('modal-pedido'));
        document.getElementById('btn-novo-pedido-2')?.addEventListener('click', () => this.abrirModal('modal-pedido'));
        document.getElementById('btn-nova-receita')?.addEventListener('click', () => this.abrirModal('modal-receita'));
        document.getElementById('btn-novo-cliente')?.addEventListener('click', () => this.abrirModal('modal-cliente'));
        
        // Fechar modais
        document.querySelectorAll('.modal-close, [data-modal]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = e.target.dataset.modal;
                if (modalId) {
                    this.fecharModal(modalId);
                }
            });
        });
        
        // Fechar modal ao clicar fora
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        });
    }

    configurarFormularios() {
        // Formulário de Pedido
        const formPedido = document.getElementById('form-pedido');
        if (formPedido) {
            formPedido.addEventListener('submit', (e) => this.salvarPedido(e));
        }
        
        // Formulário de Receita
        const formReceita = document.getElementById('form-receita');
        if (formReceita) {
            formReceita.addEventListener('submit', (e) => this.salvarReceita(e));
        }
        
        // Formulário de Cliente
        const formCliente = document.getElementById('form-cliente');
        if (formCliente) {
            formCliente.addEventListener('submit', (e) => this.salvarCliente(e));
        }

        // Botões para adicionar itens dinâmicos
        document.getElementById('btn-adicionar-item')?.addEventListener('click', () => this.adicionarItemPedido());
        document.getElementById('btn-adicionar-ingrediente')?.addEventListener('click', () => this.adicionarIngrediente());
        
        // Buscas
        document.getElementById('search-pedidos')?.addEventListener('input', (e) => this.filtrarPedidos(e.target.value));
        document.getElementById('search-clientes')?.addEventListener('input', (e) => this.filtrarClientes(e.target.value));
    }

    // AUTENTICAÇÃO
    fazerLogin(usuario) {
        this.usuarioAtual = usuario;
        this.usuarioAtual.data_cadastro = new Date().toISOString().split('T')[0];
        
        document.getElementById('user-name').textContent = usuario.nome;
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('app').classList.remove('hidden');
        
        this.mostrarToast('Bem-vinda ao DoceGestot!', 'success');
    }

    fazerLogout() {
        if (confirm('Deseja realmente sair?')) {
            window.location.reload();
        }
    }

    // GERENCIAMENTO DE DADOS
    carregarDados() {
        const dadosSalvos = localStorage.getItem('docegestot_dados');
        if (dadosSalvos) {
            this.dados = JSON.parse(dadosSalvos);
        } else {
            // Dados de exemplo para demonstração
            this.dados = {
                clientes: [
                    {
                        id: 1,
                        nome: "Ana Paula Santos",
                        telefone: "(11) 99999-1111",
                        email: "ana@email.com",
                        observacoes: "Prefere bolo de chocolate",
                        usuario_dono: "Maria Silva"
                    },
                    {
                        id: 2,
                        nome: "Carlos Oliveira",
                        telefone: "(11) 99999-2222",
                        email: "carlos@email.com",
                        observacoes: "Cliente VIP",
                        usuario_dono: "Maria Silva"
                    }
                ],
                receitas: [
                    {
                        id: 1,
                        nome: "Bolo de Chocolate Premium",
                        descricao: "Bolo molhadinho com chocolate belga",
                        categoria: "bolo",
                        custo_total: 15.50,
                        preco_sugerido: 54.25,
                        instrucoes_preparo: "Bater ovos com açúcar...",
                        ingredientes: [
                            { nome: "Chocolate", quantidade: 200, unidade: "g", custo_unitario: 2.50 },
                            { nome: "Farinha", quantidade: 300, unidade: "g", custo_unitario: 0.30 },
                            { nome: "Açúcar", quantidade: 200, unidade: "g", custo_unitario: 0.40 }
                        ],
                        usuario_dono: "Maria Silva"
                    },
                    {
                        id: 2,
                        nome: "Brigadeiro Gourmet",
                        descricao: "Brigadeiro com chocolate premium",
                        categoria: "doce_fino",
                        custo_total: 25.80,
                        preco_sugerido: 90.30,
                        instrucoes_preparo: "Derreter chocolate...",
                        ingredientes: [
                            { nome: "Chocolate Premium", quantidade: 400, unidade: "g", custo_unitario: 3.50 },
                            { nome: "Leite Condensado", quantidade: 2, unidade: "un", custo_unitario: 4.90 }
                        ],
                        usuario_dono: "Maria Silva"
                    }
                ],
                pedidos: [
                    {
                        id: 1,
                        cliente: "Ana Paula Santos",
                        data_entrega: "2025-11-16",
                        status: "em_producao",
                        valor_total: 108.50,
                        observacoes: "Entrega no período da tarde",
                        itens: [
                            { receita: "Bolo de Chocolate Premium", quantidade: 2, preco_unitario: 54.25 }
                        ],
                        usuario_dono: "Maria Silva"
                    }
                ]
            };
            this.salvarDados();
        }
    }

    salvarDados() {
        localStorage.setItem('docegestot_dados', JSON.stringify(this.dados));
    }

    // DASHBOARD
    atualizarDashboard() {
        this.atualizarMetricasDashboard();
        this.carregarProximosPedidos();
    }

    atualizarMetricasDashboard() {
        const hoje = new Date();
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        
        const pedidosMes = this.dados.pedidos.filter(pedido => {
            const dataPedido = new Date(pedido.data_entrega);
            return dataPedido >= inicioMes && dataPedido <= fimMes;
        });
        
        const pedidosPendentes = this.dados.pedidos.filter(pedido => 
            ['recebido', 'em_producao'].includes(pedido.status)
        );
        
        const receitaMensal = pedidosMes.reduce((total, pedido) => total + pedido.valor_total, 0);
        
        document.getElementById('pedidos-mes').textContent = pedidosMes.length;
        document.getElementById('pedidos-pendentes').textContent = pedidosPendentes.length;
        document.getElementById('receita-mensal').textContent = `R$ ${receitaMensal.toFixed(2).replace('.', ',')}`;
    }

    carregarProximosPedidos() {
        const container = document.getElementById('proximos-pedidos');
        if (!container) return;
        
        const hoje = new Date();
        const proximos = this.dados.pedidos
            .filter(pedido => new Date(pedido.data_entrega) >= hoje)
            .sort((a, b) => new Date(a.data_entrega) - new Date(b.data_entrega))
            .slice(0, 5);
        
        if (proximos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Nenhum pedido próximo</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = proximos.map(pedido => `
            <div class="pedido-item">
                <div class="pedido-info">
                    <h4>${pedido.cliente}</h4>
                    <p>${this.formatarData(pedido.data_entrega)} - R$ ${pedido.valor_total.toFixed(2)}</p>
                </div>
                <span class="pedido-status ${pedido.status}">${this.getStatusLabel(pedido.status)}</span>
            </div>
        `).join('');
    }

    // GESTÃO DE PEDIDOS
    carregarDadosPagina(pageName) {
        switch (pageName) {
            case 'pedidos':
                this.carregarTabelaPedidos();
                break;
            case 'receitas':
                this.carregarReceitas();
                break;
            case 'clientes':
                this.carregarTabelaClientes();
                break;
            case 'dashboard':
                this.atualizarDashboard();
                break;
        }
    }

    carregarTabelaPedidos() {
        const tbody = document.getElementById('tabela-pedidos');
        if (!tbody) return;
        
        if (this.dados.pedidos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        <div class="empty-state">
                            <p>Nenhum pedido encontrado</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = this.dados.pedidos.map(pedido => `
            <tr>
                <td>${pedido.cliente}</td>
                <td>${this.formatarData(pedido.data_entrega)}</td>
                <td>
                    <span class="status-badge pedido-status ${pedido.status}">
                        ${this.getStatusLabel(pedido.status)}
                    </span>
                </td>
                <td>R$ ${pedido.valor_total.toFixed(2)}</td>
                <td>
                    <button class="action-btn edit" onclick="app.editarPedido(${pedido.id})">
                        <i data-lucide="edit"></i>
                        Editar
                    </button>
                    <button class="action-btn status" onclick="app.alterarStatusPedido(${pedido.id})">
                        <i data-lucide="rotate-cw"></i>
                        Status
                    </button>
                </td>
            </tr>
        `).join('');
        
        this.inicializarIcones();
    }

    salvarPedido(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const pedido = {
            id: Date.now(),
            cliente: document.getElementById('pedido-cliente').value,
            data_entrega: document.getElementById('pedido-data').value,
            status: document.getElementById('pedido-status').value,
            observacoes: document.getElementById('pedido-observacoes').value,
            valor_total: parseFloat(document.getElementById('pedido-total').textContent.replace('R$ ', '').replace(',', '.')) || 0,
            itens: this.coletarItensPedido(),
            usuario_dono: this.usuarioAtual.nome
        };
        
        this.dados.pedidos.push(pedido);
        this.salvarDados();
        this.carregarTabelaPedidos();
        this.atualizarDashboard();
        
        this.fecharModal('modal-pedido');
        this.limparFormulario('form-pedido');
        this.mostrarToast('Pedido salvo com sucesso!', 'success');
        
        // Recarregar página para atualizar
        setTimeout(() => {
            document.querySelector('[data-page="dashboard"]').click();
        }, 1500);
    }

    editarPedido(id) {
        const pedido = this.dados.pedidos.find(p => p.id === id);
        if (!pedido) return;
        
        // Preencher formulário
        document.getElementById('pedido-cliente').value = pedido.cliente;
        document.getElementById('pedido-data').value = pedido.data_entrega;
        document.getElementById('pedido-status').value = pedido.status;
        document.getElementById('pedido-observacoes').value = pedido.observacoes;
        
        // Carregar itens
        pedido.itens.forEach(item => this.adicionarItemPedido(item));
        this.calcularTotalPedido();
        
        // Configurar para edição
        document.getElementById('modal-pedido-title').textContent = 'Editar Pedido';
        document.getElementById('form-pedido').dataset.editId = id;
        
        this.abrirModal('modal-pedido');
    }

    alterarStatusPedido(id) {
        const pedido = this.dados.pedidos.find(p => p.id === id);
        if (!pedido) return;
        
        const novosStatuses = ['recebido', 'em_producao', 'entregue', 'cancelado'];
        const atualIndex = novosStatuses.indexOf(pedido.status);
        const proximoStatus = novosStatuses[(atualIndex + 1) % novosStatuses.length];
        
        pedido.status = proximoStatus;
        this.salvarDados();
        this.carregarTabelaPedidos();
        this.atualizarDashboard();
        
        this.mostrarToast(`Status alterado para: ${this.getStatusLabel(proximoStatus)}`, 'success');
        
        // Simular integração n8n
        this.simularWebhook('status-pedido', { pedido_id: id, novo_status: proximoStatus });
    }

    coletarItensPedido() {
        const itens = [];
        const container = document.getElementById('itens-pedido');
        
        container.querySelectorAll('.dynamic-item').forEach(item => {
            const receita = item.querySelector('[data-field="receita"]').value;
            const quantidade = parseFloat(item.querySelector('[data-field="quantidade"]').value);
            const precoUnitario = parseFloat(item.querySelector('[data-field="preco"]').value);
            
            if (receita && quantidade && precoUnitario) {
                itens.push({
                    receita,
                    quantidade,
                    preco_unitario: precoUnitario
                });
            }
        });
        
        return itens;
    }

    calcularTotalPedido() {
        const itens = this.coletarItensPedido();
        const total = itens.reduce((sum, item) => sum + (item.quantidade * item.preco_unitario), 0);
        document.getElementById('pedido-total').textContent = `R$ ${total.toFixed(2)}`;
    }

    adicionarItemPedido(dados = {}) {
        const container = document.getElementById('itens-pedido');
        const receitaOptions = this.dados.receitas.map(r => 
            `<option value="${r.nome}" ${dados.receita === r.nome ? 'selected' : ''}>${r.nome}</option>`
        ).join('');
        
        const item = document.createElement('div');
        item.className = 'dynamic-item';
        item.innerHTML = `
            <select data-field="receita" required>
                <option value="">Selecione a receita</option>
                ${receitaOptions}
            </select>
            <input type="number" data-field="quantidade" placeholder="Qtd" min="1" step="0.1" 
                   value="${dados.quantidade || ''}" required>
            <input type="number" data-field="preco" placeholder="Preço" min="0" step="0.01" 
                   value="${dados.preco_unitario || ''}" required>
            <span>R$ <span data-field="total-item">0,00</span></span>
            <button type="button" class="remove-btn" onclick="this.parentElement.remove(); app.calcularTotalPedido()">
                <i data-lucide="trash-2"></i>
            </button>
        `;
        
        container.appendChild(item);
        this.inicializarIcones();
        
        // Adicionar listeners para cálculo automático
        item.querySelectorAll('input, select').forEach(campo => {
            campo.addEventListener('change', () => this.calcularItemPedido(item));
        });
        
        if (dados.quantidade && dados.preco_unitario) {
            this.calcularItemPedido(item);
        }
    }

    calcularItemPedido(item) {
        const quantidade = parseFloat(item.querySelector('[data-field="quantidade"]').value) || 0;
        const preco = parseFloat(item.querySelector('[data-field="preco"]').value) || 0;
        const total = quantidade * preco;
        
        item.querySelector('[data-field="total-item"]').textContent = total.toFixed(2);
        this.calcularTotalPedido();
    }

    // GESTÃO DE RECEITAS
    carregarReceitas() {
        const container = document.getElementById('receitas-lista');
        if (!container) return;
        
        if (this.dados.receitas.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Nenhuma receita encontrada</p>
                    <button class="btn-primary" onclick="app.abrirModal('modal-receita')">
                        <i data-lucide="plus"></i>
                        Criar Primeira Receita
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.dados.receitas.map(receita => `
            <div class="receita-card" onclick="app.editarReceita(${receita.id})">
                <h4>${receita.nome}</h4>
                <span class="receita-categoria">${this.getCategoriaLabel(receita.categoria)}</span>
                <p style="margin-bottom: 12px; color: #718096;">${receita.descricao || 'Sem descrição'}</p>
                <div class="receita-custo">R$ ${receita.custo_total.toFixed(2)}</div>
            </div>
        `).join('');
    }

    salvarReceita(e) {
        e.preventDefault();
        
        const receita = {
            id: Date.now(),
            nome: document.getElementById('receita-nome').value,
            categoria: document.getElementById('receita-categoria').value,
            descricao: document.getElementById('receita-descricao').value,
            custo_total: parseFloat(document.getElementById('receita-custo').textContent.replace('R$ ', '').replace(',', '.')) || 0,
            preco_sugerido: parseFloat(document.getElementById('receita-preco-sugerido').textContent.replace('R$ ', '').replace(',', '.')) || 0,
            instrucoes_preparo: document.getElementById('receita-instrucoes').value,
            ingredientes: this.coletarIngredientes(),
            usuario_dono: this.usuarioAtual.nome
        };
        
        this.dados.receitas.push(receita);
        this.salvarDados();
        this.carregarReceitas();
        
        this.fecharModal('modal-receita');
        this.limparFormulario('form-receita');
        this.mostrarToast('Receita salva com sucesso!', 'success');
    }

    editarReceita(id) {
        const receita = this.dados.receitas.find(r => r.id === id);
        if (!receita) return;
        
        // Preencher formulário
        document.getElementById('receita-nome').value = receita.nome;
        document.getElementById('receita-categoria').value = receita.categoria;
        document.getElementById('receita-descricao').value = receita.descricao;
        document.getElementById('receita-instrucoes').value = receita.instrucoes_preparo;
        
        // Carregar ingredientes
        receita.ingredientes.forEach(ing => this.adicionarIngrediente(ing));
        this.calcularCustoReceita();
        
        // Configurar para edição
        document.getElementById('modal-receita-title').textContent = 'Editar Receita';
        document.getElementById('form-receita').dataset.editId = id;
        
        this.abrirModal('modal-receita');
    }

    coletarIngredientes() {
        const ingredientes = [];
        const container = document.getElementById('ingredientes-receita');
        
        container.querySelectorAll('.dynamic-item-receita').forEach(item => {
            const nome = item.querySelector('[data-field="nome"]').value;
            const quantidade = parseFloat(item.querySelector('[data-field="quantidade"]').value);
            const unidade = item.querySelector('[data-field="unidade"]').value;
            const custoUnitario = parseFloat(item.querySelector('[data-field="custo"]').value);
            
            if (nome && quantidade && unidade && custoUnitario) {
                ingredientes.push({
                    nome,
                    quantidade,
                    unidade,
                    custo_unitario: custoUnitario
                });
            }
        });
        
        return ingredientes;
    }

    calcularCustoReceita() {
        const ingredientes = this.coletarIngredientes();
        const custoTotal = ingredientes.reduce((total, ing) => 
            total + (ing.quantidade * ing.custo_unitario), 0
        );
        const precoSugerido = custoTotal * 3.5; // Markup de 350%
        
        document.getElementById('receita-custo').textContent = `R$ ${custoTotal.toFixed(2)}`;
        document.getElementById('receita-preco-sugerido').textContent = `R$ ${precoSugerido.toFixed(2)}`;
    }

    adicionarIngrediente(dados = {}) {
        const container = document.getElementById('ingredientes-receita');
        
        const item = document.createElement('div');
        item.className = 'dynamic-item-receita';
        item.innerHTML = `
            <input type="text" data-field="nome" placeholder="Nome do ingrediente" 
                   value="${dados.nome || ''}" required>
            <input type="number" data-field="quantidade" placeholder="Qtd" min="0" step="0.01" 
                   value="${dados.quantidade || ''}" required>
            <select data-field="unidade" required>
                <option value="g" ${dados.unidade === 'g' ? 'selected' : ''}>g</option>
                <option value="kg" ${dados.unidade === 'kg' ? 'selected' : ''}>kg</option>
                <option value="ml" ${dados.unidade === 'ml' ? 'selected' : ''}>ml</option>
                <option value="L" ${dados.unidade === 'L' ? 'selected' : ''}>L</option>
                <option value="un" ${dados.unidade === 'un' ? 'selected' : ''}>un</option>
            </select>
            <input type="number" data-field="custo" placeholder="R$/un" min="0" step="0.01" 
                   value="${dados.custo_unitario || ''}" required>
            <button type="button" class="remove-btn" onclick="this.parentElement.remove(); app.calcularCustoReceita()">
                <i data-lucide="trash-2"></i>
            </button>
        `;
        
        container.appendChild(item);
        this.inicializarIcones();
        
        // Adicionar listeners para cálculo automático
        item.querySelectorAll('input, select').forEach(campo => {
            campo.addEventListener('change', () => this.calcularCustoReceita());
        });
    }

    // GESTÃO DE CLIENTES
    carregarTabelaClientes() {
        const tbody = document.getElementById('tabela-clientes');
        if (!tbody) return;
        
        if (this.dados.clientes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        <div class="empty-state">
                            <p>Nenhum cliente encontrado</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = this.dados.clientes.map(cliente => `
            <tr>
                <td>${cliente.nome}</td>
                <td>${cliente.telefone}</td>
                <td>${cliente.email || '-'}</td>
                <td>${cliente.observacoes || '-'}</td>
                <td>
                    <button class="action-btn edit" onclick="app.editarCliente(${cliente.id})">
                        <i data-lucide="edit"></i>
                        Editar
                    </button>
                    <button class="action-btn delete" onclick="app.excluirCliente(${cliente.id})">
                        <i data-lucide="trash-2"></i>
                        Excluir
                    </button>
                </td>
            </tr>
        `).join('');
        
        this.inicializarIcones();
    }

    salvarCliente(e) {
        e.preventDefault();
        
        const cliente = {
            id: Date.now(),
            nome: document.getElementById('cliente-nome').value,
            telefone: document.getElementById('cliente-telefone').value,
            email: document.getElementById('cliente-email').value,
            observacoes: document.getElementById('cliente-observacoes').value,
            usuario_dono: this.usuarioAtual.nome
        };
        
        this.dados.clientes.push(cliente);
        this.salvarDados();
        this.carregarTabelaClientes();
        
        this.fecharModal('modal-cliente');
        this.limparFormulario('form-cliente');
        this.mostrarToast('Cliente salvo com sucesso!', 'success');
    }

    editarCliente(id) {
        const cliente = this.dados.clientes.find(c => c.id === id);
        if (!cliente) return;
        
        document.getElementById('cliente-nome').value = cliente.nome;
        document.getElementById('cliente-telefone').value = cliente.telefone;
        document.getElementById('cliente-email').value = cliente.email;
        document.getElementById('cliente-observacoes').value = cliente.observacoes;
        
        document.getElementById('modal-cliente-title').textContent = 'Editar Cliente';
        document.getElementById('form-cliente').dataset.editId = id;
        
        this.abrirModal('modal-cliente');
    }

    excluirCliente(id) {
        if (confirm('Deseja realmente excluir este cliente?')) {
            this.dados.clientes = this.dados.clientes.filter(c => c.id !== id);
            this.salvarDados();
            this.carregarTabelaClientes();
            this.mostrarToast('Cliente excluído com sucesso!', 'success');
        }
    }

    // UTILITÁRIOS
    abrirModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            
            // Preencher selects de clientes para pedidos
            if (modalId === 'modal-pedido') {
                this.preencherSelectClientes();
                this.preencherSelectReceitas();
                
                // Limpar itens existentes
                document.getElementById('itens-pedido').innerHTML = '';
                this.adicionarItemPedido();
            }
            
            // Limpar receita se nova
            if (modalId === 'modal-receita') {
                document.getElementById('ingredientes-receita').innerHTML = '';
                this.adicionarIngrediente();
                this.calcularCustoReceita();
            }
        }
    }

    fecharModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            
            // Resetar formulários
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
                delete form.dataset.editId;
            }
        }
    }

    preencherSelectClientes() {
        const select = document.getElementById('pedido-cliente');
        select.innerHTML = '<option value="">Selecione um cliente</option>' +
            this.dados.clientes.map(c => `<option value="${c.nome}">${c.nome}</option>`).join('');
    }

    preencherSelectReceitas() {
        // Atualizar todos os selects de receita nos itens
        document.querySelectorAll('#itens-pedido select[data-field="receita"]').forEach(select => {
            select.innerHTML = '<option value="">Selecione a receita</option>' +
                this.dados.receitas.map(r => `<option value="${r.nome}">${r.nome}</option>`).join('');
        });
    }

    limparFormulario(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
            delete form.dataset.editId;
        }
        
        // Limpar containers dinâmicos
        const dynamicContainers = ['itens-pedido', 'ingredientes-receita'];
        dynamicContainers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '';
            }
        });
    }

    filtrarPedidos(termo) {
        const rows = document.querySelectorAll('#tabela-pedidos tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(termo.toLowerCase()) ? '' : 'none';
        });
    }

    filtrarClientes(termo) {
        const rows = document.querySelectorAll('#tabela-clientes tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(termo.toLowerCase()) ? '' : 'none';
        });
    }

    formatarData(data) {
        return new Date(data).toLocaleDateString('pt-BR');
    }

    getStatusLabel(status) {
        const labels = {
            'recebido': 'Recebido',
            'em_producao': 'Em Produção',
            'entregue': 'Entregue',
            'cancelado': 'Cancelado'
        };
        return labels[status] || status;
    }

    getCategoriaLabel(categoria) {
        const labels = {
            'bolo': 'Bolo',
            'doce_fino': 'Doce Fino',
            'torta': 'Torta'
        };
        return labels[categoria] || categoria;
    }

    mostrarToast(mensagem, tipo = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${tipo}`;
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <i data-lucide="${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'alert-circle' : 'alert-triangle'}"></i>
                <span>${mensagem}</span>
            </div>
        `;
        
        container.appendChild(toast);
        this.inicializarIcones();
        
        setTimeout(() => {
            toast.remove();
        }, 4000);
    }

    simularWebhook(tipo, dados) {
        console.log(`📱 Webhook ${tipo}:`, dados);
        // Aqui seria integrado com n8n para automações
    }
}

// Event Listeners Globais
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DoceGestot();
    
    // Logout
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        app.fazerLogout();
    });
    
    // Auto-save a cada 30 segundos
    setInterval(() => {
        if (window.app) {
            window.app.salvarDados();
        }
    }, 30000);
    
    // Before unload warning
    window.addEventListener('beforeunload', (e) => {
        // Aqui poderia adicionar lógica para salvar dados pendentes
    });
});

// Service Worker para PWA (futuro)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => console.log('SW registered:', registration))
        .catch(error => console.log('SW registration failed:', error));
}