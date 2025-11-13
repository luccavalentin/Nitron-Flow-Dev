import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { apiRequest } from "@/lib/api";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import InputModal from "@/components/ui/InputModal";

export default function Workspace() {
  const router = useRouter();
  const { id } = router.query;
  const [workspace, setWorkspace] = useState<any>(null);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [codeServerUrl, setCodeServerUrl] = useState("");
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);
  const [showCommitModal, setShowCommitModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const handleSnapshot = async (name: string) => {
    setError("");
    const response = await apiRequest(`/workspace/snapshot`, {
      method: "POST",
      body: JSON.stringify({ workspaceId: id, name }),
    });

    if (response.ok) {
      loadSnapshots();
      setSuccess("Snapshot criado com sucesso!");
      setShowSnapshotModal(false);
      setTimeout(() => setSuccess(""), 5000);
    } else {
      setError(response.error || "Erro ao criar snapshot");
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleCommit = async (message: string) => {
    setError("");
    const response = await apiRequest(`/workspace/commit`, {
      method: "POST",
      body: JSON.stringify({ workspaceId: id, message }),
    });

    if (response.ok) {
      setSuccess("Commit realizado com sucesso!");
      setShowCommitModal(false);
      setTimeout(() => setSuccess(""), 5000);
    } else {
      setError(response.error || "Erro ao fazer commit");
      setTimeout(() => setError(""), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-8">
            <div className="text-center py-12 text-slate-400">Carregando...</div>
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
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-slate-200">
              {workspace?.name || "Workspace"}
            </h1>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowSnapshotModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all text-sm shadow-lg shadow-cyan-500/30"
              >
                📸 Criar Snapshot
              </button>
              <button
                onClick={() => setShowCommitModal(true)}
                className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors text-sm"
              >
                💾 Commit & Push
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
                  <p className="text-slate-400 mb-4">
                    Code-server não configurado
                  </p>
                  <p className="text-sm text-slate-500">
                    Configure o code-server para visualizar o editor
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900 border-t border-slate-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-slate-200">
                Snapshots ({snapshots.length})
              </h2>
              {snapshots.length > 0 && (
                <button
                  onClick={loadSnapshots}
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
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
                    className="flex-shrink-0 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 cursor-pointer hover:bg-slate-700 hover:border-cyan-500/50 transition-all"
                    title={new Date(snapshot.created_at).toLocaleString("pt-BR")}
                  >
                    <div className="font-medium">{snapshot.name}</div>
                    <div className="text-xs text-slate-400">
                      {new Date(snapshot.created_at).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                Nenhum snapshot criado ainda
              </p>
            )}
          </div>
        </main>
      </div>

      <InputModal
        isOpen={showSnapshotModal}
        onClose={() => {
          setShowSnapshotModal(false);
          setError("");
        }}
        onSubmit={handleSnapshot}
        title="Criar Snapshot"
        label="Nome do Snapshot"
        placeholder="Digite o nome do snapshot"
        required
      />

      <InputModal
        isOpen={showCommitModal}
        onClose={() => {
          setShowCommitModal(false);
          setError("");
        }}
        onSubmit={handleCommit}
        title="Commit & Push"
        label="Mensagem do Commit"
        placeholder="Digite a mensagem do commit"
        type="textarea"
        required
      />

      {error && (
        <div className="fixed bottom-4 right-4 z-50 card-modern p-4 border-l-4 border-red-500 max-w-md">
          <div className="flex items-center justify-between">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => setError("")}
              className="ml-4 text-slate-400 hover:text-slate-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed bottom-4 right-4 z-50 card-modern p-4 border-l-4 border-green-500 max-w-md">
          <div className="flex items-center justify-between">
            <p className="text-green-400">{success}</p>
            <button
              onClick={() => setSuccess("")}
              className="ml-4 text-slate-400 hover:text-slate-200"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

