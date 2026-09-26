import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import { env } from './config/env'
import { prisma } from './config/database'
import { errorHandler } from './common/middleware/error-handler'
import { authRoutes } from './modules/auth/auth.routes'
import { clientRoutes } from './modules/clients/clients.routes'

const app = express()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
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

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/admin/clients', clientRoutes)

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
