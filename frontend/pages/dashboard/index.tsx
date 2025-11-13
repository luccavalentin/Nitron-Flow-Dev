import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import { apiRequest } from '@/lib/api'

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
      const projectsSummary = await apiRequest('/projects/summary')
      const financeSummary = await apiRequest('/finance/summary')

      setSummary({
        projects: projectsSummary.data || { active: 0, total: 0 },
        finance: financeSummary.data || { total: 0, active_licenses: 0 },
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Projetos Ativos
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {summary?.projects?.active || 0}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total de Projetos
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {summary?.projects?.total || 0}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Receita Total
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              R$ {summary?.finance?.total?.toLocaleString('pt-BR') || '0,00'}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Licenças Ativas
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {summary?.finance?.active_licenses || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

