import { useEffect, useState } from "react";
import { apiRequest, budgetsApi } from "@/lib/api";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

function BudgetCard({ budget, onReload }: { budget: any; onReload: () => void }) {
  const [sending, setSending] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [email, setEmail] = useState("");

  const handleDownload = () => {
    // Simular download de PDF (em produção, geraria PDF real)
    const pdfContent = `Orçamento: ${budget.title}\nValor: R$ ${parseFloat(budget.total_amount || budget.total || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\nStatus: ${budget.status}`;
    const blob = new Blob([pdfContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orcamento-${budget.id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSend = async () => {
    if (!email) {
      alert("Digite um email");
      return;
    }
    setSending(true);
    const response = await budgetsApi.send(budget.id, email);
    if (response.ok) {
      alert("Orçamento enviado com sucesso!");
      setShowSendModal(false);
      setEmail("");
    } else {
      alert("Erro ao enviar: " + (response.error || "Erro desconhecido"));
    }
    setSending(false);
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {budget.title || `Orçamento #${budget.id.slice(0, 8)}`}
        </h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          R${" "}
          {parseFloat(budget.total_amount || budget.total || "0").toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Status: {budget.status || "draft"}
        </p>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleDownload}
            className="flex-1 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            📥 Download PDF
          </button>
          <button
            onClick={() => setShowSendModal(true)}
            className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            📧 Enviar
          </button>
        </div>
      </motion.div>

      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Enviar Orçamento por Email
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email do destinatário
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="cliente@exemplo.com"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowSendModal(false);
                  setEmail("");
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {sending ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Enviando...
                  </>
                ) : (
                  "Enviar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

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

    const response = await budgetsApi.create({
      ...formData,
      total_amount: total,
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
                  <BudgetCard
                    key={budget.id}
                    budget={budget}
                    onReload={loadBudgets}
                  />
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

