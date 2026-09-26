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

  async createUpload(req: Request, res: Response): Promise<void> {
    const userId = req.userId
    const { clientId } = req.body

    if (!userId) {
      throw createError('Unauthorized', 401)
    }

    if (!clientId) {
      throw createError('Client ID is required', 400)
    }

    // Verificar se cliente pertence ao usuário
    const client = await prisma.client.findFirst({
      where: { id: clientId, userId },
    })

    if (!client) {
      throw createError('Client not found', 404)
    }

    // Criar upload
    const upload = await prisma.upload.create({
      data: {
        clientId,
      },
    })

    // Gerar token de galeria (64 caracteres)
    const token = require('crypto')
      .randomBytes(32)
      .toString('hex')

    // Criar galeria link
    const galleryLink = await prisma.galleryLink.create({
      data: {
        clientId,
        uploadId: upload.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      },
    })

    const galleryUrl = `${process.env.FRONTEND_URL}/galeria/${token}`

    res.json({
      success: true,
      data: {
        uploadId: upload.id,
        galleryUrl,
      },
    })
  }
}

export const uploadsController = new UploadsController()
