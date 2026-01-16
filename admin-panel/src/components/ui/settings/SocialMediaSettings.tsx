import { useState, useEffect } from 'react'
import {
  Save,
  Plus,
  Trash2,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Github,
} from 'lucide-react'
import ComponentCard from '../../common/ComponentCard'
import Button from '../../ui/button/Button'
import { useSiteSettings, type SocialMedia } from '../../../store/siteSettings'

interface SocialMediaSettingsProps {
  settings: any
}

const platformIcons: Record<string, any> = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  github: Github,
}

const platformLabels: Record<string, string> = {
  facebook: 'Facebook',
  twitter: 'Twitter / X',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  github: 'GitHub',
}

export default function SocialMediaSettings({
  settings: initialSettings,
}: SocialMediaSettingsProps) {
  const { updateSettings, saving } = useSiteSettings()
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>(
    initialSettings?.social_media || []
  )

  useEffect(() => {
    setSocialMedia(initialSettings?.social_media || [])
  }, [initialSettings])

  const handleAdd = () => {
    setSocialMedia([...socialMedia, { platform: 'facebook', url: '' }])
  }

  const handleRemove = (index: number) => {
    setSocialMedia(socialMedia.filter((_, i) => i !== index))
  }

  const handleChange = (
    index: number,
    field: keyof SocialMedia,
    value: any
  ) => {
    const updated = [...socialMedia]
    updated[index] = { ...updated[index], [field]: value }
    setSocialMedia(updated)
  }

  const handleSave = async () => {
    await updateSettings('social_media', { social_media: socialMedia })
  }

  return (
    <ComponentCard
      title="Social Media"
      desc="Zarządzaj linkami do mediów społecznościowych"
      button={
        <Button
          variant="outline"
          size="sm"
          startIcon={<Plus />}
          onClick={handleAdd}
        >
          Dodaj Link
        </Button>
      }
    >
      <div className="space-y-6">
        {socialMedia.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>Brak dodanych linków do social media</p>
            <p className="text-sm mt-2">Kliknij "Dodaj Link" aby rozpocząć</p>
          </div>
        ) : (
          <div className="space-y-4">
            {socialMedia.map((item, index) => {
              const Icon = platformIcons[item.platform] || Facebook

              return (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <Icon className="w-6 h-6 text-gray-400" />
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Platforma
                      </label>
                      <select
                        value={item.platform}
                        onChange={(e) =>
                          handleChange(index, 'platform', e.target.value as any)
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                      >
                        {Object.entries(platformLabels).map(
                          ([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        URL
                      </label>
                      <input
                        type="url"
                        value={item.url}
                        onChange={(e) =>
                          handleChange(index, 'url', e.target.value)
                        }
                        placeholder="https://facebook.com/yourpage"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemove(index)}
                    className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {socialMedia.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Podgląd
            </h4>
            <div className="flex gap-3">
              {socialMedia
                .filter((item) => item.url)
                .map((item, index) => {
                  const Icon = platformIcons[item.platform] || Facebook
                  return (
                    <a
                      key={index}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      title={platformLabels[item.platform]}
                    >
                      <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </a>
                  )
                })}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="primary"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Zapisywanie...' : 'Zapisz Ustawienia'}
          </Button>
        </div>
      </div>
    </ComponentCard>
  )
}
