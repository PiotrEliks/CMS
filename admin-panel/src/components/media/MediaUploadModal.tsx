import { useState, useRef, type DragEvent } from 'react'
import { createPortal } from 'react-dom'
import { X, Upload, File, Trash2 } from 'lucide-react'
import Button from '../ui/button/Button'
import { useMedia } from '../../store/media'

interface MediaUploadModalProps {
    open: boolean
    onClose: () => void
}

export default function MediaUploadModal({
    open,
    onClose,
}: MediaUploadModalProps) {
    const { upload, uploadBulk, bulkUploading, bulkProgress } = useMedia()

    const [files, setFiles] = useState<File[]>([])
    const [dragOver, setDragOver] = useState(false)
    const [uploading, setUploading] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)

    if (!open) return null

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            setFiles((prev) => [...prev, ...newFiles])
        }
    }

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setDragOver(false)

        if (e.dataTransfer.files) {
            const newFiles = Array.from(e.dataTransfer.files)
            setFiles((prev) => [...prev, ...newFiles])
        }
    }

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setDragOver(true)
    }

    const handleDragLeave = () => {
        setDragOver(false)
    }

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async () => {
        if (files.length === 0) return

        setUploading(true)
        try {
            if (files.length === 1) {
                await upload(files[0])
            } else {
                await uploadBulk(files)
            }

            setFiles([])
            onClose()
        } catch (error) {
            console.error('Upload failed:', error)
        } finally {
            setUploading(false)
        }
    }

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0)

    return createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />

                <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                Dodaj Pliki
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Przeciągnij pliki lub kliknij, aby wybrać (max
                                20 plików, 50MB każdy)
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => fileInputRef.current?.click()}
                            className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-colors duration-200
                ${
                    dragOver
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-300 dark:border-gray-700 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }
              `}
                        >
                            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600 dark:text-gray-400 mb-2">
                                <span className="font-semibold text-primary">
                                    Kliknij aby wybrać
                                </span>{' '}
                                lub przeciągnij pliki tutaj
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                                PNG, JPG, WEBP, PDF (max 50MB każdy, max 20
                                plików)
                            </p>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,application/pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        {files.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Wybrane pliki ({files.length})
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Łącznie: {formatFileSize(totalSize)}
                                    </p>
                                </div>

                                <div className="max-h-64 overflow-y-auto space-y-2">
                                    {files.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                                        >
                                            <File className="w-8 h-8 text-gray-400 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {file.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatFileSize(file.size)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    removeFile(index)
                                                }
                                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                                disabled={uploading}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {bulkProgress && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-700 dark:text-gray-300">
                                        Postęp: {bulkProgress.completed} /{' '}
                                        {bulkProgress.total}
                                    </span>
                                    {bulkProgress.failed > 0 && (
                                        <span className="text-red-600 dark:text-red-400">
                                            Błędy: {bulkProgress.failed}
                                        </span>
                                    )}
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-primary h-2 rounded-full transition-all duration-300"
                                        style={{
                                            width: `${(bulkProgress.completed / bulkProgress.total) * 100}%`,
                                        }}
                                    />
                                </div>
                                {bulkProgress.current && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        Aktualnie: {bulkProgress.current}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={uploading}
                        >
                            Anuluj
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                            disabled={files.length === 0 || uploading}
                        >
                            {uploading
                                ? bulkProgress
                                    ? `Uploading... (${bulkProgress.completed}/${bulkProgress.total})`
                                    : 'Uploading...'
                                : files.length === 1
                                  ? 'Dodaj Plik'
                                  : `Dodaj ${files.length} Plików`}
                        </Button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}
