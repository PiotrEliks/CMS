import { useState } from 'react'
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import Button from '../../../ui/button/Button'
import { type ServicesComponentData } from '../../../store/pageComponents'
import MediaLibraryModal from '../../ui/content/MediaLibraryModal'

interface ServicesEditorProps {
    data: ServicesComponentData
    onChange: (data: ServicesComponentData) => void
}

export default function ServicesEditor({
    data,
    onChange,
}: ServicesEditorProps) {
    const [mediaModalOpen, setMediaModalOpen] = useState(false)
    const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(
        null
    )

    const items = data.items || []

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        onChange({ ...data, items: newItems })
    }

    const handleAddItem = () => {
        onChange({
            ...data,
            items: [
                ...items,
                {
                    name: '',
                    description: '',
                    price: '',
                },
            ],
        })
    }

    const handleRemoveItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index)
        onChange({ ...data, items: newItems })
    }

    const handleMediaSelect = (media: any) => {
        if (selectedItemIndex !== null) {
            handleItemChange(selectedItemIndex, 'media_id', media.media_id)
        }
        setMediaModalOpen(false)
        setSelectedItemIndex(null)
    }

    return (
        <>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tytuł sekcji
                    </label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) =>
                            onChange({ ...data, title: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        placeholder="Nasze usługi"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Podtytuł (opcjonalnie)
                    </label>
                    <input
                        type="text"
                        value={data.subtitle || ''}
                        onChange={(e) =>
                            onChange({ ...data, subtitle: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        placeholder="To, co oferujemy"
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                            Usługi
                        </h4>
                        <Button
                            size="sm"
                            variant="outline"
                            startIcon={<Plus />}
                            onClick={handleAddItem}
                        >
                            Dodaj usługę
                        </Button>
                    </div>

                    {items.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                Brak usług
                            </p>
                            <Button
                                variant="primary"
                                startIcon={<Plus />}
                                onClick={handleAddItem}
                            >
                                Dodaj swoją pierwszą usługę
                            </Button>
                        </div>
                    ) : (
                        items.map((item, index) => (
                            <div
                                key={index}
                                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Usługa {index + 1}
                                    </span>
                                    <button
                                        onClick={() => handleRemoveItem(index)}
                                        className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Ikona (nazwa klasy lub emoji)
                                        </label>
                                        <input
                                            type="text"
                                            value={item.icon || ''}
                                            onChange={(e) =>
                                                handleItemChange(
                                                    index,
                                                    'icon',
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                            placeholder="flaticon-razor lub ✂️"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Nazwa usługi
                                        </label>
                                        <input
                                            type="text"
                                            value={item.name || ''}
                                            onChange={(e) =>
                                                handleItemChange(
                                                    index,
                                                    'name',
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                            placeholder="Strzyżenie włosów"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Opis
                                    </label>
                                    <textarea
                                        value={item.description || ''}
                                        onChange={(e) =>
                                            handleItemChange(
                                                index,
                                                'description',
                                                e.target.value
                                            )
                                        }
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                        placeholder="Profesjonalne strzyżenie włosów z konsultacją"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Cena
                                        </label>
                                        <input
                                            type="text"
                                            value={item.price || ''}
                                            onChange={(e) =>
                                                handleItemChange(
                                                    index,
                                                    'price',
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                            placeholder="$29"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Link (opcjonalnie)
                                        </label>
                                        <input
                                            type="text"
                                            value={item.link || ''}
                                            onChange={(e) =>
                                                handleItemChange(
                                                    index,
                                                    'link',
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                            placeholder="/uslugów/strzyżenie"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Obraz (opcjonalnie)
                                    </label>
                                    {item.media_id ? (
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                                                Obraz wybrany: {item.media_id}
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedItemIndex(index)
                                                    setMediaModalOpen(true)
                                                }}
                                            >
                                                Zmień
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    handleItemChange(
                                                        index,
                                                        'media_id',
                                                        undefined
                                                    )
                                                }
                                            >
                                                Usuń
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            startIcon={<ImageIcon />}
                                            onClick={() => {
                                                setSelectedItemIndex(index)
                                                setMediaModalOpen(true)
                                            }}
                                        >
                                            Wybierz obraz
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                        Ustawienia układu
                    </h4>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Układ
                        </label>
                        <select
                            value={data.layout || 'grid'}
                            onChange={(e) =>
                                onChange({
                                    ...data,
                                    layout: e.target.value as any,
                                })
                            }
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        >
                            <option value="grid">Siatka</option>
                            <option value="list">Lista</option>
                            <option value="carousel">Karuzela</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Kolumny (dla układu siatki)
                        </label>
                        <input
                            type="number"
                            value={data.columns || 3}
                            onChange={(e) =>
                                onChange({
                                    ...data,
                                    columns: parseInt(e.target.value),
                                })
                            }
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            min="1"
                            max="6"
                        />
                    </div>
                </div>
            </div>

            <MediaLibraryModal
                open={mediaModalOpen}
                onClose={() => {
                    setMediaModalOpen(false)
                    setSelectedItemIndex(null)
                }}
                onSelect={handleMediaSelect}
                allowedTypes={['image']}
                multiple={false}
            />
        </>
    )
}
