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
  { label: 'Roadmap', path: '/roadmap', icon: ProjectsIcon },
  { label: 'Workspace', path: '/workspace', icon: WorkspaceIcon },
  { label: 'Database', path: '/database', icon: DatabaseIcon },
  { label: 'Versões', path: '/versions', icon: ProjectsIcon },
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
    <div className="w-64 bg-slate-900 min-h-screen border-r border-slate-800 relative z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none"></div>
      <div className="p-6 border-b border-slate-800 relative z-10">
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
      
      <nav className="px-3 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)] relative z-10">
        {menuItems.map((item) => {
          const isActive = router.pathname === item.path || router.pathname.startsWith(item.path + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`group relative flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-600/30 via-blue-600/30 to-cyan-600/30 text-cyan-300 border-l-2 border-cyan-500 shadow-lg shadow-cyan-500/20'
                  : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800 border-l-2 border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-300' : 'text-slate-400 group-hover:text-cyan-400'} transition-colors`} />
              <span className={`ml-3 font-medium text-sm ${isActive ? 'text-cyan-300' : 'text-slate-300 group-hover:text-cyan-300'}`}>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/60 animate-pulse"></div>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t border-slate-800 bg-slate-900 relative z-10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2.5 text-slate-300 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all duration-200 group"
        >
          <LogoutIcon className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" />
          <span className="ml-3 font-medium text-sm">Sair</span>
        </button>
      </div>
    </div>
  )
}

