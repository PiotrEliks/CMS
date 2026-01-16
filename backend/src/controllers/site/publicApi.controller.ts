import { Request, Response } from 'express'
import { publicApiService } from '../../services/publicApi.service.js'

export class PublicApiController {
    async getPage(req: Request, res: Response) {
        try {
            const { slug } = req.params
            const content = await publicApiService.getContentFull(slug)
            res.json(content)
        } catch (error: any) {
            res.status(404).json({ error: error.message })
        }
    }

    async getPageWithSections(req: Request, res: Response) {
        try {
            const { slug } = req.params
            const content = await publicApiService.getContentWithSections(slug)
            res.json(content)
        } catch (error: any) {
            res.status(404).json({ error: error.message })
        }
    }

    async getPageWithComponents(req: Request, res: Response) {
        try {
            const { slug } = req.params
            const content =
                await publicApiService.getContentWithComponents(slug)
            res.json(content)
        } catch (error: any) {
            res.status(404).json({ error: error.message })
        }
    }

    async getPages(req: Request, res: Response) {
        try {
            const { type, category, search, limit, offset } = req.query

            const result = await publicApiService.getPublishedContents({
                type: type as string,
                category_slug: category as string,
                search: search as string,
                limit: limit ? parseInt(limit as string) : undefined,
                offset: offset ? parseInt(offset as string) : undefined,
            })

            res.json(result)
        } catch (error: any) {
            res.status(500).json({ error: error.message })
        }
    }

    async getHomepage(req: Request, res: Response) {
        try {
            const homepage = await publicApiService.getHomepage()
            res.json(homepage)
        } catch (error: any) {
            res.status(404).json({ error: error.message })
        }
    }

    async getMenu(req: Request, res: Response) {
        try {
            const { code } = req.params
            const menu = await publicApiService.getMenuByCode(code)
            res.json(menu)
        } catch (error: any) {
            res.status(404).json({ error: error.message })
        }
    }

    async getCategories(req: Request, res: Response) {
        try {
            const { type } = req.query
            const categories = await publicApiService.getActiveCategories(
                type as string
            )
            res.json({ items: categories, total: categories.length })
        } catch (error: any) {
            res.status(500).json({ error: error.message })
        }
    }

    async getCategoryContents(req: Request, res: Response) {
        try {
            const { slug } = req.params
            const { limit, offset } = req.query

            const category = await publicApiService.getCategoryContents(
                slug,
                limit ? parseInt(limit as string) : undefined,
                offset ? parseInt(offset as string) : undefined
            )

            res.json(category)
        } catch (error: any) {
            res.status(404).json({ error: error.message })
        }
    }

    async search(req: Request, res: Response) {
        try {
            const { q, limit, offset } = req.query

            if (!q) {
                return res
                    .status(400)
                    .json({ error: 'Search query (q) is required' })
            }

            const result = await publicApiService.searchContents(
                q as string,
                limit ? parseInt(limit as string) : undefined,
                offset ? parseInt(offset as string) : undefined
            )

            res.json(result)
        } catch (error: any) {
            res.status(500).json({ error: error.message })
        }
    }

    async getRelatedPages(req: Request, res: Response) {
        try {
            const { id } = req.params
            const { limit } = req.query

            const related = await publicApiService.getRelatedContents(
                id,
                limit ? parseInt(limit as string) : undefined
            )

            res.json({ items: related, total: related.length })
        } catch (error: any) {
            res.status(500).json({ error: error.message })
        }
    }
}

export const publicApiController = new PublicApiController()
