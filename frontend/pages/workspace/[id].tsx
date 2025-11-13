import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { apiRequest } from "@/lib/api";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function Workspace() {
  const router = useRouter();
  const { id } = router.query;
  const [workspace, setWorkspace] = useState<any>(null);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [codeServerUrl, setCodeServerUrl] = useState("");

  useEffect(() => {
    if (id) {
      loadWorkspace();
      loadSnapshots();
      // Em produção, buscar URL do code-server configurado
      setCodeServerUrl(`http://localhost:8080/?folder=/workspace/${id}`);
    }
  }, [id]);

  const loadWorkspace = async () => {
    const response = await apiRequest(`/workspace/get?id=${id}`);
    if (response.ok && response.data) {
      setWorkspace(response.data);
      // Configurar URL do code-server baseado no workspace
      if (response.data.storage_path) {
        setCodeServerUrl(`http://localhost:8080/?folder=/workspace/${id}`);
      }
    }
    setLoading(false);
  };

  const loadSnapshots = async () => {
    const response = await apiRequest(`/snapshots/get?workspaceId=${id}`);
    if (response.ok && response.data) {
      setSnapshots(response.data);
    }
  };

  const handleSnapshot = async () => {
    const name = prompt("Nome do snapshot:");
    if (!name) return;

    const response = await apiRequest(`/workspace/snapshot`, {
      method: "POST",
      body: JSON.stringify({ workspaceId: id, name }),
    });

    if (response.ok) {
      loadSnapshots();
      alert("Snapshot criado com sucesso!");
    } else {
      alert(`Erro: ${response.error}`);
    }
  };

  const handleCommit = async () => {
    const message = prompt("Mensagem do commit:");
    if (!message) return;

    const response = await apiRequest(`/workspace/commit`, {
      method: "POST",
      body: JSON.stringify({ workspaceId: id, message }),
    });

    if (response.ok) {
      alert("Commit realizado com sucesso!");
    } else {
      alert(`Erro: ${response.error}`);
    }
  };

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

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {workspace?.name || "Workspace"}
            </h1>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSnapshot}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                Criar Snapshot
              </button>
              <button
                onClick={handleCommit}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                Commit & Push
              </button>
            </div>
          </div>

          <div className="flex-1 relative">
            {codeServerUrl ? (
              <iframe
                src={codeServerUrl}
                className="w-full h-full border-0"
                title="Code Editor"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Code-server não configurado
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Configure o code-server para visualizar o editor
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-gray-900 dark:text-white">
                Snapshots ({snapshots.length})
              </h2>
              {snapshots.length > 0 && (
                <button
                  onClick={loadSnapshots}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Atualizar
                </button>
              )}
            </div>
            {snapshots.length > 0 ? (
              <div className="flex space-x-2 overflow-x-auto">
                {snapshots.map((snapshot) => (
                  <div
                    key={snapshot.id}
                    className="flex-shrink-0 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title={new Date(snapshot.created_at).toLocaleString("pt-BR")}
                  >
                    <div className="font-medium">{snapshot.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(snapshot.created_at).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Nenhum snapshot criado ainda
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

