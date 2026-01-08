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
    body?: string;
    lead?: string;
    meta_description?: string;
    meta_keywords?: string;
    meta_title?: string;
    slug?: string;
    status?: string;
    created_by?: string;
    cover_media_id?: string;
  }) {
    // Generate slug if not provided
    let slug = data.slug || stringToSlug(data.title);

    // Make slug unique
    slug = await makeSlugUnique(slug, async (s) => {
      const existing = await Content.findOne({ where: { slug: s } });
      return !!existing;
    });

    // Create content with defaults
    return await super.create({
      title: data.title,
      body: data.body || '',
      lead: data.lead || '',
      meta_description: data.meta_description || '',
      meta_keywords: data.meta_keywords || '',
      meta_title: data.meta_title || data.title, // Default to title
      slug,
      status: data.status || 'draft',
      created_by: data.created_by,
      cover_media_id: data.cover_media_id,
    } as any);
  }

  /**
   * Update content
   */
  async update(
    id: string,
    data: {
      title?: string;
      body?: string;
      lead?: string;
      meta_description?: string;
      meta_keywords?: string;
      meta_title?: string;
      slug?: string;
      status?: string;
      updated_by?: string;
      cover_media_id?: string;
    }
  ) {
    // If slug is being updated, make it unique
    if (data.slug) {
      data.slug = await makeSlugUnique(data.slug, async (s) => {
        const where: any = { slug: s, content_id: { [Op.ne]: id } };
        const existing = await Content.findOne({ where });
        return !!existing;
      });
    }

    return await super.update(id, data as any);
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

  /**
   * Generate unique slug from title
   */
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
      published_at: null,
    } as any);
  }

  /**
   * Get all published content
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
    return await this.findOne({
      where: { content_id: id },
      include: [
        { model: Category, as: 'categories' },
        { model: Media, as: 'media' },
        { model: User, as: 'creator', attributes: ['user_id', 'display_name', 'email'] },
        { model: User, as: 'updater', attributes: ['user_id', 'display_name', 'email'] },
        { model: Media, as: 'cover' },
      ],
    });
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
        { model: User, as: 'creator', attributes: ['user_id', 'display_name'] },
        { model: Media, as: 'cover' },
      ],
      limit: options.limit,
      offset: options.offset,
    });
  }

  /**
   * Search content by title or body
   */
  async search(query: string, options: PaginationOptions) {
    return await this.list({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${query}%` } },
          { body: { [Op.iLike]: `%${query}%` } },
          { lead: { [Op.iLike]: `%${query}%` } },
        ],
      },
      include: [
        { model: Category, as: 'categories' },
        { model: User, as: 'creator', attributes: ['user_id', 'display_name'] },
        { model: Media, as: 'cover' },
      ],
      limit: options.limit,
      offset: options.offset,
    });
  }
}

export const contentService = new ContentService();
