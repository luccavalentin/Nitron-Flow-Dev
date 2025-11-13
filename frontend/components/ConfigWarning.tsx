import { useEffect, useState } from 'react'
import { isSupabaseConfigured } from '@/lib/supabase'

export default function ConfigWarning() {
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    // Verificar apenas no cliente
    if (typeof window !== 'undefined') {
      setShowWarning(!isSupabaseConfigured)
    }
  }, [])

  if (!showWarning) return null

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black p-4 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-bold">Supabase não configurado!</p>
            <p className="text-sm">
              Crie o arquivo <code className="bg-black/20 px-1 rounded">frontend/.env.local</code> com suas credenciais.
              Veja <code className="bg-black/20 px-1 rounded">CONFIGURAR_SUPABASE.txt</code> para instruções.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowWarning(false)}
          className="px-4 py-2 bg-black/20 hover:bg-black/30 rounded font-semibold"
        >
          Fechar
        </button>
      </div>
    </div>
  )
}

