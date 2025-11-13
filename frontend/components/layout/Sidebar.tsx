import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { isDevMode, clearDevSession } from '@/lib/dev-mode'
import { 
  DashboardIcon, 
  ClientsIcon, 
  ProjectsIcon, 
  TasksIcon, 
  WorkspaceIcon, 
  DatabaseIcon,
  FinanceIcon,
  AIIcon,
  SettingsIcon,
  LogoutIcon 
} from '@/components/icons'

const menuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
  { label: 'Clientes', path: '/clients', icon: ClientsIcon },
  { label: 'Projetos', path: '/projects', icon: ProjectsIcon },
  { label: 'Tarefas', path: '/tasks', icon: TasksIcon },
  { label: 'Workspace', path: '/workspace', icon: WorkspaceIcon },
  { label: 'Database', path: '/database', icon: DatabaseIcon },
  { label: 'Financeiro', path: '/finance', icon: FinanceIcon },
  { label: 'FINCORE', path: '/fincore', icon: FinanceIcon },
  { label: 'Orçamentos', path: '/budgets', icon: ProjectsIcon },
  { label: 'Recibos', path: '/receipts', icon: ProjectsIcon },
  { label: 'IA', path: '/ai', icon: AIIcon },
  { label: 'Configurações', path: '/settings', icon: SettingsIcon },
]

export default function Sidebar() {
  const router = useRouter()

  const handleLogout = async () => {
    if (!isSupabaseConfigured && isDevMode()) {
      clearDevSession()
      router.push('/auth/login')
      return
    }
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="w-72 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 min-h-screen border-r border-slate-200/60 dark:border-slate-700/60 backdrop-blur-xl">
      <div className="p-6 border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              NitronFlow
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Dev Platform</p>
          </div>
        </div>
      </div>
      
      <nav className="px-3 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
        {menuItems.map((item) => {
          const isActive = router.pathname === item.path || router.pathname.startsWith(item.path + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`group flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'} transition-colors`} />
              <span className={`ml-3 font-medium text-sm ${isActive ? 'text-white' : ''}`}>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80"></div>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-0 w-72 p-4 border-t border-slate-200/60 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-xl">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 group"
        >
          <LogoutIcon className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-red-500 transition-colors" />
          <span className="ml-3 font-medium text-sm">Sair</span>
        </button>
      </div>
    </div>
  )
}

