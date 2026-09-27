import { Request, Response } from 'express'
import { Decimal } from '@prisma/client/runtime/library'
import { prisma } from '../../config/database'
import { createError } from '../../common/middleware/error-handler'
import { mercadoPagoService } from './mercado-pago.service'

interface CreatePaymentRequest {
  uploadId: string
  clientEmail: string
  photoIds: string[]
}

export class PaymentsController {
  async createPayment(req: Request, res: Response): Promise<void> {
    const { uploadId, clientEmail, photoIds } = req.body as CreatePaymentRequest

    if (!uploadId || !clientEmail || !photoIds || photoIds.length === 0) {
      throw createError('Invalid payment data', 400)
    }

    const upload = await prisma.upload.findUnique({
      where: { id: uploadId },
      include: {
        client: true,
        priceConfig: true,
      },
    })

    if (!upload) {
      throw createError('Upload not found', 404)
    }

    const photos = await prisma.photo.findMany({
      where: {
        id: { in: photoIds },
        uploadId,
      },
    })

    if (photos.length !== photoIds.length) {
      throw createError('Invalid photo IDs', 400)
    }

    const amount = this.calculatePaymentAmount(
      photoIds.length,
      upload.priceConfig
    )

    const pixConfig = await prisma.pixConfig.findUnique({
      where: { userId: upload.client.userId },
    })

    if (!pixConfig) {
      throw createError('PIX configuration not found', 500)
    }

    try {
      const pixPayment = await mercadoPagoService.createPixPayment({
        amount,
        description: `Compra de ${photoIds.length} fotos`,
        email: clientEmail,
        externalReference: uploadId,
      })

      const payment = await prisma.payment.create({
        data: {
          clientId: upload.clientId,
          uploadId,
          amount: new Decimal(amount),
          pixQrCode: pixPayment.qrCode,
          pixCopyPaste: pixPayment.copyPasteKey,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        },
      })

      for (const photoId of photoIds) {
        await prisma.photoSelection.create({
          data: {
            clientId: upload.clientId,
            uploadId,
            photoId,
            paymentId: payment.id,
          },
        })
      }

      res.json({
        success: true,
        data: {
          paymentId: payment.id,
          amount,
          qrCode: pixPayment.qrCode,
          qrCodeUrl: pixPayment.qrCodeUrl,
          copyPasteKey: pixPayment.copyPasteKey,
          expiresAt: payment.expiresAt,
        },
      })
    } catch (error: any) {
      throw createError(error.message || 'Failed to create payment', 500)
    }
  }

  async checkPaymentStatus(req: Request, res: Response): Promise<void> {
    const { paymentId } = req.params

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    })

    if (!payment) {
      throw createError('Payment not found', 404)
    }

    const status = await mercadoPagoService.getPaymentStatus(paymentId)

    res.json({
      success: true,
      data: {
        paymentId,
        status,
        dbStatus: payment.status,
      },
    })
  }

  private calculatePaymentAmount(
    photoCount: number,
    priceConfig: any
  ): number {
    if (!priceConfig) return 0

    const {
      price1Photo,
      price3Photos,
      price10Photos,
      pricePerExtra,
    } = priceConfig

    if (photoCount === 1) return price1Photo
    if (photoCount === 2) return price1Photo * 2
    if (photoCount === 3) return price3Photos
    if (photoCount <= 10) {
      return price3Photos + (photoCount - 3) * pricePerExtra
    }
    return price10Photos + (photoCount - 10) * pricePerExtra
  }
}

export const paymentsController = new PaymentsController()
