import { supabase } from './supabase'

export interface ApiResponse<T = any> {
  ok: boolean
  data?: T
  error?: string
}

export async function apiRequest<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return { ok: false, error: 'Não autenticado' }
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      ...options?.headers,
    },
  })

  const result = await response.json()
  return result
}

