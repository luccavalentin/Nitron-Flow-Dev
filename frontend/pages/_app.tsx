import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Verificar sessão apenas no cliente
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname
      const publicPaths = ['/auth/login', '/auth/callback']
      
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

