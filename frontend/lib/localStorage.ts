/**
 * Sistema de persistência local para desenvolvimento
 * Salva dados no localStorage para permitir testes sem backend
 */

const STORAGE_KEYS = {
  projects: 'nitronflow_projects',
  clients: 'nitronflow_clients',
  tasks: 'nitronflow_tasks',
  budgets: 'nitronflow_budgets',
  receipts: 'nitronflow_receipts',
  payments: 'nitronflow_payments',
  licenses: 'nitronflow_licenses',
  activities: 'nitronflow_activities',
}

export const localStorageService = {
  // Projetos
  saveProjects: (projects: any[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects))
    }
  },

  getProjects: (): any[] => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(STORAGE_KEYS.projects)
      return data ? JSON.parse(data) : []
    }
    return []
  },

  // Clientes
  saveClients: (clients: any[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.clients, JSON.stringify(clients))
    }
  },

  getClients: (): any[] => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(STORAGE_KEYS.clients)
      return data ? JSON.parse(data) : []
    }
    return []
  },

  // Tarefas
  saveTasks: (tasks: any[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks))
    }
  },

  getTasks: (): any[] => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(STORAGE_KEYS.tasks)
      return data ? JSON.parse(data) : []
    }
    return []
  },

  // Orçamentos
  saveBudgets: (budgets: any[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.budgets, JSON.stringify(budgets))
    }
  },

  getBudgets: (): any[] => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(STORAGE_KEYS.budgets)
      return data ? JSON.parse(data) : []
    }
    return []
  },

  // Recibos
  saveReceipts: (receipts: any[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.receipts, JSON.stringify(receipts))
    }
  },

  getReceipts: (): any[] => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(STORAGE_KEYS.receipts)
      return data ? JSON.parse(data) : []
    }
    return []
  },

  // Pagamentos
  savePayments: (payments: any[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.payments, JSON.stringify(payments))
    }
  },

  getPayments: (): any[] => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(STORAGE_KEYS.payments)
      return data ? JSON.parse(data) : []
    }
    return []
  },

  // Licenças
  saveLicenses: (licenses: any[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.licenses, JSON.stringify(licenses))
    }
  },

  getLicenses: (): any[] => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(STORAGE_KEYS.licenses)
      return data ? JSON.parse(data) : []
    }
    return []
  },

  // Atividades
  saveActivities: (activities: any[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.activities, JSON.stringify(activities))
    }
  },

  getActivities: (): any[] => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(STORAGE_KEYS.activities)
      return data ? JSON.parse(data) : []
    }
    return []
  },

  // Limpar todos os dados
  clearAll: () => {
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
    }
  },
}

