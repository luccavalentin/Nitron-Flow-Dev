import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function Budgets() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    items: [] as any[],
    client_id: "",
    project_id: "",
  });

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    const response = await apiRequest("/budgets/get");
    if (response.ok && response.data) {
      setBudgets(response.data);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = formData.items.reduce(
      (sum, item) => sum + parseFloat(item.price || "0") * parseFloat(item.quantity || "0"),
      0
    );

    const response = await apiRequest("/budgets/create", {
      method: "POST",
      body: JSON.stringify({
        ...formData,
        total,
      }),
    });

    if (response.ok) {
      setFormData({ title: "", items: [], client_id: "", project_id: "" });
      setShowModal(false);
      loadBudgets();
    }
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
                Orçamentos
              </h1>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Novo Orçamento
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">Carregando...</div>
            ) : budgets.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                Nenhum orçamento encontrado
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgets.map((budget) => (
                  <div
                    key={budget.id}
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {budget.title}
                    </h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      R${" "}
                      {parseFloat(budget.total || "0").toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Status: {budget.status}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {showModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Novo Orçamento
                  </h2>
                  <form onSubmit={handleCreate}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Título
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Criar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

