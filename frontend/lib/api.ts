import { supabase } from './supabase'

export interface ApiResponse<T = any> {
  ok: boolean
  data?: T
  error?: string
}

const getApiUrl = () => {
  if (typeof window === 'undefined') return ''
  return process.env.NEXT_PUBLIC_API_URL || ''
}

export async function apiRequest<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return { ok: false, error: 'Não autenticado' }
  }

  const apiUrl = getApiUrl()
  const fullUrl = endpoint.startsWith('http') 
    ? endpoint 
    : `${apiUrl}${endpoint}`

  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro na requisição' }))
    return { ok: false, error: error.error || error.message || 'Erro desconhecido' }
  }

  const result = await response.json()
  return result
}

// Helpers específicos
export const projectsApi = {
  getAll: () => apiRequest('/projects'),
  getById: (id: string) => apiRequest(`/projects?id=${id}`),
  create: (data: any) => apiRequest('/projects', { method: 'POST', body: JSON.stringify(data) }),
  initRoadmap: (id: string) => apiRequest(`/projects/${id}/init-roadmap`, { method: 'POST' }),
}

export const clientsApi = {
  getAll: () => apiRequest('/clients'),
  create: (data: any) => apiRequest('/clients', { method: 'POST', body: JSON.stringify(data) }),
}

export const tasksApi = {
  getAll: (projectId?: string) => {
    const url = projectId ? `/tasks?projectId=${projectId}` : '/tasks'
    return apiRequest(url)
  },
  create: (data: any) => apiRequest('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiRequest(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiRequest(`/tasks?id=${id}`, { method: 'DELETE' }),
  move: (id: string, status: string, sprintId?: string) => 
    apiRequest('/tasks/move', { 
      method: 'POST', 
      body: JSON.stringify({ id, status, sprint_id: sprintId }) 
    }),
}

