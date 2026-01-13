import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import ComponentCard from '../../common/ComponentCard';
import Button from '../../ui/button/Button';
import { useSiteSettings } from '../../../store/siteSettings';
import MediaSelector from '../content/MediaSelector';
import { useMenus } from '../../../store/menus';

interface FooterSettingsProps {
  settings: any;
}

const MAX_DESCRIPTION_LENGTH = 250;

export default function FooterSettings({ settings: initialSettings }: FooterSettingsProps) {
  const { updateSettings, saving } = useSiteSettings();
  const { items: menus, fetchMenus } = useMenus();
  const [settings, setSettings] = useState(initialSettings || {});

  useEffect(() => {
    setSettings(initialSettings || {});
  }, [initialSettings]);

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleChange = (field: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleDescriptionChange = (value: string) => {
    if (value.length <= MAX_DESCRIPTION_LENGTH) {
      handleChange('footer_description', value);
    }
  };

  const handleSave = async () => {
    await updateSettings('footer', settings);
  };

  const activeMenus = menus.filter((m: any) => m.status);
  const descriptionLength = settings.footer_description?.length || 0;
  const remainingChars = MAX_DESCRIPTION_LENGTH - descriptionLength;

  return (
    <ComponentCard title="Ustawienia Footer" desc="Konfiguruj wygląd i zawartość stopki strony">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Logo Footer
          </label>
          <MediaSelector
            selectedMediaId={settings.footer_logo_media_id}
            onSelect={(mediaId) => handleChange('footer_logo_media_id', mediaId)}
            onRemove={() => handleChange('footer_logo_media_id', undefined)}
            allowedTypes={['image']}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Opcjonalne - jeśli puste, użyje logo z headera
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Menu Footer
          </label>
          <select
            value={settings.footer_menu_id || ''}
            onChange={(e) => handleChange('footer_menu_id', e.target.value)}
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
            Wybierz menu które będzie wyświetlane w footerze
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            O Stronie - Krótki Opis
          </label>
          <textarea
            value={settings.footer_description || ''}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            rows={4}
            maxLength={MAX_DESCRIPTION_LENGTH}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none"
            placeholder="Krótki opis Twojej firmy lub strony, który pojawi się w sekcji O nas w stopce..."
          />
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Będzie wyświetlany w sekcji "O nas" w footerze
            </p>
            <p
              className={`text-xs font-medium ${
                remainingChars < 20
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {descriptionLength} / {MAX_DESCRIPTION_LENGTH}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Kolor Tła
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={settings.footer_background_color || '#1a1a1a'}
              onChange={(e) => handleChange('footer_background_color', e.target.value)}
              className="w-20 h-10 rounded cursor-pointer"
            />
            <input
              type="text"
              value={settings.footer_background_color || '#1a1a1a'}
              onChange={(e) => handleChange('footer_background_color', e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white font-mono text-sm"
              placeholder="#1a1a1a"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tekst Copyright
          </label>
          <input
            type="text"
            value={settings.footer_copyright_text || ''}
            onChange={(e) => handleChange('footer_copyright_text', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            placeholder="© {year} Wszystkie prawa zastrzeżone"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Użyj{' '}
            <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
              {'{'}year{'}'}
            </code>{' '}
            aby automatycznie wstawić aktualny rok
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.footer_show_social ?? true}
              onChange={(e) => handleChange('footer_show_social', e.target.checked)}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Wyświetl ikony social media w footerze
            </span>
          </label>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="primary" startIcon={<Save />} onClick={handleSave} disabled={saving}>
            {saving ? 'Zapisywanie...' : 'Zapisz Ustawienia'}
          </Button>
        </div>
      </div>
    </ComponentCard>
  );
}