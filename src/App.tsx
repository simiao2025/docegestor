import React, { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AuthPage from './pages/AuthPage'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Usuarios from './pages/Usuarios'
import Clientes from './pages/Clientes'
import Receitas from './pages/Receitas'
import Pedidos from './pages/Pedidos'

const AppContent: React.FC = () => {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState('dashboard')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthPage onSuccess={() => {}} />
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'usuarios':
        return <Usuarios />
      case 'clientes':
        return <Clientes />
      case 'receitas':
        return <Receitas />
      case 'pedidos':
        return <Pedidos />
      default:
        return <Dashboard />
    }
  }

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderCurrentPage()}
    </Layout>
  )
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="App">
        <AppContent />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
      </div>
    </AuthProvider>
  )
}

export default App