import { Request, Response } from 'express'
import { Op } from 'sequelize'
import {
    Content,
    Media,
    Category,
    ContentCategory,
    ContentsMedia,
} from '../../models/index.js'

export async function getPageBySlug(req: Request, res: Response) {
    const { slug } = req.params

    const content = await Content.findOne({
        where: {
            slug,
            status: true,
            published_at: { [Op.lte]: new Date() },
        },
        attributes: {
            exclude: ['created_by', 'updated_by'],
        },
    })

    if (!content) return res.status(404).json({ error: 'Not found' })

    let cover: Media | null = null
    if (content.cover_media_id) {
        cover = await Media.findOne({
            where: { media_id: content.cover_media_id, status: true },
            attributes: [
                'media_id',
                'storage_path',
                'mime_type',
                'width',
                'height',
                'alt_text',
                'title',
            ],
        })
    }

    res.set('Cache-Control', 'public, max-age=60')
    return res.json({ content, cover })
}

export async function listPages(req: Request, res: Response) {
    const page = Math.max(1, Number(req.query.page) || 1)
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 10))
    const q = (req.query.q as string | undefined)?.trim()
    const categorySlug = (req.query.category as string | undefined)?.trim()
    const type = (req.query.type as string | undefined)?.trim()

    const where: any = {
        status: true,
        published_at: { [Op.lte]: new Date() },
    }
    if (q) {
        where[Op.or] = [
            { title: { [Op.iLike]: `%${q}%` } },
            { lead: { [Op.iLike]: `%${q}%` } },
            { body: { [Op.iLike]: `%${q}%` } },
        ]
    }
    if (type) where.type = type

    let contentIdsByCategory: string[] | null = null
    if (categorySlug) {
        const cat = await Category.findOne({
            where: { slug: categorySlug, status: true },
        })
        if (!cat) return res.json({ items: [], page, pageSize, total: 0 })

        const cc = await ContentCategory.findAll({
            where: { category_category_id: cat.category_id },
            attributes: ['content_content_id'],
        })
        contentIdsByCategory = cc.map((x: any) => x.content_content_id)
        if (contentIdsByCategory.length === 0)
            return res.json({ items: [], page, pageSize, total: 0 })

        where.content_id = { [Op.in]: contentIdsByCategory }
    }

    const { rows, count } = await Content.findAndCountAll({
        where,
        order: [['published_at', 'DESC']],
        offset: (page - 1) * pageSize,
        limit: pageSize,
        attributes: [
            'content_id',
            'slug',
            'title',
            'lead',
            'published_at',
            'type',
            'cover_media_id',
        ],
    })

    const mediaIds = rows
        .map((r) => r.cover_media_id)
        .filter(Boolean) as string[]
    const covers = mediaIds.length
        ? await Media.findAll({
              where: { media_id: { [Op.in]: mediaIds }, status: true },
              attributes: ['media_id', 'storage_path', 'alt_text', 'title'],
          })
        : []

    const coverMap = new Map(covers.map((m: any) => [m.media_id, m]))
    const items = rows.map((r) => ({
        ...r.toJSON(),
        cover: r.cover_media_id
            ? (coverMap.get(r.cover_media_id) ?? null)
            : null,
    }))

    res.set('Cache-Control', 'public, max-age=60')
    return res.json({ items, page, pageSize, total: count })
}
