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
        console.log('✅ Rota pública em modo dev, permitindo acesso')
        return
      }
      
      // Em modo dev, permitir acesso mesmo sem verificar sessão imediatamente
      // A verificação só acontece se realmente não houver sessão após um tempo
      const checkSession = () => {
        const hasSession = hasDevSession()
        console.log('🔍 Verificando sessão dev:', { currentPath, hasSession })
        
        if (!hasSession && currentPath !== '/auth/login') {
          console.log('❌ Sem sessão, redirecionando para login')
          window.location.href = '/auth/login'
        } else if (hasSession) {
          console.log('✅ Sessão encontrada, permitindo acesso')
        }
      }
      
      // Verificar após um delay para dar tempo da sessão ser salva
      setTimeout(checkSession, 1000)
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

