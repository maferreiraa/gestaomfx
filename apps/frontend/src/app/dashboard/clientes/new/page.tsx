'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import Link from 'next/link'

export default function NewClientPage() {
  const router = useRouter()
  const { isAuthenticated, logout, accessToken } = useAuthStore()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    adId: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login')
      return
    }
  }, [isAuthenticated, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.name.trim()) {
      setError('Nome é obrigatório')
      return
    }

    if (!formData.phone.trim()) {
      setError('Telefone é obrigatório')
      return
    }

    if (!/^\d{10,11}$/.test(formData.phone.replace(/\D/g, ''))) {
      setError('Telefone deve ter 10 ou 11 dígitos')
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/clients`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone.replace(/\D/g, ''),
            adId: formData.adId || undefined,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao criar cliente')
      }

      await response.json()
      setSuccess('Cliente criado com sucesso!')
      setFormData({ name: '', phone: '', adId: '' })

      setTimeout(() => {
        router.push('/dashboard/clientes')
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Erro ao criar cliente')
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

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-mfx-dark mb-2">👤 Novo Cliente</h1>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Ex: Maria Silva"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mfx-orange focus:border-transparent outline-none transition disabled:opacity-50"
              />
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Ex: 11999999999"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mfx-orange focus:border-transparent outline-none transition disabled:opacity-50"
              />
              <p className="text-sm text-gray-500 mt-1">10 ou 11 dígitos</p>
            </div>

            {/* Ad ID (opcional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID do Anúncio (opcional)
              </label>
              <input
                type="text"
                name="adId"
                value={formData.adId}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Ex: ad_12345"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mfx-orange focus:border-transparent outline-none transition disabled:opacity-50"
              />
              <p className="text-sm text-gray-500 mt-1">Para rastreamento de campanhas</p>
            </div>

            {/* Botões */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-mfx-orange hover:bg-mfx-coral text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Criando...' : 'Criar Cliente'}
              </button>
              <Link
                href="/dashboard/clientes"
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-lg font-semibold transition-colors text-center"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
