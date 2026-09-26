import { Request, Response, NextFunction } from 'express'
import { verifyToken } from './jwt.util'
import { createError } from '@/common/middleware/error-handler'

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      throw createError('No token provided', 401)
    }

    const payload = verifyToken(token)
    req.userId = payload.userId
    req.userEmail = payload.email

    next()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    res.status(401).json({ success: false, error: { message } })
  }
}
