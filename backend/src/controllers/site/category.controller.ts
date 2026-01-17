import { Request, Response } from 'express'
import { categoryService } from '../../services/category.service.js'

export class CategoryController {
  async getCategories(req: Request, res: Response) {
    try {
      const {
        type,
        status,
        search,
        created_by,
        updated_by,
        created_from,
        created_to,
        updated_from,
        updated_to,
        limit,
        offset,
      } = req.query

      const result = await categoryService.getAllCategories({
        type: type as string,
        status:
          status === 'true' ? true : status === 'false' ? false : undefined,
        search: search as string,
        created_by: created_by as string,
        updated_by: updated_by as string,
        created_from: created_from as string,
        created_to: created_to as string,
        updated_from: updated_from as string,
        updated_to: updated_to as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      })

      res.json(result)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }

  async getCategoryTree(req: Request, res: Response) {
    try {
      const { type } = req.query
      const tree = await categoryService.getCategoryTree(type as string)
      res.json(tree)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }

  async getCategory(req: Request, res: Response) {
    try {
      const { id } = req.params
      const category = await categoryService.getCategoryById(id)
      res.json(category)
    } catch (error: any) {
      res.status(404).json({ error: error.message })
    }
  }

  async getCategoryBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params
      const category = await categoryService.getCategoryBySlug(slug)
      res.json(category)
    } catch (error: any) {
      res.status(404).json({ error: error.message })
    }
  }

  async createCategory(req: Request, res: Response) {
    try {
      const { type, display_name, slug, path, status } = req.body

      if (!display_name || !slug) {
        return res
          .status(400)
          .json({ error: 'display_name and slug are required' })
      }

      const userId = (req as any).user?.user_id

      const category = await categoryService.createCategory({
        type,
        display_name,
        slug,
        path,
        status,
        created_by: userId,
      })

      res.status(201).json(category)
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }

  async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { type, display_name, slug, path, status } = req.body

      const userId = (req as any).user?.user_id

      const category = await categoryService.updateCategory(id, {
        type,
        display_name,
        slug,
        path,
        status,
        updated_by: userId,
      })

      res.json(category)
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }

  async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params
      const result = await categoryService.deleteCategory(id)
      res.json(result)
    } catch (error: any) {
      res.status(404).json({ error: error.message })
    }
  }

  async getContentsByCategory(req: Request, res: Response) {
    try {
      const { id } = req.params
      const includeInactive = req.query.include_inactive === 'true'

      const category = await categoryService.getContentsByCategory(
        id,
        includeInactive
      )
      res.json(category)
    } catch (error: any) {
      res.status(404).json({ error: error.message })
    }
  }

  async getCategoriesByContent(req: Request, res: Response) {
    try {
      const { contentId } = req.params
      const content = await categoryService.getCategoriesByContent(contentId)
      res.json(content.categories || [])
    } catch (error: any) {
      res.status(404).json({ error: error.message })
    }
  }

  async assignCategoriesToContent(req: Request, res: Response) {
    try {
      const { contentId } = req.params
      const { category_ids } = req.body

      if (!Array.isArray(category_ids)) {
        return res.status(400).json({ error: 'category_ids must be an array' })
      }

      const content = await categoryService.assignCategoriesToContent(
        contentId,
        category_ids
      )
      res.json(content.categories || [])
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }

  async removeCategoryFromContent(req: Request, res: Response) {
    try {
      const { contentId, categoryId } = req.params
      const result = await categoryService.removeCategoryFromContent(
        contentId,
        categoryId
      )
      res.json(result)
    } catch (error: any) {
      res.status(404).json({ error: error.message })
    }
  }
}

export const categoryController = new CategoryController()
