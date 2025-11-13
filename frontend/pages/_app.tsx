import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { isDevMode, hasDevSession } from '@/lib/dev-mode'
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    if (typeof window === 'undefined') return
    
    const currentPath = window.location.pathname
    const publicPaths = ['/auth/login', '/auth/callback']
    
    // Modo de desenvolvimento: permite acesso se tiver sessão dev
    const hostname = window.location.hostname
    const isDev = !isSupabaseConfigured && (hostname === 'localhost' || hostname === '127.0.0.1' || isDevMode())
    
    if (isDev) {
      // Se está em uma rota pública, não precisa verificar sessão
      if (publicPaths.includes(currentPath)) {
        return
      }
      
      // Verificar sessão dev com delay maior para garantir que foi salva
      setTimeout(() => {
        const hasSession = hasDevSession()
        console.log('🔍 Verificando sessão dev:', { currentPath, hasSession })
        
        if (!hasSession) {
          console.log('❌ Sem sessão, redirecionando para login')
          window.location.href = '/auth/login'
        } else {
          console.log('✅ Sessão encontrada, permitindo acesso')
        }
      }, 500)
      return
    }
    
    // Verificar sessão apenas no cliente e se Supabase estiver configurado
    if (typeof window !== 'undefined' && isSupabaseConfigured) {
      if (!publicPaths.includes(currentPath)) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!session) {
            window.location.href = '/auth/login'
          }
        })

        // Listener de mudanças de auth
        supabase.auth.onAuthStateChange((_event, session) => {
          if (!session && !publicPaths.includes(currentPath)) {
            window.location.href = '/auth/login'
          }
        })
      }
    }
  }, [])

  if (!mounted) return null

  return <Component {...pageProps} />
}

