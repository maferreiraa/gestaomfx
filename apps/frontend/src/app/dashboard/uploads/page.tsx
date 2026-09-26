'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import Link from 'next/link'

interface Upload {
  id: string
  clientId: string
  uploadedAt: string
  photoCount?: number
}

export default function UploadsPage() {
  const router = useRouter()
  const { isAuthenticated, logout } = useAuthStore()
  const [uploads, setUploads] = useState<Upload[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login')
      return
    }

    fetchUploads()
  }, [isAuthenticated, router])

  const fetchUploads = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/uploads`,
        {
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
          },
        }
      )

      if (!response.ok) throw new Error('Erro ao buscar uploads')

      const data = await response.json()
      setUploads(data.data || [])
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar uploads')
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
              <h1 className="text-3xl font-bold text-mfx-dark mb-2">📸 Uploads de Fotos</h1>
              <div className="h-1 w-32 bg-gradient-to-r from-mfx-orange to-mfx-coral"></div>
            </div>
            <button className="bg-mfx-orange hover:bg-mfx-coral text-white px-6 py-2 rounded-lg font-semibold transition-colors">
              + Novo Upload
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando uploads...</p>
            </div>
          ) : uploads.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Nenhum upload realizado</p>
              <button className="text-mfx-orange hover:text-mfx-coral font-semibold">
                Fazer primeiro upload →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uploads.map((upload) => (
                <div
                  key={upload.id}
                  className="border border-mfx-orange/20 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <h3 className="font-semibold text-mfx-dark mb-2">Upload #{upload.id.slice(0, 8)}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Data: {new Date(upload.uploadedAt).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Fotos: {upload.photoCount || 0}
                  </p>
                  <button className="text-mfx-orange hover:text-mfx-coral font-semibold text-sm">
                    Ver galeria →
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
