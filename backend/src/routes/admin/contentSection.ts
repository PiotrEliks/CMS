import { Router } from 'express'
import * as ContentSectionsController from '../../controllers/site/contentSections.controller.js'
import { requireAuth } from '../../middlewares/auth.middleware.js'
import { authorize } from '../../middlewares/authorize.middleware.js'
import { contentSectionService } from '../../services/contentSection.service.js'

const router = Router({ mergeParams: true })

router.use(requireAuth)

router.use((req, res, next) => {
  console.log(`[Sections] ${req.method} ${req.originalUrl}`)
  console.log('[Sections] Params:', req.params)
  next()
})

router.get(
  '/',
  authorize('content.read'),
  ContentSectionsController.getSections
)

router.post(
  '/reorder',
  authorize('content.update'),
  ContentSectionsController.reorderSections
)

router.get(
  '/:sectionId',
  authorize('content.read'),
  ContentSectionsController.getSection
)

router.post(
  '/',
  authorize('content.create'),
  ContentSectionsController.createSection
)

router.put(
  '/:sectionId',
  authorize('content.update'),
  ContentSectionsController.updateSection
)

router.delete(
  '/:sectionId',
  authorize('content.delete'),
  ContentSectionsController.deleteSection
)

router.post(
  '/:sectionId/duplicate',
  authorize('content.create'),
  ContentSectionsController.duplicateSection
)

router.post(
  '/reorder-display',
  authorize('content.update'),
  async (req, res) => {
    try {
      const { contentId } = req.params
      const { items } = req.body

      const sections = await contentSectionService.reorderDisplayOrder(
        contentId,
        items
      )
      res.json(sections)
    } catch (error) {
      console.error('Error reordering display:', error)
      res.status(500).json({ message: 'Failed to reorder' })
    }
  }
)

export default router
