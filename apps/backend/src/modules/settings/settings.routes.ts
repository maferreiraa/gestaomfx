import { Router } from 'express'
import { settingsController } from './settings.controller'
import { authMiddleware } from '../auth/auth.middleware'

export const settingsRoutes = Router()

settingsRoutes.use(authMiddleware)

settingsRoutes.get('/watermark', (req, res) => settingsController.getWatermarkConfig(req, res))
settingsRoutes.put('/watermark', (req, res) => settingsController.updateWatermarkConfig(req, res))

settingsRoutes.get('/prices', (req, res) => settingsController.getPriceDefaults(req, res))
settingsRoutes.put('/prices', (req, res) => settingsController.updatePriceDefaults(req, res))

settingsRoutes.get('/pix', (req, res) => settingsController.getPixConfig(req, res))
settingsRoutes.put('/pix', (req, res) => settingsController.updatePixConfig(req, res))
