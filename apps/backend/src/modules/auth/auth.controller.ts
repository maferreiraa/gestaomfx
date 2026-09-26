import { Request, Response } from 'express'
import Joi from 'joi'
import { authService } from './auth.service'
import { createError } from '../../common/middleware/error-handler'

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
})

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    const { error, value } = loginSchema.validate(req.body)

    if (error) {
      throw createError(error.details[0].message, 400)
    }

    const result = await authService.login(value.email, value.password)

    res.json({
      success: true,
      data: result,
    })
  }

  async refresh(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body

    if (!refreshToken) {
      throw createError('Refresh token is required', 400)
    }

    const result = await authService.refreshToken(refreshToken)

    res.json({
      success: true,
      data: result,
    })
  }

  async getMe(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      throw createError('Unauthorized', 401)
    }

    const user = await authService.getMe(req.userId)

    res.json({
      success: true,
      data: user,
    })
  }

  async logout(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      message: 'Logged out successfully',
    })
  }
}

export const authController = new AuthController()
