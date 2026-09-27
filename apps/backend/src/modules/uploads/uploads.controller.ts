import { Request, Response } from 'express'
import * as fs from 'fs'
import * as path from 'path'
import sharp from 'sharp'
import { prisma } from '../../config/database'
import { env } from '../../config/env'
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
    const files = req.files as Express.Multer.File[] | undefined

    if (!userId) {
      throw createError('Unauthorized', 401)
    }

    if (!clientId) {
      throw createError('Client ID is required', 400)
    }

    if (!files || files.length === 0) {
      throw createError('At least one photo is required', 400)
    }

    if (files.length > 40) {
      throw createError('Maximum 40 photos allowed', 400)
    }

    // Verificar se cliente pertence ao usuário
    const client = await prisma.client.findFirst({
      where: { id: clientId, userId },
    })

    if (!client) {
      throw createError('Client not found', 404)
    }

    // Criar diretório para uploads se não existir
    const uploadDir = path.join(process.cwd(), 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Criar upload
    const upload = await prisma.upload.create({
      data: {
        clientId,
      },
    })

    // Salvar fotos e criar registros no banco
    const photos = await Promise.all(
      files.map(async (file, index) => {
        const filename = `${upload.id}-${index}-${Date.now()}.jpg`
        const filepath = path.join(uploadDir, filename)

        // Salvar arquivo
        fs.writeFileSync(filepath, file.buffer)

        // Criar registro de foto (sem marca d'água por enquanto)
        return await prisma.photo.create({
          data: {
            uploadId: upload.id,
            order: index,
            urlWithWatermark: `${env.API_URL}/uploads/${filename}`,
          },
        })
      })
    )

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

    const galleryUrl = `${env.FRONTEND_URL}/galeria/${token}`

    res.json({
      success: true,
      data: {
        uploadId: upload.id,
        photoCount: photos.length,
        galleryUrl,
      },
    })
  }

  async applyWatermark(req: Request, res: Response): Promise<void> {
    const { uploadId } = req.params
    const userId = req.userId
    const {
      text = 'mfxcreativee',
      opacity = 0.25,
      fontSize = 60,
      fontFamily = 'Arial',
      color = '#FFFFFF',
      repeatMode = 'diagonal',
    } = req.body

    if (!userId) {
      throw createError('Unauthorized', 401)
    }

    const upload = await prisma.upload.findFirst({
      where: {
        id: uploadId,
        client: { userId },
      },
      include: {
        photos: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!upload) {
      throw createError('Upload not found', 404)
    }

    if (upload.photos.length === 0) {
      throw createError('No photos in this upload', 400)
    }

    const uploadDir = path.join(process.cwd(), 'uploads')
    const watermarkedPhotos: any[] = []

    for (const photo of upload.photos) {
      try {
        const currentUrl = photo.urlWithWatermark
        const filename = currentUrl.split('/').pop()

        if (!filename) continue

        const originalPath = path.join(uploadDir, filename)

        if (!fs.existsSync(originalPath)) {
          throw new Error(`Original photo not found: ${filename}`)
        }

        const imageBuffer = fs.readFileSync(originalPath)
        const image = sharp(imageBuffer)
        const metadata = await image.metadata()

        if (!metadata.width || !metadata.height) {
          throw new Error(`Could not read image dimensions: ${filename}`)
        }

        let finalBuffer: Buffer

        if (repeatMode === 'single') {
          finalBuffer = await this.applySingleWatermark(
            imageBuffer,
            metadata.width,
            metadata.height,
            text,
            opacity,
            fontSize,
            color
          )
        } else if (repeatMode === 'diagonal') {
          finalBuffer = await this.applyDiagonalWatermark(
            imageBuffer,
            metadata.width,
            metadata.height,
            text,
            opacity,
            fontSize,
            color
          )
        } else {
          finalBuffer = await this.applyScatteredWatermark(
            imageBuffer,
            metadata.width,
            metadata.height,
            text,
            opacity,
            fontSize,
            color
          )
        }

        const watermarkedFilename = `${uploadId}-watermarked-${photo.order}-${Date.now()}.jpg`
        const watermarkedPath = path.join(uploadDir, watermarkedFilename)

        fs.writeFileSync(watermarkedPath, finalBuffer)

        const watermarkedUrl = `${env.API_URL}/uploads/${watermarkedFilename}`

        await prisma.photo.update({
          where: { id: photo.id },
          data: {
            urlWithWatermark: watermarkedUrl,
          },
        })

        watermarkedPhotos.push({
          photoId: photo.id,
          order: photo.order,
          url: watermarkedUrl,
        })
      } catch (error: any) {
        console.error(`Error processing photo ${photo.id}:`, error.message)
        throw createError(`Failed to process photo: ${error.message}`, 500)
      }
    }

    res.json({
      success: true,
      data: {
        uploadId: upload.id,
        processedPhotos: watermarkedPhotos.length,
        photos: watermarkedPhotos,
      },
    })
  }

  private async applySingleWatermark(
    imageBuffer: Buffer,
    width: number,
    height: number,
    text: string,
    opacity: number,
    fontSize: number,
    color: string
  ): Promise<Buffer> {
    const watermarkSvg = Buffer.from(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <text
          x="${width / 2}"
          y="${height / 2}"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="${fontSize}"
          font-family="Arial"
          fill="${color}"
          opacity="${opacity}"
          font-weight="bold"
        >${text}</text>
      </svg>
    `)

    return sharp(imageBuffer)
      .composite([
        {
          input: watermarkSvg,
          blend: 'overlay',
        },
      ])
      .toBuffer()
  }

  private async applyDiagonalWatermark(
    imageBuffer: Buffer,
    width: number,
    height: number,
    text: string,
    opacity: number,
    fontSize: number,
    color: string
  ): Promise<Buffer> {
    const diagonal = Math.sqrt(width * width + height * height)
    const textElements: string[] = []

    for (let i = -2; i < 3; i++) {
      textElements.push(`
        <text
          x="${i * diagonal}"
          y="0"
          font-size="${fontSize}"
          font-family="Arial"
          fill="${color}"
          opacity="${opacity}"
          font-weight="bold"
        >${text}</text>
      `)
    }

    const watermarkSvg = Buffer.from(`
      <svg width="${diagonal * 3}" height="${diagonal}" xmlns="http://www.w3.org/2000/svg">
        <g transform="rotate(45)">
          ${textElements.join('\n')}
        </g>
      </svg>
    `)

    return sharp(imageBuffer)
      .composite([
        {
          input: watermarkSvg,
          blend: 'overlay',
        },
      ])
      .toBuffer()
  }

  private async applyScatteredWatermark(
    imageBuffer: Buffer,
    width: number,
    height: number,
    text: string,
    opacity: number,
    fontSize: number,
    color: string
  ): Promise<Buffer> {
    const textElements: string[] = []
    const cols = Math.ceil(width / (fontSize * 4))
    const rows = Math.ceil(height / (fontSize * 2))

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * fontSize * 4 + (Math.random() * fontSize)
        const y = row * fontSize * 2 + (Math.random() * fontSize)

        textElements.push(`
          <text
            x="${x}"
            y="${y}"
            font-size="${fontSize}"
            font-family="Arial"
            fill="${color}"
            opacity="${opacity * 0.7}"
            font-weight="bold"
          >${text}</text>
        `)
      }
    }

    const watermarkSvg = Buffer.from(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        ${textElements.join('\n')}
      </svg>
    `)

    return sharp(imageBuffer)
      .composite([
        {
          input: watermarkSvg,
          blend: 'overlay',
        },
      ])
      .toBuffer()
  }

  async getUploadSelections(req: Request, res: Response): Promise<void> {
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
    })

    if (!upload) {
      throw createError('Upload not found', 404)
    }

    const payments = await prisma.payment.findMany({
      where: { uploadId },
      include: {
        selections: {
          include: {
            photo: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const formattedPayments = payments.map((payment) => ({
      id: payment.id,
      amount: payment.amount.toString(),
      status: payment.status,
      selectedPhotoCount: payment.selections.length,
      selections: payment.selections.map((sel) => ({
        id: sel.id,
        photoId: sel.photo.id,
        photoOrder: sel.photo.order,
        url: sel.photo.urlWithWatermark,
        urlWithoutWatermark: sel.photo.urlWithoutWatermark,
      })),
      createdAt: payment.createdAt,
      completedAt: payment.completedAt,
      expiresAt: payment.expiresAt,
    }))

    res.json({
      success: true,
      data: {
        uploadId,
        payments: formattedPayments,
      },
    })
  }

  async releasePhotos(req: Request, res: Response): Promise<void> {
    const { uploadId, paymentId } = req.params
    const userId = req.userId

    if (!userId) {
      throw createError('Unauthorized', 401)
    }

    const upload = await prisma.upload.findFirst({
      where: {
        id: uploadId,
        client: { userId },
      },
    })

    if (!upload) {
      throw createError('Upload not found', 404)
    }

    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        uploadId,
      },
      include: {
        selections: {
          include: {
            photo: true,
          },
        },
      },
    })

    if (!payment) {
      throw createError('Payment not found', 404)
    }

    if (payment.status !== 'COMPLETED') {
      throw createError('Payment is not completed', 400)
    }

    const uploadDir = path.join(process.cwd(), 'uploads')
    const processedPhotos: any[] = []

    for (const selection of payment.selections) {
      try {
        const watermarkedUrl = selection.photo.urlWithWatermark
        const watermarkedFilename = watermarkedUrl.split('/').pop()

        if (!watermarkedFilename) continue

        const watermarkedPath = path.join(uploadDir, watermarkedFilename)

        if (!fs.existsSync(watermarkedPath)) {
          throw new Error(`Photo not found: ${watermarkedFilename}`)
        }

        const imageBuffer = fs.readFileSync(watermarkedPath)

        const withoutWatermarkFilename = `${uploadId}-clean-${selection.photo.order}-${Date.now()}.jpg`
        const withoutWatermarkPath = path.join(
          uploadDir,
          withoutWatermarkFilename
        )

        const cleanedBuffer = await sharp(imageBuffer)
          .rotate()
          .toBuffer()

        fs.writeFileSync(withoutWatermarkPath, cleanedBuffer)

        const cleanUrl = `${env.API_URL}/uploads/${withoutWatermarkFilename}`

        await prisma.photo.update({
          where: { id: selection.photo.id },
          data: {
            urlWithoutWatermark: cleanUrl,
          },
        })

        processedPhotos.push({
          photoId: selection.photo.id,
          cleanUrl,
        })
      } catch (error: any) {
        console.error(`Error processing photo ${selection.photo.id}:`, error.message)
      }
    }

    res.json({
      success: true,
      data: {
        paymentId,
        releasedPhotos: processedPhotos.length,
        photos: processedPhotos,
      },
    })
  }
}

export const uploadsController = new UploadsController()
