import { Content } from '../models/content.model.js';
import { ContentSection } from '../models/contentSection.model.js';
import { PageComponent } from '../models/pageComponent.model.js';
import { Category } from '../models/category.model.js';
import { Media } from '../models/media.model.js';
import { Menu } from '../models/menu.model.js';
import { MenuItem } from '../models/menuItem.model.js';
import { Op } from 'sequelize';

export class PublicApiService {
  async getContentBySlug(slug: string) {
    const content = await Content.findOne({
      where: {
        slug,
        status: 'P',
      },
      include: [
        {
          model: Media,
          as: 'cover',
          attributes: ['media_id', 'storage_path', 'alt_text', 'title'],
        },
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] },
          where: { status: true },
          required: false,
        },
      ],
    });

    if (!content) {
      throw new Error('Content not found');
    }

    return content;
  }

  async getContentWithSections(slug: string) {
    const content = await this.getContentBySlug(slug);

    const sections = await ContentSection.findAll({
      where: {
        content_id: content.content_id,
        status: true,
      },
      order: [['order_index', 'ASC']],
    });

    return {
      ...content.toJSON(),
      sections,
    };
  }

  async getContentWithComponents(slug: string) {
    const content = await this.getContentBySlug(slug);

    const components = await PageComponent.findAll({
      where: {
        content_id: content.content_id,
        status: true,
      },
      order: [['order_index', 'ASC']],
    });

    return {
      ...content.toJSON(),
      components,
    };
  }

  async getContentFull(slug: string) {
    const content = await this.getContentBySlug(slug);

    const [sections, components] = await Promise.all([
      ContentSection.findAll({
        where: { content_id: content.content_id, status: true },
        order: [['order_index', 'ASC']],
      }),
      PageComponent.findAll({
        where: { content_id: content.content_id, status: true },
        order: [['order_index', 'ASC']],
      }),
    ]);

    return {
      ...content.toJSON(),
      sections,
      components,
    };
  }

  async getPublishedContents(filters?: {
    type?: string;
    category_slug?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = { status: 'P' };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${filters.search}%` } },
        { lead: { [Op.iLike]: `%${filters.search}%` } },
        { body: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    const include: any[] = [
      {
        model: Media,
        as: 'cover',
        attributes: ['media_id', 'storage_path', 'alt_text', 'title'],
      },
      {
        model: Category,
        as: 'categories',
        through: { attributes: [] },
        where: { status: true },
        required: false,
      },
    ];

    if (filters?.category_slug) {
      include[1].where = { slug: filters.category_slug, status: true };
      include[1].required = true;
    }

    const { count, rows } = await Content.findAndCountAll({
      where,
      include,
      limit: filters?.limit || 10,
      offset: filters?.offset || 0,
      order: [['published_at', 'DESC']],
      distinct: true,
    });

    return {
      items: rows,
      total: count,
      limit: filters?.limit || 10,
      offset: filters?.offset || 0,
    };
  }

  async getMenuByCode(code: string) {
    const menu = await Menu.findOne({
      where: { code, status: true },
      include: [
        {
          model: MenuItem,
          as: 'items',
          where: { status: true, parent_id: null },
          required: false,
          include: [
            {
              model: Content,
              as: 'content',
              attributes: ['content_id', 'title', 'slug', 'type'],
              where: { status: 'P' },
              required: false,
            },
            {
              model: MenuItem,
              as: 'children',
              where: { status: true },
              required: false,
              include: [
                {
                  model: Content,
                  as: 'content',
                  attributes: ['content_id', 'title', 'slug', 'type'],
                  where: { status: 'P' },
                  required: false,
                },
                {
                  model: MenuItem,
                  as: 'children',
                  where: { status: true },
                  required: false,
                  include: [
                    {
                      model: Content,
                      as: 'content',
                      attributes: ['content_id', 'title', 'slug', 'type'],
                      where: { status: 'P' },
                      required: false,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      order: [
        [{ model: MenuItem, as: 'items' }, 'order_index', 'ASC'],
        [
          { model: MenuItem, as: 'items' },
          { model: MenuItem, as: 'children' },
          'order_index',
          'ASC',
        ],
        [
          { model: MenuItem, as: 'items' },
          { model: MenuItem, as: 'children' },
          { model: MenuItem, as: 'children' },
          'order_index',
          'ASC',
        ],
      ],
    });

    if (!menu) {
      throw new Error('Menu not found');
    }

    return menu;
  }

  async getCategoryContents(slug: string, limit = 10, offset = 0) {
    const category = await Category.findOne({
      where: { slug, status: true },
      include: [
        {
          model: Content,
          as: 'contents',
          through: { attributes: [] },
          where: { status: 'P' },
          include: [
            {
              model: Media,
              as: 'cover',
              attributes: ['media_id', 'storage_path', 'alt_text', 'title'],
            },
          ],
          limit,
          offset,
        },
      ],
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }

  async getActiveCategories(type?: string) {
    const where: any = { status: true };
    if (type) {
      where.type = type;
    }

    return await Category.findAll({
      where,
      order: [['display_name', 'ASC']],
    });
  }

  async searchContents(query: string, limit = 10, offset = 0) {
    return await this.getPublishedContents({
      search: query,
      limit,
      offset,
    });
  }

  async getRelatedContents(contentId: string, limit = 5) {
    const content = await Content.findByPk(contentId, {
      include: [
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] },
        },
      ],
    });

    if (!content || !content.categories || content.categories.length === 0) {
      return [];
    }

    const categoryIds = content.categories.map((c) => c.category_id);

    const related = await Content.findAll({
      where: {
        status: 'P',
        content_id: { [Op.ne]: contentId },
      },
      include: [
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] },
          where: {
            category_id: { [Op.in]: categoryIds },
          },
        },
        {
          model: Media,
          as: 'cover',
          attributes: ['media_id', 'storage_path', 'alt_text', 'title'],
        },
      ],
      limit,
      distinct: true,
      order: [['published_at', 'DESC']],
    });

    return related;
  }

  async getHomepage() {
    const homepage = await Content.findOne({
      where: {
        status: 'P',
        [Op.or]: [{ slug: 'home' }, { slug: 'homepage' }, { type: 'homepage' }],
      },
      include: [
        {
          model: Media,
          as: 'cover',
        },
      ],
    });

    if (!homepage) {
      throw new Error('Homepage not found');
    }

    const [sections, components] = await Promise.all([
      ContentSection.findAll({
        where: { content_id: homepage.content_id, status: true },
        order: [['order_index', 'ASC']],
      }),
      PageComponent.findAll({
        where: { content_id: homepage.content_id, status: true },
        order: [['order_index', 'ASC']],
      }),
    ]);

    return {
      ...homepage.toJSON(),
      sections,
      components,
    };
  }
}

export const publicApiService = new PublicApiService();
