import { Category } from '../models/category.model.js'
import { Content } from '../models/content.model.js'
import { ContentCategory } from '../models/contentCategory.model.js'
import { User } from '../models/user.model.js'
import { Op } from 'sequelize'

export class CategoryService {
  async getAllCategories(filters?: {
    type?: string
    status?: boolean
    search?: string
    created_by?: string
    updated_by?: string
    created_from?: string
    created_to?: string
    updated_from?: string
    updated_to?: string
    limit?: number
    offset?: number
  }) {
    const where: any = {}

    if (filters?.type) {
      where.type = filters.type
    }

    if (filters?.status !== undefined) {
      where.status = filters.status
    }

    if (filters?.search) {
      where[Op.or] = [
        { display_name: { [Op.iLike]: `%${filters.search}%` } },
        { slug: { [Op.iLike]: `%${filters.search}%` } },
      ]
    }

    if (filters?.created_by) {
      where.created_by = filters.created_by
    }

    if (filters?.updated_by) {
      where.updated_by = filters.updated_by
    }

    if (filters?.created_from || filters?.created_to) {
      where.created_at = {}
      if (filters.created_from) {
        where.created_at[Op.gte] = new Date(filters.created_from)
      }
      if (filters.created_to) {
        const toDate = new Date(filters.created_to)
        toDate.setHours(23, 59, 59, 999)
        where.created_at[Op.lte] = toDate
      }
    }

    if (filters?.updated_from || filters?.updated_to) {
      where.updated_at = {}
      if (filters.updated_from) {
        where.updated_at[Op.gte] = new Date(filters.updated_from)
      }
      if (filters.updated_to) {
        const toDate = new Date(filters.updated_to)
        toDate.setHours(23, 59, 59, 999)
        where.updated_at[Op.lte] = toDate
      }
    }

    const limit = filters?.limit || 20
    const offset = filters?.offset || 0

    const { count, rows } = await Category.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['user_id', 'display_name', 'email'],
          required: false,
        },
        {
          model: User,
          as: 'updater',
          attributes: ['user_id', 'display_name', 'email'],
          required: false,
        },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    })

    return { items: rows, total: count }
  }

  async getCategoryById(categoryId: string) {
    const category = await Category.findByPk(categoryId, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['user_id', 'display_name', 'email'],
          required: false,
        },
        {
          model: User,
          as: 'updater',
          attributes: ['user_id', 'display_name', 'email'],
          required: false,
        },
      ],
    })
    if (!category) {
      throw new Error('Category not found')
    }
    return category
  }

  async getCategoryBySlug(slug: string) {
    const category = await Category.findOne({ where: { slug } })
    if (!category) {
      throw new Error('Category not found')
    }
    return category
  }

  async createCategory(data: {
    type?: string
    display_name: string
    slug: string
    path?: string
    status?: boolean
    created_by?: string
  }) {
    const existing = await Category.findOne({ where: { slug: data.slug } })
    if (existing) {
      throw new Error('Category with this slug already exists')
    }

    const category = await Category.create({
      ...data,
    })

    return await this.getCategoryById(category.category_id)
  }

  async updateCategory(
    categoryId: string,
    updates: {
      type?: string
      display_name?: string
      slug?: string
      path?: string
      status?: boolean
      updated_by?: string
    }
  ) {
    const category = await this.getCategoryById(categoryId)

    if (updates.slug && updates.slug !== category.slug) {
      const existing = await Category.findOne({
        where: { slug: updates.slug },
      })
      if (existing) {
        throw new Error('Category with this slug already exists')
      }
    }

    await category.update(updates)
    return await this.getCategoryById(categoryId)
  }

  async deleteCategory(categoryId: string) {
    const category = await this.getCategoryById(categoryId)
    await category.destroy()
    return { deleted: true, category_id: categoryId }
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
    })

    if (!category) {
      throw new Error('Category not found')
    }

    return category
  }

  async getCategoriesByContent(contentId: string) {
    const content = await Content.findByPk(contentId, {
      include: [
        {
          association: 'categories',
        },
      ],
    })

    if (!content) {
      throw new Error('Content not found')
    }

    return content
  }

  async assignCategoriesToContent(contentId: string, categoryIds: string[]) {
    const content = await Content.findByPk(contentId)
    if (!content) {
      throw new Error('Content not found')
    }

    const categories = await Category.findAll({
      where: { category_id: { [Op.in]: categoryIds } },
    })

    if (categories.length !== categoryIds.length) {
      throw new Error('Some categories not found')
    }

    await ContentCategory.destroy({
      where: { content_id: contentId },
    })

    const associations = categoryIds.map((categoryId) => ({
      content_id: contentId,
      category_id: categoryId,
    }))

    await ContentCategory.bulkCreate(associations)

    return await this.getCategoriesByContent(contentId)
  }

  async removeCategoryFromContent(contentId: string, categoryId: string) {
    await ContentCategory.destroy({
      where: {
        content_id: contentId,
        category_id: categoryId,
      },
    })

    return { removed: true, content_id: contentId, category_id: categoryId }
  }

  async getCategoryTree(type?: string) {
    const where: any = { status: true }
    if (type) {
      where.type = type
    }

    const categories = await Category.findAll({
      where,
      order: [
        ['path', 'ASC'],
        ['display_name', 'ASC'],
      ],
    })

    const tree: any[] = []
    const map = new Map()

    categories.forEach((cat) => {
      const catObj = cat.toJSON()
      map.set(catObj.category_id, { ...catObj, children: [] })
    })

    categories.forEach((cat) => {
      const catObj = cat.toJSON()
      if (!catObj.path || catObj.path === '/') {
        tree.push(map.get(catObj.category_id))
      } else {
        const parentPath = catObj.path.split('/').slice(0, -1).join('/') || '/'
        const parent = Array.from(map.values()).find(
          (c: any) => c.path === parentPath
        )
        if (parent) {
          parent.children.push(map.get(catObj.category_id))
        } else {
          tree.push(map.get(catObj.category_id))
        }
      }
    })

    return tree
  }
}

export const categoryService = new CategoryService()
