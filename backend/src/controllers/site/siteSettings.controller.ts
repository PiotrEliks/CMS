import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { siteSettingsService } from '../../services/siteSettings.service.js'

export const getAllSettings = asyncHandler(
    async (req: Request, res: Response) => {
        const settings = await siteSettingsService.getAllGrouped()
        return res.json(settings)
    }
)

export const getSettingByKey = asyncHandler(
    async (req: Request, res: Response) => {
        const { key } = req.params
        const setting = await siteSettingsService.get(key)

        return res.json({ key, value: setting || {} })
    }
)

export const updateSettings = asyncHandler(
    async (req: Request, res: Response) => {
        const { key } = req.params
        const updates = req.body

        console.log('[Settings] Updating key:', key, 'with:', updates)

        const setting = await siteSettingsService.update(key, updates)

        return res.json({
            message: 'Ustawienia zaktualizowane',
            key,
            value: setting.value,
        })
    }
)

export const setSettings = asyncHandler(async (req: Request, res: Response) => {
    const { key } = req.params
    const value = req.body

    const setting = await siteSettingsService.set(key, value)

    return res.json({
        message: 'Ustawienia zapisane',
        key,
        value: setting.value,
    })
})

export const getPublicSettings = asyncHandler(
    async (req: Request, res: Response) => {
        const settings = await siteSettingsService.getPublic()

        res.set('Cache-Control', 'public, max-age=300')

        return res.json(settings)
    }
)
