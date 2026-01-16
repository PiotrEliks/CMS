import { useState, useEffect } from 'react'
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import {
    useContentSections,
    type ContentSection,
} from '../../../store/contentSections'
import SectionItem from './SectionItem'
import AddSectionButton from './AddSectionButton'
import { Access } from '../../permissions/Access'

interface SectionManagerProps {
    contentId: string
}

export default function SectionManager({ contentId }: SectionManagerProps) {
    const { sections, fetchSections, reorderSections, loading } =
        useContentSections()
    const [localSections, setLocalSections] = useState<ContentSection[]>([])

    useEffect(() => {
        if (contentId) {
            fetchSections(contentId)
        }
    }, [contentId])

    useEffect(() => {
        setLocalSections(sections)
    }, [sections])

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (!over || active.id === over.id) return

        const oldIndex = localSections.findIndex(
            (s) => s.section_id === active.id
        )
        const newIndex = localSections.findIndex(
            (s) => s.section_id === over.id
        )

        if (oldIndex === -1 || newIndex === -1) return

        const reordered = [...localSections]
        const [moved] = reordered.splice(oldIndex, 1)
        reordered.splice(newIndex, 0, moved)

        setLocalSections(reordered)

        const items = reordered.map((section, index) => ({
            section_id: section.section_id,
            order_index: index,
        }))

        try {
            await reorderSections(contentId, items)
        } catch (error) {
            setLocalSections(sections)
        }
    }

    if (loading && sections.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Sekcje treści
                </h3>
                <Access allOf={['content.create']}>
                    <AddSectionButton contentId={contentId} />
                </Access>
            </div>

            {localSections.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Brak sekcji. Dodaj pierwszą sekcję aby rozpocząć.
                    </p>
                    <Access allOf={['content.create']}>
                        <AddSectionButton contentId={contentId} />
                    </Access>
                </div>
            ) : (
                <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={localSections.map((s) => s.section_id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-3">
                            {localSections.map((section) => (
                                <SectionItem
                                    key={section.section_id}
                                    section={section}
                                    contentId={contentId}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {localSections.length > 0 && (
                <Access allOf={['content.create']}>
                    <div className="pt-4">
                        <AddSectionButton contentId={contentId} />
                    </div>
                </Access>
            )}
        </div>
    )
}
