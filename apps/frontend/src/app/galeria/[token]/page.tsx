'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface Photo {
  id: string
  order: number
  urlWithWatermark: string
}

interface PriceConfig {
  price1Photo: number
  price3Photos: number
  price10Photos: number
  pricePerExtra: number
}

interface GalleryData {
  clientName: string
  clientPhone: string
  uploadId: string
  photos: Photo[]
  priceConfig: PriceConfig
  expiresAt: string
}

interface PaymentData {
  paymentId: string
  amount: number
  qrCode: string
  qrCodeUrl: string
  copyPasteKey: string
  expiresAt: string
}

export default function GalleryPage() {
  const params = useParams()
  const token = params.token as string

  const [gallery, setGallery] = useState<GalleryData | null>(null)
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [totalPrice, setTotalPrice] = useState(0)
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)
  const [clientEmail, setClientEmail] = useState('')

  useEffect(() => {
    fetchGallery()
  }, [token])

  useEffect(() => {
    if (gallery) {
      calculatePrice()
    }
  }, [selectedPhotos, gallery])

  const fetchGallery = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/galleries/${token}`
      )

      if (!response.ok) {
        if (response.status === 410) {
          throw new Error('Este link de galeria expirou')
        } else if (response.status === 404) {
          throw new Error('Galeria não encontrada')
        }
        throw new Error('Erro ao carregar galeria')
      }

      const data = await response.json()
      setGallery(data.data)
      setError('')
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar galeria')
    } finally {
      setIsLoading(false)
    }
  }

  const calculatePrice = () => {
    if (!gallery) return

    const count = selectedPhotos.size
    if (count === 0) {
      setTotalPrice(0)
      return
    }

    const { price1Photo, price3Photos, price10Photos, pricePerExtra } =
      gallery.priceConfig

    let price = 0
    if (count === 1) {
      price = price1Photo
    } else if (count === 2) {
      price = price1Photo * 2
    } else if (count === 3) {
      price = price3Photos
    } else if (count <= 10) {
      price = price3Photos + (count - 3) * pricePerExtra
    } else {
      price = price10Photos + (count - 10) * pricePerExtra
    }

    setTotalPrice(price)
  }

  const togglePhotoSelection = (photoId: string) => {
    const newSelected = new Set(selectedPhotos)
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId)
    } else {
      newSelected.add(photoId)
    }
    setSelectedPhotos(newSelected)
  }

  const handleInitiatePayment = async () => {
    if (!clientEmail.trim()) {
      setError('Por favor, insira um email válido')
      return
    }

    if (selectedPhotos.size === 0) {
      setError('Selecione pelo menos uma foto')
      return
    }

    try {
      setIsPaymentLoading(true)
      setError('')

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uploadId: gallery?.uploadId,
            clientEmail,
            photoIds: Array.from(selectedPhotos),
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao processar pagamento')
      }

      const data = await response.json()
      setPaymentData(data.data)
    } catch (err: any) {
      setError(err.message || 'Erro ao processar pagamento')
    } finally {
      setIsPaymentLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <p className="text-white text-lg">Carregando galeria...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h1 className="text-xl font-bold text-red-600 mb-2">Erro</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!gallery) {
    return null
  }

  const expiresDate = new Date(gallery.expiresAt)
  const daysLeft = Math.ceil(
    (expiresDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📸 Galeria de Fotos
          </h1>
          <p className="text-gray-600 mb-4">
            Cliente: <strong>{gallery.clientName}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Válida por mais {daysLeft} dias
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Gallery Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative group cursor-pointer"
                  onClick={() => togglePhotoSelection(photo.id)}
                >
                  <div className="bg-gray-700 rounded-lg overflow-hidden h-48 relative">
                    <img
                      src={photo.urlWithWatermark}
                      alt={`Foto ${photo.order + 1}`}
                      className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                    />

                    {selectedPhotos.has(photo.id) && (
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-40 flex items-center justify-center">
                        <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center">
                          <span className="text-white text-xl font-bold">✓</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-400 text-center mt-2 text-sm">
                    Foto {photo.order + 1}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar - Pricing & Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Resumo da Compra
              </h2>

              <div className="mb-6">
                <p className="text-gray-600 mb-2">
                  Fotos selecionadas:{' '}
                  <strong className="text-2xl text-blue-600">
                    {selectedPhotos.size}
                  </strong>
                </p>
              </div>

              {selectedPhotos.size > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Tabela de Preços
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>1 foto: R$ {gallery.priceConfig.price1Photo.toFixed(2)}</li>
                    <li>3 fotos: R$ {gallery.priceConfig.price3Photos.toFixed(2)}</li>
                    <li>10 fotos: R$ {gallery.priceConfig.price10Photos.toFixed(2)}</li>
                    <li>Extras: R$ {gallery.priceConfig.pricePerExtra.toFixed(2)} cada</li>
                  </ul>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Total:</span>
                  <span className="text-3xl font-bold text-green-600">
                    R$ {totalPrice.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (selectedPhotos.size > 0) {
                      setPaymentData({ amount: 0, paymentId: '' } as any)
                    }
                  }}
                  disabled={selectedPhotos.size === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Prosseguir para Pagamento
                </button>

                <button
                  onClick={() => setSelectedPhotos(new Set())}
                  disabled={selectedPhotos.size === 0}
                  className="w-full mt-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Limpar Seleção
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {paymentData && paymentData.paymentId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Pagamento via PIX
              </h2>

              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Escaneie o código QR abaixo ou copie a chave para pagar.
                </p>
              </div>

              {paymentData.qrCode && (
                <div className="mb-6 flex justify-center">
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <img
                      src={`data:image/png;base64,${paymentData.qrCode}`}
                      alt="QR Code PIX"
                      className="w-48 h-48"
                    />
                  </div>
                </div>
              )}

              {paymentData.copyPasteKey && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">Chave PIX (Copia e Cola):</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={paymentData.copyPasteKey}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(paymentData.copyPasteKey)
                      }}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              )}

              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>⏰ Atenção:</strong> Este PIX expira em 30 minutos.
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Valor a pagar:</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {paymentData.amount.toFixed(2)}
                </p>
              </div>

              <button
                onClick={() => {
                  setPaymentData(null)
                  setSelectedPhotos(new Set())
                  setClientEmail('')
                }}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* Email Input Modal (before payment) */}
        {paymentData && !paymentData.paymentId && selectedPhotos.size > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Confirmar Compra
              </h2>

              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Você está prestes a comprar{' '}
                  <strong>{selectedPhotos.size} foto(s)</strong> por{' '}
                  <strong>R$ {totalPrice.toFixed(2)}</strong>
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seu email
                  </label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="seu.email@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleInitiatePayment}
                disabled={isPaymentLoading || !clientEmail.trim()}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-2"
              >
                {isPaymentLoading ? 'Processando...' : 'Gerar PIX'}
              </button>

              <button
                onClick={() => {
                  setPaymentData(null)
                  setClientEmail('')
                }}
                disabled={isPaymentLoading}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 rounded-lg disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
