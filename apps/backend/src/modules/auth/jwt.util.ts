import jwt from 'jsonwebtoken'
import { env } from '@/config/env'

export interface JwtPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

export const generateAccessToken = (userId: string, email: string): string => {
  return jwt.sign(
    { userId, email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN } as any
  )
}

export const generateRefreshToken = (userId: string, email: string): string => {
  return jwt.sign(
    { userId, email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as any
  )
}

export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

export const decodeToken = (token: string): JwtPayload | null => {
  return jwt.decode(token) as JwtPayload | null
}
