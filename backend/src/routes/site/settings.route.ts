import { Router, Request, Response } from 'express'
import { keyValueService } from '../../services/keyValue.service.js'
import { SITE_SETTINGS } from '../../constants/siteSettings.js'

const router = Router()

// GET /api/sites/settings - Get all public site settings
router.get('/', async (_req: Request, res: Response) => {
  try {
    const settings = await keyValueService.getAllSiteSettings()
    res.json({ settings })
  } catch (error) {
    console.error('Error fetching site settings:', error)
    res.status(500).json({ error: 'Failed to fetch site settings' })
  }
})

// GET /api/sites/settings/:key - Get single setting by key
router.get('/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params

    // Only allow fetching public SITE_SETTINGS keys
    const validKeys = Object.values(SITE_SETTINGS)
    if (!validKeys.includes(key as any)) {
      res.status(404).json({ error: 'Setting not found' })
      return
    }

    const value = await keyValueService.getSiteSetting(key as any)
    res.json({ key, value })
  } catch (error) {
    console.error('Error fetching setting:', error)
    res.status(500).json({ error: 'Failed to fetch setting' })
  }
})

export default router
