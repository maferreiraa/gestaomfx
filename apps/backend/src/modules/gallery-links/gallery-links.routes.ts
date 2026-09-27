import { Router } from 'express'
import { galleryLinksController } from './gallery-links.controller'

export const galleryLinksRoutes = Router()

galleryLinksRoutes.get('/:token', (req, res) =>
  galleryLinksController.getGalleryByToken(req, res)
)
