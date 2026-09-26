import { Router } from 'express'
import { authController } from './auth.controller'
import { authMiddleware } from './auth.middleware'

export const authRoutes = Router()

authRoutes.post('/login', (req, res, next) => {
  authController.login(req, res).catch(next)
})

authRoutes.post('/refresh', (req, res, next) => {
  authController.refresh(req, res).catch(next)
})

authRoutes.post('/logout', (req, res, next) => {
  authController.logout(req, res).catch(next)
})

authRoutes.get('/me', authMiddleware, (req, res, next) => {
  authController.getMe(req, res).catch(next)
})
