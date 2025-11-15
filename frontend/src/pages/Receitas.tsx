import React, { useEffect, useState } from 'react'
import { supabase, Receita } from '../lib/supabase'
import { Plus, Edit, Trash2, Search, Clock, DollarSign, Package } from 'lucide-react'
import toast from 'react-hot-toast'

const Receitas: React.FC = () => {
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingReceita, setEditingReceita] = useState<Receita | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategoria, setFilterCategoria] = useState('')
  const [formData, setFormData] = useState({
    nome: '',
    ingredientes: '',
    modo_preparo: '',
    tempo_preparo: 0,
    rendimento: 0,
    custo_estimado: 0,
    preco_venda: 0,
    categoria: '',
    disponibilidade: 'disponivel',
    observacoes: '',
    ativo: true
  })

  const categorias = [
    'Bolo',
    'Torta',
    'Cupcake',
    'Brigadeiro',
    'Trufa',
    'Pudim',
    'Mousse',
    'Sorvete',
    'Biscoito',
    'Doce de Leite',
    'Coxinha Doce',
    ' outros'
  ]

  useEffect(() => {
    loadReceitas()
  }, [])

  const loadReceitas = async () => {
    try {
      const { data, error } = await supabase
        .from('receitas')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setReceitas(data || [])
    } catch (error) {
      console.error('Erro ao carregar receitas:', error)
      toast.error('Erro ao carregar receitas')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingReceita) {
        const { error } = await supabase
          .from('receitas')
          .update(formData)
          .eq('id', editingReceita.id)

        if (error) throw error
        toast.success('Receita atualizada com sucesso!')
      } else {
        const { error } = await supabase
          .from('receitas')
          .insert([formData])

        if (error) throw error
        toast.success('Receita criada com sucesso!')
      }

      setShowForm(false)
      setEditingReceita(null)
      setFormData({
        nome: '',
        ingredientes: '',
        modo_preparo: '',
        tempo_preparo: 0,
        rendimento: 0,
        custo_estimado: 0,
        preco_venda: 0,
        categoria: '',
        disponibilidade: 'disponivel',
        observacoes: '',
        ativo: true
      })
      loadReceitas()
    } catch (error: any) {
      console.error('Erro ao salvar receita:', error)
      toast.error(error.message || 'Erro ao salvar receita')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (receita: Receita) => {
    setEditingReceita(receita)
    setFormData({
      nome: receita.nome,
      ingredientes: receita.ingredientes,
      modo_preparo: receita.modo_preparo,
      tempo_preparo: receita.tempo_preparo,
      rendimento: receita.rendimento,
      custo_estimado: receita.custo_estimado,
      preco_venda: receita.preco_venda,
      categoria: receita.categoria,
      disponibilidade: receita.disponibilidade,
      observacoes: receita.observacoes || '',
      ativo: receita.ativo
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta receita?')) return

    try {
      const { error } = await supabase
        .from('receitas')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Receita excluída com sucesso!')
      loadReceitas()
    } catch (error: any) {
      console.error('Erro ao excluir receita:', error)
      toast.error(error.message || 'Erro ao excluir receita')
    }
  }

  const toggleStatus = async (receita: Receita) => {
    try {
      const { error } = await supabase
        .from('receitas')
        .update({ ativo: !receita.ativo })
        .eq('id', receita.id)

      if (error) throw error
      toast.success(`Receita ${!receita.ativo ? 'ativada' : 'desativada'} com sucesso!`)
      loadReceitas()
    } catch (error: any) {
      console.error('Erro ao alterar status:', error)
      toast.error(error.message || 'Erro ao alterar status')
    }
  }

  const filteredReceitas = receitas.filter(receita => {
    const matchesSearch = receita.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receita.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategoria = !filterCategoria || receita.categoria === filterCategoria
    return matchesSearch && matchesCategoria
  })

  if (loading && receitas.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Receitas</h1>
          <p className="text-gray-600">Gerencie as receitas da empresa</p>
        </div>
        <button
          onClick={() => {
            setEditingReceita(null)
            setFormData({
              nome: '',
              ingredientes: '',
              modo_preparo: '',
              tempo_preparo: 0,
              rendimento: 0,
              custo_estimado: 0,
              preco_venda: 0,
              categoria: '',
              disponibilidade: 'disponivel',
              observacoes: '',
              ativo: true
            })
            setShowForm(true)
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nova Receita
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-field"
            />
          </div>
          <select
            value={filterCategoria}
            onChange={(e) => setFilterCategoria(e.target.value)}
            className="input-field"
          >
            <option value="">Todas as categorias</option>
            {categorias.map(categoria => (
              <option key={categoria} value={categoria}>{categoria}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReceitas.map((receita) => (
          <div key={receita.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-gray-900">{receita.nome}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                receita.categoria === 'Bolo' ? 'bg-blue-100 text-blue-800' :
                receita.categoria === 'Cupcake' ? 'bg-purple-100 text-purple-800' :
                receita.categoria === 'Brigadeiro' ? 'bg-pink-100 text-pink-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {receita.categoria}
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{receita.tempo_preparo} min</span>
              </div>
              <div className="flex items-center gap-2">
                <Package size={16} />
                <span>Rende {receita.rendimento} porções</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign size={16} />
                <span>R$ {receita.preco_venda.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className={`px-2 py-1 text-xs rounded-full ${
                receita.disponibilidade === 'disponivel' ? 'bg-green-100 text-green-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {receita.disponibilidade}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                receita.ativo ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
              }`}>
                {receita.ativo ? 'Ativa' : 'Inativa'}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(receita)}
                className="flex-1 btn-secondary text-sm py-2"
              >
                <Edit size={16} className="inline mr-1" />
                Editar
              </button>
              <button
                onClick={() => handleDelete(receita.id)}
                className="btn-danger text-sm py-2 px-3"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredReceitas.length === 0 && (
        <div className="card text-center py-8">
          <div className="text-gray-500">
            {searchTerm || filterCategoria ? 'Nenhuma receita encontrada' : 'Nenhuma receita cadastrada'}
          </div>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingReceita ? 'Editar Receita' : 'Nova Receita'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Receita *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="input-field"
                    placeholder="Ex: Bolo de Chocolate"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    required
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categorias.map(categoria => (
                      <option key={categoria} value={categoria}>{categoria}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ingredientes *
                </label>
                <textarea
                  required
                  value={formData.ingredientes}
                  onChange={(e) => setFormData({ ...formData, ingredientes: e.target.value })}
                  className="input-field"
                  rows={4}
                  placeholder="Liste todos os ingredientes..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modo de Preparo *
                </label>
                <textarea
                  required
                  value={formData.modo_preparo}
                  onChange={(e) => setFormData({ ...formData, modo_preparo: e.target.value })}
                  className="input-field"
                  rows={4}
                  placeholder="Descreva o passo a passo..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tempo (min) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.tempo_preparo}
                    onChange={(e) => setFormData({ ...formData, tempo_preparo: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rendimento *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.rendimento}
                    onChange={(e) => setFormData({ ...formData, rendimento: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custo Estimado (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.custo_estimado}
                    onChange={(e) => setFormData({ ...formData, custo_estimado: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço de Venda (R$) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.preco_venda}
                    onChange={(e) => setFormData({ ...formData, preco_venda: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Disponibilidade
                </label>
                <select
                  value={formData.disponibilidade}
                  onChange={(e) => setFormData({ ...formData, disponibilidade: e.target.value })}
                  className="input-field"
                >
                  <option value="disponivel">Disponível</option>
                  <option value="esgotado">Esgotado</option>
                  <option value="sob_consulta">Sob Consulta</option>
                </select>
              </div>

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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="ativo" className="ml-2 text-sm text-gray-700">
                  Receita ativa
                </label>
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

export default Receitas