import { useState } from 'react'
import {
    FileTextIcon,
    ImageIcon,
    VideoIcon,
    CodeIcon,
    XIcon,
} from 'lucide-react'
import {
    useContentSections,
    type SectionType,
} from '../../../store/contentSections'
import Button from '../../ui/button/Button'

interface SectionTypeModalProps {
    open: boolean
    onClose: () => void
    contentId: string
}

interface SectionTypeOption {
    type: SectionType
    label: string
    description: string
    icon: React.ReactNode
    color: string
}

const sectionTypes: SectionTypeOption[] = [
    {
        type: 'text',
        label: 'Tekst',
        description: 'Blok tekstu z edytorem WYSIWYG',
        icon: <FileTextIcon className="w-6 h-6" />,
        color: 'blue',
    },
    {
        type: 'image',
        label: 'Zdjęcie',
        description: 'Pojedyncze zdjęcie',
        icon: <ImageIcon className="w-6 h-6" />,
        color: 'green',
    },
    {
        type: 'gallery',
        label: 'Galeria',
        description: 'Wiele zdjęć w galerii',
        icon: <ImageIcon className="w-6 h-6" />,
        color: 'purple',
    },
    {
        type: 'pdf',
        label: 'PDF',
        description: 'Dokument PDF do pobrania',
        icon: <FileTextIcon className="w-6 h-6" />,
        color: 'red',
    },
    {
        type: 'video',
        label: 'Wideo',
        description: 'Film z YouTube/Vimeo',
        icon: <VideoIcon className="w-6 h-6" />,
        color: 'pink',
    },
    {
        type: 'html',
        label: 'HTML',
        description: 'Własny kod HTML',
        icon: <CodeIcon className="w-6 h-6" />,
        color: 'orange',
    },
    {
        type: 'embed',
        label: 'Embed',
        description: 'Osadzony kod (iframe, widget)',
        icon: <CodeIcon className="w-6 h-6" />,
        color: 'yellow',
    },
]

export default function SectionTypeModal({
    open,
    onClose,
    contentId,
}: SectionTypeModalProps) {
    const { createSection } = useContentSections()
    const [creating, setCreating] = useState(false)

    if (!open) return null

    const handleSelectType = async (type: SectionType) => {
        setCreating(true)
        try {
            await createSection(contentId, {
                section_type: type,
                heading: '',
                body: '',
            })
            onClose()
        } catch (error) {
        } finally {
            setCreating(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div
                    className="fixed inset-0 bg-black/50 transition-opacity"
                    onClick={onClose}
                />

                <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Wybierz typ sekcji
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {sectionTypes.map((option) => (
                                <button
                                    key={option.type}
                                    onClick={() =>
                                        handleSelectType(option.type)
                                    }
                                    disabled={creating}
                                    className={`
                    p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700
                    hover:border-primary hover:bg-primary/5
                    dark:hover:border-primary dark:hover:bg-primary/10
                    transition-all text-left
                    disabled:opacity-50 disabled:cursor-not-allowed
                    focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                  `}
                                >
                                    <div
                                        className={`text-${option.color}-600 dark:text-${option.color}-400 mb-2`}
                                    >
                                        {option.icon}
                                    </div>
                                    <div className="font-medium text-gray-900 dark:text-white mb-1">
                                        {option.label}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {option.description}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                        <Button variant="outline" onClick={onClose}>
                            Anuluj
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
