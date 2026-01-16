import path from 'path'
import { Op } from 'sequelize'
import {
  Media,
  Content,
  ContentSection,
  PageComponent,
} from '../models/index.js'
import { BaseService } from './types/BaseService.js'
import { PaginationOptions } from './types/IRepository.js'
import { safeUnlink } from '../utils/fileSystem.js'

const UPLOAD_DIR =
  process.env.UPLOAD_DIR ?? path.resolve(process.cwd(), 'uploads')

export type MediaUsagePlace =
  | { type: 'content.cover'; content_id: string; title: string; slug: string }
  | { type: 'content.body'; content_id: string; title: string; slug: string }
  | {
      type: 'section.media'
      section_id: string
      content_id: string
      section_type: string
      content_title: string
    }
  | {
      type: 'component.hero'
      component_id: string
      content_id: string
      content_title: string
    }
  | {
      type: 'component.services'
      component_id: string
      content_id: string
      content_title: string
    }
  | { type: 'user.avatar'; user_id: string; email: string }
// TODO: Add other component types as needed

export class MediaService extends BaseService<Media> {
  constructor() {
    super(Media)
  }

  async createFromUpload(data: {
    filename: string
    mime_type: string
    file_size: number
    storage_path: string
    url?: string | null
    thumbnail_path?: string | null
    uploaded_by?: string | null
    alt_text?: string | null
    title?: string | null
    width?: number | null
    height?: number | null
  }) {
    return await super.create({
      ...data,
      uploaded_at: new Date(),
    } as any)
  }

  async listMedia(params: {
    type?: 'image' | 'document'
    used?: '1' | '0'
    search?: string
    limit: number
    offset: number
  }) {
    const where: any = {}

    if (params.type === 'image') where.mime_type = { [Op.like]: 'image/%' }
    if (params.type === 'document')
      where.mime_type = { [Op.notLike]: 'image/%' }

    if (params.search) {
      const q = params.search.trim()
      where[Op.or] = [
        { title: { [Op.iLike]: `%${q}%` } },
        { alt_text: { [Op.iLike]: `%${q}%` } },
        { storage_path: { [Op.iLike]: `%${q}%` } },
      ]
    }

    return await this.list({
      where,
      order: [['uploaded_at', 'DESC']],
      limit: params.limit,
      offset: params.offset,
    })
  }

  async getUsage(mediaId: string): Promise<MediaUsagePlace[]> {
    const places: MediaUsagePlace[] = []

    const covers = await Content.findAll({
      where: { cover_media_id: mediaId },
      attributes: ['content_id', 'title', 'slug'],
      limit: 100,
    })

    for (const c of covers) {
      places.push({
        type: 'content.cover',
        content_id: (c as any).content_id,
        title: (c as any).title,
        slug: (c as any).slug,
      })
    }

    const contentsWithBody = await Content.findAll({
      where: {
        body: {
          [Op.like]: `%${mediaId}%`,
        },
      },
      attributes: ['content_id', 'title', 'slug'],
      limit: 100,
    })

    for (const c of contentsWithBody) {
      places.push({
        type: 'content.body',
        content_id: (c as any).content_id,
        title: (c as any).title,
        slug: (c as any).slug,
      })
    }

    const sections = await ContentSection.findAll({
      where: {
        media_ids: {
          [Op.contains]: [mediaId],
        },
      },
      include: [
        {
          model: Content,
          as: 'content',
          attributes: ['content_id', 'title'],
        },
      ],
      attributes: ['section_id', 'content_id', 'section_type'],
      limit: 100,
    })

    for (const s of sections) {
      places.push({
        type: 'section.media',
        section_id: (s as any).section_id,
        content_id: (s as any).content_id,
        section_type: (s as any).section_type,
        content_title: (s as any).content?.title || 'Unknown',
      })
    }

    const sequelize = PageComponent.sequelize!

    const components = await PageComponent.findAll({
      where: {
        [Op.and]: [
          sequelize.where(sequelize.cast(sequelize.col('data'), 'TEXT'), {
            [Op.like]: `%${mediaId}%`,
          }),
        ],
      },
      include: [
        {
          model: Content,
          as: 'content',
          attributes: ['content_id', 'title'],
        },
      ],
      attributes: ['component_id', 'content_id', 'component_type'],
      limit: 100,
    })

    for (const comp of components) {
      const componentType = (comp as any).component_type
      places.push({
        type: `component.${componentType}` as any,
        component_id: (comp as any).component_id,
        content_id: (comp as any).content_id,
        content_title: (comp as any).content?.title || 'Unknown',
      })
    }

    return places
  }

  async getWithUsage(mediaId: string) {
    const media = await this.findById(mediaId)
    if (!media) return null

    const usage = await this.getUsage(mediaId)
    return {
      media,
      usage,
    }
  }

  async getByType(mimeType: string, options: PaginationOptions) {
    return await this.list({
      where: { mime_type: mimeType },
      order: [['uploaded_at', 'DESC']],
      limit: options.limit,
      offset: options.offset,
    })
  }

  async getRecent(limit: number = 20) {
    const { items } = await this.list({
      where: {},
      order: [['uploaded_at', 'DESC']],
      limit,
      offset: 0,
    })
    return items
  }

  async deleteMedia(mediaId: string): Promise<void> {
    const media = await this.findById(mediaId)
    if (!media) {
      throw new Error('Media not found')
    }

    const usage = await this.getUsage(mediaId)
    if (usage.length > 0) {
      const error: any = new Error('Media is in use and cannot be deleted')
      error.code = 'MEDIA_IN_USE'
      error.places = usage
      throw error
    }

    const storagePath = (media as any).storage_path as string
    if (storagePath) {
      const relativePath = storagePath.startsWith('/uploads/')
        ? storagePath.substring(1)
        : storagePath

      const abs = path.resolve(process.cwd(), relativePath)

      console.log('[DELETE] Attempting to delete:', {
        storagePath,
        relativePath,
        absolute: abs,
      })

      await safeUnlink(abs)
    }

    if ((media as any).thumbnail_path) {
      const thumbPath = (media as any).thumbnail_path as string
      const relativeThumb = thumbPath.startsWith('/uploads/')
        ? thumbPath.substring(1)
        : thumbPath

      const thumbAbs = path.resolve(process.cwd(), relativeThumb)

      console.log('[DELETE] Attempting to delete thumbnail:', {
        thumbPath,
        relativeThumb,
        absolute: thumbAbs,
      })

      await safeUnlink(thumbAbs)
    }

    await this.delete(mediaId)

    console.log('[DELETE] Successfully deleted media:', mediaId)
  }

  async updateMetadata(
    mediaId: string,
    data: { alt_text?: string; title?: string; status?: boolean }
  ) {
    return await this.update(mediaId, data as any)
  }

  async getTotalStorageUsed(): Promise<number> {
    const result = await (Media as any).findOne({
      attributes: [
        [
          Media.sequelize!.fn('SUM', Media.sequelize!.col('file_size')),
          'total',
        ],
      ],
      raw: true,
    })

    return parseInt(result?.total) || 0
  }

  async getPublishedById(mediaId: string) {
    return await Media.findOne({
      where: { media_id: mediaId, status: true },
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
}

export const mediaService = new MediaService()
