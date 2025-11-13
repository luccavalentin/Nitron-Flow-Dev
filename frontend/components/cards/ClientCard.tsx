import { useRouter } from 'next/router'
import { motion } from 'framer-motion'

interface ClientCardProps {
  client: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    contact?: {
      email?: string;
      phone?: string;
    };
    notes?: string;
  };
}

export default function ClientCard({ client }: ClientCardProps) {
  const router = useRouter()
  const email = client.email || client.contact?.email
  const phone = client.phone || client.contact?.phone

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => router.push(`/clients/${client.id}`)}
    >
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
        {client.name}
      </h3>
      {email && (
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span className="mr-2">📧</span>
          <span>{email}</span>
        </div>
      )}
      {phone && (
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span className="mr-2">📞</span>
          <span>{phone}</span>
        </div>
      )}
      {client.notes && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">
          {client.notes}
        </p>
      )}
    </motion.div>
  );
}

