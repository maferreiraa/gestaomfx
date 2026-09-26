import { prisma } from '@/config/database'
import { createError } from '@/common/middleware/error-handler'
import { generateAccessToken, generateRefreshToken, verifyToken } from './jwt.util'
import { hashPassword, comparePasswords } from './password.util'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    name: string
  }
}

export class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw createError('Invalid credentials', 401)
    }

    // Verify password
    const isPasswordValid = await comparePasswords(password, user.passwordHash)
    if (!isPasswordValid) {
      throw createError('Invalid credentials', 401)
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email)
    const refreshToken = generateRefreshToken(user.id, user.email)

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    }
  }

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    const payload = verifyToken(token)

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (!user) {
      throw createError('User not found', 404)
    }

    const newAccessToken = generateAccessToken(user.id, user.email)

    return { accessToken: newAccessToken }
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    })

    if (!user) {
      throw createError('User not found', 404)
    }

    return user
  }
}

export const authService = new AuthService()
