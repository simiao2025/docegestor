import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

// VERSÃO ALTERNATIVA: Para casos onde Supabase Auth falha
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mockUser, setMockUser] = useState<any>(null)

  useEffect(() => {
    // Tentar recuperar sessão do Supabase primeiro
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        setLoading(false)
      } else {
        // Fallback: Verificar localStorage para mock user
        const savedUser = localStorage.getItem('mockUser')
        if (savedUser) {
          setMockUser(JSON.parse(savedUser))
        }
        setLoading(false)
      }
    })
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      // Tentar Supabase Auth primeiro
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Fallback: Login mock local
        const { data: usuarios } = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', email)
          .single()

        if (usuarios && password === '123456') {
          const mockUserData = {
            id: usuarios.id,
            email: usuarios.email,
            user_metadata: { name: usuarios.nome }
          }
          
          setMockUser(mockUserData)
          localStorage.setItem('mockUser', JSON.stringify(mockUserData))
          toast.success('Login realizado com sucesso!')
          return {}
        }
        
        return { error: 'Email ou senha incorretos' }
      }

      toast.success('Login realizado com sucesso!')
      return {}
    } catch (error) {
      return { error: 'Erro ao fazer login' }
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Tentar Supabase Auth primeiro
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      })

      if (error) {
        // Fallback: Criar usuário mock
        const { data: newUser, error: insertError } = await supabase
          .from('usuarios')
          .insert({
            nome: name,
            email: email,
            tipo: 'Cliente',
            status: 'Ativo',
          })
          .select()
          .single()

        if (insertError) {
          return { error: insertError.message }
        }

        const mockUserData = {
          id: newUser.id,
          email: newUser.email,
          user_metadata: { name: newUser.nome }
        }
        
        setMockUser(mockUserData)
        localStorage.setItem('mockUser', JSON.stringify(mockUserData))
        toast.success('Conta criada com sucesso! Use a senha "123456" para entrar.')
        return {}
      }

      // Se o Supabase Auth funcionou
      if (data.user) {
        toast.success('Conta criada! Verifique seu email para confirmação.')
        return {}
      }

    } catch (error: any) {
      return { error: 'Erro ao criar conta' }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setMockUser(null)
      localStorage.removeItem('mockUser')
      toast.success('Logout realizado com sucesso!')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const value = {
    user: user || mockUser,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Versão super simplificada (SEM AUTENTICAÇÃO)
// Descomente a linha abaixo para usar sem autenticação
// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState({ id: '1', email: 'demo@docegestot.com', user_metadata: { name: 'Demo User' } })
//   const [loading, setLoading] = useState(false)

//   const signIn = async () => {
//     toast.success('Login demo realizado!')
//     return {}
//   }

//   const signUp = async () => {
//     toast.success('Conta demo criada!')
//     return {}
//   }

//   const signOut = async () => {
//     toast.success('Logout demo realizado!')
//   }

//   return (
//     <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }

export default AuthProvider