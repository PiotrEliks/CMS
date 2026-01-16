import { useEffect, useState } from 'react'
import { DndContext, type DragEndEvent, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import Button from '../../ui/button/Button'
import MenuItemComponent from './MenuItemComponent'
import MenuItemEditModal from './MenuItemModal'
import { api } from '../../../api/axios'

interface MenuItem {
  menu_item_id: string
  menu_id: string
  label: string
  content_id?: string
  parent_id?: string
  order_index: number
  status: boolean
  content?: {
    content_id: string
    title: string
    slug: string
  }
  children?: MenuItem[]
}

interface MenuBuilderProps {
  menuId: string
}

export default function MenuBuilder({ menuId }: MenuBuilderProps) {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)

  useEffect(() => {
    if (menuId) {
      fetchMenuItems()
    }
  }, [menuId])

  const fetchMenuItems = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/menus/${menuId}/items`, {
        params: { include_inactive: 'true' },
      })
      setItems(buildHierarchy(res.data.items || []))
    } catch (error) {
      console.error('Failed to fetch menu items:', error)
    } finally {
      setLoading(false)
    }
  }

  const buildHierarchy = (flatItems: MenuItem[]): MenuItem[] => {
    const itemMap = new Map<string, MenuItem>()
    const rootItems: MenuItem[] = []

    flatItems.forEach((item) => {
      itemMap.set(item.menu_item_id, { ...item, children: [] })
    })

    flatItems.forEach((item) => {
      const menuItem = itemMap.get(item.menu_item_id)!
      if (item.parent_id) {
        const parent = itemMap.get(item.parent_id)
        if (parent) {
          parent.children = parent.children || []
          parent.children.push(menuItem)
        } else {
          rootItems.push(menuItem)
        }
      } else {
        rootItems.push(menuItem)
      }
    })

    const sortItems = (items: MenuItem[]) => {
      items.sort((a, b) => a.order_index - b.order_index)
      items.forEach((item) => {
        if (item.children && item.children.length > 0) {
          sortItems(item.children)
        }
      })
    }

    sortItems(rootItems)
    return rootItems
  }

  const handleAddItem = (parentId?: string) => {
    const newItem: Partial<MenuItem> = {
      menu_id: menuId,
      label: '',
      parent_id: parentId,
      status: true,
    }
    setSelectedItem(newItem as MenuItem)
    setEditModalOpen(true)
  }

  const handleEdit = (item: MenuItem) => {
    setSelectedItem(item)
    setEditModalOpen(true)
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Usunąć tę pozycję menu i wszystkie jej podpozycje?')) return

    try {
      await api.delete(`/menu-items/${itemId}`)
      fetchMenuItems()
    } catch (error) {
      console.error('Failed to delete menu item:', error)
    }
  }

  const handleToggle = async (itemId: string) => {
    try {
      await api.patch(`/menu-items/${itemId}/toggle`)
      fetchMenuItems()
    } catch (error) {
      console.error('Failed to toggle menu item:', error)
    }
  }

  const handleDuplicate = async (itemId: string) => {
    try {
      await api.post(`/menu-items/${itemId}/duplicate`)
      fetchMenuItems()
    } catch (error) {
      console.error('Failed to duplicate menu item:', error)
    }
  }

  const flattenForDnd = (items: MenuItem[]): string[] => {
    const ids: string[] = []
    const flatten = (items: MenuItem[]) => {
      items.forEach((item) => {
        ids.push(item.menu_item_id)
        if (item.children && item.children.length > 0) {
          flatten(item.children)
        }
      })
    }
    flatten(items)
    return ids
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((item) => item.menu_item_id === active.id)
    const newIndex = items.findIndex((item) => item.menu_item_id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const reordered = [...items]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)

    const itemIds = reordered.map((item) => item.menu_item_id)

    try {
      await api.post(`/menus/${menuId}/items/reorder`, {
        item_ids: itemIds,
      })
      fetchMenuItems()
    } catch (error) {
      console.error('Failed to reorder:', error)
      fetchMenuItems()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {items.length}{' '}
            {(() => {
              const n = items.length
              if (n === 1) return 'pozycja na najwyższym poziomie'
              const nMod10 = n % 10
              const nMod100 = n % 100
              if (
                nMod10 >= 2 &&
                nMod10 <= 4 &&
                !(nMod100 >= 12 && nMod100 <= 14)
              )
                return 'pozycje na najwyższym poziomie'
              return 'pozycji na najwyższym poziomie'
            })()}
          </p>
          <Button
            variant="primary"
            size="sm"
            startIcon={<Plus />}
            onClick={() => handleAddItem()}
          >
            Dodaj pozycję menu
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <Plus className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Brak pozycji menu. Dodaj pierwszą pozycję, aby rozpocząć.
            </p>
            <Button variant="primary" onClick={() => handleAddItem()}>
              Dodaj pozycję menu
            </Button>
          </div>
        ) : (
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={flattenForDnd(items)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {items.map((item) => (
                  <MenuItemComponent
                    key={item.menu_item_id}
                    item={item}
                    menuId={menuId}
                    level={0}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                    onDuplicate={handleDuplicate}
                    onAddChild={handleAddItem}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {selectedItem && (
        <MenuItemEditModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setSelectedItem(null)
          }}
          item={selectedItem}
          menuId={menuId}
          onSuccess={fetchMenuItems}
        />
      )}
    </>
  )
}
