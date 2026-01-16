import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
    GripVertical,
    ChevronRight,
    ChevronDown,
    Eye,
    EyeOff,
    Edit,
    Copy,
    Trash2,
    Plus,
    FileText,
} from 'lucide-react'

interface MenuItem {
    menu_item_id: string
    label: string
    content_id?: string
    parent_id?: string
    status: boolean
    content?: {
        title: string
        slug: string
    }
    children?: MenuItem[]
}

interface MenuItemComponentProps {
    item: MenuItem
    menuId: string
    level: number
    onEdit: (item: MenuItem) => void
    onDelete: (itemId: string) => void
    onToggle: (itemId: string) => void
    onDuplicate: (itemId: string) => void
    onAddChild: (parentId: string) => void
}

export default function MenuItemComponent({
    item,
    menuId,
    level,
    onEdit,
    onDelete,
    onToggle,
    onDuplicate,
    onAddChild,
}: MenuItemComponentProps) {
    const [expanded, setExpanded] = useState(true)
    const hasChildren = item.children && item.children.length > 0

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: item.menu_item_id,
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    const indentClass = level === 0 ? '' : `ml-${Math.min(level * 8, 16)}`

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                className={`group bg-white dark:bg-gray-800 border-2 rounded-lg transition-all ${
                    item.status
                        ? 'border-gray-200 dark:border-gray-700 hover:border-primary'
                        : 'border-yellow-300 dark:border-yellow-600 opacity-60'
                } ${isDragging ? 'shadow-2xl z-50' : 'hover:shadow-lg'} ${indentClass}`}
            >
                {!item.status && (
                    <div className="absolute -top-3 left-4 bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded text-xs font-medium text-yellow-800 dark:text-yellow-200">
                        Inactive
                    </div>
                )}

                <div className="flex items-center gap-2 p-3">
                    {hasChildren && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                            {expanded ? (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                                <ChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                        </button>
                    )}

                    <button
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                        <GripVertical className="w-4 h-4 text-gray-400" />
                    </button>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white truncate">
                                {item.label}
                            </span>
                            {item.content && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                    <FileText className="w-3 h-3" />
                                    <span className="truncate">
                                        → {item.content.slug}
                                    </span>
                                </div>
                            )}
                        </div>
                        {hasChildren && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {item.children!.length} child item
                                {item.children!.length !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {level < 2 && (
                            <button
                                onClick={() => onAddChild(item.menu_item_id)}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                title="Add child"
                            >
                                <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                        )}

                        <button
                            onClick={() => onToggle(item.menu_item_id)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            title={item.status ? 'Hide' : 'Show'}
                        >
                            {item.status ? (
                                <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            ) : (
                                <EyeOff className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            )}
                        </button>

                        <button
                            onClick={() => onEdit(item)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            title="Edit"
                        >
                            <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>

                        <button
                            onClick={() => onDuplicate(item.menu_item_id)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            title="Duplicate"
                        >
                            <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>

                        <button
                            onClick={() => onDelete(item.menu_item_id)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                    </div>
                </div>
            </div>

            {hasChildren && expanded && (
                <div className="mt-2 ml-8 space-y-2">
                    {item.children!.map((child) => (
                        <MenuItemComponent
                            key={child.menu_item_id}
                            item={child}
                            menuId={menuId}
                            level={level + 1}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onToggle={onToggle}
                            onDuplicate={onDuplicate}
                            onAddChild={onAddChild}
                        />
                    ))}
                </div>
            )}
        </>
    )
}
