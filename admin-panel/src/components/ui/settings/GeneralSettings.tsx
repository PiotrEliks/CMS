import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import ComponentCard from '../../common/ComponentCard'
import Button from '../../ui/button/Button'
import { useSiteSettings } from '../../../store/siteSettings'

interface GeneralSettingsProps {
    settings: any
}

export default function GeneralSettings({
    settings: initialSettings,
}: GeneralSettingsProps) {
    const { updateSettings, saving } = useSiteSettings()
    const [settings, setSettings] = useState(initialSettings || {})

    useEffect(() => {
        setSettings(initialSettings || {})
    }, [initialSettings])

    const handleChange = (field: string, value: any) => {
        setSettings((prev: any) => ({ ...prev, [field]: value }))
    }

    const handleSave = async () => {
        await updateSettings('general', settings)
    }

    return (
        <ComponentCard
            title="Ustawienia Ogólne"
            desc="Podstawowe informacje o stronie"
        >
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nazwa Strony
                    </label>
                    <input
                        type="text"
                        value={settings.site_name || ''}
                        onChange={(e) =>
                            handleChange('site_name', e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        placeholder="Moja Strona"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Nazwa Twojej firmy lub strony internetowej
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Slogan / Tagline
                    </label>
                    <input
                        type="text"
                        value={settings.site_tagline || ''}
                        onChange={(e) =>
                            handleChange('site_tagline', e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        placeholder="Profesjonalne usługi wysokiej jakości"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Krótki opis działalności (1 zdanie)
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Opis Strony
                    </label>
                    <textarea
                        value={settings.site_description || ''}
                        onChange={(e) =>
                            handleChange('site_description', e.target.value)
                        }
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        placeholder="Szczegółowy opis działalności firmy..."
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Ogólny opis Twojej firmy lub strony (2-3 zdania)
                    </p>
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
