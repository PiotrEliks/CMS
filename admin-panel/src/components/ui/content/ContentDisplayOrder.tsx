import { useEffect, useState } from 'react'
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, FileText, Box, EyeOff } from 'lucide-react'
import {
    useContentSections,
    type ContentSection,
} from '../../../store/contentSections'
import {
    usePageComponents,
    type PageComponent,
} from '../../../store/pageComponents'
import { api } from '../../../api/axios'

interface ContentDisplayOrderProps {
    contentId: string
    onEditSection?: (section: ContentSection) => void
    onEditComponent?: (component: PageComponent) => void
}

type DisplayItem = {
    id: string
    type: 'section' | 'component'
    display_order: number
    status: boolean
    title: string
    subtitle?: string
    section?: ContentSection
    component?: PageComponent
}

export default function ContentDisplayOrder({
    contentId,
    onEditSection,
    onEditComponent,
}: ContentDisplayOrderProps) {
    const { sections, fetchSections } = useContentSections()
    const { components, fetchComponents } = usePageComponents()
    const [items, setItems] = useState<DisplayItem[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (contentId) {
            loadAll()
        }
    }, [contentId])

    useEffect(() => {
        const merged: DisplayItem[] = [
            ...sections.map((s) => ({
                id: `section-${s.section_id}`,
                type: 'section' as const,
                display_order: s.display_order ?? s.order_index * 2,
                status: s.status,
                title: getSectionTitle(s),
                subtitle: s.subheading,
                section: s,
            })),
            ...components.map((c) => ({
                id: `component-${c.component_id}`,
                type: 'component' as const,
                display_order: c.display_order ?? c.order_index * 2 + 1,
                status: c.status,
                title: getComponentTitle(c),
                subtitle: getComponentSubtitle(c),
                component: c,
            })),
        ]

        merged.sort((a, b) => a.display_order - b.display_order)
        setItems(merged)
    }, [sections, components])

    const loadAll = async () => {
        setLoading(true)
        try {
            await Promise.all([
                fetchSections(contentId),
                fetchComponents(contentId, true),
            ])
        } catch (error) {
            console.error('Failed to load content:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        if (oldIndex === -1 || newIndex === -1) return

        const reordered = [...items]
        const [moved] = reordered.splice(oldIndex, 1)
        reordered.splice(newIndex, 0, moved)

        const updated = reordered.map((item, index) => ({
            ...item,
            display_order: index,
        }))

        setItems(updated)

        try {
            await saveDisplayOrder(updated)
        } catch (error) {
            console.error('Failed to save order:', error)
            loadAll()
        }
    }

    const saveDisplayOrder = async (orderedItems: DisplayItem[]) => {
        const sectionUpdates = orderedItems
            .filter((item) => item.type === 'section' && item.section)
            .map((item) => ({
                section_id: item.section!.section_id,
                display_order: item.display_order,
            }))

        const componentUpdates = orderedItems
            .filter((item) => item.type === 'component' && item.component)
            .map((item) => ({
                component_id: item.component!.component_id,
                display_order: item.display_order,
            }))

        const requests = []

        if (sectionUpdates.length > 0) {
            requests.push(
                api.post(`/contents/${contentId}/sections/reorder-display`, {
                    items: sectionUpdates,
                })
            )
        }

        if (componentUpdates.length > 0) {
            requests.push(
                api.post(
                    `/components/contents/${contentId}/components/reorder-display`,
                    {
                        items: componentUpdates,
                    }
                )
            )
        }

        if (requests.length > 0) {
            await Promise.all(requests)
        }
    }

    const getSectionTitle = (section: ContentSection): string => {
        const typeLabels: Record<string, string> = {
            text: 'Tekst',
            image: 'Obraz',
            gallery: 'Galeria',
            pdf: 'PDF',
            video: 'Wideo',
            html: 'HTML',
            embed: 'Osadzony',
        }
        return section.heading || typeLabels[section.section_type] || 'Sekcja'
    }

    const getComponentTitle = (component: PageComponent): string => {
        const typeLabels: Record<string, string> = {
            hero: 'Slider',
            services: 'Usługi',
            testimonial: 'Opinie',
            team: 'Zespół',
            pricing: 'Cennik',
            hours: 'Godziny otwarcia',
            contact_form: 'Formularz',
            map: 'Mapa',
        }
        return (
            component.data?.title ||
            typeLabels[component.component_type] ||
            'Komponent'
        )
    }

    const getComponentSubtitle = (
        component: PageComponent
    ): string | undefined => {
        switch (component.component_type) {
            case 'hero':
                return `${component.data?.slides?.length || 0} slajdów`
            case 'services':
                return `${component.data?.items?.length || 0} usług`
            case 'team':
                return `${component.data?.members?.length || 0} członków`
            case 'pricing':
                return `${component.data?.services?.length || 0} usług`
            case 'testimonial':
                return `${component.data?.items?.length || 0} opinii`
            default:
                return component.data?.subtitle
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <Box className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                    Brak sekcji i komponentów do wyświetlenia
                </p>
                <p className="text-sm text-gray-400">
                    Dodaj sekcje lub komponenty w odpowiednich zakładkach
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>
                        Kolejność wyświetlania na stronie publicznej:
                    </strong>{' '}
                    Przeciągnij i upuść elementy, aby zmienić ich kolejność.
                    Możesz mieszać proste sekcje z komponentami PageBuilder.
                </p>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span>
                        {items.filter((i) => i.type === 'section').length}{' '}
                        sekcji
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-green-500" />
                    <span>
                        {items.filter((i) => i.type === 'component').length}{' '}
                        komponentów
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-yellow-500" />
                    <span>
                        {items.filter((i) => !i.status).length} ukrytych
                    </span>
                </div>
            </div>

            <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={items.map((i) => i.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-2">
                        {items.map((item, index) => (
                            <DisplayOrderItem
                                key={item.id}
                                item={item}
                                index={index}
                                onEdit={() => {
                                    if (
                                        item.type === 'section' &&
                                        item.section &&
                                        onEditSection
                                    ) {
                                        onEditSection(item.section)
                                    } else if (
                                        item.type === 'component' &&
                                        item.component &&
                                        onEditComponent
                                    ) {
                                        onEditComponent(item.component)
                                    }
                                }}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Legenda:
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                            Prosta sekcja (tekst, obraz, itp.)
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                            Komponent PageBuilder (hero, pricing, itp.)
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface DisplayOrderItemProps {
    item: DisplayItem
    index: number
    onEdit: () => void
}

function DisplayOrderItem({ item, index, onEdit }: DisplayOrderItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: item.id,
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    const Icon = item.type === 'section' ? FileText : Box
    const bgColor =
        item.type === 'section'
            ? 'bg-blue-50 dark:bg-blue-900/20'
            : 'bg-green-50 dark:bg-green-900/20'
    const iconColor =
        item.type === 'section' ? 'text-blue-600' : 'text-green-600'
    const borderColor = item.status
        ? item.type === 'section'
            ? 'border-blue-200 dark:border-blue-800'
            : 'border-green-200 dark:border-green-800'
        : 'border-yellow-300 dark:border-yellow-600'

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative border-2 rounded-lg p-4 transition-all ${borderColor} ${
                isDragging ? 'shadow-2xl z-50' : 'hover:shadow-md'
            }`}
        >
            {!item.status && (
                <div className="absolute -top-3 left-4 bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded text-xs font-medium text-yellow-800 dark:text-yellow-200">
                    Ukryty
                </div>
            )}

            <div className="flex items-center gap-3">
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                    <GripVertical className="w-5 h-5 text-gray-400" />
                </button>

                <div className="flex-shrink-0 w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {index + 1}
                </div>

                <div className={`p-2 ${bgColor} rounded-lg`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                            {item.title}
                        </span>
                        <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                                item.type === 'section'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                                    : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                            }`}
                        >
                            {item.type === 'section' ? 'Sekcja' : 'Komponent'}
                        </span>
                    </div>
                    {item.subtitle && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {item.subtitle}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!item.status && (
                        <div className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded text-xs text-yellow-700 dark:text-yellow-300">
                            <EyeOff className="w-3 h-3" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
