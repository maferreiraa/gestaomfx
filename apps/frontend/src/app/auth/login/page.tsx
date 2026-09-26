export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mfx-dark to-mfx-dark">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-mfx-orange mb-2">GestãoMFX</h1>
          <div className="h-1 w-16 bg-gradient-to-r from-mfx-orange to-mfx-coral mx-auto"></div>
        </div>

        <h2 className="text-xl font-semibold text-mfx-dark text-center mb-6">
          Dashboard Admin
        </h2>

        <p className="text-gray-600 text-center mb-8">
          Login em desenvolvimento
        </p>

        <div className="space-y-4">
          <button className="w-full bg-mfx-orange hover:bg-mfx-coral text-white py-3 rounded-lg font-semibold transition-colors">
            Continuar com Google
          </button>
        </div>
      </div>
    </div>
  )
}
