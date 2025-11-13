import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { isDevMode, getDevSession } from "@/lib/dev-mode";
import { useRouter } from "next/router";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    loadUser();
    loadTheme();
  }, []);

  const loadUser = async () => {
    // Modo de desenvolvimento
    if (!isSupabaseConfigured && isDevMode()) {
      const devSession = getDevSession();
      if (devSession) {
        setUser(devSession.user);
      }
      return;
    }
    
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    setUser(currentUser);
  };

  const loadTheme = () => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const handleLogout = async () => {
    // Modo de desenvolvimento
    if (!isSupabaseConfigured && isDevMode()) {
      const { clearDevSession } = await import("@/lib/dev-mode");
      clearDevSession();
      router.push("/auth/login");
      return;
    }
    
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-800/50 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <div className="absolute inset-0 h-2 w-2 rounded-full bg-green-500 animate-ping opacity-75"></div>
            </div>
            <span className="text-xs font-medium text-slate-400">Sistema Online</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-800/30 transition-all text-slate-400 hover:text-cyan-400"
            title={theme === "light" ? "Ativar tema escuro" : "Ativar tema claro"}
          >
            {theme === "light" ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>

          {user && (
            <div className="flex items-center space-x-2.5 pl-3 border-l border-slate-800/50">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-200">
                  {user.email?.split('@')[0] || 'Usuário'}
                </p>
                <p className="text-xs text-slate-500">
                  {user.email}
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-medium text-xs shadow-lg shadow-cyan-500/30">
                {(user.email?.charAt(0) || 'U').toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
