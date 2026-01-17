import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, GridIcon, CheckCircleIcon } from 'lucide-react'
import Button from '../../ui/button/Button'
import { api } from '../../../api/axios'

interface Media {
  media_id: string
  alt_text: string
  height: number
  width: number
  status: string
  storage_path: string
  title: string
  file_name?: string
  file_path?: string
  mime_type: string
  thumbnail_path: string
  created_at: string
  uploaded_at: string
}

interface MediaLibraryModalProps {
  open: boolean
  onClose: () => void
  onSelect: (media: Media | Media[]) => void
  multiple?: boolean
  allowedTypes?: ('image' | 'video' | 'audio' | 'document' | 'pdf')[]
  maxSelection?: number
}

export default function MediaLibraryModal({
  open,
  onClose,
  onSelect,
  multiple = false,
  allowedTypes,
  maxSelection = 10,
}: MediaLibraryModalProps) {
  const [media, setMedia] = useState<Media[]>([])
  const [filteredMedia, setFilteredMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    if (open) {
      fetchMedia()
      setSelectedIds([])
    }
  }, [open])

  useEffect(() => {
    filterMedia()
  }, [media, searchTerm, filterType, allowedTypes])

  const fetchMedia = async () => {
    setLoading(true)
    try {
      const res = await api.get('/media', {
        params: { limit: 100, offset: 0 },
      })
      setMedia(res.data.items || [])
    } catch (error) {
      console.error('Failed to fetch media:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterMedia = () => {
    let filtered = [...media]

    if (allowedTypes && allowedTypes.length > 0) {
      filtered = filtered.filter((m) => {
        const mime = m.mime_type.toLowerCase()
        return allowedTypes.some((type) => {
          if (type === 'image') return mime.startsWith('image/')
          if (type === 'video') return mime.startsWith('video/')
          if (type === 'audio') return mime.startsWith('audio/')
          if (type === 'pdf') return mime === 'application/pdf'
          if (type === 'document')
            return (
              mime.includes('document') ||
              mime.includes('text') ||
              mime.includes('word')
            )
          return false
        })
      })
    }

    if (searchTerm) {
      filtered = filtered.filter((m) =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterType !== 'all') {
      filtered = filtered.filter((m) => {
        const mime = m.mime_type.toLowerCase()
        if (filterType === 'image') return mime.startsWith('image/')
        if (filterType === 'video') return mime.startsWith('video/')
        if (filterType === 'audio') return mime.startsWith('audio/')
        if (filterType === 'pdf') return mime === 'application/pdf'
        return true
      })
    }

    setFilteredMedia(filtered)
  }

  const handleToggleSelect = (mediaId: string) => {
    if (multiple) {
      setSelectedIds((prev) =>
        prev.includes(mediaId)
          ? prev.filter((id) => id !== mediaId)
          : prev.length < maxSelection
            ? [...prev, mediaId]
            : prev
      )
    } else {
      setSelectedIds([mediaId])
    }
  }

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const selectedMedia = media.filter((m) => selectedIds.includes(m.media_id))
    if (selectedMedia.length > 0) {
      const mediaWithFileName = selectedMedia.map((m) => ({
        ...m,
        file_name: m.title,
        file_path: m.storage_path,
      }))
      onSelect(multiple ? mediaWithFileName : mediaWithFileName[0])
    }
  }

  const getMediaUrl = (path: string) =>
    `${import.meta.env.VITE_API_UPLOADS}${path}`

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[999999] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
        />

        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Biblioteka Mediów
              </h3>
              {allowedTypes && allowedTypes.length > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Filtr:{' '}
                  {allowedTypes
                    .map((t) => {
                      if (t === 'image') return 'Zdjęcia'
                      if (t === 'pdf') return 'PDF'
                      if (t === 'video') return 'Wideo'
                      if (t === 'audio') return 'Audio'
                      return t
                    })
                    .join(', ')}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Szukaj..."
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="all">Wszystkie</option>
                <option value="image">Zdjęcia</option>
                <option value="pdf">PDF</option>
                <option value="video">Wideo</option>
                <option value="audio">Audio</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-800">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="text-center py-20">
                <GridIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  {allowedTypes && allowedTypes.length > 0
                    ? `Brak plików typu: ${allowedTypes.join(', ')}`
                    : 'Brak plików w bibliotece'}
                </p>
                {searchTerm && (
                  <p className="text-gray-400 text-sm mt-2">
                    Spróbuj zmienić wyszukiwaną frazę
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredMedia.map((m) => {
                  const isSelected = selectedIds.includes(m.media_id)
                  const isImage = m.mime_type.startsWith('image/')
                  const isPDF = m.mime_type === 'application/pdf'

                  return (
                    <button
                      key={m.media_id}
                      type="button"
                      onClick={() => handleToggleSelect(m.media_id)}
                      onDoubleClick={handleConfirm}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        isSelected
                          ? 'border-blue-500 ring-2 ring-blue-500/20'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      {isImage ? (
                        <img
                          src={getMediaUrl(m.storage_path)}
                          className="w-full h-full object-cover"
                          alt={m.title}
                        />
                      ) : isPDF ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
                          <img
                            src={getMediaUrl(m.thumbnail_path)}
                            className="w-full h-full object-cover"
                            alt={m.title}
                          />
                          <span>{m.title}</span>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                          {m.thumbnail_path ? (
                            <img
                              src={getMediaUrl(m.thumbnail_path)}
                              className="w-full h-full object-cover"
                              alt={m.title}
                            />
                          ) : (
                            <span className="text-4xl">📁</span>
                          )}
                        </div>
                      )}

                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                          <CheckCircleIcon className="w-8 h-8 text-blue-500 fill-white" />
                        </div>
                      )}

                      <div className="absolute bottom-0 inset-x-0 p-2 bg-black/50 text-white text-[10px] truncate">
                        {m.title}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center gap-3 bg-gray-50 dark:bg-gray-900">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredMedia.length}{' '}
              {filteredMedia.length === 1 ? 'plik' : 'plików'}
              {selectedIds.length > 0 && ` • ${selectedIds.length} wybranych`}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Anuluj
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirm}
                disabled={selectedIds.length === 0}
                type="button"
              >
                Wybierz ({selectedIds.length})
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
