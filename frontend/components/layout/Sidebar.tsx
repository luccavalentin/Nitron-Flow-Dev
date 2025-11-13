import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const menuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: '📊' },
  { label: 'Clientes', path: '/clients', icon: '👥' },
  { label: 'Projetos', path: '/projects', icon: '📁' },
  { label: 'Tarefas', path: '/tasks', icon: '✅' },
  { label: 'Workspace', path: '/workspace', icon: '💻' },
  { label: 'Banco de Dados', path: '/database', icon: '🗄️' },
  { label: 'Versões Finais', path: '/versions', icon: '📦' },
  { label: 'Financeiro', path: '/finance', icon: '💰' },
  { label: 'FINCORE', path: '/fincore', icon: '🤖' },
  { label: 'Orçamentos', path: '/budgets', icon: '📋' },
  { label: 'Recibos', path: '/receipts', icon: '🧾' },
  { label: 'IA', path: '/ai', icon: '✨' },
  { label: 'Configurações', path: '/settings', icon: '⚙️' },
]

const workspaceItems = [
  { label: 'Workspace', path: '/workspace', icon: '💻' },
]

export default function Sidebar() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="w-64 bg-white dark:bg-gray-800 min-h-screen border-r border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          NitronFlow Dev
        </h1>
      </div>
      
      <nav className="px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = router.pathname === item.path || router.pathname.startsWith(item.path + '/')
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <span className="mr-3">🚪</span>
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </div>
  )
}

