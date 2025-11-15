import { createClient } from '@supabase/supabase-js'

// URL alternativa para EasyPanel Supabase Self-Hosted
const supabaseUrl = 'https://manager-1.7sydhv.easypanel.host'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos TypeScript para as tabelas (corrigidos)
export interface Usuario {
  id: string
  nome: string
  email: string
  tipo: string
  status: string
  created_at: string
  updated_at: string
}

export interface Cliente {
  id: string
  nome: string
  email: string | null
  telefone: string
  endereco: string
  cidade: string
  estado: string
  cep: string
  observacoes: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface Receita {
  id: string
  nome: string
  ingredientes: string
  modo_preparo: string
  tempo_preparo: number
  rendimento: number
  custo_estimado: number
  preco_venda: number
  categoria: string
  disponibilidade: string
  observacoes: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface Pedido {
  id: string
  numero_pedido: string
  cliente_id: string
  usuario_id: string
  receita_id: string
  quantidade: number
  preco_unitario: number
  valor_total: number
  data_pedido: string
  data_entrega: string
  status_pedido: 'pendente' | 'em_producao' | 'pronto' | 'entregue' | 'cancelado'
  observacoes: string | null
  created_at: string
  updated_at: string
}