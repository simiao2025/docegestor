import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Users, UserCheck, BookOpen, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface DashboardStats {
  totalUsuarios: number
  totalClientes: number
  totalReceitas: number
  totalPedidos: number
  pedidosPendentes: number
  vendasMes: number
  pedidosPorStatus: { status: string; count: number }[]
  vendasPorMes: { mes: string; vendas: number }[]
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsuarios: 0,
    totalClientes: 0,
    totalReceitas: 0,
    totalPedidos: 0,
    pedidosPendentes: 0,
    vendasMes: 0,
    pedidosPorStatus: [],
    vendasPorMes: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Carregar contadores básicos
      const [usuariosResult, clientesResult, receitasResult, pedidosResult] = await Promise.all([
        supabase.from('usuarios').select('*', { count: 'exact', head: true }),
        supabase.from('clientes').select('*', { count: 'exact', head: true }),
        supabase.from('receitas').select('*', { count: 'exact', head: true }),
        supabase.from('pedidos').select('*', { count: 'exact', head: true }),
      ])

      // Carregar pedidos pendentes
      const { count: pedidosPendentes } = await supabase
        .from('pedidos')
        .select('*', { count: 'exact', head: true })
        .eq('status_pedido', 'pendente')

      // Calcular vendas do mês
      const inicioMes = new Date()
      inicioMes.setDate(1)
      inicioMes.setHours(0, 0, 0, 0)

      const { data: vendasData } = await supabase
        .from('pedidos')
        .select('valor_total')
        .gte('created_at', inicioMes.toISOString())
        .eq('status_pedido', 'entregue')

      const vendasMes = vendasData?.reduce((total, pedido) => total + pedido.valor_total, 0) || 0

      // Carregar pedidos por status
      const { data: pedidosStatus } = await supabase
        .from('pedidos')
        .select('status_pedido')

      const statusCount: { [key: string]: number } = {}
      pedidosStatus?.forEach(pedido => {
        statusCount[pedido.status_pedido] = (statusCount[pedido.status_pedido] || 0) + 1
      })

      const pedidosPorStatus = Object.entries(statusCount).map(([status, count]) => ({
        status,
        count
      }))

      // Gerar dados de vendas dos últimos 6 meses
      const vendasPorMes = []
      for (let i = 5; i >= 0; i--) {
        const data = new Date()
        data.setMonth(data.getMonth() - i)
        const inicio = new Date(data.getFullYear(), data.getMonth(), 1)
        const fim = new Date(data.getFullYear(), data.getMonth() + 1, 0)

        const { data: vendasMesData } = await supabase
          .from('pedidos')
          .select('valor_total')
          .gte('created_at', inicio.toISOString())
          .lte('created_at', fim.toISOString())
          .eq('status_pedido', 'entregue')

        const totalVendas = vendasMesData?.reduce((total, pedido) => total + pedido.valor_total, 0) || 0
        vendasPorMes.push({
          mes: data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
          vendas: totalVendas
        })
      }

      setStats({
        totalUsuarios: usuariosResult.count || 0,
        totalClientes: clientesResult.count || 0,
        totalReceitas: receitasResult.count || 0,
        totalPedidos: pedidosResult.count || 0,
        pedidosPendentes: pedidosPendentes || 0,
        vendasMes,
        pedidosPorStatus,
        vendasPorMes
      })
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const statsCards = [
    {
      title: 'Total de Usuários',
      value: stats.totalUsuarios,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Total de Clientes',
      value: stats.totalClientes,
      icon: UserCheck,
      color: 'bg-green-500'
    },
    {
      title: 'Total de Receitas',
      value: stats.totalReceitas,
      icon: BookOpen,
      color: 'bg-purple-500'
    },
    {
      title: 'Total de Pedidos',
      value: stats.totalPedidos,
      icon: ShoppingCart,
      color: 'bg-orange-500'
    },
    {
      title: 'Pedidos Pendentes',
      value: stats.pedidosPendentes,
      icon: TrendingUp,
      color: 'bg-red-500'
    },
    {
      title: 'Vendas do Mês',
      value: `R$ ${stats.vendasMes.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-600'
    }
  ]

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="card">
              <div className="flex items-center">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendas por Mês */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas dos Últimos 6 Meses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.vendasPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Vendas']} />
              <Bar dataKey="vendas" fill="#f1760a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pedidos por Status */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pedidos por Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.pedidosPorStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, count }) => `${status}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {stats.pedidosPorStatus.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resumo Rápido */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{stats.totalUsuarios + stats.totalClientes}</p>
            <p className="text-sm text-blue-800">Pessoas Cadastradas</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{stats.totalReceitas}</p>
            <p className="text-sm text-green-800">Receitas Disponíveis</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">
              {stats.totalPedidos > 0 ? Math.round((stats.pedidosPendentes / stats.totalPedidos) * 100) : 0}%
            </p>
            <p className="text-sm text-orange-800">Taxa de Pendência</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard