import path from 'path';
import { Op } from 'sequelize';
import { Media, Content, ContentsMedia } from '../models/index.js';
import { BaseService } from './types/BaseService.js';
import { PaginationOptions } from './types/IRepository.js';
import { safeUnlink } from '../utils/fileSystem.js';

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.resolve(process.cwd(), 'uploads');

export type MediaUsagePlace =
  | { type: 'content.cover'; content_id: string; title: string; slug: string }
  | { type: 'content.attachment'; content_id: string; title: string; slug: string };

type UsagePlace = {
  kind: 'content.cover' | 'content.media';
  content_id: string;
  title: string;
  slug: string;
};

export class MediaService extends BaseService<Media> {
  constructor() {
    super(Media);
  }

  async createFromUpload(data: {
    filename: string;
    mime_type: string;
    file_size: number;
    storage_path: string;
    url?: string | null;
    thumbnail_path?: string | null;
    uploaded_by?: string | null;
    alt_text?: string | null;
    title?: string | null;
    width?: number | null;
    height?: number | null;
  }) {
    return await super.create({
      ...data,
      uploaded_at: new Date(),
    } as any);
  }

  async listMedia(params: {
    type?: 'image' | 'document';
    used?: '1' | '0';
    search?: string;
    limit: number;
    offset: number;
  }) {
    const where: any = {};

    if (params.type === 'image') where.mime_type = { [Op.like]: 'image/%' };
    if (params.type === 'document') where.mime_type = { [Op.notLike]: 'image/%' };

    if (params.search) {
      const q = params.search.trim();
      where[Op.or] = [
        { title: { [Op.iLike]: `%${q}%` } },
        { title: { [Op.iLike]: `%${q}%` } },
        { alt_text: { [Op.iLike]: `%${q}%` } },
        { storage_path: { [Op.iLike]: `%${q}%` } },
      ];
    }

    if (params.used === '1') {
      where[Op.or] = [
        ...(where[Op.or] ?? []),
        { media_id: { [Op.in]: (Content as any).sequelize.literal(`(SELECT cover_media_id FROM contents WHERE cover_media_id IS NOT NULL)`) } },
        { media_id: { [Op.in]: (Content as any).sequelize.literal(`(SELECT media_id FROM contents_media)`) } },
      ];
    }

    if (params.used === '0') {
      where[Op.and] = [
        ...(where[Op.and] ?? []),
        { media_id: { [Op.notIn]: (Content as any).sequelize.literal(`(SELECT cover_media_id FROM contents WHERE cover_media_id IS NOT NULL)`) } },
        { media_id: { [Op.notIn]: (Content as any).sequelize.literal(`(SELECT media_id FROM contents_media)`) } },
      ];
    }

    return await this.list({
      where,
      order: [['uploaded_at', 'DESC']],
      limit: params.limit,
      offset: params.offset,
    });
  }

  async getUsage(mediaId: string): Promise<{ isUsed: boolean; count: number; places: MediaUsagePlace[] }> {
    const places: MediaUsagePlace[] = [];

    const covers = await Content.findAll({
      where: { cover_media_id: mediaId },
      attributes: ['content_id', 'title', 'slug'],
      limit: 200,
    });

    for (const c of covers) {
      places.push({
        type: 'content.cover',
        content_id: (c as any).content_id,
        title: (c as any).title,
        slug: (c as any).slug,
      });
    }

    const attachments = await Content.findAll({
      include: [
        {
          model: Media,
          as: 'media',
          where: { media_id: mediaId },
          attributes: [],
          through: { attributes: [] },
          required: true,
        },
      ],
      attributes: ['content_id', 'title', 'slug'],
      limit: 200,
    });

    for (const c of attachments) {
      places.push({
        type: 'content.attachment',
        content_id: (c as any).content_id,
        title: (c as any).title,
        slug: (c as any).slug,
      });
    }

    return { isUsed: places.length > 0, count: places.length, places };
  }

  async getWithUsage(mediaId: string) {
    const media = await this.findById(mediaId);
    if (!media) return null;

    const usage = await this.getUsage(mediaId);
    return {
      media,
      usage: Array.isArray(usage) ? usage : [],
    };
  }
  

  async getByType(mimeType: string, options: PaginationOptions) {
    return await this.list({
      where: { mime_type: mimeType },
      order: [['uploaded_at', 'DESC']],
      limit: options.limit,
      offset: options.offset,
    });
  }

  async getRecent(limit: number = 20) {
    const { items } = await this.list({
      where: {},
      order: [['uploaded_at', 'DESC']],
      limit,
      offset: 0,
    });
    return items;
  }

  async deleteMedia(mediaId: string): Promise<{ deleted: true } | { deleted: false; places: MediaUsagePlace[] }> {
    const media = await this.findById(mediaId);
    if (!media) throw new Error('Media not found');

    const usage = await this.getUsage(mediaId);
    if (usage.isUsed) {
      return { deleted: false, places: usage.places };
    }

    const storagePath = (media as any).storage_path as string;
    if (storagePath) {
      const abs = path.join(UPLOAD_DIR, storagePath);
      await safeUnlink(abs);
    }

    if ((media as any).thumbnail_path) {
      const thumbAbs = path.join(UPLOAD_DIR, (media as any).thumbnail_path);
      await safeUnlink(thumbAbs);
    }

    await ContentsMedia.destroy({ where: { media_id: mediaId } });
    await this.delete(mediaId);

    return { deleted: true };
  }


  async updateMetadata(mediaId: string, data: { alt_text?: string; title?: string; status?: boolean }) {
    return await this.update(mediaId, data as any);
  }

  async search(query: string, options: PaginationOptions) {
    return await this.list({
      where: {},
      order: [['uploaded_at', 'DESC']],
      limit: options.limit,
      offset: options.offset,
    });
  }

  async getTotalStorageUsed(): Promise<number> {
    const result = await (Media as any).findOne({
      attributes: [['SUM(file_size)', 'total']],
      raw: true,
    });

    return result?.total || 0;
  }


  async getPublishedById(mediaId: string) {
    return await Media.findOne({
      where: { media_id: mediaId, status: true },
      attributes: ['media_id', 'storage_path', 'mime_type', 'width', 'height', 'alt_text', 'title'],
    });
  }
}

export const mediaService = new MediaService();
