import { Op } from 'sequelize';
import { Category, Content, ContentCategory } from '../models/index.js';
import { BaseService } from './types/BaseService.js';
import { ISluggable } from './types/ISluggable.js';
import { IAttachable } from './types/IAttachable.js';
import { FindOptions, PaginationOptions } from './types/IRepository.js';
import { stringToSlug, makeSlugUnique } from '../utils/slugger.js';

export class CategoryService extends BaseService<Category> implements ISluggable, IAttachable {
  constructor() {
    super(Category);
  }

  /**
   * Create new category with slug generation
   */
  async create(data: {
    name: string;
    description?: string;
    slug?: string;
    order_index?: number;
  }) {
    // Generate slug if not provided
    let slug = data.slug || stringToSlug(data.name);

    // Ensure slug uniqueness
    slug = await makeSlugUnique(slug, async (s) => {
      const existing = await Category.findOne({ where: { slug: s } });
      return !!existing;
    });

    return await super.create({
      ...data,
      slug,
      order_index: data.order_index || 0,
    } as any);
  }

  /**
   * Get category by slug
   */
  async getBySlug(slug: string) {
    return await this.findOne({
      where: { slug },
      include: [
        {
          model: Content,
          as: 'contents',
          attributes: ['content_id', 'title', 'slug', 'status'],
        },
      ],
    });
  }

  /**
   * Generate slug from name with uniqueness check
   */
  async generateSlug(name: string, existingId?: string | number): Promise<string> {
    let slug = stringToSlug(name);

    slug = await makeSlugUnique(slug, async (s) => {
      const where: any = { slug: s };
      if (existingId) {
        where.category_id = { [Op.ne]: existingId };
      }
      const existing = await Category.findOne({ where });
      return !!existing;
    });

    return slug;
  }

  /**
   * Attach content to category
   */
  async attach(categoryId: string, contentId: string, metadata?: Record<string, any>): Promise<void> {
    const category = await this.findById(categoryId);
    if (!category) throw new Error('Category not found');

    await (category as any).addContent(contentId, { through: metadata });
  }

  /**
   * Detach content from category
   */
  async detach(categoryId: string, contentId: string): Promise<void> {
    const category = await this.findById(categoryId);
    if (!category) throw new Error('Category not found');

    await (category as any).removeContent(contentId);
  }

  /**
   * Get all contents in category
   */
  async getRelated(categoryId: string): Promise<any[]> {
    const category = await this.findById(categoryId);
    if (!category) return [];

    return await (category as any).getContents();
  }

  /**
   * Check if content is in category
   */
  async isAttached(categoryId: string, contentId: string): Promise<boolean> {
    const category = await this.findById(categoryId);
    if (!category) return false;

    const content = await (category as any).hasContent(contentId);
    return !!content;
  }

  /**
   * List categories with content count
   */
  async listWithCounts(options: PaginationOptions & FindOptions) {
    const { limit, offset, ...findOptions } = options;

    const categories = await (Category as any).findAndCountAll({
      ...findOptions,
      limit,
      offset,
      distinct: true,
      include: [
        {
          model: Content,
          as: 'contents',
          attributes: [],
        },
      ],
      subQuery: false,
      raw: false,
    });

    return {
      items: categories.rows,
      total: categories.count,
    };
  }

  /**
   * Reorder categories
   */
  async reorder(items: Array<{ id: string; order_index: number }>) {
    const updates = items.map((item) =>
      this.update(item.id, { order_index: item.order_index } as any)
    );

    await Promise.all(updates);
  }

  /**
   * Get published category by slug with published contents (public API)
   * Exact logic from Piotr's original controller
   */
  async getPublishedBySlug(slug: string) {
    const category = await Category.findOne({
      where: { slug, status: true },
      attributes: ['category_id', 'display_name', 'slug', 'path'],
    });

    if (!category) return null;

    // Get content IDs from junction table (Piotr's original approach)
    const contentLinks = await ContentCategory.findAll({
      where: { category_category_id: (category as any).category_id },
      attributes: ['content_content_id'],
    });
    const ids = contentLinks.map((x: any) => x.content_content_id);

    if (ids.length === 0) {
      return { category, items: [] };
    }

    // Get published contents
    const items = await Content.findAll({
      where: {
        content_id: { [Op.in]: ids },
        status: true,
        published_at: { [Op.lte]: new Date() },
      },
      order: [['published_at', 'DESC']],
      attributes: ['content_id', 'slug', 'title', 'lead', 'published_at'],
    });

    return { category, items };
  }
}

export const categoryService = new CategoryService();
