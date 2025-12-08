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

  /**
   * Create new content with slug generation
   */
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
    // Generate slug if not provided
    let slug = data.slug || stringToSlug(data.title);

    // Ensure slug uniqueness
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
        { model: Media, as: 'medias' },
        { model: User, as: 'creator', attributes: ['user_id', 'display_name', 'email'] },
        { model: User, as: 'updater', attributes: ['user_id', 'display_name', 'email'] },
        { model: Media, as: 'cover' },
      ],
    });
  }

  /**
   * Generate slug from title with uniqueness check
   */
  async generateSlug(title: string, existingId?: string | number): Promise<string> {
    let slug = stringToSlug(title);

    // Check uniqueness excluding current content if updating
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

  /**
   * Publish content
   */
  async publish(id: string): Promise<Content | null> {
    return await this.update(id, {
      status: 'published',
      published_at: new Date(),
    } as any);
  }

  /**
   * Unpublish content
   */
  async unpublish(id: string): Promise<Content | null> {
    return await this.update(id, {
      status: 'draft',
    } as any);
  }

  /**
   * Get published content with pagination
   */
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

  /**
   * Detach category from content
   */
  async detachCategory(contentId: string, categoryId: string) {
    const content = await this.findById(contentId);
    if (!content) throw new Error('Content not found');

    await (content as any).removeCategory(categoryId);
  }

  /**
   * Attach media to content
   */
  async attachMedia(contentId: string, mediaId: string) {
    const content = await this.findById(contentId);
    if (!content) throw new Error('Content not found');

    await (content as any).addMedia(mediaId);
  }

  /**
   * Detach media from content
   */
  async detachMedia(contentId: string, mediaId: string) {
    const content = await this.findById(contentId);
    if (!content) throw new Error('Content not found');

    await (content as any).removeMedia(mediaId);
  }

  /**
   * Get content with all associations
   */
  async getWithAssociations(id: string) {
    return await this.findById(id);
  }

  /**
   * List content by category
   */
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

// Export singleton instance
export const contentService = new ContentService();
