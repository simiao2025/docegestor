import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://supabase.brasilonthebox.shop'
const supabaseAnonKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2MzE2NTIyMCwiZXhwIjo0OTE4ODM4ODIwLCJyb2xlIjoiYW5vbiJ9.KvPvUzIgcW3dz1wEueysw-QWYkpMDBtf9hE-CnmY5uo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos TypeScript para as tabelas
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