import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import { apiRequest } from "@/lib/api";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function Settings() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>([]);
  const [newEnvVar, setNewEnvVar] = useState({ key: "", value: "" });
  const [backupSchedule, setBackupSchedule] = useState("daily");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setUser(currentUser);

    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }

    // Carregar integrações
    const integrationsRes = await apiRequest("/integrations");
    if (integrationsRes.ok && integrationsRes.data) {
      setIntegrations(integrationsRes.data);
    }

    // Carregar projetos
    const projectsRes = await apiRequest("/projects");
    if (projectsRes.ok && projectsRes.data) {
      setProjects(projectsRes.data);
    }

    // Carregar backup schedule
    const savedSchedule = localStorage.getItem("backup_schedule") || "daily";
    setBackupSchedule(savedSchedule);

    setLoading(false);
  };

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const handleConnectGitHub = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("Faça login primeiro");
      return;
    }

    // Redirecionar para GitHub OAuth
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?provider=github`,
      },
    });

    if (error) {
      alert("Erro ao conectar GitHub: " + error.message);
    }
  };

  const handleConnectKiwify = async () => {
    const apiKey = prompt("Digite sua API Key do Kiwify:");
    if (!apiKey) return;

    const response = await apiRequest("/finance/sync-kiwify", {
      method: "POST",
      body: JSON.stringify({ apiKey }),
    });

    if (response.ok) {
      alert("Kiwify conectado com sucesso!");
      loadData();
    } else {
      alert("Erro ao conectar: " + (response.error || "Erro desconhecido"));
    }
  };

  const handleAddEnvVar = () => {
    if (!newEnvVar.key || !newEnvVar.value) {
      alert("Preencha chave e valor");
      return;
    }

    setEnvVars([...envVars, newEnvVar]);
    setNewEnvVar({ key: "", value: "" });
    
    // Salvar no localStorage (em produção, salvaria no backend)
    localStorage.setItem(`env_vars_${selectedProject}`, JSON.stringify([...envVars, newEnvVar]));
  };

  const handleRemoveEnvVar = (index: number) => {
    const newVars = envVars.filter((_, i) => i !== index);
    setEnvVars(newVars);
    localStorage.setItem(`env_vars_${selectedProject}`, JSON.stringify(newVars));
  };

  const handleBackupScheduleChange = (schedule: string) => {
    setBackupSchedule(schedule);
    localStorage.setItem("backup_schedule", schedule);
  };

  useEffect(() => {
    if (selectedProject) {
      const saved = localStorage.getItem(`env_vars_${selectedProject}`);
      if (saved) {
        setEnvVars(JSON.parse(saved));
      } else {
        setEnvVars([]);
      }
    }
  }, [selectedProject]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Configurações
            </h1>

            {loading ? (
              <div className="text-center py-12">Carregando...</div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Perfil
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {user?.email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nome
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {user?.user_metadata?.full_name || "Não definido"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Aparência
                  </h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tema
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Escolha entre tema claro ou escuro
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleThemeChange("light")}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          theme === "light"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        Claro
                      </button>
                      <button
                        onClick={() => handleThemeChange("dark")}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          theme === "dark"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        Escuro
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Integrações
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          GitHub
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {integrations.find((i) => i.provider === "github")
                            ? "Conectado"
                            : "Conecte sua conta GitHub"}
                        </p>
                      </div>
                      <button
                        onClick={handleConnectGitHub}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                      >
                        {integrations.find((i) => i.provider === "github")
                          ? "Gerenciar"
                          : "Conectar"}
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Kiwify
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Sincronize suas vendas
                        </p>
                      </div>
                      <button
                        onClick={handleConnectKiwify}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                      >
                        Conectar
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Variáveis de Ambiente por Projeto
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Selecionar Projeto
                      </label>
                      <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Selecione um projeto</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedProject && (
                      <>
                        <div className="space-y-2">
                          {envVars.map((envVar, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                            >
                              <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                                {envVar.key}
                              </span>
                              <span className="text-sm text-gray-500">=</span>
                              <span className="text-sm text-gray-500 flex-1">
                                {envVar.value.substring(0, 20)}
                                {envVar.value.length > 20 ? "..." : ""}
                              </span>
                              <button
                                onClick={() => handleRemoveEnvVar(index)}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                Remover
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Chave (ex: API_KEY)"
                            value={newEnvVar.key}
                            onChange={(e) =>
                              setNewEnvVar({ ...newEnvVar, key: e.target.value })
                            }
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <input
                            type="text"
                            placeholder="Valor"
                            value={newEnvVar.value}
                            onChange={(e) =>
                              setNewEnvVar({ ...newEnvVar, value: e.target.value })
                            }
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <button
                            onClick={handleAddEnvVar}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                          >
                            Adicionar
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Backup Automático
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Frequência de Backup
                      </label>
                      <select
                        value={backupSchedule}
                        onChange={(e) => handleBackupScheduleChange(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="daily">Diário</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensal</option>
                        <option value="manual">Manual</option>
                      </select>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Backups automáticos incluem schema do banco e snapshots de workspace
                    </p>
                    <button
                      onClick={async () => {
                        const response = await apiRequest("/backup/run", {
                          method: "POST",
                        });
                        if (response.ok) {
                          alert("Backup executado com sucesso!");
                        } else {
                          alert("Erro ao executar backup");
                        }
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Executar Backup Agora
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
