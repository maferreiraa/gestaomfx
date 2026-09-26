'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import Link from 'next/link'

interface Client {
  id: string
  name: string
  phone: string
  createdAt: string
}

export default function ClientesPage() {
  const router = useRouter()
  const { isAuthenticated, logout } = useAuthStore()
  const [clients, setClients] = useState<Client[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const filteredClients = clients.filter((client) => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return true

    // Busca por nome
    if (client.name.toLowerCase().includes(query)) return true

    // Busca por telefone (remove espaços/caracteres especiais para comparação)
    const phoneDigits = client.phone.replace(/\D/g, '')
    const queryDigits = query.replace(/\D/g, '')
    if (phoneDigits.includes(queryDigits)) return true

    return false
  })

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login')
      return
    }

    fetchClients()
  }, [isAuthenticated, router])

  const fetchClients = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/clients`,
        {
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
          },
        }
      )

      if (!response.ok) throw new Error('Erro ao buscar clientes')

      const data = await response.json()
      setClients(data.data || [])
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar clientes')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated()) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mfx-dark to-mfx-dark">
      <nav className="bg-mfx-dark border-b border-mfx-orange/20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-mfx-orange">
            GestãoMFX
          </Link>
          <button
            onClick={() => {
              logout()
              router.push('/')
            }}
            className="bg-mfx-coral hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Sair
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-mfx-dark mb-2">👥 Clientes</h1>
              <div className="h-1 w-32 bg-gradient-to-r from-mfx-orange to-mfx-coral"></div>
            </div>
            <Link
              href="/dashboard/clientes/new"
              className="bg-mfx-orange hover:bg-mfx-coral text-white px-6 py-2 rounded-lg font-semibold transition-colors inline-block"
            >
              + Novo Cliente
            </Link>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          {/* Campo de Busca */}
          {!isLoading && clients.length > 0 && (
            <div className="mb-6">
              <input
                type="text"
                placeholder="🔍 Buscar por nome ou telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mfx-orange focus:border-transparent outline-none transition"
              />
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando clientes...</p>
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Nenhum cliente cadastrado</p>
              <Link
                href="/dashboard/clientes/new"
                className="text-mfx-orange hover:text-mfx-coral font-semibold"
              >
                Cadastrar primeiro cliente →
              </Link>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum cliente encontrado para "{searchQuery}"</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-mfx-orange/20">
                    <th className="text-left py-3 px-4 font-semibold text-mfx-dark">Nome</th>
                    <th className="text-left py-3 px-4 font-semibold text-mfx-dark">Telefone</th>
                    <th className="text-left py-3 px-4 font-semibold text-mfx-dark">Data de Cadastro</th>
                    <th className="text-left py-3 px-4 font-semibold text-mfx-dark">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-800">{client.name}</td>
                      <td className="py-3 px-4 text-gray-600">{client.phone}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-mfx-orange hover:text-mfx-coral font-semibold">
                          Ver →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
