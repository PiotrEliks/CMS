import { Op } from 'sequelize';
import { Content, Category, Media, User } from '../models/index.js';
import { BaseService } from './types/BaseService.js';
import { IPublishable } from './types/IPublishable.js';
import { ISluggable } from './types/ISluggable.js';
import { FindOptions, PaginationOptions } from './types/IRepository.js';
import { stringToSlug, makeSlugUnique } from '../utils/slugger.js';

export class ContentService extends BaseService<Content> implements IPublishable, ISluggable {
  constructor() {
    super(Content);
  }


  async create(data: {
    title: string;
    body: string;
    meta_description?: string;
    meta_keywords?: string;
    slug?: string;
    status?: 'draft' | 'published';
    created_by?: string;
    cover_media_id?: string;
  }) {
    let slug = data.slug || stringToSlug(data.title);

    slug = await makeSlugUnique(slug, async (s) => {
      const existing = await Content.findOne({ where: { slug: s } });
      return !!existing;
    });

    return await super.create({
      ...data,
      slug,
      status: data.status || 'draft',
    });
  }

  /**
   * Get content by slug
   */
  async getBySlug(slug: string) {
    return await this.findOne({
      where: { slug },
      include: [
        { model: Category, as: 'categories' },
        { model: Media, as: 'media' },
        { model: User, as: 'creator', attributes: ['user_id', 'display_name', 'email'] },
        { model: User, as: 'updater', attributes: ['user_id', 'display_name', 'email'] },
        { model: Media, as: 'cover' },
      ],
    });
  }

  async generateSlug(title: string, existingId?: string | number): Promise<string> {
    let slug = stringToSlug(title);

    slug = await makeSlugUnique(slug, async (s) => {
      const where: any = { slug: s };
      if (existingId) {
        where.content_id = { [Op.ne]: existingId };
      }
      const existing = await Content.findOne({ where });
      return !!existing;
    });

    return slug;
  }


  async publish(id: string): Promise<Content | null> {
    return await this.update(id, {
      status: 'published',
      published_at: new Date(),
    } as any);
  }


  async unpublish(id: string): Promise<Content | null> {
    return await this.update(id, {
      status: 'draft',
    } as any);
  }

  async getPublished(options: FindOptions & PaginationOptions) {
    return await this.list({
      ...options,
      where: {
        ...options.where,
        status: 'published',
      },
      include: [
        { model: Category, as: 'categories' },
        { model: User, as: 'creator', attributes: ['user_id', 'display_name'] },
        { model: Media, as: 'cover' },
      ],
    });
  }

  /**
   * Attach category to content
   */
  async attachCategory(contentId: string, categoryId: string) {
    const content = await this.findById(contentId);
    if (!content) throw new Error('Content not found');

    await (content as any).addCategory(categoryId);
  }


  async detachCategory(contentId: string, categoryId: string) {
    const content = await this.findById(contentId);
    if (!content) throw new Error('Content not found');

    await (content as any).removeCategory(categoryId);
  }

  async attachMedia(contentId: string, mediaId: string) {
    const content = await this.findById(contentId);
    if (!content) throw new Error('Content not found');

    await (content as any).addMedia(mediaId);
  }

  async detachMedia(contentId: string, mediaId: string) {
    const content = await this.findById(contentId);
    if (!content) throw new Error('Content not found');

    await (content as any).removeMedia(mediaId);
  }


  async getWithAssociations(id: string) {
    return await this.findById(id);
  }


  async listByCategory(categoryId: string, options: PaginationOptions) {
    return await this.list({
      where: {},
      include: [
        {
          model: Category,
          as: 'categories',
          where: { category_id: categoryId },
          through: { attributes: [] },
        },
      ],
      limit: options.limit,
      offset: options.offset,
    });
  }
}

export const contentService = new ContentService();
