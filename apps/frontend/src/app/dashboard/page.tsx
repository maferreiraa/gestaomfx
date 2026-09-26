'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated()) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mfx-dark to-mfx-dark">
      <nav className="bg-mfx-dark border-b border-mfx-orange/20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-mfx-orange">GestãoMFX</h1>
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

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-mfx-dark mb-2">
            Bem-vindo, {user?.name || user?.email}! 👋
          </h2>
          <div className="h-1 w-32 bg-gradient-to-r from-mfx-orange to-mfx-coral mb-8"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 border border-mfx-orange/20 rounded-lg hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-mfx-orange mb-2">
                📊 Clientes
              </h3>
              <p className="text-gray-600 mb-4">Gerencie seus clientes</p>
              <Link
                href="/dashboard/clientes"
                className="text-mfx-orange hover:text-mfx-coral font-semibold"
              >
                Acessar →
              </Link>
            </div>

            <div className="p-6 border border-mfx-orange/20 rounded-lg hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-mfx-orange mb-2">
                📸 Uploads
              </h3>
              <p className="text-gray-600 mb-4">Envie e gerencie fotos</p>
              <Link
                href="/dashboard/uploads"
                className="text-mfx-orange hover:text-mfx-coral font-semibold"
              >
                Acessar →
              </Link>
            </div>

            <div className="p-6 border border-mfx-orange/20 rounded-lg hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-mfx-orange mb-2">
                ⚙️ Configurações
              </h3>
              <p className="text-gray-600 mb-4">Configure sua conta</p>
              <Link
                href="/dashboard/settings"
                className="text-mfx-orange hover:text-mfx-coral font-semibold"
              >
                Acessar →
              </Link>
            </div>
          </div>

          <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              ℹ️ Status do Sistema
            </h3>
            <p className="text-blue-700">
              Dashboard em desenvolvimento. Mais funcionalidades em breve!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
