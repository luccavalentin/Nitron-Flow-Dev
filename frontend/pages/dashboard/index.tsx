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
          console.log('❌ Dashboard: Sem sessão dev, redirecionando para login')
          router.push('/auth/login')
          return
        }
        console.log('✅ Dashboard: Sessão dev encontrada, carregando dados...')
        // Continuar carregando dados mesmo sem Supabase
      } else if (isSupabaseConfigured) {
        // Verificar sessão Supabase apenas se estiver configurado
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/auth/login')
          return
        }
      } else {
        // Sem Supabase e não está em modo dev - redirecionar
        router.push('/auth/login')
        return
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
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 p-8 overflow-y-auto">
              <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                  <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    Dashboard
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Visão geral do ambiente de desenvolvimento
                  </p>
                </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Projetos Ativos
                  </h3>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  {summary?.projects?.active || 0}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  de {summary?.projects?.total || 0} projetos
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Total Projetos
                  </h3>
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <svg className="w-4 h-4 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  {summary?.projects?.total || 0}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Todos os projetos
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Tarefas Ativas
                  </h3>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  {summary?.tasks?.active || 0}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  de {summary?.tasks?.total || 0} tarefas
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Clientes
                  </h3>
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <svg className="w-4 h-4 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  {summary?.clients?.total || 0}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Clientes cadastrados
                </p>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {/* Gráfico de Receita */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-lg">
                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4">
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
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-lg">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4">
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
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-lg mb-8">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4">
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
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-lg">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4">
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

