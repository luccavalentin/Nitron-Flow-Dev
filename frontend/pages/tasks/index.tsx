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
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8 overflow-x-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold gradient-text mb-2">Tarefas</h1>
              <p className="text-sm text-slate-400">Kanban board para gerenciamento de tarefas</p>
            </div>
            <div className="flex items-center justify-between mb-6">
              <div></div>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/30"
              >
                + Nova Tarefa
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-400">Carregando...</div>
            ) : (
              <div className="flex gap-4 min-w-max">
                {columns.map((column) => {
                  const columnTasks = getTasksByStatus(column.id);
                  return (
                    <div
                      key={column.id}
                      className="flex-shrink-0 w-80 card-modern p-4"
                    >
                      <h2 className="font-semibold text-slate-200 mb-4 text-sm">
                        {column.label} <span className="text-slate-500">({columnTasks.length})</span>
                      </h2>
                      <div 
                        className="space-y-3 min-h-[200px]"
                        data-column={column.id}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('bg-slate-800/50');
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove('bg-slate-800/50');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('bg-slate-800/50');
                          const taskId = e.dataTransfer.getData('taskId');
                          if (taskId && column.id) {
                            handleMove(taskId, column.id);
                          }
                        }}
                      >
                        {columnTasks.map((task) => (
                          <div
                            key={task.id}
                            className="bg-slate-800 border border-slate-700 p-4 rounded-lg cursor-move hover:bg-slate-700 hover:border-cyan-500/50 transition-all"
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('taskId', task.id);
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                          >
                            <h3 className="font-medium text-slate-200 mb-2 text-sm">
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="text-xs text-slate-400 mb-2">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  task.priority === "high"
                                    ? "bg-red-900/50 text-red-400 border border-red-800"
                                    : task.priority === "medium"
                                    ? "bg-yellow-900/50 text-yellow-400 border border-yellow-800"
                                    : "bg-green-900/50 text-green-400 border border-green-800"
                                }`}
                              >
                                {task.priority}
                              </span>
                              {task.estimate_hours && (
                                <span className="text-xs text-slate-500">
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
          </div>

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

