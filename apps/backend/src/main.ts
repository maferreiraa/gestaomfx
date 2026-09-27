import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { env } from './config/env'
import { prisma } from './config/database'
import { errorHandler } from './common/middleware/error-handler'
import { authRoutes } from './modules/auth/auth.routes'
import { clientRoutes } from './modules/clients/clients.routes'
import { uploadRoutes } from './modules/uploads/uploads.routes'
import { settingsRoutes } from './modules/settings/settings.routes'
import { galleryLinksRoutes } from './modules/gallery-links/gallery-links.routes'
import { paymentRoutes } from './modules/payments/payments.routes'

const app = express()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(multer({ storage: multer.memoryStorage() }).array('photos', 40))
app.use('/uploads', express.static('uploads'))

const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'https://gestaomfx.vercel.app',
]

console.log('🔐 CORS Configuration:', { FRONTEND_URL: env.FRONTEND_URL, allowedOrigins })

app.use(cors({
  origin: (origin, callback) => {
    console.log('📍 CORS request from origin:', origin)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Debug: List all gallery links (remove in production)
app.get('/debug/galleries', async (req, res) => {
  const galleries = await prisma.galleryLink.findMany({
    include: { client: true, upload: { include: { photos: true } } },
    take: 10,
    orderBy: { createdAt: 'desc' },
  })
  res.json({
    totalGalleries: galleries.length,
    galleries: galleries.map(g => ({
      token: g.token,
      client: g.client.name,
      photoCount: g.upload.photos.length,
      expiresAt: g.expiresAt,
      isExpired: new Date() > g.expiresAt,
    })),
  })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/admin/clients', clientRoutes)
app.use('/api/admin/uploads', uploadRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/galleries', galleryLinksRoutes)
app.use('/api/payments', paymentRoutes)

// Error handling
app.use(errorHandler)

// Start server
const startServer = async () => {
  try {
    await prisma.$connect()
    console.log('✅ Database connected')

    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT}`)
      console.log(`📝 API Docs: http://localhost:${env.PORT}/api`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

startServer()
