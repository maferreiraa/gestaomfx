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
  const { user, isAuthenticated, logout } = useAuthStore()
  const [watermark, setWatermark] = useState<WatermarkConfig | null>(null)
  const [prices, setPrices] = useState<PriceDefaults | null>(null)
  const [pix, setPix] = useState<PixConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

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
      const token = useAuthStore.getState().accessToken

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
                      <button className="text-mfx-orange hover:text-mfx-coral font-semibold">
                        Editar →
                      </button>
                    </div>
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
                      <button className="text-mfx-orange hover:text-mfx-coral font-semibold">
                        Editar →
                      </button>
                    </div>
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
                    <div className="space-y-4">
                      <p className="text-gray-700">
                        <strong>Chave:</strong> {pix.key.substring(0, 5)}***
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
                      <button className="text-mfx-orange hover:text-mfx-coral font-semibold">
                        Editar →
                      </button>
                    </div>
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
