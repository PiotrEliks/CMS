import { useEffect, useState } from 'react'
import { DndContext, type DragEndEvent, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { PlusIcon } from 'lucide-react'
import Button from '../../ui/button/Button'
import ComponentTypeSelector from './ComponentTypeSelector'
import ComponentItem from './ComponentItem'
import ComponentEditModal from './ComponentEditModal'
import {
    usePageComponents,
    type ComponentType,
    type PageComponent,
} from '../../../store/pageComponents'

interface PageBuilderProps {
    contentId: string
}

export default function PageBuilder({ contentId }: PageBuilderProps) {
    const { components, loading, fetchComponents, reorderComponents } =
        usePageComponents()
    const [typeSelectorOpen, setTypeSelectorOpen] = useState(false)
    const [editingComponent, setEditingComponent] =
        useState<PageComponent | null>(null)
    const [showInactive, setShowInactive] = useState(false)

    useEffect(() => {
        if (contentId) {
            fetchComponents(contentId, showInactive)
        }
    }, [contentId, showInactive, fetchComponents])

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (!over || active.id === over.id) return

        const oldIndex = components.findIndex(
            (c) => c.component_id === active.id
        )
        const newIndex = components.findIndex((c) => c.component_id === over.id)

        if (oldIndex === -1 || newIndex === -1) return

        const reordered = [...components]
        const [moved] = reordered.splice(oldIndex, 1)
        reordered.splice(newIndex, 0, moved)

        const componentIds = reordered.map((c) => c.component_id)

        try {
            await reorderComponents(contentId, componentIds)
        } catch (error) {
            console.error('Failed to reorder:', error)
            fetchComponents(contentId, showInactive)
        }
    }

    const handleSelectType = async (type: ComponentType) => {
        const defaultData = getDefaultDataForType(type)

        const newComponent: Partial<PageComponent> = {
            component_type: type,
            data: defaultData,
            status: true,
        }

        setEditingComponent(newComponent as PageComponent)
    }

    const visibleComponents = showInactive
        ? components
        : components.filter((c) => c.status)

    if (loading && components.length === 0) {
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
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Komponenty strony
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {visibleComponents.length} komponent
                            {visibleComponents.length === 1 ? '' : 'y'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <input
                                type="checkbox"
                                checked={showInactive}
                                onChange={(e) =>
                                    setShowInactive(e.target.checked)
                                }
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            Pokaż nieaktywne
                        </label>
                        <Button
                            variant="primary"
                            startIcon={<PlusIcon />}
                            onClick={() => setTypeSelectorOpen(true)}
                        >
                            Dodaj komponent
                        </Button>
                    </div>
                </div>

                {visibleComponents.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                        <PlusIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            Brak komponentów. Dodaj swój pierwszy komponent, aby
                            zacząć.
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => setTypeSelectorOpen(true)}
                        >
                            Dodaj komponent
                        </Button>
                    </div>
                ) : (
                    <DndContext
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={visibleComponents.map((c) => c.component_id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-3">
                                {visibleComponents.map((component) => (
                                    <ComponentItem
                                        key={component.component_id}
                                        component={component}
                                        onEdit={setEditingComponent}
                                        showInactive={showInactive}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>

            <ComponentTypeSelector
                open={typeSelectorOpen}
                onClose={() => setTypeSelectorOpen(false)}
                onSelect={handleSelectType}
            />

            {editingComponent && (
                <ComponentEditModal
                    open={!!editingComponent}
                    onClose={() => setEditingComponent(null)}
                    component={editingComponent}
                    contentId={contentId}
                />
            )}
        </>
    )
}

function getDefaultDataForType(type: ComponentType): any {
    switch (type) {
        case 'hero':
            return {
                slides: [
                    {
                        title: 'Witaj',
                        subtitle: '',
                        buttonText: 'Zaczynaj',
                        buttonLink: '#',
                    },
                ],
                autoplay: true,
                interval: 5000,
            }
        case 'services':
            return {
                title: 'Nasze usługi',
                items: [{ name: 'Usługa 1', description: '', price: '' }],
                layout: 'grid',
                columns: 3,
            }
        case 'testimonial':
            return {
                title: 'Opinie klientów',
                items: [{ quote: 'Świetna usługa!', author: 'Jan Kowalski' }],
                layout: 'slider',
            }
        case 'team':
            return {
                title: 'Nasz zespół',
                members: [{ name: 'Anna Nowak', role: 'CEO', bio: '' }],
            }
        case 'pricing':
            return {
                title: 'Cennik',
                plans: [
                    {
                        name: 'Podstawowy',
                        price: '99 PLN',
                        features: ['Funkcja 1', 'Funkcja 2'],
                    },
                ],
            }
        case 'hours':
            return {
                title: 'Godziny otwarcia',
                schedule: [
                    { day: 'Poniedziałek', open: '09:00', close: '17:00' },
                    { day: 'Wtorek', open: '09:00', close: '17:00' },
                ],
            }
        case 'contact_form':
            return {
                title: 'Skontaktuj się z nami',
                fields: [
                    { label: 'Imię', type: 'text', required: true },
                    { label: 'Email', type: 'email', required: true },
                    { label: 'Wiadomość', type: 'textarea', required: true },
                ],
                submitText: 'Wyślij',
            }
        case 'map':
            return {
                location: 'Warszawa, Polska',
                zoom: 12,
            }
        default:
            return {}
    }
}
