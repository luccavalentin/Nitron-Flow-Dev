import Link from "next/link";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description?: string;
    status: string;
    client_id?: string;
  };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const statusColors = {
    active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    draft: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    paused: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  };

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {project.name}
          </h3>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              statusColors[project.status as keyof typeof statusColors] ||
              statusColors.draft
            }`}
          >
            {project.status}
          </span>
        </div>
        {project.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
            {project.description}
          </p>
        )}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Ver detalhes →</span>
        </div>
      </div>
    </Link>
  );
}

