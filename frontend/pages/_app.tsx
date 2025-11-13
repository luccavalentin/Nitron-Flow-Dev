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
    if (!isSupabaseConfigured && isDevMode()) {
      // Se está em uma rota pública, não precisa verificar sessão
      if (publicPaths.includes(currentPath)) {
        return
      }
      
      // Verificar sessão dev com um pequeno delay para garantir que foi salva
      setTimeout(() => {
        if (!hasDevSession()) {
          window.location.href = '/auth/login'
        }
      }, 100)
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

