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
      } else if (endpoint.includes('/roadmap')) {
        const roadmap = localStorageService.getRoadmap()
        
        // GET - filtrar por projectId se fornecido
        if (options?.method === 'GET' || !options?.method) {
          try {
            // Tentar extrair projectId da URL
            const urlMatch = endpoint.match(/[?&]projectId=([^&]+)/)
            const projectId = urlMatch ? urlMatch[1] : null
            
            if (projectId) {
              const filtered = roadmap.filter((item: any) => item.project_id === projectId)
              return { ok: true, data: filtered }
            }
            return { ok: true, data: roadmap }
          } catch (e) {
            return { ok: true, data: roadmap }
          }
        }
        
        // POST - criar novo roadmap item
        if (options?.method === 'POST') {
          try {
            const body = JSON.parse(options.body as string)
            const newItem = {
              id: `roadmap-${Date.now()}`,
              ...body,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
            roadmap.push(newItem)
            localStorageService.saveRoadmap(roadmap)
            return { ok: true, data: newItem }
          } catch (e) {
            return { ok: false, error: 'Erro ao criar roadmap item' }
          }
        }
        
        // PUT - atualizar roadmap item
        if (options?.method === 'PUT') {
          try {
            const body = JSON.parse(options.body as string)
            const index = roadmap.findIndex((item: any) => item.id === body.id)
            if (index !== -1) {
              roadmap[index] = { ...roadmap[index], ...body, updated_at: new Date().toISOString() }
              localStorageService.saveRoadmap(roadmap)
              return { ok: true, data: roadmap[index] }
            }
            return { ok: false, error: 'Roadmap item não encontrado' }
          } catch (e) {
            return { ok: false, error: 'Erro ao atualizar roadmap item' }
          }
        }
        
        // DELETE - deletar roadmap item
        if (options?.method === 'DELETE') {
          try {
            const body = JSON.parse(options.body as string)
            const filtered = roadmap.filter((item: any) => item.id !== body.id)
            localStorageService.saveRoadmap(filtered)
            return { ok: true, data: { id: body.id } }
          } catch (e) {
            return { ok: false, error: 'Erro ao deletar roadmap item' }
          }
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
    // Se em modo dev e API não disponível, salvar no localStorage mesmo se a API falhar
    if (isDevMode() && !isSupabaseConfigured) {
      if (!response.ok || !response.data) {
        // API falhou, criar localmente
        const projects = localStorageService.getProjects()
        const newProject = { ...data, id: `project-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        projects.push(newProject)
        localStorageService.saveProjects(projects)
        return { ok: true, data: newProject }
      } else {
        // API funcionou, salvar também no localStorage
        const projects = localStorageService.getProjects()
        const newProject = { ...data, id: response.data.id || `project-${Date.now()}`, created_at: new Date().toISOString() }
        projects.push(newProject)
        localStorageService.saveProjects(projects)
        return { ...response, data: newProject }
      }
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
    if (isDevMode() && !isSupabaseConfigured) {
      if (!response.ok || !response.data) {
        const clients = localStorageService.getClients()
        const newClient = { ...data, id: `client-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        clients.push(newClient)
        localStorageService.saveClients(clients)
        return { ok: true, data: newClient }
      } else {
        const clients = localStorageService.getClients()
        const newClient = { ...data, id: response.data.id || `client-${Date.now()}`, created_at: new Date().toISOString() }
        clients.push(newClient)
        localStorageService.saveClients(clients)
        return { ...response, data: newClient }
      }
    }
    return response
  },
}

export const tasksApi = {
  getAll: async (projectId?: string) => {
    const url = projectId ? `/tasks?projectId=${projectId}` : '/tasks'
    const response = await apiRequest(url)
    if (response.ok && response.data && isDevMode() && !isSupabaseConfigured) {
      localStorageService.saveTasks(Array.isArray(response.data) ? response.data : [])
    }
    return response
  },
  create: async (data: any) => {
    const response = await apiRequest('/tasks', { method: 'POST', body: JSON.stringify(data) })
    if (isDevMode() && !isSupabaseConfigured) {
      if (!response.ok || !response.data) {
        const tasks = localStorageService.getTasks()
        const newTask = { ...data, id: `task-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        tasks.push(newTask)
        localStorageService.saveTasks(tasks)
        return { ok: true, data: newTask }
      } else {
        const tasks = localStorageService.getTasks()
        const newTask = { ...data, id: response.data.id || `task-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        tasks.push(newTask)
        localStorageService.saveTasks(tasks)
        return { ...response, data: newTask }
      }
    }
    return response
  },
  update: async (id: string, data: any) => {
    const response = await apiRequest(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) })
    if (response.ok && isDevMode() && !isSupabaseConfigured) {
      const tasks = localStorageService.getTasks()
      const index = tasks.findIndex((t: any) => t.id === id)
      if (index !== -1) {
        tasks[index] = { ...tasks[index], ...data, updated_at: new Date().toISOString() }
        localStorageService.saveTasks(tasks)
      }
    }
    return response
  },
  delete: async (id: string) => {
    const response = await apiRequest(`/tasks?id=${id}`, { method: 'DELETE' })
    if (response.ok && isDevMode() && !isSupabaseConfigured) {
      const tasks = localStorageService.getTasks().filter((t: any) => t.id !== id)
      localStorageService.saveTasks(tasks)
    }
    return response
  },
  move: async (id: string, status: string, sprintId?: string) => {
    const response = await apiRequest('/tasks/move', { 
      method: 'POST', 
      body: JSON.stringify({ id, status, sprint_id: sprintId }) 
    })
    if (response.ok && isDevMode() && !isSupabaseConfigured) {
      const tasks = localStorageService.getTasks()
      const index = tasks.findIndex((t: any) => t.id === id)
      if (index !== -1) {
        tasks[index] = { ...tasks[index], status, updated_at: new Date().toISOString() }
        localStorageService.saveTasks(tasks)
      }
    }
    return response
  },
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
    if (isDevMode() && !isSupabaseConfigured) {
      if (!response.ok || !response.data) {
        const budgets = localStorageService.getBudgets()
        const newBudget = { ...data, id: `budget-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        budgets.push(newBudget)
        localStorageService.saveBudgets(budgets)
        return { ok: true, data: newBudget }
      } else {
        const budgets = localStorageService.getBudgets()
        const newBudget = { ...data, id: response.data.id || `budget-${Date.now()}`, created_at: new Date().toISOString() }
        budgets.push(newBudget)
        localStorageService.saveBudgets(budgets)
        return { ...response, data: newBudget }
      }
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

export const roadmapApi = {
  getAll: async (projectId?: string) => {
    const url = projectId ? `/roadmap/get?projectId=${projectId}` : '/roadmap/get'
    const response = await apiRequest(url)
    if (response.ok && response.data && isDevMode() && !isSupabaseConfigured) {
      localStorageService.saveRoadmap(Array.isArray(response.data) ? response.data : [])
    }
    return response
  },
  create: async (data: any) => {
    const response = await apiRequest('/roadmap/create', { method: 'POST', body: JSON.stringify(data) })
    if (isDevMode() && !isSupabaseConfigured) {
      if (!response.ok || !response.data) {
        const roadmap = localStorageService.getRoadmap()
        const newItem = { ...data, id: `roadmap-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        roadmap.push(newItem)
        localStorageService.saveRoadmap(roadmap)
        return { ok: true, data: newItem }
      } else {
        const roadmap = localStorageService.getRoadmap()
        const newItem = { ...data, id: response.data.id || `roadmap-${Date.now()}`, created_at: new Date().toISOString() }
        roadmap.push(newItem)
        localStorageService.saveRoadmap(roadmap)
        return { ...response, data: newItem }
      }
    }
    return response
  },
  update: async (id: string, data: any) => {
    const response = await apiRequest('/roadmap/update', { method: 'PUT', body: JSON.stringify({ id, ...data }) })
    if (response.ok && isDevMode() && !isSupabaseConfigured) {
      const roadmap = localStorageService.getRoadmap()
      const index = roadmap.findIndex((item: any) => item.id === id)
      if (index !== -1) {
        roadmap[index] = { ...roadmap[index], ...data, updated_at: new Date().toISOString() }
        localStorageService.saveRoadmap(roadmap)
      }
    }
    return response
  },
  delete: async (id: string) => {
    const response = await apiRequest('/roadmap/delete', { method: 'DELETE', body: JSON.stringify({ id }) })
    if (response.ok && isDevMode() && !isSupabaseConfigured) {
      const roadmap = localStorageService.getRoadmap().filter((item: any) => item.id !== id)
      localStorageService.saveRoadmap(roadmap)
    }
    return response
  },
}

