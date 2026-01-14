import { useState } from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';
import { type HoursComponentData } from '../../../store/pageComponents';
import Button from '../../ui/button/Button';

interface HoursEditorProps {
  data: HoursComponentData;
  onChange: (data: HoursComponentData) => void;
}

export default function HoursEditor({ data, onChange }: HoursEditorProps) {
  const [formData, setFormData] = useState<HoursComponentData>({
    title: data.title || 'Godziny otwarcia',
    hours: data.hours || [],
    specialNote: data.specialNote || '',
  });

  const handleChange = (field: keyof HoursComponentData, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const addHours = () => {
    const newHours = {
      days: 'Poniedziałek - Piątek',
      time: '9:00 - 17:00',
      closed: false,
    };

    handleChange('hours', [...formData.hours, newHours]);
  };

  const updateHours = (index: number, updates: any) => {
    const updatedHours = formData.hours.map((hour, i) =>
      i === index ? { ...hour, ...updates } : hour
    );
    handleChange('hours', updatedHours);
  };

  const removeHours = (index: number) => {
    handleChange('hours', formData.hours.filter((_, i) => i !== index));
  };

  const loadTemplate = (template: 'weekdays' | 'everyday' | 'weekend') => {
    let hours = [];

    switch (template) {
      case 'weekdays':
        hours = [
          { days: 'Poniedziałek - Piątek', time: '9:00 - 17:00', closed: false },
          { days: 'Sobota', time: '10:00 - 14:00', closed: false },
          { days: 'Niedziela', time: '', closed: true },
        ];
        break;

      case 'everyday':
        hours = [
          { days: 'Poniedziałek - Niedziela', time: '8:00 - 22:00', closed: false },
        ];
        break;

      case 'weekend':
        hours = [
          { days: 'Poniedziałek - Piątek', time: '', closed: true },
          { days: 'Sobota - Niedziela', time: '10:00 - 18:00', closed: false },
        ];
        break;
    }

    handleChange('hours', hours);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tytuł sekcji
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="np. Godziny otwarcia"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Szybkie szablony
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => loadTemplate('weekdays')}
          >
            Dni robocze (Pn-Pt + So)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => loadTemplate('everyday')}
          >
            Codziennie
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => loadTemplate('weekend')}
          >
            Tylko weekend
          </Button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Godziny ({formData.hours.length})
          </label>
          <Button size="sm" variant="primary" startIcon={<Plus />} onClick={addHours}>
            Dodaj godziny
          </Button>
        </div>

        {formData.hours.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <Clock className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-3">
              Brak godzin. Dodaj pierwsze godziny lub użyj szablonu.
            </p>
            <Button size="sm" variant="primary" onClick={addHours}>
              Dodaj pierwsze godziny
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {formData.hours.map((hour, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {hour.days}
                    </span>
                  </div>
                  <button
                    onClick={() => removeHours(index)}
                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Dni
                    </label>
                    <input
                      type="text"
                      value={hour.days}
                      onChange={(e) => updateHours(index, { days: e.target.value })}
                      placeholder="np. Poniedziałek - Piątek"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Godziny
                    </label>
                    <input
                      type="text"
                      value={hour.time}
                      onChange={(e) => updateHours(index, { time: e.target.value })}
                      placeholder="np. 9:00 - 17:00"
                      disabled={hour.closed}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hour.closed}
                    onChange={(e) => {
                      updateHours(index, {
                        closed: e.target.checked,
                        time: e.target.checked ? '' : hour.time,
                      });
                    }}
                    className="w-4 h-4 text-primary border-gray-300 rounded"
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Nieczynne (zamknięte)
                  </span>
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Specjalna uwaga
        </label>
        <textarea
          value={formData.specialNote}
          onChange={(e) => handleChange('specialNote', e.target.value)}
          rows={3}
          placeholder="np. W święta i dni ustawowo wolne nieczynne"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Dodatkowe informacje o godzinach otwarcia
        </p>
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Podgląd
        </h4>
        <div className="space-y-2">
          {formData.hours.map((hour, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">{hour.days}</span>
              <span className={`font-medium ${hour.closed ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                {hour.closed ? 'Nieczynne' : hour.time}
              </span>
            </div>
          ))}
        </div>
        {formData.specialNote && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            {formData.specialNote}
          </p>
        )}
      </div>
    </div>
  );
}