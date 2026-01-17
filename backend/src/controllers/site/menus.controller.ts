import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { menuService } from '../../services/menu.service.js'
import { buildMenuTree } from '../../utils/buildMenuTree.js'

export const createMenu = asyncHandler(async (req: Request, res: Response) => {
  const { name, description } = req.body

  if (!name) {
    return res.status(400).json({ error: 'Name is required' })
  }

  const menu = await menuService.create({
    name,
    description,
  } as any)

  return res.status(201).json(menu)
})

export const getMenu = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  const menu = await menuService.getMenuWithItems(id)

  if (!menu) {
    return res.status(404).json({ error: 'Menu not found' })
  }

  return res.json(menu)
})

export const getMenuByCode = asyncHandler(
  async (req: Request, res: Response) => {
    const { code } = req.params

    const result = await menuService.getPublishedByCode(code)

    if (!result) {
      return res.status(404).json({ error: 'Menu not found' })
    }

    res.set('Cache-Control', 'public, max-age=60')
    return res.json({
      code: result.code,
      items: buildMenuTree(result.items),
    })
  }
)

export const getMenuById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await menuService.getPublishedById(id);

  if (!result) {
    return res.status(404).json({ error: 'Menu not found' });
  }

  res.set('Cache-Control', 'public, max-age=60');
  return res.json({ menu_id: result.menu_id, code: result.code, name: result.name, items: buildMenuTree(result.items) });
});

export const getMenuTree = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  const menu = await menuService.findById(id)
  if (!menu) {
    return res.status(404).json({ error: 'Menu not found' })
  }

  const tree = await menuService.getTree()

  return res.json(tree)
})

export const listMenus = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
  const offset = parseInt(req.query.offset as string) || 0

  const { items, total } = await menuService.list({
    where: {},
    limit,
    offset,
  })

  return res.json({ items, total, limit, offset })
})

export const updateMenu = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { name, description } = req.body

  const menu = await menuService.update(id, {
    name,
    description,
  } as any)

  if (!menu) {
    return res.status(404).json({ error: 'Menu not found' })
  }

  return res.json(menu)
})

export const addMenuItem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { label, url, parent_id, order_index, content_id } = req.body

  if (!label) {
    return res.status(400).json({ error: 'Label is required' })
  }

  try {
    const item = await menuService.addItem(
      {
        label,
        url,
        order_index,
        menu_id: id,
        parent_id,
        content_id,
      },
      parent_id
    )

    return res.status(201).json(item)
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message })
  }
})

export const updateMenuItem = asyncHandler(
  async (req: Request, res: Response) => {
    const { menuId, itemId } = req.params
    const { label, url, parent_id, order_index, content_id } = req.body

    try {
      const item = await menuService.updateItem(itemId, {
        label,
        url,
        parent_id,
        order_index,
        content_id,
      })

      if (!item) {
        return res.status(404).json({ error: 'Menu item not found' })
      }

      return res.json(item)
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message })
    }
  }
)

export const reorderMenuItems = asyncHandler(
  async (req: Request, res: Response) => {
    const { menuId } = req.params
    const { items } = req.body

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array is required' })
    }

    try {
      const updated = await menuService.reorder(items)
      return res.json({ items: updated })
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message })
    }
  }
)

export const deleteMenuItem = asyncHandler(
  async (req: Request, res: Response) => {
    const { menuId, itemId } = req.params
    const cascadeChildren = req.query.cascadeChildren === 'true'

    try {
      const deleted = await menuService.deleteItem(itemId, cascadeChildren)

      if (!deleted) {
        return res.status(404).json({ error: 'Menu item not found' })
      }

      return res.json({ ok: true })
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message })
    }
  }
)

export const deleteMenu = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  const deleted = await menuService.delete(id)

  if (!deleted) {
    return res.status(404).json({ error: 'Menu not found' })
  }

  return res.json({ ok: true })
})
