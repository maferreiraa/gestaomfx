import { Request, Response } from 'express'
import { clientsService } from './clients.service'
import { createError } from '@/common/middleware/error-handler'
import {
  createClientSchema,
  updateClientSchema,
} from './dtos/create-client.dto'

export class ClientsController {
  async create(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      throw createError('Unauthorized', 401)
    }

    const { error, value } = createClientSchema.validate(req.body)
    if (error) {
      throw createError(error.details[0].message, 400)
    }

    const client = await clientsService.create(req.userId, value)

    res.status(201).json({
      success: true,
      data: client,
    })
  }

  async getById(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      throw createError('Unauthorized', 401)
    }

    const client = await clientsService.getById(req.params.id, req.userId)

    res.json({
      success: true,
      data: client,
    })
  }

  async getAll(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      throw createError('Unauthorized', 401)
    }

    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20

    const result = await clientsService.getAll(req.userId, page, limit)

    res.json({
      success: true,
      data: result,
    })
  }

  async update(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      throw createError('Unauthorized', 401)
    }

    const { error, value } = updateClientSchema.validate(req.body)
    if (error) {
      throw createError(error.details[0].message, 400)
    }

    const client = await clientsService.update(req.params.id, req.userId, value)

    res.json({
      success: true,
      data: client,
    })
  }

  async delete(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      throw createError('Unauthorized', 401)
    }

    await clientsService.delete(req.params.id, req.userId)

    res.json({
      success: true,
      message: 'Client deleted successfully',
    })
  }
}

export const clientsController = new ClientsController()
