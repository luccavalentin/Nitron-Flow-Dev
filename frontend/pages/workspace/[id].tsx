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
    // TODO: Implementar endpoint para buscar workspace
    setWorkspace({ id, name: `Workspace ${id}` });
    setLoading(false);
  };

  const loadSnapshots = async () => {
    // TODO: Implementar endpoint para buscar snapshots
    setSnapshots([]);
  };

  const handleSnapshot = async () => {
    const name = prompt("Nome do snapshot:");
    if (!name) return;

    const response = await apiRequest(`/workspace/${id}/snapshot`, {
      method: "POST",
      body: JSON.stringify({ name }),
    });

    if (response.ok) {
      loadSnapshots();
      alert("Snapshot criado com sucesso!");
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
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm">
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

          {snapshots.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
              <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Snapshots
              </h2>
              <div className="flex space-x-2 overflow-x-auto">
                {snapshots.map((snapshot) => (
                  <div
                    key={snapshot.id}
                    className="flex-shrink-0 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300"
                  >
                    {snapshot.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

