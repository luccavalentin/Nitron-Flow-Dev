import { useEffect, useState } from 'react'
import { activitiesApi } from '@/lib/api'
import { motion } from 'framer-motion'
import LoadingSpinner from './ui/LoadingSpinner'

interface Activity {
  id: string
  type: 'telemetry' | 'task' | 'project'
  event_type: string
  project_name?: string
  payload: any
  created_at: string
}

export default function ActivityFeed({ projectId, limit = 10 }: { projectId?: string; limit?: number }) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadActivities = async () => {
      setLoading(true)
      const response = await activitiesApi.getAll(projectId, limit)
      if (response.ok && response.data) {
        setActivities(response.data)
      }
      setLoading(false)
    }

    loadActivities()
    const interval = setInterval(loadActivities, 30000) // Atualizar a cada 30s
    return () => clearInterval(interval)
  }, [projectId, limit])

  const getActivityIcon = (type: string, eventType: string) => {
    if (eventType.includes('task_completed')) return '✅'
    if (eventType.includes('task')) return '📝'
    if (eventType.includes('project')) return '📁'
    if (eventType.includes('deployment')) return '🚀'
    if (eventType.includes('commit')) return '💾'
    if (eventType.includes('budget')) return '💰'
    if (eventType.includes('receipt')) return '🧾'
    return '📌'
  }

  const getActivityText = (activity: Activity) => {
    const { type, event_type, payload, project_name } = activity

    if (type === 'task') {
      if (event_type === 'task_completed') {
        return `Tarefa "${payload.task_title}" concluída`
      }
      return `Tarefa "${payload.task_title}" atualizada para ${payload.status}`
    }

    if (type === 'project') {
      return `Projeto "${project_name || payload.project_name}" atualizado`
    }

    // Telemetry events
    switch (event_type) {
      case 'project_created':
        return `Projeto "${project_name}" criado`
      case 'task_created':
        return `Nova tarefa criada em "${project_name}"`
      case 'deployment_started':
        return `Deploy iniciado para "${project_name}"`
      case 'deployment_completed':
        return `Deploy concluído para "${project_name}"`
      case 'budget_created':
        return `Orçamento criado para "${project_name}"`
      case 'budget_sent':
        return `Orçamento enviado para "${payload.recipient_email || 'cliente'}"`
      case 'receipt_generated':
        return `Recibo gerado para "${project_name}"`
      case 'workspace_commit':
        return `Commit realizado no workspace de "${project_name}"`
      case 'github_commit_push':
        return `Push realizado no repositório de "${project_name}"`
      default:
        return `${event_type.replace(/_/g, ' ')} em "${project_name || 'projeto'}"`
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return 'Agora'
    if (minutes < 60) return `${minutes}min atrás`
    if (hours < 24) return `${hours}h atrás`
    if (days < 7) return `${days}d atrás`
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="sm" />
        <span className="ml-2 text-gray-500 dark:text-gray-400">Carregando atividades...</span>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>Nenhuma atividade recente</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, idx) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="text-2xl flex-shrink-0">
            {getActivityIcon(activity.type, activity.event_type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900 dark:text-white">
              {getActivityText(activity)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatTime(activity.created_at)}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

