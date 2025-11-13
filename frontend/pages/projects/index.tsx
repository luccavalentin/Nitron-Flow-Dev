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
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold gradient-text mb-2">Projetos</h1>
              <p className="text-sm text-slate-400">Gerencie seus projetos e desenvolvimento</p>
            </div>
            <div className="flex items-center justify-between mb-6">
              <div></div>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/30"
              >
                + Novo Projeto
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-400">Carregando...</div>
            ) : projects.length === 0 ? (
              <div className="card-modern p-12 text-center">
                <p className="text-slate-400">Nenhum projeto encontrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>

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

