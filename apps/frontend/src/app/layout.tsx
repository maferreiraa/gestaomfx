import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GestãoMFX',
  description: 'Sistema de gestão de fotos com PIX',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  )
}
