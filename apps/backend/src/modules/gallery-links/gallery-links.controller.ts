import { Request, Response } from 'express'
import { prisma } from '../../config/database'
import { createError } from '../../common/middleware/error-handler'

export class GalleryLinksController {
  async getGalleryByToken(req: Request, res: Response): Promise<void> {
    const { token } = req.params

    if (!token) {
      throw createError('Token is required', 400)
    }

    const galleryLink = await prisma.galleryLink.findUnique({
      where: { token },
      include: {
        client: {
          select: {
            name: true,
            phone: true,
          },
        },
        upload: {
          include: {
            photos: {
              orderBy: { order: 'asc' },
            },
            priceConfig: true,
          },
        },
      },
    })

    if (!galleryLink) {
      throw createError('Gallery not found', 404)
    }

    if (new Date() > galleryLink.expiresAt) {
      throw createError('Gallery link has expired', 410)
    }

    await prisma.galleryLink.update({
      where: { id: galleryLink.id },
      data: {
        accessCount: { increment: 1 },
        lastAccessedAt: new Date(),
      },
    })

    res.json({
      success: true,
      data: {
        clientName: galleryLink.client.name,
        clientPhone: galleryLink.client.phone,
        uploadId: galleryLink.upload.id,
        photos: galleryLink.upload.photos.map((photo) => ({
          id: photo.id,
          order: photo.order,
          urlWithWatermark: photo.urlWithWatermark,
        })),
        priceConfig: galleryLink.upload.priceConfig || {
          price1Photo: 0,
          price3Photos: 0,
          price10Photos: 0,
          pricePerExtra: 0,
        },
        expiresAt: galleryLink.expiresAt,
      },
    })
  }
}

export const galleryLinksController = new GalleryLinksController()
