import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { isDevMode, hasDevSession } from "@/lib/dev-mode";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      // Modo de desenvolvimento
      if (!isSupabaseConfigured && isDevMode()) {
        if (hasDevSession()) {
          router.push("/dashboard");
        } else {
          router.push("/auth/login");
        }
        return;
      }
      
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.push("/dashboard");
      } else {
        router.push("/auth/login");
      }
    };

    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          Carregando...
        </div>
      </div>
    </div>
  );
}

