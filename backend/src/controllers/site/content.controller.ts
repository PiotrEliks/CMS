import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import {
  contentService,
  ContentFilters,
} from '../../services/content.service.js'

const toStartOfDay = (dateString: string): Date => {
  const date = new Date(dateString)
  date.setUTCHours(0, 0, 0, 0)
  return date
}

const toEndOfDay = (dateString: string): Date => {
  const date = new Date(dateString)
  date.setUTCHours(23, 59, 59, 999)
  return date
}

export const createContent = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      title,
      body,
      lead,
      meta_description,
      meta_keywords,
      meta_title,
      slug,
      status,
    } = req.body

    if (!title) {
      return res.status(400).json({ error: 'Title is required' })
    }

    const content = await contentService.create({
      title,
      body: body || '',
      lead: lead || '',
      meta_description: meta_description || '',
      meta_keywords: meta_keywords || '',
      meta_title: meta_title || title,
      slug: slug || '',
      status: status || 'D',
      created_by: (req as any).user?.user_id || (req as any).user?.sub,
    })

    return res.status(201).json(content)
  }
)

export const getContent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  const content = await contentService.getWithAssociations(id)

  if (!content) {
    return res.status(404).json({ error: 'Content not found' })
  }

  return res.json(content)
})

export const getContentBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params

    const content = await contentService.getBySlug(slug)

    if (!content) {
      return res.status(404).json({ error: 'Content not found' })
    }

    return res.json(content)
  }
)

export const listContents = asyncHandler(
  async (req: Request, res: Response) => {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
    const offset = parseInt(req.query.offset as string) || 0

    const filters: ContentFilters = {
      title: req.query.title as string,
      status: req.query.status as string,
      created_by: req.query.created_by as string,
      updated_by: req.query.updated_by as string,
    }

    if (req.query.created_from) {
      filters.created_from = toStartOfDay(
        req.query.created_from as string
      ).toISOString()
    }
    if (req.query.created_to) {
      filters.created_to = toEndOfDay(
        req.query.created_to as string
      ).toISOString()
    }
    if (req.query.updated_from) {
      filters.updated_from = toStartOfDay(
        req.query.updated_from as string
      ).toISOString()
    }
    if (req.query.updated_to) {
      filters.updated_to = toEndOfDay(
        req.query.updated_to as string
      ).toISOString()
    }

    Object.keys(filters).forEach((key) => {
      if (filters[key as keyof ContentFilters] === undefined) {
        delete filters[key as keyof ContentFilters]
      }
    })

    const result = await contentService.listWithEditInfo({
      limit,
      offset,
      filters,
    })

    return res.json(result)
  }
)

export const listPublishedContents = asyncHandler(
  async (req: Request, res: Response) => {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
    const offset = parseInt(req.query.offset as string) || 0

    const { items, total } = await contentService.getPublished({
      where: {},
      limit,
      offset,
    })

    return res.json({ items, total, limit, offset })
  }
)

export const updateContent = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params
    const {
      title,
      body,
      lead,
      meta_description,
      meta_keywords,
      meta_title,
      slug,
      status,
      cover_media_id,
    } = req.body

    const content = await contentService.update(id, {
      title,
      body,
      lead,
      cover_media_id,
      meta_description,
      meta_keywords,
      meta_title,
      slug,
      status,
      updated_by: (req as any).user?.user_id || (req as any).user?.sub,
    } as any)

    if (!content) {
      return res.status(404).json({ error: 'Content not found' })
    }

    return res.json(content)
  }
)

export const publishContent = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params

    const content = await contentService.publish(id)

    if (!content) {
      return res.status(404).json({ error: 'Content not found' })
    }

    return res.json(content)
  }
)

export const unpublishContent = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params

    const content = await contentService.unpublish(id)

    if (!content) {
      return res.status(404).json({ error: 'Content not found' })
    }

    return res.json(content)
  }
)

export const attachCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, categoryId } = req.params

    try {
      await contentService.attachCategory(id, categoryId)
      return res.json({ ok: true })
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message })
    }
  }
)

export const detachCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, categoryId } = req.params

    try {
      await contentService.detachCategory(id, categoryId)
      return res.json({ ok: true })
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message })
    }
  }
)

export const attachMedia = asyncHandler(async (req: Request, res: Response) => {
  const { id, mediaId } = req.params

  try {
    await contentService.attachMedia(id, mediaId)
    return res.json({ ok: true })
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message })
  }
})

export const detachMedia = asyncHandler(async (req: Request, res: Response) => {
  const { id, mediaId } = req.params

  try {
    await contentService.detachMedia(id, mediaId)
    return res.json({ ok: true })
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message })
  }
})

export const deleteContent = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params

    const deleted = await contentService.delete(id)

    if (!deleted) {
      return res.status(404).json({ error: 'Content not found' })
    }

    return res.json({ ok: true })
  }
)

export const generateSlug = asyncHandler(
  async (req: Request, res: Response) => {
    const { title, existingId } = req.body

    if (!title) {
      return res.status(400).json({ error: 'Title is required' })
    }

    const slug = await contentService.generateSlug(title, existingId)

    return res.json({ slug })
  }
)
