// 🚀 SCRIPT DE MIGRAÇÃO - DoceGestot para Stack Moderna
// Este script migra dados do localStorage para Supabase + n8n

const migrateToModernStack = async () => {
  console.log('🔄 Iniciando migração para Stack Moderna...');

  // ============================================
  // CONFIGURAÇÕES
  // ============================================
  const config = {
    // URLs das APIs (SUBSTITUA PELAS SUAS URLs REAIS)
    SUPABASE_URL: 'https://your-supabase-domain.com',
    N8N_URL: 'https://workflow.eetadnucleopalmas.shop',
    
    // Chaves (OBTER NO SUPABASE ADMIN)
    SUPABASE_ANON_KEY: 'eyJ...sua_chave_aqui',
    SUPABASE_SERVICE_KEY: 'eyJ...sua_service_key_aqui',
    
    // Teste (alterar para false em produção)
    DRY_RUN: true
  };

  // ============================================
  // UTILITÁRIOS
  // ============================================
  
  // Função para fazer requests HTTP
  const apiCall = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      'apikey': config.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${config.SUPABASE_ANON_KEY}`,
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  };

  // Função para logging
  const log = (message, type = 'info') => {
    const timestamp = new Date().toISOString();
    const icons = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    };
    console.log(`${icons[type]} [${timestamp}] ${message}`);
  };

  // ============================================
  // PASSO 1: EXPORTAR DADOS do localStorage
  // ============================================
  
  const exportLocalData = () => {
    try {
      const dataString = localStorage.getItem('docegestot_dados');
      
      if (!dataString) {
        log('Nenhum dado encontrado no localStorage', 'warning');
        return null;
      }

      const data = JSON.parse(dataString);
      log(`Dados exportados do localStorage:`, 'success');
      console.log('Estrutura dos dados:', data);

      return {
        clientes: data.clientes || [],
        receitas: data.receitas || [],
        pedidos: data.pedidos || [],
        ingredientes: data.ingredientes || []
      };
    } catch (error) {
      log(`Erro ao exportar dados: ${error.message}`, 'error');
      return null;
    }
  };

  // ============================================
  // PASSO 2: AUTENTICAR NO SUPABASE
  // ============================================
  
  const authenticateSupabase = async (email, password) => {
    try {
      log(`Autenticando usuário: ${email}`);
      
      const response = await fetch(`${config.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      if (!response.ok) {
        throw new Error(`Falha na autenticação: ${response.status}`);
      }

      const data = await response.json();
      log('Usuário autenticado com sucesso', 'success');
      
      return data.access_token;
    } catch (error) {
      log(`Erro na autenticação: ${error.message}`, 'error');
      throw error;
    }
  };

  // ============================================
  // PASSO 3: CRIAR USUÁRIOS NO SUPABASE AUTH
  // ============================================
  
  const createSupabaseUser = async (userData) => {
    try {
      if (config.DRY_RUN) {
        log(`[DRY RUN] Criaria usuário: ${userData.email}`, 'info');
        return { id: 'dry-run-user-id' };
      }

      const response = await fetch(`${config.SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${config.SUPABASE_SERVICE_KEY}`
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password || 'temp123456',
          email_confirm: true,
          user_metadata: {
            nome_completo: userData.nome_completo || '',
            tipo_usuario: userData.tipo_usuario || 'confeiteira'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Falha ao criar usuário: ${response.status}`);
      }

      const data = await response.json();
      log(`Usuário criado: ${userData.email}`, 'success');
      
      return data;
    } catch (error) {
      log(`Erro ao criar usuário ${userData.email}: ${error.message}`, 'error');
      throw error;
    }
  };

  // ============================================
  // PASSO 4: CRIAR TABELAS NO n8n
  // ============================================
  
  const createTableInN8N = async (tableName, schema) => {
    try {
      if (config.DRY_RUN) {
        log(`[DRY RUN] Criaria tabela: ${tableName}`, 'info');
        return { success: true };
      }

      const response = await fetch(`${config.N8N_URL}/api/rest/tables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase_session')?.access_token}`
        },
        body: JSON.stringify({
          name: tableName,
          schema: schema
        })
      });

      if (!response.ok) {
        throw new Error(`Falha ao criar tabela ${tableName}: ${response.status}`);
      }

      const data = await response.json();
      log(`Tabela criada: ${tableName}`, 'success');
      
      return data;
    } catch (error) {
      log(`Erro ao criar tabela ${tableName}: ${error.message}`, 'error');
      throw error;
    }
  };

  // ============================================
  // PASSO 5: MIGRAR DADOS
  // ============================================
  
  const migrateData = async (localData) => {
    const results = {
      usuarios: [],
      clientes: [],
      receitas: [],
      pedidos: []
    };

    try {
      // 1. Criar usuários únicos encontrados nos dados
      const uniqueUsers = new Set();
      
      // Coletar emails únicos
      [...localData.clientes, ...localData.receitas, ...localData.pedidos].forEach(item => {
        if (item.usuario_dono) {
          uniqueUsers.add(item.usuario_dono);
        }
      });

      log(`Encontrados ${uniqueUsers.size} usuários únicos`, 'info');

      // 2. Criar cada usuário
      for (const userEmail of uniqueUsers) {
        if (!userEmail || userEmail === 'null' || userEmail === 'undefined') continue;

        try {
          const supabaseUser = await createSupabaseUser({
            email: userEmail,
            nome_completo: userEmail.split('@')[0], // Usar parte do email como nome
            tipo_usuario: 'confeiteira'
          });

          results.usuarios.push({
            supabase_id: supabaseUser.id,
            email: userEmail,
            nome_completo: userEmail.split('@')[0]
          });

        } catch (error) {
          // Se usuário já existe, pegar existente
          log(`Usuário ${userEmail} pode já existir, continuando...`, 'warning');
        }
      }

      // 3. Migrar clientes
      log(`Migrando ${localData.clientes.length} clientes...`, 'info');
      
      for (const cliente of localData.clientes) {
        try {
          if (config.DRY_RUN) {
            log(`[DRY RUN] Migraria cliente: ${cliente.nome}`, 'info');
            results.clientes.push({ ...cliente, migrated: true });
            continue;
          }

          const response = await fetch(`${config.N8N_URL}/api/rest/tables/clientes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('supabase_session')?.access_token}`
            },
            body: JSON.stringify({
              nome: cliente.nome,
              telefone: cliente.telefone || '',
              email: cliente.email || '',
              observacoes: cliente.observacoes || '',
              usuario_id: results.usuarios.find(u => u.email === cliente.usuario_dono)?.id || null
            })
          });

          if (response.ok) {
            const data = await response.json();
            results.clientes.push({ ...cliente, migrated: true, newId: data.id });
            log(`Cliente migrado: ${cliente.nome}`, 'success');
          }

        } catch (error) {
          log(`Erro ao migrar cliente ${cliente.nome}: ${error.message}`, 'error');
        }
      }

      // 4. Migrar receitas
      log(`Migrando ${localData.receitas.length} receitas...`, 'info');
      
      for (const receita of localData.receitas) {
        try {
          if (config.DRY_RUN) {
            log(`[DRY RUN] Migraria receita: ${receita.nome}`, 'info');
            results.receitas.push({ ...receita, migrated: true });
            continue;
          }

          const response = await fetch(`${config.N8N_URL}/api/rest/tables/receitas`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('supabase_session')?.access_token}`
            },
            body: JSON.stringify({
              nome: receita.nome,
              descricao: receita.descricao || '',
              categoria: receita.categoria || 'bolo',
              custo_total: parseFloat(receita.custo_total) || 0,
              preco_sugerido: parseFloat(receita.preco_sugerido) || 0,
              instrucoes_preparo: receita.instrucoes_preparo || '',
              ingredientes: JSON.stringify(receita.ingredientes || []),
              usuario_id: results.usuarios.find(u => u.email === receita.usuario_dono)?.id || null
            })
          });

          if (response.ok) {
            const data = await response.json();
            results.receitas.push({ ...receita, migrated: true, newId: data.id });
            log(`Receita migrada: ${receita.nome}`, 'success');
          }

        } catch (error) {
          log(`Erro ao migrar receita ${receita.nome}: ${error.message}`, 'error');
        }
      }

      // 5. Migrar pedidos
      log(`Migrando ${localData.pedidos.length} pedidos...`, 'info');
      
      for (const pedido of localData.pedidos) {
        try {
          if (config.DRY_RUN) {
            log(`[DRY RUN] Migraria pedido: ${pedido.id}`, 'info');
            results.pedidos.push({ ...pedido, migrated: true });
            continue;
          }

          // Encontrar cliente relacionado
          const cliente = results.clientes.find(c => c.nome === pedido.cliente_nome || c.id === pedido.cliente_id);
          
          const response = await fetch(`${config.N8N_URL}/api/rest/tables/pedidos`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('supabase_session')?.access_token}`
            },
            body: JSON.stringify({
              status: pedido.status || 'recebido',
              data_entrega: pedido.data_entrega || new Date().toISOString().split('T')[0],
              total: parseFloat(pedido.valor_total) || 0,
              observacoes: pedido.observacoes || '',
              itens: JSON.stringify(pedido.itens || []),
              cliente_id: cliente?.newId || null,
              usuario_id: results.usuarios.find(u => u.email === pedido.usuario_dono)?.id || null
            })
          });

          if (response.ok) {
            const data = await response.json();
            results.pedidos.push({ ...pedido, migrated: true, newId: data.id });
            log(`Pedido migrado: #${pedido.id}`, 'success');
          }

        } catch (error) {
          log(`Erro ao migrar pedido #${pedido.id}: ${error.message}`, 'error');
        }
      }

      return results;

    } catch (error) {
      log(`Erro durante migração: ${error.message}`, 'error');
      throw error;
    }
  };

  // ============================================
  // PASSO 6: VALIDAÇÃO DOS DADOS
  // ============================================
  
  const validateMigration = (results) => {
    log('Validando dados migrados...', 'info');

    const validation = {
      usuarios: results.usuarios.length > 0,
      clientes: results.clientes.filter(c => c.migrated).length > 0,
      receitas: results.receitas.filter(r => r.migrated).length > 0,
      pedidos: results.pedidos.filter(p => p.migrated).length > 0
    };

    Object.entries(validation).forEach(([table, success]) => {
      if (success) {
        log(`✅ Tabela ${table} validada`, 'success');
      } else {
        log(`❌ Problema na tabela ${table}`, 'error');
      }
    });

    return validation;
  };

  // ============================================
  // FUNÇÃO PRINCIPAL DE MIGRAÇÃO
  // ============================================
  
  const runMigration = async () => {
    try {
      log('🚀 Iniciando migração completa...', 'info');

      // PASSO 1: Exportar dados locais
      log('📤 Exportando dados do localStorage...', 'info');
      const localData = exportLocalData();
      
      if (!localData) {
        log('❌ Não foi possível exportar dados. Cancelando migração.', 'error');
        return;
      }

      // PASSO 2: Autenticar (OPCIONAL - se precisar de auth)
      log('🔐 Autenticando no Supabase...', 'info');
      
      const adminEmail = prompt('Email do admin para autenticação:');
      const adminPassword = prompt('Senha do admin:');
      
      if (adminEmail && adminPassword) {
        const token = await authenticateSupabase(adminEmail, adminPassword);
        localStorage.setItem('supabase_session', JSON.stringify({ access_token: token }));
      }

      // PASSO 3: Migrar dados
      log('🔄 Migrando dados para nova stack...', 'info');
      const results = await migrateData(localData);

      // PASSO 4: Validar
      log('✅ Validando migração...', 'info');
      const validation = validateMigration(results);

      // PASSO 5: Relatório final
      log('📊 Relatório final da migração:', 'success');
      console.log('=====================================');
      console.log('RESULTADOS DA MIGRAÇÃO:');
      console.log('=====================================');
      console.log(`👤 Usuários criados: ${results.usuarios.length}`);
      console.log(`👥 Clientes migrados: ${results.clientes.filter(c => c.migrated).length}`);
      console.log(`🍰 Receitas migradas: ${results.receitas.filter(r => r.migrated).length}`);
      console.log(`📦 Pedidos migrados: ${results.pedidos.filter(p => p.migrated).length}`);
      console.log('=====================================');

      // PASSO 6: Limpar localStorage (OPCIONAL)
      if (!config.DRY_RUN && Object.values(validation).every(v => v)) {
        const shouldClear = confirm('Migração concluída com sucesso! Deseja limpar o localStorage?');
        if (shouldClear) {
          localStorage.removeItem('docegestot_dados');
          log('🗑️ localStorage limpo', 'success');
        }
      }

      log('🎉 Migração concluída!', 'success');
      
      return results;

    } catch (error) {
      log(`💥 Erro fatal na migração: ${error.message}`, 'error');
      console.error('Stack trace:', error);
      throw error;
    }
  };

  // ============================================
  // EXECUTAR MIGRAÇÃO
  // ============================================
  
  return {
    runMigration,
    config,
    exportLocalData,
    migrateData
  };
};

