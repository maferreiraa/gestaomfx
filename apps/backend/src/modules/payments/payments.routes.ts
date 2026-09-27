import { Router } from 'express'
import { paymentsController } from './payments.controller'

export const paymentRoutes = Router()

paymentRoutes.post('/', (req, res) => paymentsController.createPayment(req, res))
paymentRoutes.get('/:paymentId/status', (req, res) =>
  paymentsController.checkPaymentStatus(req, res)
)
