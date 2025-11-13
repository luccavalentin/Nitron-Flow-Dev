import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import SupabaseConnectModal from "@/components/modals/SupabaseConnectModal";

export default function Database() {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<any>(null);
  const [query, setQuery] = useState("SELECT * FROM projects LIMIT 10;");
  const [queryResult, setQueryResult] = useState<any>(null);
  const [executing, setExecuting] = useState(false);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    const response = await apiRequest("/supabase/projects");
    if (response.ok && response.data) {
      setConnections(response.data);
    }
    setLoading(false);
  };

  const handleConnect = (data: any) => {
    loadConnections();
    setShowModal(false);
  };

  const handleExecuteQuery = async () => {
    if (!selectedConnection || !query.trim()) return;

    setExecuting(true);
    setQueryResult(null);

    // Adicionar ao histórico
    if (!queryHistory.includes(query.trim())) {
      setQueryHistory([query.trim(), ...queryHistory].slice(0, 10));
    }

    try {
      // Em produção, isso chamaria uma Edge Function que executa a query
      // Por enquanto, simular
      await new Promise((resolve) => setTimeout(resolve, 500));
      setQueryResult({
        columns: ["id", "name", "status"],
        rows: [
          { id: "1", name: "Projeto 1", status: "active" },
          { id: "2", name: "Projeto 2", status: "draft" },
        ],
        executionTime: "0.05s",
        rowsAffected: 2,
      });
    } catch (error: any) {
      setQueryResult({ error: error.message });
    } finally {
      setExecuting(false);
    }
  };

  const insertQuickQuery = (template: string) => {
    setQuery(template);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Banco de Dados
              </h1>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Conectar Novo Banco
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Conexões
                  </h2>
                  {loading ? (
                    <div className="text-center py-4">Carregando...</div>
                  ) : connections.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                        Nenhuma conexão
                      </p>
                      <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                      >
                        Conectar Primeiro Banco
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {connections.map((conn) => (
                        <button
                          key={conn.id}
                          onClick={() => setSelectedConnection(conn)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            selectedConnection?.id === conn.id
                              ? "bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-500"
                              : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                          }`}
                        >
                          <p className="font-medium text-gray-900 dark:text-white">
                            {conn.project_ref || "Projeto"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {conn.url}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Query Editor
                  </h2>

                  {!selectedConnection ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Selecione uma conexão para executar queries
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            SQL Query
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => insertQuickQuery("SELECT * FROM projects LIMIT 10;")}
                              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                              SELECT
                            </button>
                            <button
                              onClick={() => insertQuickQuery("INSERT INTO projects (name, status) VALUES ('Novo Projeto', 'draft');")}
                              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                              INSERT
                            </button>
                            <button
                              onClick={() => insertQuickQuery("UPDATE projects SET status = 'active' WHERE id = '...';")}
                              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                              UPDATE
                            </button>
                            <button
                              onClick={() => insertQuickQuery("DELETE FROM projects WHERE id = '...';")}
                              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                              DELETE
                            </button>
                          </div>
                        </div>
                        <textarea
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          className="w-full h-48 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="SELECT * FROM projects;"
                          spellCheck={false}
                        />
                        {queryHistory.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Histórico:</p>
                            <div className="flex flex-wrap gap-1">
                              {queryHistory.slice(0, 5).map((histQuery, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setQuery(histQuery)}
                                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 truncate max-w-xs"
                                  title={histQuery}
                                >
                                  {histQuery.substring(0, 30)}...
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedConnection?.project_ref && (
                            <span>Conectado: {selectedConnection.project_ref}</span>
                          )}
                        </div>
                        <button
                          onClick={handleExecuteQuery}
                          disabled={executing || !query.trim()}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                        >
                          {executing ? (
                            <>
                              <span className="animate-spin">⏳</span>
                              Executando...
                            </>
                          ) : (
                            <>
                              ▶️ Executar Query
                            </>
                          )}
                        </button>
                      </div>

                      {queryResult && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Resultado:
                            </h3>
                            {queryResult.executionTime && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {queryResult.executionTime} • {queryResult.rowsAffected || 0} linha(s)
                              </span>
                            )}
                          </div>
                          {queryResult.error ? (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
                              ❌ {queryResult.error}
                            </div>
                          ) : (
                            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                              <table className="min-w-full bg-white dark:bg-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                  <tr>
                                    {queryResult.columns?.map((col: string) => (
                                      <th
                                        key={col}
                                        className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600"
                                      >
                                        {col}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                  {queryResult.rows?.length > 0 ? (
                                    queryResult.rows.map((row: any, idx: number) => (
                                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                                        {queryResult.columns?.map((col: string) => (
                                          <td
                                            key={col}
                                            className="px-4 py-2 text-sm text-gray-900 dark:text-white"
                                          >
                                            {row[col]?.toString() || (
                                              <span className="text-gray-400 italic">null</span>
                                            )}
                                          </td>
                                        ))}
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td
                                        colSpan={queryResult.columns?.length || 1}
                                        className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                                      >
                                        Nenhum resultado encontrado
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showModal && (
        <SupabaseConnectModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConnect={handleConnect}
        />
      )}
    </div>
  );
}
