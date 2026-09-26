import { clientsRepository } from './clients.repository'
import { CreateClientDto, UpdateClientDto } from './dtos/create-client.dto'
import { createError } from '@/common/middleware/error-handler'

export class ClientsService {
  async create(userId: string, data: CreateClientDto) {
    // Check if client with same phone already exists
    const existing = await clientsRepository.findByPhone(data.phone, userId)
    if (existing) {
      throw createError('Client with this phone number already exists', 409)
    }

    return clientsRepository.create(userId, data)
  }

  async getById(id: string, userId: string) {
    const client = await clientsRepository.findById(id, userId)
    if (!client) {
      throw createError('Client not found', 404)
    }
    return client
  }

  async getAll(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit
    const { data, total } = await clientsRepository.findAll(userId, limit, offset)

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async update(id: string, userId: string, data: UpdateClientDto) {
    const client = await clientsRepository.findById(id, userId)
    if (!client) {
      throw createError('Client not found', 404)
    }

    // If phone is being updated, check for duplicates
    if (data.phone && data.phone !== client.phone) {
      const existing = await clientsRepository.findByPhone(data.phone, userId)
      if (existing) {
        throw createError('Client with this phone number already exists', 409)
      }
    }

    return clientsRepository.update(id, userId, data)
  }

  async delete(id: string, userId: string) {
    const client = await clientsRepository.findById(id, userId)
    if (!client) {
      throw createError('Client not found', 404)
    }

    return clientsRepository.delete(id, userId)
  }
}

export const clientsService = new ClientsService()
