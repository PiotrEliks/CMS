import { Media, Content } from '../models/index.js';
import { BaseService } from './types/BaseService.js';
import { PaginationOptions } from './types/IRepository.js';

export class MediaService extends BaseService<Media> {
  constructor() {
    super(Media);
  }

  async createFromUpload(data: {
    filename: string;
    mime_type: string;
    file_size: number;
    url: string;
    uploaded_by?: string;
    alt_text?: string;
  }) {
    return await super.create({
      ...data,
      uploaded_at: new Date(),
    } as any);
  }

  async getWithUsage(mediaId: string) {
    return await this.findOne({
      where: { media_id: mediaId },
      include: [
        {
          model: Content,
          as: 'coverOf',
          attributes: ['content_id', 'title', 'slug'],
        },
        {
          model: Content,
          as: 'medias',
          attributes: ['content_id', 'title', 'slug'],
        },
      ],
    });
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

  async deleteMedia(mediaId: string): Promise<void> {
    const media = await this.findById(mediaId);
    if (!media) throw new Error('Media not found');
    await this.delete(mediaId);
  }


  async updateMetadata(mediaId: string, data: { alt_text?: string; filename?: string }) {
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
