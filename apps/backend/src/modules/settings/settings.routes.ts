import { Router } from 'express'
import { settingsController } from './settings.controller'
import { authMiddleware } from '../../common/middleware/auth.middleware'

export const settingsRoutes = Router()

settingsRoutes.use(authMiddleware)

settingsRoutes.get('/watermark', (req, res) => settingsController.getWatermarkConfig(req, res))
settingsRoutes.get('/prices', (req, res) => settingsController.getPriceDefaults(req, res))
settingsRoutes.get('/pix', (req, res) => settingsController.getPixConfig(req, res))
