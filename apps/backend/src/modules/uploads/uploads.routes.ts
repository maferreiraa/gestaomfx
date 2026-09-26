import { Router } from 'express'
import { uploadsController } from './uploads.controller'
import { authMiddleware } from '../auth/auth.middleware'

export const uploadRoutes = Router()

uploadRoutes.use(authMiddleware)

uploadRoutes.get('/', (req, res) => uploadsController.listUploads(req, res))
uploadRoutes.post('/', (req, res) => uploadsController.createUpload(req, res))
uploadRoutes.get('/:uploadId', (req, res) => uploadsController.getUpload(req, res))
