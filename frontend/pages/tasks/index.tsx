import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { apiRequest, tasksApi } from "@/lib/api";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import CreateTaskModal from "@/components/modals/CreateTaskModal";

const columns = [
  { id: "todo", label: "A Fazer" },
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

  useEffect(() => {
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

  const handleCreate = async (formData: any) => {
    setLoading(true);

    const response = await tasksApi.create({
      ...formData,
      project_id: projectId || formData.project_id,
    });

    if (response.ok) {
      setShowModal(false);
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
                    <div 
                      className="space-y-3 min-h-[200px]"
                      data-column={column.id}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('bg-gray-200', 'dark:bg-gray-700');
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove('bg-gray-200', 'dark:bg-gray-700');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('bg-gray-200', 'dark:bg-gray-700');
                        const taskId = e.dataTransfer.getData('taskId');
                        if (taskId && column.id) {
                          handleMove(taskId, column.id);
                        }
                      }}
                    >
                      {columnTasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow cursor-move hover:shadow-md transition-shadow"
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('taskId', task.id);
                            e.dataTransfer.effectAllowed = 'move';
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

          <CreateTaskModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSubmit={handleCreate}
            projectId={projectId as string}
          />
        </main>
      </div>
    </div>
  );
}

