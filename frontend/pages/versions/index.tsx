import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function Versions() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const response = await apiRequest("/finance/products");
    if (response.ok && response.data) {
      setProducts(response.data);
    }
    setLoading(false);
  };

  const handleSyncKiwify = async () => {
    setSyncing(true);
    const response = await apiRequest("/finance/sync-kiwify", {
      method: "POST",
    });

    if (response.ok) {
      alert("Sincronizado com sucesso!");
      loadProducts();
    }
    setSyncing(false);
  };

  const handleExport = () => {
    // Gerar CSV
    const csv = [
      ["Produto", "Versão", "Licenças Vendidas", "Licenças Ativas", "Valor Unitário", "Receita"],
      ...products.map((p) => [
        p.name,
        p.version,
        p.licenses_sold,
        p.licenses_active,
        p.unit_price,
        p.total_revenue,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `versoes-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold gradient-text mb-2">Minhas Versões Finais</h1>
              <p className="text-sm text-slate-400">Gerencie produtos, versões e licenças</p>
            </div>
            <div className="flex items-center justify-between mb-6">
              <div></div>
              <div className="flex space-x-3">
                <button
                  onClick={handleSyncKiwify}
                  disabled={syncing}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-cyan-500/30"
                >
                  {syncing ? "Sincronizando..." : "Sincronizar Kiwify"}
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  📊 Exportar CSV
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-400">Carregando...</div>
            ) : products.length === 0 ? (
              <div className="card-modern p-12 text-center">
                <p className="text-slate-400 mb-4">
                  Nenhum produto encontrado
                </p>
                <button
                  onClick={handleSyncKiwify}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/30"
                >
                  Sincronizar com Kiwify
                </button>
              </div>
            ) : (
              <>
                <div className="card-modern overflow-hidden mb-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-700">
                      <thead className="bg-slate-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                            Produto
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                            Versão
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                            Licenças Vendidas
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                            Licenças Ativas
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                            Valor Unitário
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                            Receita Acumulada
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-slate-900 divide-y divide-slate-700">
                        {products.map((product) => (
                          <tr key={product.id} className="hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-200">
                              {product.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                              {product.version}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                              {product.licenses_sold || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-semibold">
                              {product.licenses_active || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                              R$ {parseFloat(product.unit_price || "0").toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-400">
                              R$ {parseFloat(product.total_revenue || "0").toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Gráficos */}
                {products.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="card-modern p-5">
                      <h3 className="text-sm font-medium text-slate-300 mb-4">Licenças por Produto</h3>
                      <div className="space-y-3">
                        {products.map((product) => {
                          const total = product.licenses_sold || 0;
                          const active = product.licenses_active || 0;
                          const percentage = total > 0 ? (active / total) * 100 : 0;
                          return (
                            <div key={product.id}>
                              <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>{product.name}</span>
                                <span>{active} / {total}</span>
                              </div>
                              <div className="w-full bg-slate-800 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="card-modern p-5">
                      <h3 className="text-sm font-medium text-slate-300 mb-4">Receita por Produto</h3>
                      <div className="space-y-3">
                        {products
                          .sort((a, b) => parseFloat(b.total_revenue || "0") - parseFloat(a.total_revenue || "0"))
                          .map((product) => {
                            const maxRevenue = Math.max(...products.map(p => parseFloat(p.total_revenue || "0")));
                            const percentage = maxRevenue > 0 ? (parseFloat(product.total_revenue || "0") / maxRevenue) * 100 : 0;
                            return (
                              <div key={product.id}>
                                <div className="flex justify-between text-xs text-slate-400 mb-1">
                                  <span>{product.name}</span>
                                  <span className="text-green-400 font-semibold">
                                    R$ {parseFloat(product.total_revenue || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                  </span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
    );
}

