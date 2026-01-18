import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import ComponentCard from '../../common/ComponentCard'
import Button from '../../ui/button/Button'
import { useSiteSettings } from '../../../store/siteSettings'
import MediaSelector from '../content/MediaSelector'
import { useMenus } from '../../../store/menus'

interface HeaderSettingsProps {
  settings: any
}

export default function HeaderSettings({
  settings: initialSettings,
}: HeaderSettingsProps) {
  const { updateSettings, saving } = useSiteSettings()
  const { items: menus, fetchMenus } = useMenus()
  const [settings, setSettings] = useState(initialSettings || {})

  useEffect(() => {
    setSettings(initialSettings || {})
  }, [initialSettings])

  useEffect(() => {
    fetchMenus()
  }, [])

  const handleChange = (field: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    const dataToSave: any = {}
    
    Object.keys(settings).forEach((key) => {
      const value = settings[key]
      if (value === undefined) {
        dataToSave[key] = null
      } else {
        dataToSave[key] = value
      }
    })
    
    await updateSettings('header', dataToSave)
  }

  const activeMenus = menus.filter((m: any) => m.status)

  return (
    <ComponentCard
      title="Ustawienia Header"
      desc="Konfiguruj wygląd i zawartość nagłówka strony"
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Logo Header
          </label>
          <MediaSelector
            selectedMediaId={settings.header_logo_media_id}
            onSelect={(mediaId) => {
              handleChange('header_logo_media_id', mediaId)
            }}
            onRemove={() => {
              handleChange('header_logo_media_id', null)
            }}
            allowedTypes={['image']}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Rekomendowany rozmiar: 200x50px (PNG z przezroczystym tłem)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Menu Header
          </label>
          <select
            value={settings.header_menu_id || ''}
            onChange={(e) => {
              const value = e.target.value || null
              handleChange('header_menu_id', value)
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          >
            <option value="">-- Wybierz menu --</option>
            {activeMenus.map((menu: any) => (
              <option key={menu.menu_id} value={menu.menu_id}>
                {menu.name} ({menu.code})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Wybierz menu które będzie wyświetlane w headerze
          </p>
        </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kolor Tła
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.header_background_color || '#ffffff'}
                onChange={(e) =>
                  handleChange('header_background_color', e.target.value)
                }
                className="w-20 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={settings.header_background_color || '#ffffff'}
                onChange={(e) =>
                  handleChange('header_background_color', e.target.value)
                }
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white font-mono text-sm"
                placeholder="#ffffff"
              />
            </div>
          </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.header_show_social ?? false}
              onChange={(e) =>
                handleChange('header_show_social', e.target.checked)
              }
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Wyświetl ikony social media w headerze
            </span>
          </label>
        </div>

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