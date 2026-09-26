import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mfx-dark via-mfx-dark to-mfx-dark">
      <div className="text-center text-white px-4">
        <div className="mb-8">
          <h1 className="text-6xl font-bold mb-2 text-mfx-orange">GestãoMFX</h1>
          <div className="h-1 w-24 bg-gradient-to-r from-mfx-orange to-mfx-coral mx-auto mb-6"></div>
        </div>

        <p className="text-2xl mb-2 font-light">Transformando sua visão</p>
        <p className="text-lg mb-12 text-gray-300">Sistema inteligente de gestão de fotos com PIX</p>

        <div className="flex gap-4 justify-center flex-wrap mb-12">
          <Link
            href="/auth/login"
            className="bg-mfx-orange hover:bg-mfx-coral text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            📊 Dashboard Admin
          </Link>
          <Link
            href="/galeria"
            className="border-2 border-mfx-gold text-mfx-gold hover:bg-mfx-gold/10 px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105"
          >
            🖼️ Acessar Galeria
          </Link>
        </div>

        <div className="mt-12 text-sm opacity-70 border-t border-mfx-orange/30 pt-8">
          <p className="text-mfx-gold font-semibold">MVP 1 • Arte Digital • Fotografia AI</p>
        </div>
      </div>
    </div>
  )
}
