interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    estimate_hours?: number;
    tags?: string[];
  };
  onDragStart?: (e: React.DragEvent) => void;
}

export default function TaskCard({ task, onDragStart }: TaskCardProps) {
  const priorityColors = {
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  };

  return (
    <div
      className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow cursor-move hover:shadow-md transition-shadow"
      draggable
      onDragStart={onDragStart}
    >
      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
        {task.title}
      </h3>
      {task.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}
      <div className="flex items-center justify-between">
        <span
          className={`px-2 py-1 rounded text-xs ${
            priorityColors[task.priority as keyof typeof priorityColors] ||
            priorityColors.medium
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
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

