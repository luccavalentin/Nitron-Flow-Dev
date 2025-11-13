import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { apiRequest } from "@/lib/api";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

const columns = [
  { id: "backlog", label: "Backlog" },
  { id: "in_progress", label: "Em Andamento" },
  { id: "review", label: "Revisão" },
  { id: "done", label: "Concluído" },
];

export default function Tasks() {
  const router = useRouter();
  const { projectId } = router.query;
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    project_id: projectId || "",
    title: "",
    description: "",
    status: "backlog",
    priority: "medium",
    tags: [] as string[],
    estimate_hours: null as number | null,
  });

  useEffect(() => {
    if (projectId) {
      setFormData((prev) => ({ ...prev, project_id: projectId as string }));
    }
    loadTasks();
  }, [projectId]);

  const loadTasks = async () => {
    const url = projectId
      ? `/tasks?projectId=${projectId}`
      : "/tasks";
    const response = await apiRequest(url);
    if (response.ok && response.data) {
      setTasks(response.data);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const response = await apiRequest("/tasks", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      setShowModal(false);
      setFormData({
        project_id: projectId as string || "",
        title: "",
        description: "",
        status: "backlog",
        priority: "medium",
        tags: [],
        estimate_hours: null,
      });
      loadTasks();
    }
    setLoading(false);
  };

  const handleMove = async (taskId: string, newStatus: string) => {
    const response = await apiRequest("/tasks/move", {
      method: "POST",
      body: JSON.stringify({ id: taskId, status: newStatus }),
    });

    if (response.ok) {
      loadTasks();
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8 overflow-x-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Tarefas
            </h1>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Nova Tarefa
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">Carregando...</div>
          ) : (
            <div className="flex gap-4 min-w-max">
              {columns.map((column) => {
                const columnTasks = getTasksByStatus(column.id);
                return (
                  <div
                    key={column.id}
                    className="flex-shrink-0 w-80 bg-gray-100 dark:bg-gray-800 rounded-lg p-4"
                  >
                    <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                      {column.label} ({columnTasks.length})
                    </h2>
                    <div className="space-y-3">
                      {columnTasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow cursor-move hover:shadow-md transition-shadow"
                          draggable
                          onDragEnd={(e) => {
                            const target = document.elementFromPoint(
                              e.clientX,
                              e.clientY
                            );
                            if (target) {
                              const targetColumn = target.closest(
                                "[data-column]"
                              );
                              if (targetColumn) {
                                const newStatus =
                                  targetColumn.getAttribute("data-column");
                                if (newStatus && newStatus !== task.status) {
                                  handleMove(task.id, newStatus);
                                }
                              }
                            }
                          }}
                        >
                          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                task.priority === "high"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  : task.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              }`}
                            >
                              {task.priority}
                            </span>
                            {task.estimate_hours && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {task.estimate_hours}h
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Nova Tarefa
                </h2>
                <form onSubmit={handleCreate}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Título *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Descrição
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Status
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) =>
                            setFormData({ ...formData, status: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="backlog">Backlog</option>
                          <option value="in_progress">Em Andamento</option>
                          <option value="review">Revisão</option>
                          <option value="done">Concluído</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Prioridade
                        </label>
                        <select
                          value={formData.priority}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              priority: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="low">Baixa</option>
                          <option value="medium">Média</option>
                          <option value="high">Alta</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Estimativa (horas)
                      </label>
                      <input
                        type="number"
                        value={formData.estimate_hours || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            estimate_hours: e.target.value
                              ? parseInt(e.target.value)
                              : null,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      Criar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

