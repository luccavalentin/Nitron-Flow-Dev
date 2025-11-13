import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { isDevMode, hasDevSession, getDevSession } from '@/lib/dev-mode'

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true)

      // Modo de desenvolvimento
      if (!isSupabaseConfigured && isDevMode()) {
        const devSession = getDevSession()
        if (devSession) {
          setUser(devSession.user)
          setAuthenticated(true)
        } else {
          setAuthenticated(false)
          if (router.pathname !== '/auth/login' && router.pathname !== '/auth/callback') {
            router.push('/auth/login')
          }
        }
        setLoading(false)
        return
      }

      // Modo produção com Supabase
      if (isSupabaseConfigured) {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          setAuthenticated(false)
          if (router.pathname !== '/auth/login' && router.pathname !== '/auth/callback') {
            router.push('/auth/login')
          }
        } else {
          setUser(session.user)
          setAuthenticated(true)
        }
      }

      setLoading(false)
    }

    checkAuth()

    // Listener para mudanças de auth (apenas se Supabase configurado)
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setUser(session.user)
          setAuthenticated(true)
        } else {
          setUser(null)
          setAuthenticated(false)
          if (router.pathname !== '/auth/login' && router.pathname !== '/auth/callback') {
            router.push('/auth/login')
          }
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [router.pathname])

  return { user, loading, authenticated, isDev: !isSupabaseConfigured && isDevMode() }
}

