import { supabase, isSupabaseConfigured } from './supabase'
import { isDevMode, getDevSession } from './dev-mode'
import { localStorageService } from './localStorage'

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
  // Modo de desenvolvimento: usar sessão fake
  if (isDevMode() && !isSupabaseConfigured) {
    const devSession = getDevSession()
    if (!devSession) {
      return { ok: false, error: 'Não autenticado' }
    }
    
    // Em dev mode, retornar dados mockados ou permitir requisições sem auth
    // Por enquanto, vamos permitir mas sem token real
    const apiUrl = getApiUrl()
    const fullUrl = endpoint.startsWith('http') 
      ? endpoint 
      : `${apiUrl}${endpoint}`
    
    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-Dev-Mode': 'true',
          'X-Dev-User': devSession.user.email,
          ...options?.headers,
        },
      })
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Erro na requisição' }))
        return { ok: false, error: error.error || error.message || 'Erro desconhecido' }
      }
      
      const result = await response.json()
      return result
    } catch (error: any) {
      // Em dev mode, se a API não estiver disponível, usar localStorage
      console.log('🔧 Modo dev: usando localStorage para', endpoint)
      
      // Mapear endpoints para localStorage
      if (endpoint.includes('/projects') && !endpoint.includes('/init-roadmap')) {
        if (options?.method === 'GET' || !options?.method) {
          return { ok: true, data: localStorageService.getProjects() }
        }
      } else if (endpoint.includes('/clients')) {
        if (options?.method === 'GET' || !options?.method) {
          return { ok: true, data: localStorageService.getClients() }
        }
      } else if (endpoint.includes('/tasks')) {
        if (options?.method === 'GET' || !options?.method) {
          return { ok: true, data: localStorageService.getTasks() }
        }
      } else if (endpoint.includes('/budgets')) {
        if (options?.method === 'GET' || !options?.method) {
          return { ok: true, data: localStorageService.getBudgets() }
        }
      } else if (endpoint.includes('/receipts')) {
        if (options?.method === 'GET' || !options?.method) {
          return { ok: true, data: localStorageService.getReceipts() }
        }
      } else if (endpoint.includes('/payments')) {
        if (options?.method === 'GET' || !options?.method) {
          return { ok: true, data: localStorageService.getPayments() }
        }
      } else if (endpoint.includes('/activities')) {
        if (options?.method === 'GET' || !options?.method) {
          return { ok: true, data: localStorageService.getActivities() }
        }
      }
      
      return { ok: true, data: [] }
    }
  }
  
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
  getAll: async () => {
    const response = await apiRequest('/projects')
    if (response.ok && response.data && isDevMode() && !isSupabaseConfigured) {
      // Salvar no localStorage após buscar
      localStorageService.saveProjects(Array.isArray(response.data) ? response.data : [])
    }
    return response
  },
  getById: (id: string) => apiRequest(`/projects?id=${id}`),
  create: async (data: any) => {
    const response = await apiRequest('/projects', { method: 'POST', body: JSON.stringify(data) })
    if (response.ok && response.data && isDevMode() && !isSupabaseConfigured) {
      // Adicionar ao localStorage
      const projects = localStorageService.getProjects()
      const newProject = { ...data, id: response.data.id || `project-${Date.now()}`, created_at: new Date().toISOString() }
      projects.push(newProject)
      localStorageService.saveProjects(projects)
      return { ...response, data: newProject }
    }
    return response
  },
  initRoadmap: (id: string) => apiRequest(`/projects/${id}/init-roadmap`, { method: 'POST' }),
}

export const clientsApi = {
  getAll: async () => {
    const response = await apiRequest('/clients')
    if (response.ok && response.data && isDevMode() && !isSupabaseConfigured) {
      localStorageService.saveClients(Array.isArray(response.data) ? response.data : [])
    }
    return response
  },
  create: async (data: any) => {
    const response = await apiRequest('/clients', { method: 'POST', body: JSON.stringify(data) })
    if (response.ok && response.data && isDevMode() && !isSupabaseConfigured) {
      const clients = localStorageService.getClients()
      const newClient = { ...data, id: response.data.id || `client-${Date.now()}`, created_at: new Date().toISOString() }
      clients.push(newClient)
      localStorageService.saveClients(clients)
      return { ...response, data: newClient }
    }
    return response
  },
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

export const budgetsApi = {
  getAll: async (projectId?: string, clientId?: string) => {
    const params = new URLSearchParams()
    if (projectId) params.append('projectId', projectId)
    if (clientId) params.append('clientId', clientId)
    const url = `/budgets/get${params.toString() ? `?${params.toString()}` : ''}`
    const response = await apiRequest(url)
    if (response.ok && response.data && isDevMode() && !isSupabaseConfigured) {
      localStorageService.saveBudgets(Array.isArray(response.data) ? response.data : [])
    }
    return response
  },
  create: async (data: any) => {
    const response = await apiRequest('/budgets/create', { method: 'POST', body: JSON.stringify(data) })
    if (response.ok && response.data && isDevMode() && !isSupabaseConfigured) {
      const budgets = localStorageService.getBudgets()
      const newBudget = { ...data, id: response.data.id || `budget-${Date.now()}`, created_at: new Date().toISOString() }
      budgets.push(newBudget)
      localStorageService.saveBudgets(budgets)
      return { ...response, data: newBudget }
    }
    return response
  },
  send: (budgetId: string, recipientEmail: string) => 
    apiRequest('/budgets/send', { 
      method: 'POST', 
      body: JSON.stringify({ budgetId, recipientEmail }) 
    }),
}

export const receiptsApi = {
  getAll: async () => {
    const response = await apiRequest('/receipts/get')
    if (response.ok && response.data && isDevMode() && !isSupabaseConfigured) {
      localStorageService.saveReceipts(Array.isArray(response.data) ? response.data : [])
    }
    return response
  },
  generate: async (paymentId: string, receiptData: any) => {
    const response = await apiRequest('/receipts/generate', {
      method: 'POST',
      body: JSON.stringify({ paymentId, receiptData }),
    })
    if (response.ok && response.data && isDevMode() && !isSupabaseConfigured) {
      const receipts = localStorageService.getReceipts()
      const newReceipt = { ...receiptData, id: response.data.id || `receipt-${Date.now()}`, payment_id: paymentId, created_at: new Date().toISOString() }
      receipts.push(newReceipt)
      localStorageService.saveReceipts(receipts)
      return { ...response, data: newReceipt }
    }
    return response
  },
}

export const financeApi = {
      getProducts: () => apiRequest('/finance/products'),
      syncKiwify: () => apiRequest('/finance/sync-kiwify', { method: 'POST' }),
    }

export const activitiesApi = {
  getAll: async (projectId?: string, limit?: number) => {
    const params = new URLSearchParams()
    if (projectId) params.append('projectId', projectId)
    if (limit) params.append('limit', limit.toString())
    const url = `/activities/get${params.toString() ? `?${params.toString()}` : ''}`
    const response = await apiRequest(url)
    if (response.ok && response.data && isDevMode() && !isSupabaseConfigured) {
      localStorageService.saveActivities(Array.isArray(response.data) ? response.data : [])
    }
    return response
  },
}

