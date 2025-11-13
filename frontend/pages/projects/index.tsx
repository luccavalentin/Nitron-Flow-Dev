import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { apiRequest, clientsApi } from '@/lib/api'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import ProjectCard from '@/components/cards/ProjectCard'
import CreateProjectModal from '@/components/modals/CreateProjectModal'

export default function Projects() {
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadProjects()
    loadClients()
  }, [])

  const loadClients = async () => {
    const response = await clientsApi.getAll()
    if (response.ok && response.data) {
      setClients(response.data)
    }
  }

  const loadProjects = async () => {
    const response = await apiRequest('/projects')
    if (response.ok && response.data) {
      setProjects(response.data)
    }
    setLoading(false)
  }

  const handleCreate = async (formData: any) => {
    setLoading(true)

    const response = await apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(formData),
    })

    if (response.ok) {
      setShowModal(false)
      loadProjects()
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
              Projetos
            </h1>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Novo Projeto
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">Carregando...</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Nenhum projeto encontrado
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}

          <CreateProjectModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSubmit={handleCreate}
            clients={clients}
          />
        </main>
      </div>
    </div>
  )
}

