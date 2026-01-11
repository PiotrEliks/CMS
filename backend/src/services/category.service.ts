import { Category } from '../models/category.model.js';
import { Content } from '../models/content.model.js';
import { ContentCategory } from '../models/contentCategory.model.js';
import { Op } from 'sequelize';

export class CategoryService {
  async getAllCategories(filters?: { type?: string; status?: boolean; search?: string }) {
    const where: any = {};

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.status !== undefined) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where[Op.or] = [
        { display_name: { [Op.iLike]: `%${filters.search}%` } },
        { slug: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    return await Category.findAll({
      where,
      order: [['display_name', 'ASC']],
    });
  }

  async getCategoryById(categoryId: string) {
    const category = await Category.findByPk(categoryId);
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }

  async getCategoryBySlug(slug: string) {
    const category = await Category.findOne({ where: { slug } });
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }

  async createCategory(data: {
    type?: string;
    display_name: string;
    slug: string;
    path?: string;
    status?: boolean;
  }) {
    const existing = await Category.findOne({ where: { slug: data.slug } });
    if (existing) {
      throw new Error('Category with this slug already exists');
    }

    return await Category.create(data);
  }

  async updateCategory(
    categoryId: string,
    updates: {
      type?: string;
      display_name?: string;
      slug?: string;
      path?: string;
      status?: boolean;
    }
  ) {
    const category = await this.getCategoryById(categoryId);

    if (updates.slug && updates.slug !== category.slug) {
      const existing = await Category.findOne({ where: { slug: updates.slug } });
      if (existing) {
        throw new Error('Category with this slug already exists');
      }
    }

    await category.update(updates);
    return category;
  }

  async deleteCategory(categoryId: string) {
    const category = await this.getCategoryById(categoryId);
    await category.destroy();
    return { deleted: true, category_id: categoryId };
  }

  async getContentsByCategory(categoryId: string, includeInactive = false) {
    const category = await Category.findByPk(categoryId, {
      include: [
        {
          association: 'contents',
          where: includeInactive ? undefined : { status: 'P' },
          required: false,
        },
      ],
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }

  async getCategoriesByContent(contentId: string) {
    const content = await Content.findByPk(contentId, {
      include: [
        {
          association: 'categories',
        },
      ],
    });

    if (!content) {
      throw new Error('Content not found');
    }

    return content;
  }

  async assignCategoriesToContent(contentId: string, categoryIds: string[]) {
    const content = await Content.findByPk(contentId);
    if (!content) {
      throw new Error('Content not found');
    }

    const categories = await Category.findAll({
      where: { category_id: { [Op.in]: categoryIds } },
    });

    if (categories.length !== categoryIds.length) {
      throw new Error('Some categories not found');
    }

    await ContentCategory.destroy({
      where: { content_id: contentId },
    });

    const associations = categoryIds.map((categoryId) => ({
      content_id: contentId,
      category_id: categoryId,
    }));

    await ContentCategory.bulkCreate(associations);

    return await this.getCategoriesByContent(contentId);
  }

  async removeCategoryFromContent(contentId: string, categoryId: string) {
    await ContentCategory.destroy({
      where: {
        content_id: contentId,
        category_id: categoryId,
      },
    });

    return { removed: true, content_id: contentId, category_id: categoryId };
  }

  async getCategoryTree(type?: string) {
    const where: any = { status: true };
    if (type) {
      where.type = type;
    }

    const categories = await Category.findAll({
      where,
      order: [
        ['path', 'ASC'],
        ['display_name', 'ASC'],
      ],
    });

    const tree: any[] = [];
    const map = new Map();

    categories.forEach((cat) => {
      const catObj = cat.toJSON();
      map.set(catObj.category_id, { ...catObj, children: [] });
    });

    categories.forEach((cat) => {
      const catObj = cat.toJSON();
      if (!catObj.path || catObj.path === '/') {
        tree.push(map.get(catObj.category_id));
      } else {
        const parentPath = catObj.path.split('/').slice(0, -1).join('/') || '/';
        const parent = Array.from(map.values()).find((c: any) => c.path === parentPath);
        if (parent) {
          parent.children.push(map.get(catObj.category_id));
        } else {
          tree.push(map.get(catObj.category_id));
        }
      }
    });

    return tree;
  }
}

export const categoryService = new CategoryService();
