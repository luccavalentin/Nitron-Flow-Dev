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
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            NitronFlow Dev
          </h2>
          <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
            V40
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={theme === "light" ? "Ativar tema escuro" : "Ativar tema claro"}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          {user && (
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Online
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
