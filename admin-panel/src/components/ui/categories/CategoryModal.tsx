import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Save } from 'lucide-react'
import Button from '../../ui/button/Button'
import { useCategories } from '../../../store/categories'

interface CategoryModalProps {
    open: boolean
    onClose: () => void
    category: any
    onSuccess: () => void
}

export default function CategoryModal({
    open,
    onClose,
    category,
    onSuccess,
}: CategoryModalProps) {
    const { createCategory, updateCategory } = useCategories()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        display_name: '',
        slug: '',
        status: true,
    })

    const isEdit = !!category

    useEffect(() => {
        if (open && category) {
            setFormData({
                display_name: category.display_name || '',
                slug: category.slug || '',
                status: category.status ?? true,
            })
        } else if (open && !category) {
            setFormData({
                display_name: '',
                slug: '',
                status: true,
            })
        }
    }, [open, category])

    if (!open) return null

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }))

        if (field === 'display_name' && !isEdit) {
            const slug = value
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
            setFormData((prev) => ({ ...prev, slug }))
        }
    }

    const handleSave = async () => {
        if (!formData.display_name) {
            alert('Nazwa jest wymagana')
            return
        }

        if (!formData.slug) {
            alert('Slug jest wymagany')
            return
        }

        setLoading(true)
        try {
            if (isEdit) {
                await updateCategory(category.category_id, formData)
            } else {
                await createCategory(formData)
            }
            onSuccess()
        } catch (error: any) {
            console.error('Failed to save category:', error)
            alert(
                error.response?.data?.error || 'Nie udało się zapisać kategorii'
            )
        } finally {
            setLoading(false)
        }
    }

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
                                {isEdit
                                    ? 'Edytuj kategorię'
                                    : 'Dodaj kategorię'}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {isEdit
                                    ? 'Zaktualizuj informacje o kategorii'
                                    : 'Utwórz nową kategorię treści'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nazwa *
                            </label>
                            <input
                                type="text"
                                value={formData.display_name}
                                onChange={(e) =>
                                    handleChange('display_name', e.target.value)
                                }
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                placeholder="np. Aktualności, Blog, Produkty"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Slug *
                            </label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) =>
                                    handleChange('slug', e.target.value)
                                }
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white font-mono"
                                placeholder="aktualnosci"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                URL: /category/{formData.slug || 'slug'}
                            </p>
                        </div>

                        <div>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.status}
                                    onChange={(e) =>
                                        handleChange('status', e.target.checked)
                                    }
                                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Kategoria aktywna
                                </span>
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                                Nieaktywne kategorie nie są widoczne na stronie
                                publicznej
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Anuluj
                        </Button>
                        <Button
                            variant="primary"
                            startIcon={<Save />}
                            onClick={handleSave}
                            disabled={loading}
                        >
                            {loading
                                ? 'Zapisywanie...'
                                : isEdit
                                  ? 'Zapisz zmiany'
                                  : 'Utwórz kategorię'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}
