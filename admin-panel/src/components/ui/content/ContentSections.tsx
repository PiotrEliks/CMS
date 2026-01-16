import { useEffect, useState } from 'react'
import {
    PlusIcon,
    GripVertical,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Copy,
} from 'lucide-react'
import { DndContext, type DragEndEvent, closestCenter } from '@dnd-kit/core'
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Button from '../../ui/button/Button'
import SectionTypeModal from './SectionTypeModal'
import SectionEditModal from './SectionEditModal'
import DeleteConfirmModal from '../../modal/DeleteConfirmModal'
import {
    useContentSections,
    type ContentSection,
    type SectionType,
} from '../../../store/contentSections'

interface ContentSectionsProps {
    contentId: string
}

export default function ContentSections({ contentId }: ContentSectionsProps) {
    const {
        sections,
        loading,
        fetchSections,
        reorderSections,
        deleteSection,
        toggleSectionStatus,
    } = useContentSections()
    const [typeModalOpen, setTypeModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [selectedSection, setSelectedSection] =
        useState<ContentSection | null>(null)
    const [selectedType, setSelectedType] = useState<SectionType | null>(null)

    useEffect(() => {
        if (contentId) {
            fetchSections(contentId)
        }
    }, [contentId, fetchSections])

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const oldIndex = sections.findIndex((s) => s.section_id === active.id)
        const newIndex = sections.findIndex((s) => s.section_id === over.id)

        if (oldIndex === -1 || newIndex === -1) return

        const reordered = [...sections]
        const [moved] = reordered.splice(oldIndex, 1)
        reordered.splice(newIndex, 0, moved)

        const sectionIds = reordered.map((s) => s.section_id)

        try {
            await reorderSections(contentId, sectionIds)
        } catch (error) {
            console.error('Failed to reorder sections:', error)
            fetchSections(contentId)
        }
    }

    const handleSelectType = (type: SectionType) => {
        if (!contentId || contentId === 'undefined') {
            alert('Błąd: Nie można dodać sekcji do nieistniejącej treści.')
            return
        }

        setSelectedType(type)
        setTypeModalOpen(false)

        const newSection: Partial<ContentSection> = {
            content_id: contentId,
            section_type: type,
            heading: '',
            subheading: '',
            body: '',
            status: true,
            media_ids: [],
            settings: {},
        }

        setSelectedSection(newSection as ContentSection)
        setEditModalOpen(true)
    }

    const handleEdit = (section: ContentSection) => {
        setSelectedSection(section)
        setEditModalOpen(true)
    }

    const handleDelete = async () => {
        if (!selectedSection?.section_id || !contentId) return

        try {
            await deleteSection(contentId, selectedSection.section_id)
            setDeleteModalOpen(false)
            setSelectedSection(null)
        } catch (error) {
            console.error('Failed to delete section:', error)
        }
    }

    const handleToggle = async (sectionId: string) => {
        try {
            await toggleSectionStatus(sectionId)
        } catch (error) {
            console.error('Failed to toggle section:', error)
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
        <>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {sections.length} sekcj
                        {sections.length === 1 ? 'a' : 'i'}
                    </p>
                    <Button
                        variant="primary"
                        size="sm"
                        startIcon={<PlusIcon />}
                        onClick={() => setTypeModalOpen(true)}
                    >
                        Dodaj sekcję
                    </Button>
                </div>

                {sections.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                        <PlusIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            Nie ma jeszcze sekcji. Dodaj pierwszą sekcję, aby
                            zacząć.
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => setTypeModalOpen(true)}
                        >
                            Dodaj sekcję
                        </Button>
                    </div>
                ) : (
                    <DndContext
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={sections.map((s) => s.section_id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-3">
                                {sections.map((section) => (
                                    <SectionItem
                                        key={section.section_id}
                                        section={section}
                                        onEdit={handleEdit}
                                        onDelete={(s) => {
                                            setSelectedSection(s)
                                            setDeleteModalOpen(true)
                                        }}
                                        onToggle={handleToggle}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>

            <SectionTypeModal
                open={typeModalOpen}
                onClose={() => setTypeModalOpen(false)}
                onSelect={handleSelectType}
                contentId={contentId}
            />

            {selectedSection && (
                <SectionEditModal
                    open={editModalOpen}
                    onClose={() => {
                        setEditModalOpen(false)
                        setSelectedSection(null)
                    }}
                    section={selectedSection}
                    contentId={contentId}
                />
            )}

            <DeleteConfirmModal
                open={deleteModalOpen}
                onCancel={() => {
                    setDeleteModalOpen(false)
                    setSelectedSection(null)
                }}
                onConfirm={handleDelete}
                title="Usuń sekcję"
                message="Czy na pewno chcesz usunąć tę sekcję? Tej akcji nie będzie można cofnąć."
            />
        </>
    )
}

interface SectionItemProps {
    section: ContentSection
    onEdit: (section: ContentSection) => void
    onDelete: (section: ContentSection) => void
    onToggle: (sectionId: string) => void
}

function SectionItem({
    section,
    onEdit,
    onDelete,
    onToggle,
}: SectionItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: section.section_id,
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    const sectionTypeLabels: Record<SectionType, string> = {
        text: 'Tekst',
        image: 'Obraz',
        gallery: 'Galeria',
        pdf: 'PDF',
        video: 'Wideo',
        html: 'HTML',
        embed: 'Osadzony',
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group bg-white dark:bg-gray-800 border-2 rounded-lg p-4 transition-all ${
                section.status
                    ? 'border-gray-200 dark:border-gray-700 hover:border-primary'
                    : 'border-yellow-300 dark:border-yellow-600 opacity-60'
            } ${isDragging ? 'shadow-2xl z-50' : 'hover:shadow-lg'}`}
        >
            {!section.status && (
                <div className="absolute -top-3 left-4 bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded text-xs font-medium text-yellow-800 dark:text-yellow-200">
                    Nieaktywna
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

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                            {sectionTypeLabels[section.section_type]}
                        </span>
                        {section.heading && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                - {section.heading}
                            </span>
                        )}
                    </div>
                    {section.subheading && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {section.subheading}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onToggle(section.section_id)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title={section.status ? 'Ukryj' : 'Pokaż'}
                    >
                        {section.status ? (
                            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        ) : (
                            <EyeOff className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        )}
                    </button>

                    <button
                        onClick={() => onEdit(section)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="Edytuj"
                    >
                        <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>

                    <button
                        onClick={() => onDelete(section)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        title="Usuń"
                    >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                </div>
            </div>
        </div>
    )
}
