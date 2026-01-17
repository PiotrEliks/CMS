import { useState, useCallback } from 'react'
import { api, BACKEND_URL } from '../api/axios'
import type { SectionMedia, ContentSection } from '../types'

export function useMediaCache() {
  const [mediaCache, setMediaCache] = useState<Map<string, SectionMedia>>(new Map())
  const [loading, setLoading] = useState(false)

  const fetchMediaForSections = useCallback(
    async (sections: ContentSection[]) => {
      const allMediaIds = sections.flatMap((s) => s.media_ids || [])
      const uniqueIds = [...new Set(allMediaIds.filter((id) => id && !mediaCache.has(id)))]

      if (uniqueIds.length === 0) return

      setLoading(true)
      try {
        const responses = await Promise.all(
          uniqueIds.map((id) =>
            api
              .get(`/media/${id}`)
              .then((res) => res.data)
              .catch(() => null)
          )
        )

        const newCache = new Map(mediaCache)
        responses.forEach((data) => {
          if (data) {
            const media = data.media || data
            if (media.media_id) {
              newCache.set(media.media_id, media)
            }
          }
        })
        setMediaCache(newCache)
      } finally {
        setLoading(false)
      }
    },
    [mediaCache]
  )

  const fetchMediaById = useCallback(
    async (mediaId: string): Promise<SectionMedia | null> => {
      if (mediaCache.has(mediaId)) {
        return mediaCache.get(mediaId)!
      }

      try {
        const res = await api.get(`/media/${mediaId}`)
        const media = res.data.media || res.data
        setMediaCache((prev) => {
          const newCache = new Map(prev)
          newCache.set(mediaId, media)
          return newCache
        })
        return media
      } catch {
        return null
      }
    },
    [mediaCache]
  )

  const getMediaUrl = useCallback(
    (mediaId: string): string => {
      const media = mediaCache.get(mediaId)
      if (!media) return ''
      return `${BACKEND_URL}${media.storage_path}`
    },
    [mediaCache]
  )

  const getThumbnailUrl = useCallback(
    (mediaId: string): string => {
      const media = mediaCache.get(mediaId)
      if (!media) return ''
      const path = media.thumbnail_path || media.storage_path
      return `${BACKEND_URL}${path}`
    },
    [mediaCache]
  )

  const getMedia = useCallback(
    (mediaId: string): SectionMedia | undefined => {
      return mediaCache.get(mediaId)
    },
    [mediaCache]
  )

  return {
    mediaCache,
    loading,
    fetchMediaForSections,
    fetchMediaById,
    getMediaUrl,
    getThumbnailUrl,
    getMedia,
  }
}
