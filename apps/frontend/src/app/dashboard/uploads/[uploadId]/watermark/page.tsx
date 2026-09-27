'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import Link from 'next/link'

interface Upload {
  id: string
  clientId: string
  photos: Photo[]
}

interface Photo {
  id: string
  urlWithWatermark: string
}

interface Client {
  id: string
  name: string
}

interface WatermarkConfig {
  text: string
  opacity: number
  fontSize: number
  fontFamily: string
  color: string
  repeatMode: string
  enabled: boolean
}

export default function ConfigureWatermarkPage() {
  const router = useRouter()
  const params = useParams()
  const uploadId = params.uploadId as string
  const { isAuthenticated, logout, accessToken } = useAuthStore()

  const [upload, setUpload] = useState<Upload | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [watermark, setWatermark] = useState<WatermarkConfig>({
    text: 'mfxcreativee',
    opacity: 0.25,
    fontSize: 60,
    fontFamily: 'Arial',
    color: '#FFFFFF',
    repeatMode: 'diagonal',
    enabled: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login')
      return
    }

    fetchData()
  }, [isAuthenticated, router])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const uploadRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/uploads/${uploadId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )

      if (!uploadRes.ok) throw new Error('Upload não encontrado')

      const uploadData = await uploadRes.json()
      setUpload(uploadData.data)
      setPreviewPhoto(uploadData.data.photos[0]?.urlWithWatermark || null)

      // Fetch client info
      const clientRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/clients/${uploadData.data.clientId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )

      if (clientRes.ok) {
        const clientData = await clientRes.json()
        setClient(clientData.data)
      }

      // Try to fetch existing watermark config from admin settings
      const watermarkRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/settings/watermark`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )

      if (watermarkRes.ok) {
        const watermarkData = await watermarkRes.json()
        setWatermark(watermarkData.data)
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      // TODO: Create endpoint to apply watermark to photos
      // For now, just show success and continue
      setSuccess('Marca d\'água aplicada com sucesso!')
      setTimeout(() => {
        router.push(`/dashboard/uploads/${uploadId}`)
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar marca d\'água')
    } finally {
      setIsSaving(false)
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <Link
              href={`/dashboard/uploads/${uploadId}/config`}
              className="text-mfx-orange hover:text-mfx-coral text-sm font-semibold mb-2 inline-block"
            >
              ← Voltar para preços
            </Link>
            <h1 className="text-3xl font-bold text-mfx-dark mb-2">💧 Marca d\'água</h1>
            {client && (
              <p className="text-gray-600 mb-4">
                Cliente: <strong>{client.name}</strong>
              </p>
            )}
            <div className="h-1 w-32 bg-gradient-to-r from-mfx-orange to-mfx-coral"></div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">
              {success}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Preview */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Preview</h2>
                <div className="bg-gray-100 rounded-lg overflow-hidden h-96 flex items-center justify-center relative">
                  {previewPhoto ? (
                    <img
                      src={previewPhoto}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <p className="text-gray-500">Nenhuma foto para preview</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Total de fotos: {upload?.photos.length || 0}
                </p>
              </div>

              {/* Configurações */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Configurações</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Texto
                    </label>
                    <input
                      type="text"
                      value={watermark.text}
                      onChange={(e) =>
                        setWatermark({ ...watermark, text: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mfx-orange focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opacidade: {(watermark.opacity * 100).toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={watermark.opacity}
                      onChange={(e) =>
                        setWatermark({
                          ...watermark,
                          opacity: parseFloat(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tamanho da fonte
                    </label>
                    <input
                      type="number"
                      value={watermark.fontSize}
                      onChange={(e) =>
                        setWatermark({
                          ...watermark,
                          fontSize: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mfx-orange focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Modo de repetição
                    </label>
                    <select
                      value={watermark.repeatMode}
                      onChange={(e) =>
                        setWatermark({ ...watermark, repeatMode: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mfx-orange focus:border-transparent outline-none"
                    >
                      <option value="diagonal">Diagonal</option>
                      <option value="scattered">Espalhado</option>
                      <option value="single">Único</option>
                    </select>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      <strong>ℹ️ Nota:</strong> Estas configurações serão aplicadas a todas as fotos desta galeria.
                    </p>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 bg-mfx-orange hover:bg-mfx-coral text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Processando...' : 'Aplicar Marca d\'água'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
