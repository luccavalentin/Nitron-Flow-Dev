import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { apiRequest } from "@/lib/api";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { motion } from "framer-motion";

export default function Roadmap() {
  const router = useRouter();
  const { projectId } = router.query;
  const [roadmap, setRoadmap] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>(projectId as string || "");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    loadProjects();
    if (selectedProject) {
      loadRoadmap();
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    const response = await apiRequest("/projects");
    if (response.ok && response.data) {
      setProjects(response.data);
    }
  };

  const loadRoadmap = async () => {
    setLoading(true);
    const response = await apiRequest(`/roadmap/get?projectId=${selectedProject}`);
    if (response.ok && response.data) {
      setRoadmap(response.data);
    }
    setLoading(false);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setEditData({ title: item.title, description: item.description, status: item.status });
  };

  const handleSave = async (id: string) => {
    const response = await apiRequest(`/roadmap/update`, {
      method: "PUT",
      body: JSON.stringify({ id, ...editData }),
    });
    if (response.ok) {
      setEditingId(null);
      loadRoadmap();
    }
  };

  const handleCreate = async () => {
    const title = prompt("Título do milestone:");
    if (!title || !selectedProject) return;

    const response = await apiRequest(`/roadmap/create`, {
      method: "POST",
      body: JSON.stringify({
        project_id: selectedProject,
        title,
        description: "",
        status: "planned",
      }),
    });
    if (response.ok) {
      loadRoadmap();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja deletar este milestone?")) return;
    const response = await apiRequest(`/roadmap/delete`, {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    if (response.ok) {
      loadRoadmap();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "in_progress": return "bg-blue-500";
      case "planned": return "bg-gray-500";
      default: return "bg-gray-500";
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
              <h1 className="text-3xl font-bold gradient-text mb-2">Roadmap</h1>
              <p className="text-sm text-slate-400">Visualize e gerencie o roadmap do projeto</p>
            </div>

            <div className="card-modern p-5 mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Selecionar Projeto
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
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

            {selectedProject && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-200">Timeline</h2>
                  <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/30"
                  >
                    + Novo Milestone
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-12 text-slate-400">Carregando...</div>
                ) : roadmap.length === 0 ? (
                  <div className="card-modern p-12 text-center">
                    <p className="text-slate-400 mb-4">Nenhum milestone criado ainda</p>
                    <button
                      onClick={handleCreate}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all"
                    >
                      Criar Primeiro Milestone
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-700"></div>

                    <div className="space-y-6">
                      {roadmap.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative flex items-start gap-6"
                        >
                          {/* Timeline dot */}
                          <div className={`relative z-10 w-4 h-4 rounded-full ${getStatusColor(item.status)} shadow-lg`}></div>

                          {/* Content card */}
                          <div className="card-modern flex-1 p-5">
                            {editingId === item.id ? (
                              <div className="space-y-4">
                                <input
                                  type="text"
                                  value={editData.title}
                                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                                <textarea
                                  value={editData.description}
                                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                  rows={3}
                                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                                <select
                                  value={editData.status}
                                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                >
                                  <option value="planned">Planejado</option>
                                  <option value="in_progress">Em Andamento</option>
                                  <option value="completed">Concluído</option>
                                </select>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleSave(item.id)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                  >
                                    Salvar
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="text-lg font-semibold text-slate-200">{item.title}</h3>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleEdit(item)}
                                      className="px-3 py-1 text-xs bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors"
                                    >
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => handleDelete(item.id)}
                                      className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                      Deletar
                                    </button>
                                  </div>
                                </div>
                                {item.description && (
                                  <p className="text-sm text-slate-400 mb-2">{item.description}</p>
                                )}
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                  <span className={`px-2 py-1 rounded ${getStatusColor(item.status)} text-white`}>
                                    {item.status === "completed" ? "Concluído" : item.status === "in_progress" ? "Em Andamento" : "Planejado"}
                                  </span>
                                  <span>{new Date(item.created_at).toLocaleDateString("pt-BR")}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </motion.div>
                      ))}
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

