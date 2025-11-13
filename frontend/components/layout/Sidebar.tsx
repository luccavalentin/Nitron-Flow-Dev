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
    <div className="w-64 bg-white dark:bg-slate-900 min-h-screen border-r border-slate-200 dark:border-slate-800">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-slate-100 flex items-center justify-center">
            <span className="text-white dark:text-slate-900 font-bold text-sm">NF</span>
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              NitronFlow
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">Development</p>
          </div>
        </div>
      </div>
      
      <nav className="px-3 py-4 space-y-0.5 overflow-y-auto max-h-[calc(100vh-180px)]">
        {menuItems.map((item) => {
          const isActive = router.pathname === item.path || router.pathname.startsWith(item.path + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`group flex items-center px-3 py-2.5 rounded-lg transition-colors duration-150 ${
                isActive
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'} transition-colors`} />
              <span className={`ml-3 font-medium text-sm ${isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1 h-6 rounded-full bg-slate-900 dark:bg-slate-100"></div>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors duration-150 group"
        >
          <LogoutIcon className="w-4 h-4 text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors" />
          <span className="ml-3 font-medium text-sm">Sair</span>
        </button>
      </div>
    </div>
  )
}

