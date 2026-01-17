import { Router } from 'express'
import * as ContentController from '../../controllers/site/content.controller.js'
import { publicApiService } from '../../services/publicApi.service.js'
import { asyncHandler } from '../../utils/asyncHandler.js'

const router = Router()

// Public routes - no authentication required

// List published content
router.get('/', ContentController.listPublishedContents)

// Get content with sections and components (full)
router.get(
  '/:slug/full',
  asyncHandler(async (req, res) => {
    const { slug } = req.params
    try {
      const content = await publicApiService.getContentFull(slug)
      return res.json(content)
    } catch (error: any) {
      if (error.message === 'Content not found') {
        return res.status(404).json({ error: 'Content not found' })
      }
      throw error
    }
  })
)

// Get content by slug
router.get('/:slug', ContentController.getContentBySlug)

export default router
