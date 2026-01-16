import { Menu } from '../models/menu.model.js'
import { MenuItem } from '../models/menuItem.model.js'
import { Content } from '../models/content.model.js'
import { Op } from 'sequelize'

export class MenuService {
  private async touchMenu(menuId: string, userId?: string) {
    const updateData: any = { updated_at: new Date() }
    if (userId) {
      updateData.updated_by = userId
    }
    await Menu.update(updateData, { where: { menu_id: menuId } })
  }

  async getAllMenus(filters?: {
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

    if (filters?.status !== undefined) {
      where.status = filters.status
    }

    if (filters?.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${filters.search}%` } },
        { code: { [Op.iLike]: `%${filters.search}%` } },
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

    const include: any[] = []
    try {
      const User = (await import('../models/user.model.js')).User
      if (User) {
        include.push(
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
          }
        )
      }
    } catch (e) {
      console.log('User relations not available for Menu model')
    }

    const { count, rows } = await Menu.findAndCountAll({
      where,
      include: include.length > 0 ? include : undefined,
      order: [['created_at', 'DESC']],
      limit,
      offset,
    })

    return { items: rows, total: count }
  }

  async getMenuById(menuId: string) {
    const include: any[] = []
    try {
      const User = (await import('../models/user.model.js')).User
      if (User) {
        include.push(
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
          }
        )
      }
    } catch (e) {
      console.error('User relations not available for Menu model')
    }

    const menu = await Menu.findByPk(menuId, {
      include: include.length > 0 ? include : undefined,
    })

    if (!menu) {
      throw new Error('Menu not found')
    }
    return menu
  }

  async getMenuByCode(code: string) {
    const menu = await Menu.findOne({ where: { code } })
    if (!menu) {
      throw new Error('Menu not found')
    }
    return menu
  }

  async createMenu(data: {
    code: string
    name: string
    status?: boolean
    created_by?: string
  }) {
    const existing = await Menu.findOne({ where: { code: data.code } })
    if (existing) {
      throw new Error('Menu with this code already exists')
    }

    const menu = await Menu.create({
      ...data,
      updated_by: data.created_by,
    })

    return await this.getMenuById(menu.menu_id)
  }

  async updateMenu(
    menuId: string,
    updates: {
      code?: string
      name?: string
      status?: boolean
      updated_by?: string
    }
  ) {
    const menu = await Menu.findByPk(menuId)
    if (!menu) {
      throw new Error('Menu not found')
    }

    if (updates.code && updates.code !== menu.code) {
      const existing = await Menu.findOne({
        where: { code: updates.code },
      })
      if (existing) {
        throw new Error('Menu with this code already exists')
      }
    }

    await menu.update(updates)
    return await this.getMenuById(menuId)
  }

  async deleteMenu(menuId: string) {
    const menu = await Menu.findByPk(menuId)
    if (!menu) {
      throw new Error('Menu not found')
    }
    await menu.destroy()
    return { deleted: true, menu_id: menuId }
  }

  async getMenuWithItems(menuId: string, includeInactive = false) {
    const menu = await Menu.findByPk(menuId, {
      include: [
        {
          model: MenuItem,
          as: 'items',
          where: includeInactive ? undefined : { status: true },
          required: false,
          include: [
            {
              model: Content,
              as: 'content',
              attributes: ['content_id', 'title', 'slug'],
            },
            {
              model: MenuItem,
              as: 'children',
              required: false,
              include: [
                {
                  model: Content,
                  as: 'content',
                  attributes: ['content_id', 'title', 'slug'],
                },
              ],
            },
          ],
        },
      ],
      order: [[{ model: MenuItem, as: 'items' }, 'order_index', 'ASC']],
    })

    if (!menu) {
      throw new Error('Menu not found')
    }

    return menu
  }

  async getMenuByCodeWithItems(code: string, includeInactive = false) {
    const menu = await Menu.findOne({
      where: { code },
      include: [
        {
          model: MenuItem,
          as: 'items',
          where: includeInactive
            ? undefined
            : { status: true, parent_id: null },
          required: false,
          include: [
            {
              model: Content,
              as: 'content',
              attributes: ['content_id', 'title', 'slug'],
            },
            {
              model: MenuItem,
              as: 'children',
              where: includeInactive ? undefined : { status: true },
              required: false,
              include: [
                {
                  model: Content,
                  as: 'content',
                  attributes: ['content_id', 'title', 'slug'],
                },
                {
                  model: MenuItem,
                  as: 'children',
                  where: includeInactive ? undefined : { status: true },
                  required: false,
                  include: [
                    {
                      model: Content,
                      as: 'content',
                      attributes: ['content_id', 'title', 'slug'],
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
      ],
    })

    if (!menu) {
      throw new Error('Menu not found')
    }

    return menu
  }

  async createMenuItem(data: {
    menu_id: string
    label: string
    content_id?: string
    external_url?: string
    parent_id?: string
    order_index?: number
    status?: boolean
    user_id?: string
  }) {
    await this.getMenuById(data.menu_id)

    if (data.content_id && data.external_url) {
      throw new Error('Menu item cannot have both content_id and external_url')
    }

    if (data.parent_id) {
      const parent = await MenuItem.findByPk(data.parent_id)
      if (!parent) {
        throw new Error('Parent menu item not found')
      }
    }

    if (data.content_id) {
      const content = await Content.findByPk(data.content_id)
      if (!content) {
        throw new Error('Content not found')
      }
    }

    if (data.external_url) {
      if (!data.external_url.match(/^https?:\/\/.+/)) {
        throw new Error('External URL must start with http:// or https://')
      }
    }

    if (data.order_index === undefined) {
      const lastItem = await MenuItem.findOne({
        where: {
          menu_id: data.menu_id,
          parent_id: data.parent_id || null,
        },
        order: [['order_index', 'DESC']],
      })
      data.order_index = lastItem ? lastItem.order_index + 1 : 0
    }

    const createData: any = {
      menu_id: data.menu_id,
      label: data.label,
      content_id: data.content_id ?? null,
      external_url: data.external_url ?? null,
      parent_id: data.parent_id || null,
      order_index: data.order_index,
      status: data.status ?? true,
    }

    const menuItem = await MenuItem.create(createData)

    await this.touchMenu(data.menu_id, data.user_id)

    return menuItem
  }

  async updateMenuItem(
    menuItemId: string,
    updates: {
      label?: string
      content_id?: string | null
      external_url?: string | null
      parent_id?: string
      order_index?: number
      status?: boolean
      user_id?: string
    }
  ) {
    const menuItem = await MenuItem.findByPk(menuItemId)
    if (!menuItem) {
      throw new Error('Menu item not found')
    }

    const newContentId =
      updates.content_id !== undefined
        ? updates.content_id
        : menuItem.content_id
    const newExternalUrl =
      updates.external_url !== undefined
        ? updates.external_url
        : menuItem.external_url

    if (newContentId && newExternalUrl) {
      throw new Error('Menu item cannot have both content_id and external_url')
    }

    if (updates.content_id) {
      const content = await Content.findByPk(updates.content_id)
      if (!content) {
        throw new Error('Content not found')
      }
    }

    if (updates.external_url) {
      if (!updates.external_url.match(/^https?:\/\/.+/)) {
        throw new Error('External URL must start with http:// or https://')
      }
    }

    if (updates.parent_id) {
      if (updates.parent_id === menuItemId) {
        throw new Error('Menu item cannot be its own parent')
      }
      const parent = await MenuItem.findByPk(updates.parent_id)
      if (!parent) {
        throw new Error('Parent menu item not found')
      }
    }

    const updateData: any = {}

    if (updates.label !== undefined) updateData.label = updates.label
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.order_index !== undefined)
      updateData.order_index = updates.order_index
    if (updates.parent_id !== undefined)
      updateData.parent_id = updates.parent_id

    if (updates.content_id !== undefined) {
      updateData.content_id = updates.content_id
    }
    if (updates.external_url !== undefined) {
      updateData.external_url = updates.external_url
    }

    console.log(
      '[MenuService] Updating menu item:',
      menuItemId,
      'with:',
      updateData
    )

    await menuItem.update(updateData)

    await this.touchMenu(menuItem.menu_id, updates.user_id)

    return menuItem
  }

  async deleteMenuItem(menuItemId: string, userId?: string) {
    const menuItem = await MenuItem.findByPk(menuItemId)
    if (!menuItem) {
      throw new Error('Menu item not found')
    }

    const menuId = menuItem.menu_id
    await menuItem.destroy()

    await this.touchMenu(menuId, userId)

    return { deleted: true, menu_item_id: menuItemId }
  }

  async reorderMenuItems(menuId: string, itemIds: string[], userId?: string) {
    const items = await MenuItem.findAll({
      where: {
        menu_id: menuId,
        menu_item_id: { [Op.in]: itemIds },
      },
    })

    if (items.length !== itemIds.length) {
      throw new Error('Some menu items not found')
    }

    const updates = itemIds.map((id, index) =>
      MenuItem.update({ order_index: index }, { where: { menu_item_id: id } })
    )

    await Promise.all(updates)

    await this.touchMenu(menuId, userId)

    return await this.getMenuWithItems(menuId)
  }

  async duplicateMenuItem(menuItemId: string, userId?: string) {
    const original = await MenuItem.findByPk(menuItemId)
    if (!original) {
      throw new Error('Menu item not found')
    }

    const duplicate = await MenuItem.create({
      menu_id: original.menu_id,
      label: `${original.label} (copy)`,
      content_id: original.content_id,
      external_url: original.external_url,
      parent_id: original.parent_id,
      order_index: original.order_index + 1,
      status: original.status,
    })

    await MenuItem.update(
      { order_index: MenuItem.sequelize!.literal('order_index + 1') },
      {
        where: {
          menu_id: original.menu_id,
          parent_id: original.parent_id || null,
          order_index: { [Op.gt]: original.order_index },
          menu_item_id: { [Op.ne]: duplicate.menu_item_id },
        },
      }
    )

    await this.touchMenu(original.menu_id, userId)

    return duplicate
  }

  async toggleMenuItemStatus(menuItemId: string, userId?: string) {
    const menuItem = await MenuItem.findByPk(menuItemId)
    if (!menuItem) {
      throw new Error('Menu item not found')
    }
    await menuItem.update({ status: !menuItem.status })

    await this.touchMenu(menuItem.menu_id, userId)

    return menuItem
  }
}

export const menuService = new MenuService()
