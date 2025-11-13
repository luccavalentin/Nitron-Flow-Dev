interface ClientCardProps {
  client: {
    id: string;
    name: string;
    contact?: {
      email?: string;
      phone?: string;
    };
    notes?: string;
  };
}

export default function ClientCard({ client }: ClientCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
        {client.name}
      </h3>
      {client.contact?.email && (
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span className="mr-2">📧</span>
          <span>{client.contact.email}</span>
        </div>
      )}
      {client.contact?.phone && (
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span className="mr-2">📞</span>
          <span>{client.contact.phone}</span>
        </div>
      )}
      {client.notes && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">
          {client.notes}
        </p>
      )}
    </div>
  );
}

