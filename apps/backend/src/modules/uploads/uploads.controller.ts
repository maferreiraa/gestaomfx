import { Request, Response } from 'express'
import { prisma } from '../../config/database'
import { createError } from '../../common/middleware/error-handler'

export class UploadsController {
  async listUploads(req: Request, res: Response): Promise<void> {
    const userId = req.userId
    
    if (!userId) {
      throw createError('Unauthorized', 401)
    }

    const uploads = await prisma.upload.findMany({
      where: {
        client: { userId },
      },
      include: {
        photos: true,
        client: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    })

    const formattedUploads = uploads.map(upload => ({
      id: upload.id,
      clientId: upload.clientId,
      clientName: upload.client.name,
      uploadedAt: upload.uploadedAt,
      photoCount: upload.photos.length,
    }))

    res.json({
      success: true,
      data: formattedUploads,
    })
  }

  async getUpload(req: Request, res: Response): Promise<void> {
    const { uploadId } = req.params
    const userId = req.userId

    if (!userId) {
      throw createError('Unauthorized', 401)
    }

    const upload = await prisma.upload.findFirst({
      where: {
        id: uploadId,
        client: { userId },
      },
      include: {
        photos: true,
        client: true,
      },
    })

    if (!upload) {
      throw createError('Upload not found', 404)
    }

    res.json({
      success: true,
      data: upload,
    })
  }
}

export const uploadsController = new UploadsController()
