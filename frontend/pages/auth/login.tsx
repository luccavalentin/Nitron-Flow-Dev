import { useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { isDevMode, setDevSession } from '@/lib/dev-mode'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Modo de desenvolvimento: permite login com qualquer credencial
    // Se não está configurado E está em localhost, sempre permitir modo dev
    const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
    const isDev = !isSupabaseConfigured && (hostname === 'localhost' || hostname === '127.0.0.1' || isDevMode())
    
    console.log('🔍 Debug Login:', { isSupabaseConfigured, hostname, isDev, email })
    
    if (isDev) {
      if (!email) {
        setError('Digite um email (qualquer email funciona em modo dev)')
        return
      }
      
      setLoading(true)
      setError('')
      
      try {
        // Criar sessão fake ANTES do delay
        setDevSession(email)
        console.log('✅ Sessão dev criada')
        
        // Verificar se foi salva
        const saved = localStorage.getItem('nitronflow_dev_session')
        console.log('💾 Sessão salva:', saved ? 'SIM' : 'NÃO')
        
        // Aguardar um pouco para garantir que localStorage foi atualizado
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Verificar novamente se foi salvo
        const verifySession = localStorage.getItem('nitronflow_dev_session')
        if (!verifySession) {
          console.error('❌ ERRO: Sessão não foi salva!')
          setError('Erro ao salvar sessão. Tente novamente.')
          setLoading(false)
          return
        }
        
        console.log('✅ Sessão verificada, redirecionando...')
        
        // Redirecionar usando window.location para garantir recarregamento completo
        window.location.href = '/dashboard'
      } catch (err: any) {
        console.error('❌ Erro no login dev:', err)
        setError('Erro ao fazer login: ' + err.message)
        setLoading(false)
      }
      return
    }
    
    if (!isSupabaseConfigured) {
      setError('Supabase não configurado. Configure o arquivo .env.local')
      return
    }
    
    setLoading(true)
    setError('')

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      if (data.session) {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login')
      setLoading(false)
    }
  }

  const handleSignUp = async () => {
    if (!email || !password) {
      setError('Preencha email e senha para criar conta')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      if (data.user) {
        setError('Conta criada! Verifique seu email para confirmar.')
        // Auto login após criação
        setTimeout(() => {
          handleLogin(new Event('submit') as any)
        }, 1000)
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta')
      setLoading(false)
    }
  }

  const handleGitHubLogin = async () => {
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full space-y-6 p-8 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl tech-border"
      >
        <div>
          <div className="flex items-center justify-center mb-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <span className="text-white font-bold text-sm">NF</span>
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
            </div>
          </div>
          <h2 className="text-center text-2xl font-bold gradient-text">
            NitronFlow
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Faça login para continuar
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100 focus:border-slate-900 dark:focus:border-slate-100 transition-colors"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100 focus:border-slate-900 dark:focus:border-slate-100 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            {!isSupabaseConfigured && isDevMode() && (
              <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-400">
                <span className="font-medium">Modo Desenvolvimento:</span> Digite qualquer email e senha para entrar
              </div>
            )}
            <button
              type="submit"
              disabled={loading || (!isSupabaseConfigured && !isDevMode())}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">ou</span>
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading || !isSupabaseConfigured}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 dark:focus:ring-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Criando...
                </>
              ) : (
                'Criar Conta'
              )}
            </button>

            <button
              type="button"
              onClick={handleGitHubLogin}
              disabled={loading || !isSupabaseConfigured}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 dark:focus:ring-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Conectando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  Entrar com GitHub
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

