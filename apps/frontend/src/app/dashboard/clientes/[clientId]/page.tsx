'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import Link from 'next/link'

interface Upload {
  id: string
  clientId: string
  uploadedAt: string
  photoCount: number
}

interface Client {
  id: string
  name: string
  phone: string
}

export default function ClientGalleriesPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params.clientId as string
  const { isAuthenticated, logout, accessToken } = useAuthStore()

  const [client, setClient] = useState<Client | null>(null)
  const [uploads, setUploads] = useState<Upload[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login')
      return
    }

    fetchClientAndUploads()
  }, [isAuthenticated, router, clientId])

  const fetchClientAndUploads = async () => {
    try {
      setIsLoading(true)
      const [clientRes, uploadsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/clients/${clientId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/uploads`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ])

      if (!clientRes.ok) throw new Error('Cliente não encontrado')

      const clientData = await clientRes.json()
      setClient(clientData.data)

      if (uploadsRes.ok) {
        const uploadsData = await uploadsRes.json()
        const clientUploads = uploadsData.data.filter(
          (upload: Upload) => upload.clientId === clientId
        )
        setUploads(clientUploads)
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar galerias')
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
          {/* Cabeçalho com informações do cliente */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <Link href="/dashboard/clientes" className="text-mfx-orange hover:text-mfx-coral text-sm font-semibold mb-2 inline-block">
                  ← Voltar para clientes
                </Link>
                {client && (
                  <>
                    <h1 className="text-3xl font-bold text-mfx-dark">🖼️ Galerias de {client.name}</h1>
                    <p className="text-gray-600 mt-1">Telefone: {client.phone}</p>
                  </>
                )}
              </div>
              <Link
                href={`/dashboard/uploads/new?clientId=${clientId}`}
                className="bg-mfx-orange hover:bg-mfx-coral text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
              >
                + Nova Galeria
              </Link>
            </div>
            <div className="h-1 w-32 bg-gradient-to-r from-mfx-orange to-mfx-coral"></div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando galerias...</p>
            </div>
          ) : uploads.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Nenhuma galeria criada para este cliente</p>
              <Link
                href={`/dashboard/uploads/new?clientId=${clientId}`}
                className="text-mfx-orange hover:text-mfx-coral font-semibold"
              >
                Criar primeira galeria →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uploads.map((upload) => (
                <div
                  key={upload.id}
                  className="border border-mfx-orange/20 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/dashboard/uploads/${upload.id}`)}
                >
                  <h3 className="font-semibold text-mfx-dark mb-2">
                    Galeria #{upload.id.slice(0, 8)}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Data: {new Date(upload.uploadedAt).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    📸 Fotos: {upload.photoCount}
                  </p>
                  <button className="text-mfx-orange hover:text-mfx-coral font-semibold text-sm w-full text-left">
                    Ver detalhes →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
