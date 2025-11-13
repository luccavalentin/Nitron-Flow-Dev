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

  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");

  useEffect(() => {
    if (selectedConnection) {
      // Carregar tabelas (simulado)
      setTables(["projects", "clients", "tasks", "budgets", "receipts", "payments", "licenses"]);
    }
  }, [selectedConnection]);

  const handleViewTable = (tableName: string) => {
    setSelectedTable(tableName);
    setQuery(`SELECT * FROM ${tableName} LIMIT 100;`);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold gradient-text mb-2">Banco de Dados</h1>
              <p className="text-sm text-slate-400">Execute queries e gerencie conexões Supabase</p>
            </div>
            <div className="flex items-center justify-between mb-6">
              <div></div>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/30"
              >
                + Conectar Novo Banco
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-1">
                <div className="card-modern p-5 mb-4">
                  <h2 className="text-sm font-medium text-slate-300 mb-4">
                    Conexões
                  </h2>
                  {loading ? (
                    <div className="text-center py-4 text-slate-400">Carregando...</div>
                  ) : connections.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-400 text-sm mb-4">
                        Nenhuma conexão
                      </p>
                      <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 text-sm transition-all"
                      >
                        Conectar Banco
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {connections.map((conn) => (
                        <button
                          key={conn.id}
                          onClick={() => setSelectedConnection(conn)}
                          className={`w-full text-left p-3 rounded-lg transition-all ${
                            selectedConnection?.id === conn.id
                              ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 text-cyan-300"
                              : "bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300"
                          }`}
                        >
                          <p className="font-medium text-sm">
                            {conn.project_ref || "Projeto"}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 truncate">
                            {conn.url}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedConnection && tables.length > 0 && (
                  <div className="card-modern p-5">
                    <h2 className="text-sm font-medium text-slate-300 mb-4">
                      Tabelas
                    </h2>
                    <div className="space-y-1">
                      {tables.map((table) => (
                        <button
                          key={table}
                          onClick={() => handleViewTable(table)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                            selectedTable === table
                              ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 text-cyan-300"
                              : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                          }`}
                        >
                          {table}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-3">
                <div className="card-modern p-5">
                  <h2 className="text-sm font-medium text-slate-300 mb-4">
                    Query Editor
                  </h2>

                  {!selectedConnection ? (
                    <div className="text-center py-12">
                      <p className="text-slate-400 mb-4">
                        Selecione uma conexão para executar queries
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-slate-300">
                            SQL Query
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => insertQuickQuery("SELECT * FROM projects LIMIT 10;")}
                              className="px-2 py-1 text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                            >
                              SELECT
                            </button>
                            <button
                              onClick={() => insertQuickQuery("INSERT INTO projects (name, status) VALUES ('Novo Projeto', 'draft');")}
                              className="px-2 py-1 text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                            >
                              INSERT
                            </button>
                            <button
                              onClick={() => insertQuickQuery("UPDATE projects SET status = 'active' WHERE id = '...';")}
                              className="px-2 py-1 text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                            >
                              UPDATE
                            </button>
                            <button
                              onClick={() => insertQuickQuery("DELETE FROM projects WHERE id = '...';")}
                              className="px-2 py-1 text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                            >
                              DELETE
                            </button>
                          </div>
                        </div>
                        <textarea
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          className="w-full h-48 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                          placeholder="SELECT * FROM projects;"
                          spellCheck={false}
                        />
                        {queryHistory.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-slate-500 mb-1">Histórico:</p>
                            <div className="flex flex-wrap gap-1">
                              {queryHistory.slice(0, 5).map((histQuery, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setQuery(histQuery)}
                                  className="px-2 py-1 text-xs bg-slate-800 border border-slate-700 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-slate-200 transition-colors truncate max-w-xs"
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
                        <div className="text-xs text-slate-500">
                          {selectedConnection?.project_ref && (
                            <span>Conectado: <span className="text-cyan-400">{selectedConnection.project_ref}</span></span>
                          )}
                        </div>
                        <button
                          onClick={handleExecuteQuery}
                          disabled={executing || !query.trim()}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/30"
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
                            <h3 className="text-sm font-medium text-slate-300">
                              Resultado:
                            </h3>
                            {queryResult.executionTime && (
                              <span className="text-xs text-slate-500">
                                ⚡ {queryResult.executionTime} • {queryResult.rowsAffected || 0} linha(s)
                              </span>
                            )}
                          </div>
                          {queryResult.error ? (
                            <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg">
                              ❌ {queryResult.error}
                            </div>
                          ) : (
                            <div className="overflow-x-auto border border-slate-700 rounded-lg">
                              <table className="min-w-full bg-slate-900">
                                <thead className="bg-slate-800">
                                  <tr>
                                    {queryResult.columns?.map((col: string) => (
                                      <th
                                        key={col}
                                        className="px-4 py-2 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-700"
                                      >
                                        {col}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                  {queryResult.rows?.length > 0 ? (
                                    queryResult.rows.map((row: any, idx: number) => (
                                      <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                                        {queryResult.columns?.map((col: string) => (
                                          <td
                                            key={col}
                                            className="px-4 py-2 text-sm text-slate-200"
                                          >
                                            {row[col]?.toString() || (
                                              <span className="text-slate-500 italic">null</span>
                                            )}
                                          </td>
                                        ))}
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td
                                        colSpan={queryResult.columns?.length || 1}
                                        className="px-4 py-8 text-center text-slate-400"
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
