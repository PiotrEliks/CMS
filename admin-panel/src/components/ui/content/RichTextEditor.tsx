import { useRef, useState } from 'react'
import { Editor } from '@tinymce/tinymce-react'
import MediaLibraryModal from './MediaLibraryModal'

interface Media {
    media_id: string
    alt_text: string
    storage_path: string
    title: string
    mime_type: string
    thumbnail_path: string
}

const TINYMCE_API_KEY = import.meta.env.VITE_TINYMCE_API_KEY

export default function RichTextEditor({
    value,
    onChange,
    height = 400,
    placeholder = 'Zacznij pisać...',
}: {
    value: string
    onChange: (v: string) => void
    height?: number
    placeholder?: string
}) {
    const editorRef = useRef<any>(null)
    const [mediaModalOpen, setMediaModalOpen] = useState(false)
    const [insertImageCallback, setInsertImageCallback] = useState<any>(null)

    const handleMediaSelect = (media: Media | Media[]) => {
        if (!insertImageCallback) return

        const selectedMedia = Array.isArray(media) ? media[0] : media

        const baseUrl = import.meta.env.VITE_API_UPLOADS || ''
        const imageUrl = `${baseUrl}${selectedMedia.storage_path}`

        insertImageCallback(imageUrl, {
            alt: selectedMedia.alt_text || selectedMedia.title,
            title: selectedMedia.title,
        })

        setMediaModalOpen(false)
        setInsertImageCallback(null)
    }

    return (
        <>
            <Editor
                apiKey={TINYMCE_API_KEY}
                onInit={(_evt, editor) => (editorRef.current = editor)}
                value={value}
                onEditorChange={(content) => onChange(content)}
                init={{
                    height,
                    menubar: true,
                    plugins: [
                        'advlist',
                        'autolink',
                        'lists',
                        'link',
                        'image',
                        'code',
                        'table',
                        'wordcount',
                    ],
                    toolbar:
                        'undo redo | bold italic | alignleft aligncenter alignright | image link | code',
                    placeholder,
                    file_picker_types: 'image',
                    file_picker_callback: (callback) => {
                        setInsertImageCallback(() => callback)
                        setMediaModalOpen(true)
                    },
                    content_style:
                        'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                }}
            />

            <MediaLibraryModal
                open={mediaModalOpen}
                onClose={() => {
                    setMediaModalOpen(false)
                    setInsertImageCallback(null)
                }}
                onSelect={handleMediaSelect}
                multiple={false}
                allowedTypes={['image']}
            />
        </>
    )
}
