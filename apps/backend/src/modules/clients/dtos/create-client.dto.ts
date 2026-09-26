import Joi from 'joi'

export interface CreateClientDto {
  name: string
  phone: string
  adId?: string
}

export interface UpdateClientDto {
  name?: string
  phone?: string
  adId?: string
}

export const createClientSchema = Joi.object({
  name: Joi.string().min(2).required(),
  phone: Joi.string()
    .regex(/^(\d{10,11})$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone must be 10 or 11 digits',
    }),
  adId: Joi.string().optional(),
})

export const updateClientSchema = Joi.object({
  name: Joi.string().min(2).optional(),
  phone: Joi.string()
    .regex(/^(\d{10,11})$/)
    .optional()
    .messages({
      'string.pattern.base': 'Phone must be 10 or 11 digits',
    }),
  adId: Joi.string().optional(),
})
