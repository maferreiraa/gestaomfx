import { Request, Response } from 'express'
import { prisma } from '../../config/database'
import { createError } from '../../common/middleware/error-handler'
import { CreateClientDto, createClientSchema } from './dtos/create-client.dto'

export class ClientsController {
  async createClient(req: Request, res: Response): Promise<void> {
    const userId = req.userId
    const { error, value } = createClientSchema.validate(req.body)

    if (error) {
      throw createError(error.message, 400)
    }

    if (!userId) {
      throw createError('Unauthorized', 401)
    }

    const dto: CreateClientDto = value

    const existingClient = await prisma.client.findFirst({
      where: {
        userId,
        phone: dto.phone,
      },
    })

    if (existingClient) {
      throw createError('Client with this phone already exists', 409)
    }

    const client = await prisma.client.create({
      data: {
        userId,
        name: dto.name,
        phone: dto.phone,
        adId: dto.adId,
      },
    })

    res.status(201).json({
      success: true,
      data: client,
    })
  }

  async listClients(req: Request, res: Response): Promise<void> {
    const userId = req.userId

    console.log('📍 listClients called with userId:', userId)

    if (!userId) {
      throw createError('Unauthorized', 401)
    }

    const clients = await prisma.client.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        phone: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    })

    console.log('✅ Found clients:', clients.length)

    res.json({
      success: true,
      data: clients,
    })
  }

  async getClient(req: Request, res: Response): Promise<void> {
    const { clientId } = req.params
    const userId = req.userId

    if (!userId) {
      throw createError('Unauthorized', 401)
    }

    const client = await prisma.client.findFirst({
      where: { id: clientId, userId },
      include: {
        uploads: true,
        selections: true,
        payments: true,
      },
    })

    if (!client) {
      throw createError('Client not found', 404)
    }

    res.json({
      success: true,
      data: client,
    })
  }
}

export const clientsController = new ClientsController()
