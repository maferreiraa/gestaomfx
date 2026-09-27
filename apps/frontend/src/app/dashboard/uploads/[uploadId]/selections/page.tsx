'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import Link from 'next/link'

interface Photo {
  id: string
  photoOrder: number
  url: string
  urlWithoutWatermark: string | null
}

interface Selection {
  id: string
  status: string
  selectedPhotoCount: number
  amount: string
  selections: Photo[]
  createdAt: string
  completedAt: string | null
}

export default function SelectionsPage() {
  const router = useRouter()
  const params = useParams()
  const uploadId = params.uploadId as string
  const { isAuthenticated, logout, accessToken } = useAuthStore()

  const [selections, setSelections] = useState<Selection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [releasingPaymentId, setReleasingPaymentId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login')
      return
    }

    fetchSelections()
  }, [isAuthenticated, router])

  const fetchSelections = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/uploads/${uploadId}/selections`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )

      if (!response.ok) throw new Error('Erro ao carregar seleções')

      const data = await response.json()
      setSelections(data.data.payments || [])
      setError('')
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar seleções')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReleasePhotos = async (paymentId: string) => {
    if (!window.confirm('Liberar fotos sem marca d\'água para este pagamento?')) {
      return
    }

    try {
      setReleasingPaymentId(paymentId)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/uploads/${uploadId}/payments/${paymentId}/release`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )

      if (!response.ok) {
        throw new Error('Erro ao liberar fotos')
      }

      await fetchSelections()
    } catch (err: any) {
      setError(err.message || 'Erro ao liberar fotos')
    } finally {
      setReleasingPaymentId(null)
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
              href={`/dashboard/uploads/${uploadId}`}
              className="text-mfx-orange hover:text-mfx-coral text-sm font-semibold mb-2 inline-block"
            >
              ← Voltar
            </Link>
            <h1 className="text-3xl font-bold text-mfx-dark mb-2">
              📦 Seleções de Fotos
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
              <p className="text-gray-500">Carregando seleções...</p>
            </div>
          ) : selections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhuma seleção de fotos ainda</p>
            </div>
          ) : (
            <div className="space-y-8">
              {selections.map((selection) => (
                <div
                  key={selection.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <p className="font-semibold text-gray-800">
                          {selection.status === 'COMPLETED' && (
                            <span className="text-green-600">✓ Pago</span>
                          )}
                          {selection.status === 'PENDING' && (
                            <span className="text-yellow-600">⏱ Pendente</span>
                          )}
                          {selection.status === 'FAILED' && (
                            <span className="text-red-600">✗ Falhou</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Fotos Selecionadas</p>
                        <p className="font-semibold text-gray-800">
                          {selection.selectedPhotoCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Valor</p>
                        <p className="font-semibold text-gray-800">
                          R$ {parseFloat(selection.amount).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Data</p>
                        <p className="font-semibold text-gray-800">
                          {new Date(selection.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-4">
                      Fotos Selecionadas
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {selection.selections.map((photo) => (
                        <div key={photo.id} className="relative group">
                          <div className="bg-gray-100 rounded-lg overflow-hidden h-32 relative">
                            <img
                              src={photo.url}
                              alt={`Foto ${photo.photoOrder + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {photo.urlWithoutWatermark && (
                              <div className="absolute inset-0 bg-green-500 bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                <span className="text-green-600 font-bold">
                                  ✓
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1 text-center">
                            Foto {photo.photoOrder + 1}
                          </p>
                          {photo.urlWithoutWatermark && (
                            <a
                              href={photo.urlWithoutWatermark}
                              download
                              className="text-xs text-blue-600 hover:text-blue-800 text-center block mt-1"
                            >
                              Baixar
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {selection.status === 'COMPLETED' && !selection.selections[0]?.urlWithoutWatermark && (
                    <div className="bg-blue-50 border-t border-blue-200 p-4">
                      <p className="text-sm text-blue-800 mb-3">
                        As fotos estão prontas para serem liberadas. Cliente poderá baixá-las sem marca d'água.
                      </p>
                      <button
                        onClick={() => handleReleasePhotos(selection.id)}
                        disabled={releasingPaymentId === selection.id}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {releasingPaymentId === selection.id
                          ? 'Liberando...'
                          : 'Liberar Fotos'}
                      </button>
                    </div>
                  )}

                  {selection.status === 'COMPLETED' && selection.selections[0]?.urlWithoutWatermark && (
                    <div className="bg-green-50 border-t border-green-200 p-4">
                      <p className="text-sm text-green-800">
                        ✓ Fotos liberadas e disponíveis para download
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