// ============================================
// INTERFACE DE COMANDO
// ============================================

// Para executar no console do navegador:
if (typeof window !== 'undefined') {
  console.log('🔧 Script de migração carregado!');
  console.log('📋 Execute: migrateToModernStack().runMigration()');
  
  // Disponibilizar globalmente
  window.migrateToModernStack = migrateToModernStack;
}

// Para Node.js:
if (typeof module !== 'undefined' && module.exports) {
  module.exports = migrateToModernStack;
}

// ============================================
// INSTRUÇÕES DE USO
// ============================================

/*
INSTRUÇÕES PARA EXECUTAR A MIGRAÇÃO:

1. CONFIGURAR URLs:
   - Edite as URLs no objeto 'config'
   - Configure suas chaves do Supabase

2. EXECUTAR NO BROWSER:
   console.log('🚀 Iniciando migração...');
   const migrator = migrateToModernStack();
   await migrator.runMigration();

3. EXECUTAR COM DRY RUN (teste):
   migrator.config.DRY_RUN = true;
   await migrator.runMigration();

4. VERIFICAR RESULTADOS:
   - Console mostra progresso detalhado
   - Relatório final com estatísticas
   - Dados disponíveis para verificação

5. IMPORTANTE:
   - Execute primeiro com DRY_RUN = true
   - Verifique se os dados estão corretos
   - Execute novamente com DRY_RUN = false
   - Sistema migra todos os dados automaticamente

ESTRUTURA DE DADOS ESPERADA NO localStorage:
{
  "clientes": [
    {
      "id": 1,
      "nome": "Maria Silva",
      "telefone": "(11) 99999-9999",
      "email": "maria@email.com",
      "observacoes": "Prefere doces sem lactose",
      "usuario_dono": "admin@docegestot.com"
    }
  ],
  "receitas": [
    {
      "id": 1,
      "nome": "Bolo de Chocolate",
      "descricao": "Bolo cremoso",
      "categoria": "bolo",
      "custo_total": "15.50",
      "preco_sugerido": "54.25",
      "ingredientes": [...],
      "usuario_dono": "admin@docegestot.com"
    }
  ],
  "pedidos": [
    {
      "id": 1,
      "cliente_id": 1,
      "cliente_nome": "Maria Silva",
      "data_entrega": "2025-01-20",
      "status": "recebido",
      "valor_total": "54.25",
      "itens": [...],
      "usuario_dono": "admin@docegestot.com"
    }
  ]
}
*/