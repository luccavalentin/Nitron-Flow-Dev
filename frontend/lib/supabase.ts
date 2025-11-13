import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Verificar se as variáveis estão configuradas
const isConfigured = supabaseUrl && supabaseAnonKey && 
                     supabaseUrl !== '' && 
                     supabaseAnonKey !== '' &&
                     !supabaseUrl.includes('seu-projeto') &&
                     !supabaseAnonKey.includes('sua_chave')

// Criar cliente apenas se estiver configurado, caso contrário usar valores dummy
let supabase: SupabaseClient

if (isConfigured) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
} else {
  // Cliente dummy para evitar erros - não funcionará, mas permite a aplicação carregar
  console.warn('⚠️ Variáveis de ambiente do Supabase não configuradas!')
  console.warn('Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local')
  
  // Usar valores dummy válidos para evitar erro de validação
  supabase = createClient('https://placeholder.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder', {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export { supabase }
export const isSupabaseConfigured = isConfigured

export type Database = {
  // Tipos serão gerados automaticamente quando o schema estiver pronto
}

