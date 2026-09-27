'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import Link from 'next/link'

interface Photo {
  id: string
  order: number
  urlWithWatermark: string
  urlWithoutWatermark: string | null
}

interface Upload {
  id: string
  clientId: string
  uploadedAt: string
  photos: Photo[]
  client: {
    name: string
    phone: string
  }
  galleryLink?: {
    token: string
  }
}

export default function UploadDetailPage() {
  const router = useRouter()
  const params = useParams()
  const uploadId = params.uploadId as string
  const { isAuthenticated, logout, accessToken } = useAuthStore()

  const [upload, setUpload] = useState<Upload | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login')
      return
    }

    fetchUpload()
  }, [isAuthenticated, router])

  const fetchUpload = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/uploads/${uploadId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )

      if (!response.ok) throw new Error('Upload não encontrado')

      const data = await response.json()
      setUpload(data.data)
      setError('')
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar upload')
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
          <div className="mb-8">
            <Link
              href="/dashboard/uploads"
              className="text-mfx-orange hover:text-mfx-coral text-sm font-semibold mb-2 inline-block"
            >
              ← Voltar para Uploads
            </Link>
            <h1 className="text-3xl font-bold text-mfx-dark mb-2">
              📸 Detalhes do Upload
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-mfx-orange to-mfx-coral"></div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando...</p>
            </div>
          ) : upload ? (
            <div className="space-y-8">
              {/* Summary Section */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Cliente</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {upload.client.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total de Fotos</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {upload.photos.length} foto(s)
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Data do Upload</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {new Date(upload.uploadedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href={`/dashboard/uploads/${uploadId}/config`}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-center"
                >
                  💰 Configurar Preços
                </Link>
                <Link
                  href={`/dashboard/uploads/${uploadId}/watermark`}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-center"
                >
                  💧 Aplicar Marca d'água
                </Link>
                <Link
                  href={`/dashboard/uploads/${uploadId}/selections`}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-center"
                >
                  📦 Ver Seleções & Liberar
                </Link>
                <a
                  href={upload.galleryLink ? `${process.env.NEXT_PUBLIC_FRONTEND_URL}/galeria/${upload.galleryLink.token}` : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-center disabled:opacity-50"
                >
                  🔗 Link da Galeria Pública
                </a>
              </div>

              {/* Photos Preview */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Fotos do Upload
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {upload.photos.map((photo) => (
                    <div key={photo.id} className="relative">
                      <div className="bg-gray-100 rounded-lg overflow-hidden h-32">
                        <img
                          src={photo.urlWithWatermark}
                          alt={`Foto ${photo.order + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1 text-center">
                        Foto {photo.order + 1}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
