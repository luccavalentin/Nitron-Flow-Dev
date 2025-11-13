import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function FINCORE() {
  const [summary, setSummary] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [simulation, setSimulation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSimulate, setShowSimulate] = useState(false);
  const [simulateData, setSimulateData] = useState({
    scenario: "baseline",
    months: 12,
    revenue_per_month: "0",
    expenses_per_month: "0",
  });

  useEffect(() => {
    loadSummary();
    loadInsights();
  }, []);

  const loadSummary = async () => {
    const response = await apiRequest("/fincore/summary");
    if (response.ok && response.data) {
      setSummary(response.data);
    }
    setLoading(false);
  };

  const loadInsights = async () => {
    const response = await apiRequest("/fincore/insights");
    if (response.ok && response.data) {
      setInsights(response.data);
    }
  };

  const handleSimulate = async () => {
    const response = await apiRequest("/fincore/simulate", {
      method: "POST",
      body: JSON.stringify(simulateData),
    });

    if (response.ok && response.data) {
      setSimulation(response.data);
      setShowSimulate(false);
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

  const funds = summary?.funds || [];
  const kpis = summary?.kpis || {};

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold gradient-text mb-2">FINCORE AI</h1>
              <p className="text-sm text-slate-400">Inteligência financeira e alocação automática de fundos</p>
            </div>
            <div className="flex items-center justify-between mb-6">
              <div></div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSimulate(true)}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/30"
                >
                  Simular Cenário
                </button>
                <button
                  onClick={loadInsights}
                  className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Atualizar Insights
                </button>
              </div>
            </div>

            {insights && insights.insights && insights.insights.length > 0 && (
              <div className="mb-6 space-y-3">
                {insights.insights.map((insight: any, idx: number) => (
                  <div
                    key={idx}
                    className={`card-modern p-4 ${
                      insight.type === "warning"
                        ? "border-yellow-500/50"
                        : insight.type === "success"
                        ? "border-green-500/50"
                        : "border-cyan-500/50"
                    }`}
                  >
                    <h3 className="font-semibold text-slate-200 mb-1 text-sm">
                      {insight.title}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {insight.message}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="card-modern p-5">
                <h3 className="text-sm font-medium text-slate-500 mb-1">
                  Saldo Total
                </h3>
                <p className="text-3xl font-bold text-cyan-400">
                  R$ {summary?.total_balance?.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || "0,00"}
                </p>
              </div>

              <div className="card-modern p-5">
                <h3 className="text-sm font-medium text-slate-500 mb-1">
                  Receita Total
                </h3>
                <p className="text-3xl font-bold text-green-400">
                  R$ {kpis.total_revenue?.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || "0,00"}
                </p>
              </div>

              <div className="card-modern p-5">
                <h3 className="text-sm font-medium text-slate-500 mb-1">
                  Licenças Ativas
                </h3>
                <p className="text-3xl font-bold text-blue-400">
                  {kpis.active_licenses || 0}
                </p>
              </div>

              <div className="card-modern p-5">
                <h3 className="text-sm font-medium text-slate-500 mb-1">
                  ROI
                </h3>
                <p className="text-3xl font-bold text-purple-400">
                  {kpis.roi ? `${kpis.roi}%` : "N/A"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <div className="card-modern p-5">
                <h2 className="text-sm font-medium text-slate-300 mb-4">
                  Fundos
                </h2>
                <div className="space-y-3">
                  {funds.length > 0 ? (
                    funds.map((fund: any) => {
                      const totalBalance = summary?.total_balance || 1;
                      const percentage = (parseFloat(fund.balance || "0") / totalBalance) * 100;
                      return (
                        <div
                          key={fund.id}
                          className="p-3 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:border-cyan-500/50 transition-all"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium text-slate-200 text-sm">
                                {fund.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {fund.code}
                              </p>
                            </div>
                            <p className="text-lg font-semibold text-cyan-400">
                              R$ {parseFloat(fund.balance || "0").toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </p>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-slate-400 text-sm">
                      Nenhum fundo criado ainda
                    </p>
                  )}
                </div>
              </div>

              <div className="card-modern p-5">
                <h2 className="text-sm font-medium text-slate-300 mb-4">
                  KPIs
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">LTV</p>
                    <p className="text-lg font-semibold text-cyan-400">
                      {kpis.ltv ? `R$ ${kpis.ltv.toLocaleString("pt-BR")}` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">CAC</p>
                    <p className="text-lg font-semibold text-blue-400">
                      {kpis.cac ? `R$ ${kpis.cac.toLocaleString("pt-BR")}` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Runway</p>
                    <p className="text-lg font-semibold text-green-400">
                      {kpis.runway ? `${kpis.runway} meses` : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {summary?.recent_transactions && summary.recent_transactions.length > 0 && (
              <div className="card-modern p-5 mb-6">
                <h2 className="text-sm font-medium text-slate-300 mb-4">
                  Transações Recentes
                </h2>
                <div className="space-y-2">
                  {summary.recent_transactions.map((tx: any) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:border-cyan-500/50 transition-all"
                    >
                      <div>
                        <p className="font-medium text-slate-200 text-sm">
                          {tx.reference || "Transação"}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(tx.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <p
                        className={`text-lg font-semibold ${
                          tx.type === "credit"
                            ? "text-green-400"
                            : "text-red-400"
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

            {simulation && (
              <div className="card-modern p-5 mt-6">
                <h2 className="text-sm font-medium text-slate-300 mb-4">
                  Simulação: {simulation.scenario}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Saldo Inicial
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      R${" "}
                      {simulation.current_balance.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Saldo Final
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      R${" "}
                      {simulation.final_balance.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Runway Médio
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {simulation.average_runway === Infinity
                        ? "∞"
                        : `${simulation.average_runway} meses`}
                    </p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 text-gray-700 dark:text-gray-300">
                          Mês
                        </th>
                        <th className="text-right py-2 text-gray-700 dark:text-gray-300">
                          Receita
                        </th>
                        <th className="text-right py-2 text-gray-700 dark:text-gray-300">
                          Despesas
                        </th>
                        <th className="text-right py-2 text-gray-700 dark:text-gray-300">
                          Saldo
                        </th>
                        <th className="text-right py-2 text-gray-700 dark:text-gray-300">
                          Runway
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulation.simulation.map((sim: any) => (
                        <tr
                          key={sim.month}
                          className="border-b border-gray-100 dark:border-gray-700"
                        >
                          <td className="py-2 text-gray-900 dark:text-white">
                            {sim.month}
                          </td>
                          <td className="text-right py-2 text-green-600 dark:text-green-400">
                            R${" "}
                            {sim.revenue.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="text-right py-2 text-red-600 dark:text-red-400">
                            R${" "}
                            {sim.expenses.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="text-right py-2 text-gray-900 dark:text-white">
                            R${" "}
                            {sim.balance.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="text-right py-2 text-gray-900 dark:text-white">
                            {sim.runway === Infinity ? "∞" : `${sim.runway} meses`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {showSimulate && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Simular Cenário
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Cenário
                      </label>
                      <select
                        value={simulateData.scenario}
                        onChange={(e) =>
                          setSimulateData({
                            ...simulateData,
                            scenario: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="baseline">Baseline</option>
                        <option value="optimistic">Otimista</option>
                        <option value="pessimistic">Pessimista</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Meses
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={simulateData.months}
                        onChange={(e) =>
                          setSimulateData({
                            ...simulateData,
                            months: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Receita Mensal (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={simulateData.revenue_per_month}
                        onChange={(e) =>
                          setSimulateData({
                            ...simulateData,
                            revenue_per_month: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Despesas Mensais (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={simulateData.expenses_per_month}
                        onChange={(e) =>
                          setSimulateData({
                            ...simulateData,
                            expenses_per_month: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setShowSimulate(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSimulate}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Simular
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

