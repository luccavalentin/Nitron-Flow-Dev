import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function Finance() {
  const [payments, setPayments] = useState<any[]>([]);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [paymentsRes, licensesRes] = await Promise.all([
      apiRequest("/payments/get"),
      apiRequest("/licenses/get"),
    ]);

    if (paymentsRes.ok && paymentsRes.data) {
      setPayments(paymentsRes.data);
    }

    if (licensesRes.ok && licensesRes.data) {
      setLicenses(licensesRes.data);
    }

    setLoading(false);
  };

  const handleSyncKiwify = async () => {
    setSyncing(true);
    const response = await apiRequest("/finance/sync-kiwify", {
      method: "POST",
    });

    if (response.ok) {
      alert(`Sincronizado: ${response.data.payments_created} pagamentos, ${response.data.licenses_created} licenças`);
      loadData();
    } else {
      alert(`Erro: ${response.error}`);
    }
    setSyncing(false);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold gradient-text mb-2">Financeiro</h1>
              <p className="text-sm text-slate-400">Gerencie pagamentos, licenças e receitas</p>
            </div>
            <div className="flex items-center justify-between mb-6">
              <div></div>
              <button
                onClick={handleSyncKiwify}
                disabled={syncing}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-cyan-500/30"
              >
                {syncing ? "Sincronizando..." : "Sincronizar Kiwify"}
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-400">Carregando...</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="card-modern p-5">
                    <h3 className="text-sm font-medium text-slate-500 mb-1">
                      Total de Pagamentos
                    </h3>
                    <p className="text-3xl font-bold text-cyan-400 mb-2">
                      {payments.length}
                    </p>
                    <p className="text-sm text-slate-400">
                      R${" "}
                      {payments
                        .reduce(
                          (sum, p) => sum + parseFloat(p.amount || "0"),
                          0
                        )
                        .toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                    </p>
                  </div>
                  <div className="card-modern p-5">
                    <h3 className="text-sm font-medium text-slate-500 mb-1">
                      Total de Licenças
                    </h3>
                    <p className="text-3xl font-bold text-blue-400 mb-2">
                      {licenses.length}
                    </p>
                    <p className="text-sm text-slate-400">
                      <span className="text-green-400 font-semibold">{licenses.filter((l) => l.status === "active").length}</span> ativas
                    </p>
                  </div>
                  <div className="card-modern p-5">
                    <h3 className="text-sm font-medium text-slate-500 mb-1">
                      Receita Total
                    </h3>
                    <p className="text-3xl font-bold text-green-400">
                      R${" "}
                      {payments
                        .reduce(
                          (sum, p) => sum + parseFloat(p.amount || "0"),
                          0
                        )
                        .toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="card-modern p-5">
                    <h2 className="text-sm font-medium text-slate-300 mb-4">
                      Pagamentos Recentes
                    </h2>
                    {payments.length > 0 ? (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {payments.map((payment) => (
                          <div
                            key={payment.id}
                            className="p-3 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:border-cyan-500/50 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-slate-200 text-sm">
                                  {payment.projects?.name || payment.provider}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                  {payment.provider} •{" "}
                                  {new Date(payment.paid_at).toLocaleDateString("pt-BR")}
                                </p>
                              </div>
                              <p className="text-lg font-semibold text-green-400">
                                R${" "}
                                {parseFloat(payment.amount || "0").toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm">
                        Nenhum pagamento encontrado
                      </p>
                    )}
                  </div>

                  <div className="card-modern p-5">
                    <h2 className="text-sm font-medium text-slate-300 mb-4">
                      Licenças
                    </h2>
                    {licenses.length > 0 ? (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {licenses.map((license) => (
                          <div
                            key={license.id}
                            className="p-3 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:border-cyan-500/50 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-slate-200 text-sm">
                                  {license.projects?.name || "Licença"}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                  {license.license_key?.substring(0, 20)}... •{" "}
                                  <span
                                    className={`${
                                      license.status === "active"
                                        ? "text-green-400"
                                        : "text-slate-500"
                                    }`}
                                  >
                                    {license.status}
                                  </span>
                                </p>
                              </div>
                              <p className="text-lg font-semibold text-slate-200">
                                R${" "}
                                {parseFloat(license.price || "0").toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm">
                        Nenhuma licença encontrada
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

