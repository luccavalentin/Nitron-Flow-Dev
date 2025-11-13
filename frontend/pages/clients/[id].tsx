import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { apiRequest, clientsApi, projectsApi, budgetsApi } from '@/lib/api'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { motion } from 'framer-motion'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function ClientDetail() {
  const router = useRouter()
  const { id } = router.query
  const [client, setClient] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [budgets, setBudgets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'budgets'>('overview')

  useEffect(() => {
    if (id) {
      loadClientData()
    }
  }, [id])

  const loadClientData = async () => {
    setLoading(true)
    
    const [clientsRes, projectsRes, budgetsRes] = await Promise.all([
      apiRequest('/clients'),
      apiRequest('/projects'),
      budgetsApi.getAll(undefined, id as string),
    ])

    if (clientsRes.ok && clientsRes.data) {
      const foundClient = Array.isArray(clientsRes.data) 
        ? clientsRes.data.find((c: any) => c.id === id)
        : null
      setClient(foundClient)
    }

    if (projectsRes.ok && projectsRes.data) {
      const clientProjects = projectsRes.data.filter((p: any) => p.client_id === id)
      setProjects(clientProjects)
    }

    if (budgetsRes.ok && budgetsRes.data) {
      setBudgets(budgetsRes.data)
    }

    setLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja deletar este cliente?')) return

    const response = await apiRequest(`/clients?id=${id}`, { method: 'DELETE' })
    if (response.ok) {
      router.push('/clients')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </main>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">Cliente não encontrado</p>
              <button
                onClick={() => router.push('/clients')}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Voltar para Clientes
              </button>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <button
                onClick={() => router.push('/clients')}
                className="text-indigo-600 dark:text-indigo-400 hover:underline mb-4"
              >
                ← Voltar para Clientes
              </button>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {client.name}
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {client.email} {client.phone && `• ${client.phone}`}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push(`/clients?edit=${id}`)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
              <nav className="flex space-x-8">
                {(['overview', 'projects', 'budgets'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab === 'overview' && 'Visão Geral'}
                    {tab === 'projects' && `Projetos (${projects.length})`}
                    {tab === 'budgets' && `Orçamentos (${budgets.length})`}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Informações do Cliente
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Nome
                        </label>
                        <p className="text-gray-900 dark:text-white mt-1">{client.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Email
                        </label>
                        <p className="text-gray-900 dark:text-white mt-1">{client.email}</p>
                      </div>
                      {client.phone && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Telefone
                          </label>
                          <p className="text-gray-900 dark:text-white mt-1">{client.phone}</p>
                        </div>
                      )}
                      {client.company && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Empresa
                          </label>
                          <p className="text-gray-900 dark:text-white mt-1">{client.company}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Criado em
                        </label>
                        <p className="text-gray-900 dark:text-white mt-1">
                          {new Date(client.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {client.notes && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Notas
                      </label>
                      <p className="text-gray-900 dark:text-white mt-1 whitespace-pre-wrap">
                        {client.notes}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Projetos</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {projects.length}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Orçamentos</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {budgets.length}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'projects' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Projetos do Cliente
                  </h3>
                  {projects.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">
                      Nenhum projeto associado a este cliente
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {projects.map((project) => (
                        <motion.div
                          key={project.id}
                          whileHover={{ scale: 1.02 }}
                          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-500 cursor-pointer"
                          onClick={() => router.push(`/projects/${project.id}`)}
                        >
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {project.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {project.status}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'budgets' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Orçamentos do Cliente
                  </h3>
                  {budgets.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">
                      Nenhum orçamento para este cliente
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {budgets.map((budget) => (
                        <div
                          key={budget.id}
                          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {budget.title || `Orçamento #${budget.id.slice(0, 8)}`}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {budget.status} • {new Date(budget.created_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900 dark:text-white">
                                R$ {parseFloat(budget.total_amount || 0).toLocaleString('pt-BR', {
                                  minimumFractionDigits: 2,
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

