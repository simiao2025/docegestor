import React, { useEffect, useState } from 'react'
import { supabase, Pedido, Cliente, Receita, Usuario } from '../lib/supabase'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const Pedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<(Pedido & { cliente?: Cliente; receita?: Receita; usuario?: Usuario })[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPedido, setEditingPedido] = useState<Pedido | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [formData, setFormData] = useState({
    cliente_id: '',
    receita_id: '',
    quantidade: 1,
    data_pedido: format(new Date(), 'yyyy-MM-dd'),
    data_entrega: '',
    status_pedido: 'pendente' as 'pendente' | 'em_producao' | 'pronto' | 'entregue' | 'cancelado',
    observacoes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Carregar pedidos com relacionamentos
      const [pedidosResult, clientesResult, receitasResult, usuariosResult] = await Promise.all([
        supabase
          .from('pedidos')
          .select(`
            *,
            cliente:clientes(*),
            receita:receitas(*),
            usuario:usuarios(*)
          `)
          .order('created_at', { ascending: false }),
        supabase.from('clientes').select('*').eq('ativo', true),
        supabase.from('receitas').select('*').eq('ativo', true),
        supabase.from('usuarios').select('*').eq('ativo', true)
      ])

      if (pedidosResult.error) throw pedidosResult.error
      if (clientesResult.error) throw clientesResult.error
      if (receitasResult.error) throw receitasResult.error
      if (usuariosResult.error) throw usuariosResult.error

      setPedidos(pedidosResult.data || [])
      setClientes(clientesResult.data || [])
      setReceitas(receitasResult.data || [])
      setUsuarios(usuariosResult.data || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = (receitaId: string, quantidade: number) => {
    const receita = receitas.find(r => r.id === receitaId)
    if (!receita) return 0
    return receita.preco_venda * quantidade
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const receita = receitas.find(r => r.id === formData.receita_id)
      if (!receita) {
        toast.error('Receita não encontrada')
        setLoading(false)
        return
      }

      const valorTotal = calculateTotal(formData.receita_id, formData.quantidade)

      const pedidoData = {
        ...formData,
        valor_total: valorTotal,
        usuario_id: usuarios[0]?.id || '', // Pega o primeiro usuário ativo
        preco_unitario: receita.preco_venda
      }

      if (editingPedido) {
        const { error } = await supabase
          .from('pedidos')
          .update(pedidoData)
          .eq('id', editingPedido.id)

        if (error) throw error
        toast.success('Pedido atualizado com sucesso!')
      } else {
        const { error } = await supabase
          .from('pedidos')
          .insert([pedidoData])

        if (error) throw error
        toast.success('Pedido criado com sucesso!')
      }

      setShowForm(false)
      setEditingPedido(null)
      setFormData({
        cliente_id: '',
        receita_id: '',
        quantidade: 1,
        data_pedido: format(new Date(), 'yyyy-MM-dd'),
        data_entrega: '',
        status_pedido: 'pendente',
        observacoes: ''
      })
      loadData()
    } catch (error: any) {
      console.error('Erro ao salvar pedido:', error)
      toast.error(error.message || 'Erro ao salvar pedido')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (pedido: Pedido) => {
    setEditingPedido(pedido)
    setFormData({
      cliente_id: pedido.cliente_id,
      receita_id: pedido.receita_id,
      quantidade: pedido.quantidade,
      data_pedido: format(new Date(pedido.data_pedido), 'yyyy-MM-dd'),
      data_entrega: format(new Date(pedido.data_entrega), 'yyyy-MM-dd'),
      status_pedido: pedido.status_pedido,
      observacoes: pedido.observacoes || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return

    try {
      const { error } = await supabase
        .from('pedidos')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Pedido excluído com sucesso!')
      loadData()
    } catch (error: any) {
      console.error('Erro ao excluir pedido:', error)
      toast.error(error.message || 'Erro ao excluir pedido')
    }
  }

  const updateStatus = async (pedido: Pedido, newStatus: typeof pedido.status_pedido) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ status_pedido: newStatus })
        .eq('id', pedido.id)

      if (error) throw error
      toast.success('Status do pedido atualizado!')
      loadData()
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error)
      toast.error(error.message || 'Erro ao atualizar status')
    }
  }

  const filteredPedidos = pedidos.filter(pedido => {
    const matchesSearch = pedido.numero_pedido.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pedido.cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pedido.receita?.nome.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filterStatus || pedido.status_pedido === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800'
      case 'em_producao': return 'bg-blue-100 text-blue-800'
      case 'pronto': return 'bg-green-100 text-green-800'
      case 'entregue': return 'bg-purple-100 text-purple-800'
      case 'cancelado': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading && pedidos.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-600">Gerencie os pedidos da empresa</p>
        </div>
        <button
          onClick={() => {
            setEditingPedido(null)
            setFormData({
              cliente_id: '',
              receita_id: '',
              quantidade: 1,
              data_pedido: format(new Date(), 'yyyy-MM-dd'),
              data_entrega: '',
              status_pedido: 'pendente',
              observacoes: ''
            })
            setShowForm(true)
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Pedido
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por número, cliente ou receita..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-field"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field"
          >
            <option value="">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="em_producao">Em Produção</option>
            <option value="pronto">Pronto</option>
            <option value="entregue">Entregue</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Pedidos Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Número do Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receita
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qtd
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Entrega
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPedidos.map((pedido) => (
                <tr key={pedido.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{pedido.numero_pedido}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{pedido.cliente?.nome}</div>
                    <div className="text-xs text-gray-500">{pedido.cliente?.telefone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{pedido.receita?.nome}</div>
                    <div className="text-xs text-gray-500">{pedido.receita?.categoria}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{pedido.quantidade}</div>
                    <div className="text-xs text-gray-500">R$ {pedido.preco_unitario.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">R$ {pedido.valor_total.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {format(new Date(pedido.data_entrega), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={pedido.status_pedido}
                      onChange={(e) => updateStatus(pedido, e.target.value as any)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${getStatusColor(pedido.status_pedido)}`}
                    >
                      <option value="pendente">Pendente</option>
                      <option value="em_producao">Em Produção</option>
                      <option value="pronto">Pronto</option>
                      <option value="entregue">Entregue</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(pedido)}
                        className="text-primary-600 hover:text-primary-900"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(pedido.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPedidos.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || filterStatus ? 'Nenhum pedido encontrado' : 'Nenhum pedido cadastrado'}
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingPedido ? 'Editar Pedido' : 'Novo Pedido'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente *
                  </label>
                  <select
                    required
                    value={formData.cliente_id}
                    onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Selecione um cliente</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Receita *
                  </label>
                  <select
                    required
                    value={formData.receita_id}
                    onChange={(e) => setFormData({ ...formData, receita_id: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Selecione uma receita</option>
                    {receitas.map(receita => (
                      <option key={receita.id} value={receita.id}>
                        {receita.nome} - R$ {receita.preco_venda.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantidade *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.quantidade}
                    onChange={(e) => setFormData({ ...formData, quantidade: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    required
                    value={formData.status_pedido}
                    onChange={(e) => setFormData({ ...formData, status_pedido: e.target.value as any })}
                    className="input-field"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="em_producao">Em Produção</option>
                    <option value="pronto">Pronto</option>
                    <option value="entregue">Entregue</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data do Pedido *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.data_pedido}
                    onChange={(e) => setFormData({ ...formData, data_pedido: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Entrega *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.data_entrega}
                    onChange={(e) => setFormData({ ...formData, data_entrega: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              {formData.receita_id && formData.quantidade > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">Valor Total:</span>
                    <span className="text-lg font-bold text-blue-900">
                      R$ {calculateTotal(formData.receita_id, formData.quantidade).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Observações adicionais..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Pedidos