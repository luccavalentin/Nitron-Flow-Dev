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
        className="card-modern p-6"
      >
        <h3 className="text-xl font-semibold text-slate-200 mb-2">
          {budget.title || `Orçamento #${budget.id.slice(0, 8)}`}
        </h3>
        <p className="text-3xl font-bold text-green-400 mb-2">
          R${" "}
          {parseFloat(budget.total_amount || budget.total || "0").toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <p className="text-sm text-slate-500 mb-4">
          Status: <span className="text-slate-300">{budget.status || "draft"}</span>
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 rounded-lg hover:from-cyan-500/30 hover:to-blue-500/30 transition-all"
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card-modern p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold gradient-text mb-4">
              Enviar Orçamento por Email
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Email do destinatário
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
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
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [editingItems, setEditingItems] = useState(false);
  const [itemsJson, setItemsJson] = useState("[]");

  useEffect(() => {
    loadBudgets();
    loadClients();
    loadProjects();
  }, []);

  useEffect(() => {
    try {
      const parsed = JSON.parse(itemsJson);
      setFormData({ ...formData, items: Array.isArray(parsed) ? parsed : [] });
    } catch (e) {
      // Invalid JSON, ignore
    }
  }, [itemsJson]);

  const loadClients = async () => {
    const response = await apiRequest("/clients");
    if (response.ok && response.data) {
      setClients(response.data);
    }
  };

  const loadProjects = async () => {
    const response = await apiRequest("/projects");
    if (response.ok && response.data) {
      setProjects(response.data);
    }
  };

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
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold gradient-text mb-2">Orçamentos</h1>
              <p className="text-sm text-slate-400">Gerencie orçamentos e envie para clientes</p>
            </div>
            <div className="flex items-center justify-between mb-6">
              <div></div>
              <button
                onClick={() => {
                  setFormData({ title: "", items: [], client_id: "", project_id: "" });
                  setItemsJson("[]");
                  setShowModal(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/30"
              >
                + Novo Orçamento
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-400">Carregando...</div>
            ) : budgets.length === 0 ? (
              <div className="card-modern p-12 text-center">
                <p className="text-slate-400">Nenhum orçamento encontrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="card-modern p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <h2 className="text-2xl font-bold gradient-text mb-4">
                    Novo Orçamento
                  </h2>
                  <form onSubmit={handleCreate}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Título
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Cliente
                      </label>
                      <select
                        value={formData.client_id}
                        onChange={(e) =>
                          setFormData({ ...formData, client_id: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="">Selecione um cliente</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Projeto
                      </label>
                      <select
                        value={formData.project_id}
                        onChange={(e) =>
                          setFormData({ ...formData, project_id: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="">Selecione um projeto</option>
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-slate-300">
                          Itens (JSON)
                        </label>
                        <button
                          type="button"
                          onClick={() => setEditingItems(!editingItems)}
                          className="text-xs text-cyan-400 hover:text-cyan-300"
                        >
                          {editingItems ? "Visualizar" : "Editar JSON"}
                        </button>
                      </div>
                      {editingItems ? (
                        <textarea
                          value={itemsJson}
                          onChange={(e) => setItemsJson(e.target.value)}
                          rows={8}
                          className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          placeholder='[{"name": "Item 1", "quantity": 1, "price": "100.00"}, {"name": "Item 2", "quantity": 2, "price": "50.00"}]'
                        />
                      ) : (
                        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 max-h-48 overflow-y-auto">
                          {formData.items.length === 0 ? (
                            <p className="text-slate-500 text-sm">Nenhum item adicionado</p>
                          ) : (
                            <div className="space-y-2">
                              {formData.items.map((item, idx) => (
                                <div key={idx} className="text-sm text-slate-300">
                                  {item.name || `Item ${idx + 1}`} - Qtd: {item.quantity || 0} - R$ {parseFloat(item.price || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/30"
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

