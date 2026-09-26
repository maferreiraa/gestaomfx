import { Request, Response } from 'express'
import { prisma } from '../../config/database'
import { createError } from '../../common/middleware/error-handler'
import Joi from 'joi'

const watermarkSchema = Joi.object({
  text: Joi.string().required(),
  opacity: Joi.number().min(0).max(1).required(),
  fontSize: Joi.number().min(8).required(),
  fontFamily: Joi.string().required(),
  color: Joi.string().regex(/^#[0-9A-F]{6}$/i).required(),
  repeatMode: Joi.string().valid('diagonal', 'scattered', 'single').required(),
  enabled: Joi.boolean().required(),
})

const priceSchema = Joi.object({
  price1Photo: Joi.number().positive().required(),
  price3Photos: Joi.number().positive().required(),
  price10Photos: Joi.number().positive().required(),
  pricePerExtra: Joi.number().positive().required(),
})

const pixSchema = Joi.object({
  key: Joi.string().required(),
  keyType: Joi.string().valid('CPF', 'EMAIL', 'PHONE', 'RANDOM').required(),
  bankName: Joi.string().required(),
  bankCode: Joi.string().required(),
  accountHolder: Joi.string().required(),
})

export class SettingsController {
  async getWatermarkConfig(req: Request, res: Response): Promise<void> {
    const userId = req.userId

    if (!userId) {
      throw createError('Unauthorized', 401)
    }

    const config = await prisma.watermarkConfig.findUnique({
      where: { userId },
    })

    if (!config) {
      throw createError('Watermark config not found', 404)
    }

    res.json({
      success: true,
      data: config,
    })
  }

  async getPriceDefaults(req: Request, res: Response): Promise<void> {
    const userId = req.userId

    if (!userId) {
      throw createError('Unauthorized', 401)
    }

    const config = await prisma.priceDefaults.findUnique({
      where: { userId },
    })

    if (!config) {
      throw createError('Price defaults not found', 404)
    }

    res.json({
      success: true,
      data: {
        price1Photo: config.price1Photo.toNumber(),
        price3Photos: config.price3Photos.toNumber(),
        price10Photos: config.price10Photos.toNumber(),
        pricePerExtra: config.pricePerExtra.toNumber(),
      },
    })
  }

  async getPixConfig(req: Request, res: Response): Promise<void> {
    const userId = req.userId

    if (!userId) {
      throw createError('Unauthorized', 401)
    }

    const config = await prisma.pixConfig.findUnique({
      where: { userId },
    })

    if (!config) {
      throw createError('PIX config not found', 404)
    }

    res.json({
      success: true,
      data: {
        key: config.key,
        keyType: config.keyType,
        bankName: config.bankName,
        bankCode: config.bankCode,
        accountHolder: config.accountHolder,
      },
    })
  }

  async updateWatermarkConfig(req: Request, res: Response): Promise<void> {
    const userId = req.userId
    const { error, value } = watermarkSchema.validate(req.body)

    if (error) {
      throw createError(error.message, 400)
    }

    if (!userId) {
      throw createError('Unauthorized', 401)
    }

    const config = await prisma.watermarkConfig.upsert({
      where: { userId },
      update: value,
      create: { userId, ...value },
    })

    res.json({
      success: true,
      data: config,
    })
  }

  async updatePriceDefaults(req: Request, res: Response): Promise<void> {
    const userId = req.userId
    const { error, value } = priceSchema.validate(req.body)

    if (error) {
      throw createError(error.message, 400)
    }

    if (!userId) {
      throw createError('Unauthorized', 401)
    }

    const config = await prisma.priceDefaults.upsert({
      where: { userId },
      update: value,
      create: { userId, ...value },
    })

    res.json({
      success: true,
      data: {
        price1Photo: config.price1Photo.toNumber(),
        price3Photos: config.price3Photos.toNumber(),
        price10Photos: config.price10Photos.toNumber(),
        pricePerExtra: config.pricePerExtra.toNumber(),
      },
    })
  }

  async updatePixConfig(req: Request, res: Response): Promise<void> {
    const userId = req.userId
    const { error, value } = pixSchema.validate(req.body)

    if (error) {
      throw createError(error.message, 400)
    }

    if (!userId) {
      throw createError('Unauthorized', 401)
    }

    const config = await prisma.pixConfig.upsert({
      where: { userId },
      update: value,
      create: { userId, ...value },
    })

    res.json({
      success: true,
      data: {
        key: config.key,
        keyType: config.keyType,
        bankName: config.bankName,
        bankCode: config.bankCode,
        accountHolder: config.accountHolder,
      },
    })
  }
}

export const settingsController = new SettingsController()
