import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function FINCORE() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    const response = await apiRequest("/fincore/summary");
    if (response.ok && response.data) {
      setSummary(response.data);
    }
    setLoading(false);
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

  const funds = summary?.funds || [];
  const kpis = summary?.kpis || {};

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              FINCORE AI
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Saldo Total
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  R$ {summary?.total_balance?.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || "0,00"}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Receita Total
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  R$ {kpis.total_revenue?.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || "0,00"}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Licenças Ativas
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {kpis.active_licenses || 0}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  ROI
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {kpis.roi ? `${kpis.roi}%` : "N/A"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Fundos
                </h2>
                <div className="space-y-3">
                  {funds.length > 0 ? (
                    funds.map((fund: any) => (
                      <div
                        key={fund.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {fund.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {fund.code}
                          </p>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          R$ {parseFloat(fund.balance || "0").toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Nenhum fundo criado ainda
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  KPIs
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">LTV</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {kpis.ltv ? `R$ ${kpis.ltv.toLocaleString("pt-BR")}` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">CAC</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {kpis.cac ? `R$ ${kpis.cac.toLocaleString("pt-BR")}` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Runway</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {kpis.runway ? `${kpis.runway} meses` : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {summary?.recent_transactions && summary.recent_transactions.length > 0 && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Transações Recentes
                </h2>
                <div className="space-y-2">
                  {summary.recent_transactions.map((tx: any) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {tx.reference || "Transação"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(tx.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <p
                        className={`text-lg font-semibold ${
                          tx.type === "credit"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {tx.type === "credit" ? "+" : "-"}R${" "}
                        {parseFloat(tx.amount || "0").toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

