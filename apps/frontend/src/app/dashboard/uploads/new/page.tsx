'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import Link from 'next/link'

interface Client {
  id: string
  name: string
}

interface UploadPreview {
  file: File
  preview: string
  id: string
}

export default function NewUploadPage() {
  const router = useRouter()
  const { isAuthenticated, logout, accessToken } = useAuthStore()
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState('')
  const [files, setFiles] = useState<UploadPreview[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login')
      return
    }

    fetchClients()
  }, [isAuthenticated, router])

  const fetchClients = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/clients`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      if (!response.ok) throw new Error('Erro ao buscar clientes')

      const data = await response.json()
      setClients(data.data || [])
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar clientes')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])

    if (files.length + selectedFiles.length > 40) {
      setError('Máximo de 40 fotos por galeria')
      return
    }

    const newFiles = selectedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36),
    }))

    setFiles([...files, ...newFiles])
    setError('')
  }

  const removeFile = (id: string) => {
    const fileToRemove = files.find((f) => f.id === id)
    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.preview)
    }
    setFiles(files.filter((f) => f.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!selectedClient) {
      setError('Selecione um cliente')
      return
    }

    if (files.length === 0) {
      setError('Selecione pelo menos uma foto')
      return
    }

    try {
      setIsLoading(true)

      const formData = new FormData()
      formData.append('clientId', selectedClient)
      files.forEach((f) => {
        formData.append('photos', f.file)
      })

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/uploads`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Erro ao fazer upload')
      }

      const data = await response.json()
      setSuccess(`Upload realizado com sucesso! URL: ${data.data.galleryUrl}`)
      setFiles([])
      setSelectedClient('')

      setTimeout(() => {
        router.push('/dashboard/uploads')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer upload')
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
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-mfx-dark mb-2">📸 Novo Upload</h1>
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
            {/* Seleção de Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente *
              </label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mfx-orange focus:border-transparent outline-none transition disabled:opacity-50"
              >
                <option value="">Selecione um cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Upload de Fotos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fotos (máx 40) *
              </label>
              <div className="border-2 border-dashed border-mfx-orange rounded-lg p-8 text-center hover:border-mfx-coral transition">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={isLoading || files.length >= 40}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer">
                  <p className="text-gray-600 mb-2">
                    Clique para selecionar fotos ou arraste aqui
                  </p>
                  <p className="text-sm text-gray-500">
                    Fotos selecionadas: {files.length}/40
                  </p>
                </label>
              </div>
            </div>

            {/* Preview das Fotos */}
            {files.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-mfx-dark mb-4">
                  Preview ({files.length} fotos)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {files.map((f) => (
                    <div key={f.id} className="relative group">
                      <img
                        src={f.preview}
                        alt="preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(f.id)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading || !selectedClient || files.length === 0}
                className="flex-1 bg-mfx-orange hover:bg-mfx-coral text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Enviando...' : 'Enviar Fotos'}
              </button>
              <Link
                href="/dashboard/uploads"
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
