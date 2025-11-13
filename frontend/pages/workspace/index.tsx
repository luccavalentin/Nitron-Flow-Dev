import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { apiRequest } from "@/lib/api";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { WorkspaceIcon } from "@/components/icons";

export default function WorkspacesList() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Carregar workspaces diretamente
      const workspacesResponse = await apiRequest("/workspace/get");
      if (workspacesResponse.ok && workspacesResponse.data) {
        setWorkspaces(workspacesResponse.data);
      } else {
        // Fallback: se não tiver workspaces, usar projetos como referência
        const projectsResponse = await apiRequest("/projects/get");
        if (projectsResponse.ok && projectsResponse.data) {
          setProjects(projectsResponse.data);
          const workspacesList: any[] = [];
          for (const project of projectsResponse.data) {
            workspacesList.push({
              id: project.id,
              name: project.name,
              project_id: project.id,
              project_name: project.name,
              created_at: project.created_at,
            });
          }
          setWorkspaces(workspacesList);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar workspaces:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWorkspace = (workspaceId: string) => {
    router.push(`/workspace/${workspaceId}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-8">
            <div className="text-center py-12 text-slate-400">Carregando workspaces...</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold gradient-text mb-2">
                Workspaces
              </h1>
              <p className="text-slate-400">
                Gerencie seus ambientes de desenvolvimento
              </p>
            </div>

            {workspaces.length === 0 ? (
              <div className="card-modern p-12 text-center">
                <WorkspaceIcon className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-200 mb-2">
                  Nenhum workspace encontrado
                </h3>
                <p className="text-slate-400 mb-6">
                  Crie um projeto com workspace para começar
                </p>
                <button
                  onClick={() => router.push("/projects")}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/30"
                >
                  Criar Projeto
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workspaces.map((workspace) => (
                  <div
                    key={workspace.id}
                    onClick={() => handleOpenWorkspace(workspace.id)}
                    className="card-modern p-6 cursor-pointer hover:border-cyan-500/50 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center group-hover:from-cyan-500/30 group-hover:to-blue-500/30 transition-all">
                        <WorkspaceIcon className="w-6 h-6 text-cyan-400" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-2 group-hover:text-cyan-300 transition-colors">
                      {workspace.name || workspace.projects?.name || `Workspace ${workspace.id?.substring(0, 8)}`}
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">
                      {workspace.projects?.name ? `Projeto: ${workspace.projects.name}` : `ID: ${workspace.id?.substring(0, 8)}...`}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {new Date(workspace.created_at).toLocaleDateString("pt-BR")}
                      </span>
                      <button className="text-sm text-cyan-400 group-hover:text-cyan-300 transition-colors">
                        Abrir →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

