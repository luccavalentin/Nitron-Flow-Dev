import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import { apiRequest } from '@/lib/api'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/auth/login')
        return
      }

      // Carregar dados do dashboard
      const [projectsRes, clientsRes, tasksRes, financeRes] = await Promise.all([
        apiRequest('/projects'),
        apiRequest('/clients'),
        apiRequest('/tasks'),
        apiRequest('/fincore/summary').catch(() => ({ ok: false, data: null })),
      ])

      const projects = projectsRes.ok ? projectsRes.data || [] : []
      const clients = clientsRes.ok ? clientsRes.data || [] : []
      const tasks = tasksRes.ok ? tasksRes.data || [] : []
      const finance = financeRes.ok ? financeRes.data : null
      
      const activeProjects = projects.filter((p: any) => p.status === 'active').length
      const activeTasks = tasks.filter((t: any) => t.status !== 'done').length

      setSummary({
        projects: { active: activeProjects, total: projects.length },
        clients: { total: clients.length },
        tasks: { active: activeTasks, total: tasks.length },
        finance: finance || { total: 0, active_licenses: 0 },
      })
      setLoading(false)
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Dashboard
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Projetos Ativos
                    </h3>
                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                      {summary?.projects?.active || 0}
                    </p>
                  </div>
                  <div className="text-4xl">📁</div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total de Projetos
                    </h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {summary?.projects?.total || 0}
                    </p>
                  </div>
                  <div className="text-4xl">📊</div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Clientes
                    </h3>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                      {summary?.clients?.total || 0}
                    </p>
                  </div>
                  <div className="text-4xl">👥</div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Tarefas Ativas
                    </h3>
                    <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                      {summary?.tasks?.active || 0}
                    </p>
                  </div>
                  <div className="text-4xl">✅</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Receita Total
                </h3>
                <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                  R$ {summary?.finance?.total?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Licenças Ativas: {summary?.finance?.active_licenses || 0}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Ações Rápidas
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="/projects"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-center transition-colors"
                  >
                    Ver Projetos
                  </a>
                  <a
                    href="/tasks"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center transition-colors"
                  >
                    Ver Tarefas
                  </a>
                  <a
                    href="/clients"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center transition-colors"
                  >
                    Ver Clientes
                  </a>
                  <a
                    href="/finance"
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-center transition-colors"
                  >
                    Ver Financeiro
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

