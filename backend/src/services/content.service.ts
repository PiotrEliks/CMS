import { Op } from 'sequelize';
import { Content, Category, Media, User, ContentSection, PageComponent } from '../models/index.js';
import { BaseService } from './types/BaseService.js';
import { IPublishable } from './types/IPublishable.js';
import { ISluggable } from './types/ISluggable.js';
import { FindOptions, PaginationOptions } from './types/IRepository.js';
import { stringToSlug, makeSlugUnique } from '../utils/slugger.js';

export interface ContentFilters {
  title?: string;
  status?: string;
  created_by?: string;
  updated_by?: string;
  created_from?: string;
  created_to?: string;
  updated_from?: string;
  updated_to?: string;
}

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
    let slug = data.slug || stringToSlug(data.title);

    slug = await makeSlugUnique(slug, async (s) => {
      const existing = await Content.findOne({ where: { slug: s } });
      return !!existing;
    });

    return await super.create({
      title: data.title,
      body: data.body || '',
      lead: data.lead || '',
      meta_description: data.meta_description || '',
      meta_keywords: data.meta_keywords || '',
      meta_title: data.meta_title || data.title,
      slug,
      status: data.status || 'D',
      created_by: data.created_by,
      cover_media_id: data.cover_media_id,
    } as any);
  }

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
    if (data.slug) {
      data.slug = await makeSlugUnique(data.slug, async (s) => {
        const where: any = { slug: s, content_id: { [Op.ne]: id } };
        const existing = await Content.findOne({ where });
        return !!existing;
      });
    }

    return await super.update(id, data as any);
  }

  private buildWhereClause(filters: ContentFilters) {
    const where: any = {};

    if (filters.title) {
      where.title = { [Op.iLike]: `%${filters.title}%` };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.created_by) {
      where.created_by = filters.created_by;
    }

    if (filters.updated_by) {
      where.updated_by = filters.updated_by;
    }

    if (filters.created_from) {
      where.created_at = {
        ...(where.created_at || {}),
        [Op.gte]: new Date(filters.created_from),
      };
    }

    if (filters.created_to) {
      where.created_at = {
        ...(where.created_at || {}),
        [Op.lte]: new Date(filters.created_to),
      };
    }

    if (filters.updated_from) {
      where.updated_at = {
        ...(where.updated_at || {}),
        [Op.gte]: new Date(filters.updated_from),
      };
    }

    if (filters.updated_to) {
      where.updated_at = {
        ...(where.updated_at || {}),
        [Op.lte]: new Date(filters.updated_to),
      };
    }

    return where;
  }

  async listWithEditInfo(options: PaginationOptions & { filters?: ContentFilters } = {}) {
    const { limit = 20, offset = 0, filters = {} } = options;

    const where = this.buildWhereClause(filters);

    const contents = await Content.findAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['user_id', 'display_name', 'email'],
        },
        {
          model: User,
          as: 'updater',
          attributes: ['user_id', 'display_name', 'email'],
        },
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    const contentsWithEditInfo = await Promise.all(
      contents.map(async (content) => {
        const contentData = content.toJSON() as any;

        const lastSectionEdit = await ContentSection.findOne({
          where: { content_id: content.content_id },
          order: [['updated_at', 'DESC']],
          limit: 1,
          attributes: ['updated_at'],
        });

        const lastComponentEdit = await PageComponent.findOne({
          where: { content_id: content.content_id },
          order: [['updated_at', 'DESC']],
          limit: 1,
          attributes: ['updated_at'],
        });

        const dates = [
          content.updated_at,
          lastSectionEdit?.updated_at,
          lastComponentEdit?.updated_at,
        ].filter(Boolean);

        const lastEditDate =
          dates.length > 0
            ? new Date(Math.max(...dates.map((d) => d!.getTime())))
            : content.updated_at;

        return {
          ...contentData,
          last_edit_date: lastEditDate,
          has_sections: !!lastSectionEdit,
          has_components: !!lastComponentEdit,
        };
      })
    );

    const total = await Content.count({ where });

    return {
      items: contentsWithEditInfo,
      total,
      limit,
      offset,
    };
  }

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
      status: 'P',
      published_at: new Date(),
    } as any);
  }

  async unpublish(id: string): Promise<Content | null> {
    return await this.update(id, {
      status: 'D',
      published_at: null,
    } as any);
  }

  async getPublished(options: FindOptions & PaginationOptions) {
    return await this.list({
      ...options,
      where: {
        ...options.where,
        status: 'P',
      },
      include: [
        { model: Category, as: 'categories' },
        { model: User, as: 'creator', attributes: ['user_id', 'display_name'] },
        { model: Media, as: 'cover' },
      ],
    });
  }

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
