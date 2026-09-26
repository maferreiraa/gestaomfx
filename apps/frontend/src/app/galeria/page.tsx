export default function GaleriaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-mfx-dark to-mfx-dark">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-mfx-orange mb-2">
            Galeria de Fotos
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-mfx-orange to-mfx-coral mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">
            Transformando sua visão em arte digital
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow hover:scale-105 transform duration-300"
            >
              <div className="h-48 bg-gradient-to-br from-mfx-orange/20 to-mfx-coral/20 flex items-center justify-center">
                <div className="text-4xl text-mfx-orange">🖼️</div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-mfx-dark mb-2">
                  Foto {i}
                </h3>
                <p className="text-gray-600 text-sm">
                  Galeria em desenvolvimento
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button className="bg-mfx-orange hover:bg-mfx-coral text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            Enviar Fotos
          </button>
        </div>
      </div>
    </div>
  )
}
