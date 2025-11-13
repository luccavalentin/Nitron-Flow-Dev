import { useState } from "react";

interface SupabaseConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  onConnect: (data: any) => void;
}

export default function SupabaseConnectModal({
  isOpen,
  onClose,
  projectId,
  onConnect,
}: SupabaseConnectModalProps) {
  const [authType, setAuthType] = useState<"url" | "create">("url");
  const [formData, setFormData] = useState({
    projectRef: "",
    anonKey: "",
    projectName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || ""}/supabase/connect`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(await import("@/lib/supabase")).supabase.auth.getSession().then((r) => r.data.session?.access_token)}`,
          },
          body: JSON.stringify({
            authType,
            project_id: projectId,
            ...formData,
          }),
        }
      );

      const result = await response.json();

      if (result.ok) {
        onConnect(result.data);
        onClose();
      } else {
        setError(result.error || "Erro ao conectar");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao conectar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Conectar Supabase
        </h2>

        <div className="mb-4">
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setAuthType("url")}
              className={`flex-1 px-4 py-2 rounded-lg ${
                authType === "url"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              Conectar Existente
            </button>
            <button
              type="button"
              onClick={() => setAuthType("create")}
              className={`flex-1 px-4 py-2 rounded-lg ${
                authType === "create"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              Criar Novo
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {authType === "url" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Reference
                </label>
                <input
                  type="text"
                  required
                  value={formData.projectRef}
                  onChange={(e) =>
                    setFormData({ ...formData, projectRef: e.target.value })
                  }
                  placeholder="abcdefghijklmnop"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Anon Key
                </label>
                <textarea
                  required
                  value={formData.anonKey}
                  onChange={(e) =>
                    setFormData({ ...formData, anonKey: e.target.value })
                  }
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome do Projeto
              </label>
              <input
                type="text"
                required
                value={formData.projectName}
                onChange={(e) =>
                  setFormData({ ...formData, projectName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Conectando..." : "Conectar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

