import { Request, Response } from 'express'
import { prisma } from '../../config/database'
import { createError } from '../../common/middleware/error-handler'

export class ClientsController {
  async listClients(req: Request, res: Response): Promise<void> {
    const userId = req.userId
    
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
      orderBy: { createdAt: 'desc' },
    })

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
