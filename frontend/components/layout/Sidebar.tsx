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
    <div className="w-64 glass min-h-screen border-r border-slate-800/50">
      <div className="p-6 border-b border-slate-800/50">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <span className="text-white font-bold text-sm">NF</span>
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-base font-semibold gradient-text tracking-tight">
              NitronFlow
            </h1>
            <p className="text-xs text-slate-400 font-normal">Development Platform</p>
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
              className={`group relative flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 border-l-2 border-cyan-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400'} transition-colors`} />
              <span className={`ml-3 font-medium text-sm ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`}>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50"></div>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t border-slate-800/50 glass">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 rounded-lg transition-all duration-200 group"
        >
          <LogoutIcon className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" />
          <span className="ml-3 font-medium text-sm">Sair</span>
        </button>
      </div>
    </div>
  )
}

