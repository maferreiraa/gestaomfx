import { Request, Response } from 'express'
import { prisma } from '../../config/database'
import { createError } from '../../common/middleware/error-handler'

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
}

export const settingsController = new SettingsController()
