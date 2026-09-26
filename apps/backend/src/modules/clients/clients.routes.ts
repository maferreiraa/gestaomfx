import { Router } from 'express'
import { clientsController } from './clients.controller'
import { authMiddleware } from '../auth/auth.middleware'

export const clientRoutes = Router()

clientRoutes.use(authMiddleware)

clientRoutes.get('/', (req, res) => clientsController.listClients(req, res))
clientRoutes.get('/:clientId', (req, res) => clientsController.getClient(req, res))
