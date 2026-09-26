'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import Link from 'next/link'

interface WatermarkConfig {
  text: string
  opacity: number
  fontSize: number
  fontFamily: string
  color: string
  repeatMode: string
  enabled: boolean
}

interface PriceDefaults {
  price1Photo: number
  price3Photos: number
  price10Photos: number
  pricePerExtra: number
}

interface PixConfig {
  key: string
  keyType: string
  bankName: string
  bankCode: string
  accountHolder: string
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout, accessToken } = useAuthStore()
  const [watermark, setWatermark] = useState<WatermarkConfig | null>(null)
  const [prices, setPrices] = useState<PriceDefaults | null>(null)
  const [pix, setPix] = useState<PixConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editMode, setEditMode] = useState<'watermark' | 'prices' | 'pix' | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login')
      return
    }

    fetchSettings()
  }, [isAuthenticated, router])

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      const token = accessToken

      const [watermarkRes, pricesRes, pixRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/watermark`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/prices`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/pix`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (watermarkRes.ok) {
        const data = await watermarkRes.json()
        setWatermark(data.data)
      }

      if (pricesRes.ok) {
        const data = await pricesRes.json()
        setPrices(data.data)
      }

      if (pixRes.ok) {
        const data = await pixRes.json()
        setPix(data.data)
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar configurações')
    } finally {
      setIsLoading(false)
    }
  }

  const saveWatermark = async () => {
    if (!watermark) return
    try {
      setIsSaving(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/watermark`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(watermark),
      })

      if (!response.ok) throw new Error('Erro ao salvar watermark')
      setSuccess('Watermark salvo com sucesso!')
      setEditMode(null)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar')
    } finally {
      setIsSaving(false)
    }
  }

  const savePrices = async () => {
    if (!prices) return
    try {
      setIsSaving(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/prices`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(prices),
      })

      if (!response.ok) throw new Error('Erro ao salvar preços')
      setSuccess('Preços salvos com sucesso!')
      setEditMode(null)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar')
    } finally {
      setIsSaving(false)
    }
  }

  const savePix = async () => {
    if (!pix) return
    try {
      setIsSaving(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/pix`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(pix),
      })

      if (!response.ok) throw new Error('Erro ao salvar PIX')
      setSuccess('PIX salvo com sucesso!')
      setEditMode(null)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar')
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
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-mfx-dark mb-2">⚙️ Configurações</h1>
          <div className="h-1 w-32 bg-gradient-to-r from-mfx-orange to-mfx-coral mb-8"></div>

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
              <p className="text-gray-500">Carregando configurações...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Perfil */}
              <div>
                <h2 className="text-2xl font-semibold text-mfx-dark mb-4">👤 Perfil</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-700 mb-2">
                    <strong>Email:</strong> {user?.email}
                  </p>
                  <p className="text-gray-700">
                    <strong>Nome:</strong> {user?.name}
                  </p>
                </div>
              </div>

              {/* Marca d'água */}
              <div>
                <h2 className="text-2xl font-semibold text-mfx-dark mb-4">💧 Marca d'água</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  {watermark ? (
                    <>
                      {editMode === 'watermark' ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Texto</label>
                            <input
                              type="text"
                              value={watermark.text}
                              onChange={(e) => setWatermark({ ...watermark, text: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Opacidade: {(watermark.opacity * 100).toFixed(0)}%
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={watermark.opacity}
                              onChange={(e) => setWatermark({ ...watermark, opacity: parseFloat(e.target.value) })}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tamanho da fonte</label>
                            <input
                              type="number"
                              value={watermark.fontSize}
                              onChange={(e) => setWatermark({ ...watermark, fontSize: parseInt(e.target.value) })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={saveWatermark}
                              disabled={isSaving}
                              className="flex-1 bg-mfx-orange text-white py-2 rounded-lg font-semibold disabled:opacity-50"
                            >
                              Salvar
                            </button>
                            <button
                              onClick={() => setEditMode(null)}
                              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-gray-700">
                            <strong>Texto:</strong> {watermark.text}
                          </p>
                          <p className="text-gray-700">
                            <strong>Opacidade:</strong> {(watermark.opacity * 100).toFixed(0)}%
                          </p>
                          <p className="text-gray-700">
                            <strong>Tamanho da fonte:</strong> {watermark.fontSize}px
                          </p>
                          <p className="text-gray-700">
                            <strong>Modo:</strong> {watermark.repeatMode}
                          </p>
                          <p className="text-gray-700">
                            <strong>Status:</strong> {watermark.enabled ? '✅ Ativada' : '❌ Desativada'}
                          </p>
                          <button
                            onClick={() => setEditMode('watermark')}
                            className="text-mfx-orange hover:text-mfx-coral font-semibold"
                          >
                            Editar →
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500">Configuração não encontrada</p>
                  )}
                </div>
              </div>

              {/* Preços */}
              <div>
                <h2 className="text-2xl font-semibold text-mfx-dark mb-4">💰 Preços Padrão</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  {prices ? (
                    <>
                      {editMode === 'prices' ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">1 Foto</label>
                            <input
                              type="number"
                              step="0.01"
                              value={prices.price1Photo}
                              onChange={(e) => setPrices({ ...prices, price1Photo: parseFloat(e.target.value) })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">3 Fotos</label>
                            <input
                              type="number"
                              step="0.01"
                              value={prices.price3Photos}
                              onChange={(e) => setPrices({ ...prices, price3Photos: parseFloat(e.target.value) })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">10 Fotos</label>
                            <input
                              type="number"
                              step="0.01"
                              value={prices.price10Photos}
                              onChange={(e) => setPrices({ ...prices, price10Photos: parseFloat(e.target.value) })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Adicional por foto</label>
                            <input
                              type="number"
                              step="0.01"
                              value={prices.pricePerExtra}
                              onChange={(e) => setPrices({ ...prices, pricePerExtra: parseFloat(e.target.value) })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={savePrices}
                              disabled={isSaving}
                              className="flex-1 bg-mfx-orange text-white py-2 rounded-lg font-semibold disabled:opacity-50"
                            >
                              Salvar
                            </button>
                            <button
                              onClick={() => setEditMode(null)}
                              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-gray-700">
                            <strong>1 Foto:</strong> R$ {prices.price1Photo.toFixed(2)}
                          </p>
                          <p className="text-gray-700">
                            <strong>3 Fotos:</strong> R$ {prices.price3Photos.toFixed(2)}
                          </p>
                          <p className="text-gray-700">
                            <strong>10 Fotos:</strong> R$ {prices.price10Photos.toFixed(2)}
                          </p>
                          <p className="text-gray-700">
                            <strong>Adicional por foto:</strong> R$ {prices.pricePerExtra.toFixed(2)}
                          </p>
                          <button
                            onClick={() => setEditMode('prices')}
                            className="text-mfx-orange hover:text-mfx-coral font-semibold"
                          >
                            Editar →
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500">Configuração não encontrada</p>
                  )}
                </div>
              </div>

              {/* PIX */}
              <div>
                <h2 className="text-2xl font-semibold text-mfx-dark mb-4">🔐 PIX</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  {pix ? (
                    <>
                      {editMode === 'pix' ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Chave PIX</label>
                            <input
                              type="text"
                              value={pix.key}
                              onChange={(e) => setPix({ ...pix, key: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                            <select
                              value={pix.keyType}
                              onChange={(e) => setPix({ ...pix, keyType: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                              <option value="CPF">CPF</option>
                              <option value="EMAIL">Email</option>
                              <option value="PHONE">Telefone</option>
                              <option value="RANDOM">Aleatória</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
                            <input
                              type="text"
                              value={pix.bankName}
                              onChange={(e) => setPix({ ...pix, bankName: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Titular</label>
                            <input
                              type="text"
                              value={pix.accountHolder}
                              onChange={(e) => setPix({ ...pix, accountHolder: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={savePix}
                              disabled={isSaving}
                              className="flex-1 bg-mfx-orange text-white py-2 rounded-lg font-semibold disabled:opacity-50"
                            >
                              Salvar
                            </button>
                            <button
                              onClick={() => setEditMode(null)}
                              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-gray-700">
                            <strong>Chave:</strong> {pix.key}
                          </p>
                          <p className="text-gray-700">
                            <strong>Tipo:</strong> {pix.keyType}
                          </p>
                          <p className="text-gray-700">
                            <strong>Banco:</strong> {pix.bankName}
                          </p>
                          <p className="text-gray-700">
                            <strong>Titular:</strong> {pix.accountHolder}
                          </p>
                          <button
                            onClick={() => setEditMode('pix')}
                            className="text-mfx-orange hover:text-mfx-coral font-semibold"
                          >
                            Editar →
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500">Configuração não encontrada</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
