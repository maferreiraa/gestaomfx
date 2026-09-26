import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600">
      <div className="text-center text-white">
        <h1 className="text-5xl font-bold mb-6">GestãoMFX</h1>
        <p className="text-xl mb-8">Sistema de Gestão de Fotos com PIX</p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/login"
            className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
          >
            Dashboard Admin
          </Link>
          <Link
            href="/galeria"
            className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/20"
          >
            Acessar Galeria
          </Link>
        </div>

        <div className="mt-12 text-sm opacity-80">
          <p>Status: MVP 1 em desenvolvimento</p>
        </div>
      </div>
    </div>
  )
}
