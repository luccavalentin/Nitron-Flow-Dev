import { useEffect, useState } from 'react'
import { apiRequest, clientsApi } from '@/lib/api'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import ClientCard from '@/components/cards/ClientCard'
import CreateClientModal from '@/components/modals/CreateClientModal'

export default function Clients() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    const response = await apiRequest('/clients')
    if (response.ok && response.data) {
      setClients(response.data)
    }
    setLoading(false)
  }

  const handleCreate = async (formData: any) => {
    setLoading(true)

    const response = await clientsApi.create(formData)

    if (response.ok) {
      setShowModal(false)
      loadClients()
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Clientes
            </h1>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Novo Cliente
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">Carregando...</div>
          ) : clients.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Nenhum cliente encontrado
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((client) => (
                <ClientCard key={client.id} client={client} />
              ))}
            </div>
          )}

          <CreateClientModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSubmit={handleCreate}
          />
        </main>
      </div>
    </div>
  )
}

