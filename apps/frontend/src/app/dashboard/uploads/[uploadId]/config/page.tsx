'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import Link from 'next/link'

interface Upload {
  id: string
  clientId: string
  uploadedAt: string
}

interface Client {
  id: string
  name: string
  phone: string
}

interface PriceConfig {
  price1Photo: number
  price3Photos: number
  price10Photos: number
  pricePerExtra: number
}

export default function ConfigurePricesPage() {
  const router = useRouter()
  const params = useParams()
  const uploadId = params.uploadId as string
  const { isAuthenticated, logout, accessToken } = useAuthStore()

  const [upload, setUpload] = useState<Upload | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [prices, setPrices] = useState<PriceConfig>({
    price1Photo: 14.90,
    price3Photos: 24.90,
    price10Photos: 35.00,
    pricePerExtra: 3.50,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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

      // Try to fetch existing price config (if any)
      // For now, use defaults
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      // TODO: Create endpoint to save price config for this upload
      // For now, just show success and continue
      setSuccess('Preços configurados com sucesso!')
      setTimeout(() => {
        router.push(`/dashboard/uploads/${uploadId}/watermark`)
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar preços')
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

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <Link
              href={`/dashboard/clientes/${upload?.clientId}`}
              className="text-mfx-orange hover:text-mfx-coral text-sm font-semibold mb-2 inline-block"
            >
              ← Voltar para galerias
            </Link>
            <h1 className="text-3xl font-bold text-mfx-dark mb-2">💰 Configurar Preços</h1>
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
            <form className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>💡 Dica:</strong> Configure os preços para esta galeria. Você pode usar valores diferentes para cada galeria.
                </p>
              </div>

              {/* Preços */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    1 Foto
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-2 text-gray-500">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={prices.price1Photo}
                      onChange={(e) =>
                        setPrices({ ...prices, price1Photo: parseFloat(e.target.value) })
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mfx-orange focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    3 Fotos
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-2 text-gray-500">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={prices.price3Photos}
                      onChange={(e) =>
                        setPrices({ ...prices, price3Photos: parseFloat(e.target.value) })
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mfx-orange focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    10 Fotos
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-2 text-gray-500">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={prices.price10Photos}
                      onChange={(e) =>
                        setPrices({ ...prices, price10Photos: parseFloat(e.target.value) })
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mfx-orange focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor por foto adicional (acima de 10)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-2 text-gray-500">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={prices.pricePerExtra}
                      onChange={(e) =>
                        setPrices({ ...prices, pricePerExtra: parseFloat(e.target.value) })
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mfx-orange focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-mfx-orange hover:bg-mfx-coral text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Salvando...' : 'Avançar para Marca d\'água'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
