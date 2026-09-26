import { prisma } from '../../config/database'
import { CreateClientDto, UpdateClientDto } from './dtos/create-client.dto'
import { Client } from '@prisma/client'

export class ClientsRepository {
  async create(userId: string, data: CreateClientDto): Promise<Client> {
    return prisma.client.create({
      data: {
        userId,
        ...data,
      },
    })
  }

  async findById(id: string, userId: string): Promise<Client | null> {
    return prisma.client.findFirst({
      where: {
        id,
        userId,
      },
    })
  }

  async findByPhone(phone: string, userId: string): Promise<Client | null> {
    return prisma.client.findFirst({
      where: {
        phone,
        userId,
      },
    })
  }

  async findAll(userId: string, limit = 20, offset = 0): Promise<{
    data: Client[]
    total: number
  }> {
    const [data, total] = await Promise.all([
      prisma.client.findMany({
        where: { userId },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.client.count({
        where: { userId },
      }),
    ])

    return { data, total }
  }

  async update(id: string, userId: string, data: UpdateClientDto): Promise<Client> {
    return prisma.client.update({
      where: {
        id,
        userId,
      },
      data,
    })
  }

  async delete(id: string, userId: string): Promise<Client> {
    return prisma.client.delete({
      where: {
        id,
        userId,
      },
    })
  }
}

export const clientsRepository = new ClientsRepository()
