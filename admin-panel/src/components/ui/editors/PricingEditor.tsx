import { useState } from 'react';
import { Plus, Trash2, DollarSign } from 'lucide-react';
import { type PricingComponentData } from '../../../store/pageComponents';
import Button from '../../ui/button/Button';
import MediaSelector from '../content/MediaSelector';

interface PricingEditorProps {
  data: PricingComponentData;
  onChange: (data: PricingComponentData) => void;
}

const MAX_DESCRIPTION_LENGTH = 200;

export default function PricingEditor({ data, onChange }: PricingEditorProps) {
  const [formData, setFormData] = useState<PricingComponentData>({
    title: data.title || 'Cennik',
    subtitle: data.subtitle || '',
    services: data.services || [],
  });

  const handleChange = (field: keyof PricingComponentData, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const addService = () => {
    const newService = {
      name: 'Nowa usługa',
      price: '99',
      description: '',
      media_id: undefined,
    };

    handleChange('services', [...formData.services, newService]);
  };

  const updateService = (index: number, updates: any) => {
    const updatedServices = formData.services.map((service, i) =>
      i === index ? { ...service, ...updates } : service
    );
    handleChange('services', updatedServices);
  };

  const removeService = (index: number) => {
    handleChange(
      'services',
      formData.services.filter((_, i) => i !== index)
    );
  };

  const getRemainingChars = (text: string) => {
    return MAX_DESCRIPTION_LENGTH - (text?.length || 0);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tytuł sekcji
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="np. Cennik usług"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Podtytuł
          </label>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) => handleChange('subtitle', e.target.value)}
            placeholder="np. Nasze usługi i ceny"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Usługi ({formData.services.length})
          </label>
          <Button size="sm" variant="primary" startIcon={<Plus />} onClick={addService}>
            Dodaj usługę
          </Button>
        </div>

        {formData.services.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <DollarSign className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-3">
              Brak usług. Dodaj pierwszą usługę do cennika.
            </p>
            <Button size="sm" variant="primary" onClick={addService}>
              Dodaj pierwszą usługę
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {formData.services.map((service, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{service.name}</h4>
                      <p className="text-lg font-bold text-primary">{service.price} zł</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeService(index)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nazwa usługi *
                    </label>
                    <input
                      type="text"
                      value={service.name}
                      onChange={(e) => updateService(index, { name: e.target.value })}
                      placeholder="np. Strzyżenie męskie"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cena (zł) *
                    </label>
                    <input
                      type="text"
                      value={service.price}
                      onChange={(e) => updateService(index, { price: e.target.value })}
                      placeholder="99"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Opis usługi
                    </label>
                    <span
                      className={`text-xs ${
                        getRemainingChars(service.description || '') < 20
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {service.description?.length || 0} / {MAX_DESCRIPTION_LENGTH}
                    </span>
                  </div>
                  <textarea
                    value={service.description || ''}
                    onChange={(e) => {
                      const newValue = e.target.value.slice(0, MAX_DESCRIPTION_LENGTH);
                      updateService(index, { description: newValue });
                    }}
                    rows={3}
                    maxLength={MAX_DESCRIPTION_LENGTH}
                    placeholder="Krótki opis usługi (max 200 znaków)..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Pozostało: {getRemainingChars(service.description || '')} znaków
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Zdjęcie poglądu usługi
                  </label>
                  <MediaSelector
                    selectedMediaId={service.media_id}
                    onSelect={(mediaId) => updateService(index, { media_id: mediaId })}
                    onRemove={() => updateService(index, { media_id: undefined })}
                    allowedTypes={['image']}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Zdjęcie będzie wyświetlane jako miniatura przy usłudze
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {formData.services.length > 0 && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Podsumowanie cennika
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Liczba usług</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formData.services.length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Najtańsza</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Math.min(...formData.services.map((s) => parseFloat(s.price) || 0))} zł
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Najdroższa</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Math.max(...formData.services.map((s) => parseFloat(s.price) || 0))} zł
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Ze zdjęciem</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formData.services.filter((s) => s.media_id).length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
