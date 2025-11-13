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
    // TODO: Implementar endpoints específicos
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
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Financeiro
              </h1>
              <button
                onClick={handleSyncKiwify}
                disabled={syncing}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {syncing ? "Sincronizando..." : "Sincronizar Kiwify"}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Pagamentos
                </h2>
                {payments.length > 0 ? (
                  <div className="space-y-2">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {payment.provider}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(payment.paid_at).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
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
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Nenhum pagamento encontrado
                  </p>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Licenças
                </h2>
                {licenses.length > 0 ? (
                  <div className="space-y-2">
                    {licenses.map((license) => (
                      <div
                        key={license.id}
                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {license.license_key}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Status: {license.status}
                            </p>
                          </div>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
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
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Nenhuma licença encontrada
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

