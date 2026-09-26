import { Router } from 'express'
import { clientsController } from './clients.controller'
import { authMiddleware } from '../auth/auth.middleware'

export const clientRoutes = Router()

clientRoutes.use(authMiddleware)

clientRoutes.post('/', (req, res, next) => {
  clientsController.create(req, res).catch(next)
})

clientRoutes.get('/', (req, res, next) => {
  clientsController.getAll(req, res).catch(next)
})

clientRoutes.get('/:id', (req, res, next) => {
  clientsController.getById(req, res).catch(next)
})

clientRoutes.put('/:id', (req, res, next) => {
  clientsController.update(req, res).catch(next)
})

clientRoutes.delete('/:id', (req, res, next) => {
  clientsController.delete(req, res).catch(next)
})
