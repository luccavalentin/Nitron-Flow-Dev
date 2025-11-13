import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { apiRequest } from "@/lib/api";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Link from "next/link";

export default function ProjectDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [roadmap, setRoadmap] = useState<any[]>([]);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);

  useEffect(() => {
    if (id) {
      loadProject();
      loadTasks();
      loadRoadmap();
      loadDeployments();
    }
  }, [id]);

  const loadProject = async () => {
    const response = await apiRequest(`/projects/get-by-id?id=${id}`);
    if (response.ok && response.data) {
      setProject(response.data);
    }
  };

  const loadTasks = async () => {
    const response = await apiRequest(`/tasks?projectId=${id}`);
    if (response.ok && response.data) {
      setTasks(response.data);
    }
  };

  const loadRoadmap = async () => {
    const response = await apiRequest(`/roadmap/get?projectId=${id}`);
    if (response.ok && response.data) {
      setRoadmap(response.data);
    }
  };

  const loadDeployments = async () => {
    const response = await apiRequest(`/deployments/get?projectId=${id}`);
    if (response.ok && response.data) {
      setDeployments(response.data);
    }
  };

  const handleDeploy = async (environment: string) => {
    if (!confirm(`Confirmar deploy para ${environment}?`)) return;

    setDeploying(true);
    const response = await apiRequest("/deploy/start", {
      method: "POST",
      body: JSON.stringify({
        project_id: id,
        environment,
      }),
    });

    if (response.ok) {
      alert(`Deploy iniciado! URL: ${response.data?.preview_url || "Em processamento..."}`);
      loadDeployments();
    } else {
      alert(`Erro: ${response.error}`);
    }
    setDeploying(false);
  };

  useEffect(() => {
    if (project && tasks.length >= 0) {
      setLoading(false);
    }
  }, [project, tasks]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-8">
            <div className="text-center py-12">Carregando...</div>
          </main>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-8">
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                Projeto não encontrado
              </p>
              <Link
                href="/projects"
                className="text-indigo-600 dark:text-indigo-400 hover:underline mt-4 inline-block"
              >
                Voltar para projetos
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <Link
                href="/projects"
                className="text-indigo-600 dark:text-indigo-400 hover:underline mb-4 inline-block"
              >
                ← Voltar para projetos
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {project.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Tarefas
                    </h2>
                    <Link
                      href={`/tasks?projectId=${id}`}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
                    >
                      Ver todas →
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {tasks.slice(0, 5).map((task) => (
                      <div
                        key={task.id}
                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-gray-900 dark:text-white">
                            {task.title}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              task.status === "done"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : task.status === "in_progress"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                            }`}
                          >
                            {task.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {tasks.length === 0 && (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Nenhuma tarefa ainda
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Roadmap
                    </h2>
                    {roadmap.length === 0 && (
                      <button
                        onClick={async () => {
                          const response = await apiRequest(
                            `/projects/${id}/init-roadmap`,
                            { method: "POST" }
                          );
                          if (response.ok) {
                            loadRoadmap();
                          }
                        }}
                        className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                      >
                        Inicializar Roadmap
                      </button>
                    )}
                  </div>
                  {roadmap.length > 0 ? (
                    <div className="space-y-2">
                      {roadmap.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.phase}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Roadmap não inicializado
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Informações
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Status
                      </span>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {project.status}
                      </p>
                    </div>
                    {project.github_repo && (
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          GitHub
                        </span>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {project.github_repo}
                        </p>
                      </div>
                    )}
                    {project.supabase_project_ref && (
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Supabase
                        </span>
                        <p className="text-gray-900 dark:text-white font-medium">
                          Conectado
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Deploy
                  </h2>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleDeploy("staging")}
                      disabled={deploying}
                      className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-center"
                    >
                      {deploying ? "Deployando..." : "Deploy Staging"}
                    </button>
                    <button
                      onClick={() => handleDeploy("production")}
                      disabled={deploying}
                      className="block w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-center"
                    >
                      {deploying ? "Deployando..." : "Go Live 🚀"}
                    </button>
                  </div>
                  {deployments.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Últimos Deploys
                      </h3>
                      <div className="space-y-2">
                        {deployments.slice(0, 3).map((deploy) => (
                          <div
                            key={deploy.id}
                            className="text-sm text-gray-600 dark:text-gray-400"
                          >
                            <div className="flex items-center justify-between">
                              <span>{deploy.environment}</span>
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  deploy.status === "success"
                                    ? "bg-green-100 text-green-800"
                                    : deploy.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {deploy.status}
                              </span>
                            </div>
                            {deploy.logs?.url && (
                              <a
                                href={deploy.logs.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs"
                              >
                                Ver site →
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Ações Rápidas
                  </h2>
                  <div className="space-y-2">
                    <Link
                      href={`/tasks?projectId=${id}`}
                      className="block w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-center transition-colors"
                    >
                      Ver Tarefas
                    </Link>
                    {project.workspaces && project.workspaces.length > 0 && (
                      <Link
                        href={`/workspace/${project.workspaces[0].id}`}
                        className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
                      >
                        Abrir Workspace
                      </Link>
                    )}
                    <button className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      Conectar GitHub
                    </button>
                    <button className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      Conectar Supabase
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
