import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { isDevMode, hasDevSession } from '@/lib/dev-mode'
import { apiRequest } from '@/lib/api'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import ActivityFeed from '@/components/ActivityFeed'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      // Verificar sessão dev primeiro se Supabase não estiver configurado
      if (!isSupabaseConfigured && isDevMode()) {
        if (!hasDevSession()) {
          router.push('/auth/login')
          return
        }
        // Continuar carregando dados mesmo sem Supabase
      } else {
        // Verificar sessão Supabase apenas se estiver configurado
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/auth/login')
          return
        }
      }

      // Carregar dados do dashboard
      const [projectsRes, clientsRes, tasksRes, financeRes, paymentsRes, activitiesRes] = await Promise.all([
        apiRequest('/projects'),
        apiRequest('/clients'),
        apiRequest('/tasks'),
        apiRequest('/fincore/summary').catch(() => ({ ok: false, data: null })),
        apiRequest('/payments/get').catch(() => ({ ok: false, data: [] })),
        apiRequest('/activities/get').catch(() => ({ ok: false, data: [] })),
      ])

      const projects = projectsRes.ok ? projectsRes.data || [] : []
      const clients = clientsRes.ok ? clientsRes.data || [] : []
      const tasks = tasksRes.ok ? tasksRes.data || [] : []
      const finance = financeRes.ok ? financeRes.data : null
      const payments = paymentsRes.ok ? paymentsRes.data || [] : []
      const activities = activitiesRes.ok ? activitiesRes.data || [] : []
      
      const activeProjects = projects.filter((p: any) => p.status === 'active').length
      const activeTasks = tasks.filter((t: any) => t.status !== 'done').length

      // Preparar dados para gráficos
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - (5 - i))
        return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
      })

      // Agrupar pagamentos por mês
      const revenueData = last6Months.map((month) => {
        const monthPayments = payments.filter((p: any) => {
          const paymentDate = new Date(p.paid_at)
          const monthStr = paymentDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
          return monthStr === month
        })
        const total = monthPayments.reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0)
        return { month, receita: total }
      })

      // Distribuição de tarefas por status
      const taskStatusCounts = tasks.reduce((acc: any, task: any) => {
        const status = task.status || 'backlog'
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {})

      const taskStatusData = [
        { name: 'Backlog', value: taskStatusCounts.backlog || 0 },
        { name: 'Em Andamento', value: taskStatusCounts['em_andamento'] || 0 },
        { name: 'Revisão', value: taskStatusCounts.revisao || 0 },
        { name: 'Concluído', value: taskStatusCounts.done || 0 },
      ].filter((item) => item.value > 0)

      // Distribuição de projetos por status
      const projectStatusCounts = projects.reduce((acc: any, project: any) => {
        const status = project.status || 'draft'
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {})

      const projectStatusData = Object.entries(projectStatusCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }))

      setSummary({
        projects: { active: activeProjects, total: projects.length },
        clients: { total: clients.length },
        tasks: { active: activeTasks, total: tasks.length },
        finance: finance || { total: 0, active_licenses: 0 },
        revenueData,
        taskStatusData,
        projectStatusData,
        activities,
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

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Gráfico de Receita */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Receita (Últimos 6 Meses)
                </h3>
                {summary?.revenueData && summary.revenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={summary.revenueData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
                      <XAxis
                        dataKey="month"
                        className="text-gray-600 dark:text-gray-400"
                        tick={{ fill: 'currentColor' }}
                      />
                      <YAxis
                        className="text-gray-600 dark:text-gray-400"
                        tick={{ fill: 'currentColor' }}
                        tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [
                          `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                          'Receita',
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="receita"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: '#10b981', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                    Sem dados de receita disponíveis
                  </div>
                )}
              </div>

              {/* Gráfico de Tarefas por Status */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Tarefas por Status
                </h3>
                {summary?.taskStatusData && summary.taskStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={summary.taskStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {summary.taskStatusData.map((entry: any, index: number) => {
                          const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        })}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                    Sem tarefas disponíveis
                  </div>
                )}
              </div>
            </div>

            {/* Gráfico de Projetos por Status */}
            {summary?.projectStatusData && summary.projectStatusData.length > 0 && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Projetos por Status
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={summary.projectStatusData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
                    <XAxis
                      dataKey="name"
                      className="text-gray-600 dark:text-gray-400"
                      tick={{ fill: 'currentColor' }}
                    />
                    <YAxis
                      className="text-gray-600 dark:text-gray-400"
                      tick={{ fill: 'currentColor' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Feed de Atividades */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Atividades Recentes
              </h3>
              <ActivityFeed limit={10} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

