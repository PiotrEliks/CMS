import { Router, Request, Response, NextFunction } from 'express'
import multer from 'multer'
import * as MediaController from '../../controllers/site/media.controller.js'
import { requireAuth } from '../../middlewares/auth.middleware.js'
import { authorize } from '../../middlewares/authorize.middleware.js'
import { uploadMediaMiddleware } from '../../middlewares/uploadMedia.middleware.js'

const router = Router()

router.use(requireAuth)

router.post(
  '/bulk',
  authorize('media.upload'),
  (req: Request, res: Response, next: NextFunction) => {
    uploadMediaMiddleware.array('files', 20)(req, res, (err: any) => {
      if (!err) {
        return next()
      }

      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            error: 'Jeden z plików jest za duży. Maksymalny rozmiar: 50MB',
          })
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            error: 'Za dużo plików. Maksymalnie 20 plików na raz.',
          })
        }
        return res.status(400).json({
          error: `Błąd uploadu: ${err.message}`,
        })
      }

      console.error('Bulk upload error:', err)
      return res.status(500).json({
        error: err.message || 'Nie udało się wgrać plików',
      })
    })
  },
  MediaController.uploadMultipleMedia
)

router.post(
  '/',
  authorize('media.upload'),
  (req: Request, res: Response, next: NextFunction) => {
    uploadMediaMiddleware.single('file')(req, res, (err: any) => {
      if (!err) {
        return next()
      }

      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            error: 'Plik za duży. Maksymalny rozmiar: 50MB',
          })
        }
        return res.status(400).json({
          error: `Błąd uploadu: ${err.message}`,
        })
      }

      console.error('Upload error:', err)
      return res.status(500).json({
        error: err.message || 'Nie udało się wgrać pliku',
      })
    })
  },
  MediaController.uploadMedia
)

router.get('/', authorize('media.read'), MediaController.listMedia)
router.get('/recent', authorize('media.read'), MediaController.getRecentMedia)
router.get(
  '/stats/storage',
  authorize('media.read'),
  MediaController.getStorageStats
)
router.get(
  '/type/:mimeType',
  authorize('media.read'),
  MediaController.getMediaByType
)
router.get('/:id', authorize('media.read'), MediaController.getMedia)
router.put('/:id', authorize('media.update'), MediaController.updateMedia)
router.delete('/:id', authorize('media.delete'), MediaController.deleteMedia)

export default router
