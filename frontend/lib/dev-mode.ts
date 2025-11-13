/**
 * Modo de desenvolvimento - permite login sem Supabase configurado
 * Ativo automaticamente quando Supabase não está configurado ou em localhost
 */

const DEV_MODE_KEY = 'nitronflow_dev_mode'
const DEV_SESSION_KEY = 'nitronflow_dev_session'

export const isDevMode = (): boolean => {
  // Verifica se está em localhost
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname.toLowerCase()
    const isLocalhost = hostname === 'localhost' || 
                       hostname === '127.0.0.1' ||
                       hostname === '' ||
                       hostname.startsWith('192.168.') ||
                       hostname.startsWith('10.') ||
                       hostname.startsWith('172.')
    
    // Verifica variável de ambiente
    const envDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true'
    
    return isLocalhost || envDevMode
  }
  // No servidor, sempre retorna false (só funciona no cliente)
  return false
}

export const setDevSession = (email: string) => {
  if (typeof window !== 'undefined') {
    try {
      const session = {
        user: {
          id: 'dev-user-' + Date.now(),
          email: email,
          user_metadata: {
            full_name: email.split('@')[0],
          },
        },
        access_token: 'dev-token-' + Date.now(),
        expires_at: Date.now() + 86400000, // 24 horas
      }
      
      const sessionStr = JSON.stringify(session)
      localStorage.setItem(DEV_SESSION_KEY, sessionStr)
      localStorage.setItem(DEV_MODE_KEY, 'true')
      
      console.log('💾 Sessão dev salva no localStorage:', { email, key: DEV_SESSION_KEY })
      
      // Verificar se foi salvo
      const verify = localStorage.getItem(DEV_SESSION_KEY)
      if (!verify) {
        console.error('❌ ERRO: Sessão não foi salva no localStorage!')
      } else {
        console.log('✅ Sessão verificada no localStorage')
      }
    } catch (err) {
      console.error('❌ Erro ao salvar sessão dev:', err)
      throw err
    }
  }
}

export const getDevSession = () => {
  if (typeof window !== 'undefined') {
    const sessionStr = localStorage.getItem(DEV_SESSION_KEY)
    if (sessionStr) {
      const session = JSON.parse(sessionStr)
      // Verificar se não expirou
      if (session.expires_at > Date.now()) {
        return session
      } else {
        // Limpar sessão expirada
        clearDevSession()
        return null
      }
    }
  }
  return null
}

export const clearDevSession = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(DEV_SESSION_KEY)
    localStorage.removeItem(DEV_MODE_KEY)
  }
}

export const hasDevSession = (): boolean => {
  return getDevSession() !== null
}

