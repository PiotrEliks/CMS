import type { MediaItem } from '../../store/media'

export default function MediaGrid({
    items,
    loading,
    onOpen,
    onDelete,
}: {
    items: MediaItem[]
    loading: boolean
    onOpen: (m: MediaItem) => void
    onDelete?: (m: MediaItem) => void
}) {
    if (loading) return <p className="text-sm text-gray-500">Ładowanie…</p>
    if (!items.length)
        return <p className="text-sm text-gray-500">Brak zasobów.</p>

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
            {items.map((m) => {
                const isImage = (m.mime_type ?? '').startsWith('image/')
                const previewUrl = m.storage_path
                const isPdf = m.mime_type === 'application/pdf'
                return (
                    <div
                        key={m.media_id}
                        className="rounded-xl border border-gray-200 bg-white p-2 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900"
                    >
                        <button
                            onClick={() => onOpen(m)}
                            className="w-full overflow-hidden rounded-lg border border-gray-100 dark:border-gray-800"
                            type="button"
                        >
                            <div className="aspect-square bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                {isImage && (
                                    <img
                                        src={`${import.meta.env.VITE_API_UPLOADS}${previewUrl}`}
                                        className="h-full w-full object-cover"
                                    />
                                )}

                                {isPdf && m.thumbnail_path && (
                                    <img
                                        src={`${import.meta.env.VITE_API_UPLOADS}${m.thumbnail_path}`}
                                        className="h-full w-full object-cover"
                                    />
                                )}

                                {isPdf && !m.thumbnail_path && (
                                    <div className="text-xs text-gray-500">
                                        PDF
                                    </div>
                                )}
                            </div>
                        </button>

                        <div className="mt-2 flex items-center justify-between gap-2">
                            <div className="min-w-0">
                                <p className="truncate text-xs font-medium text-gray-800 dark:text-gray-200">
                                    {m.title ?? m.storage_path}
                                </p>
                                <p className="truncate text-[11px] text-gray-500">
                                    {m.mime_type}
                                </p>
                            </div>

                            {onDelete && (
                                <button
                                    onClick={() => onDelete(m)}
                                    className="rounded-full px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    type="button"
                                    aria-label="Usuń"
                                >
                                    Usuń
                                </button>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
