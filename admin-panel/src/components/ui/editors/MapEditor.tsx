import { useState } from 'react';
import { MapPin, Plus, Minus } from 'lucide-react';
import { type MapComponentData } from '../../../store/pageComponents';

interface MapEditorProps {
  data: MapComponentData;
  onChange: (data: MapComponentData) => void;
}

export default function MapEditor({ data, onChange }: MapEditorProps) {
  const [formData, setFormData] = useState<MapComponentData>({
    title: data.title || '',
    latitude: data.latitude || 52.2297,
    longitude: data.longitude || 21.0122,
    zoom: data.zoom || 15,
    marker: data.marker !== false,
    markerTitle: data.markerTitle || '',
    height: data.height || '400px',
  });

  const handleChange = (field: keyof MapComponentData, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const adjustZoom = (delta: number) => {
    const newZoom = Math.max(1, Math.min(20, (formData.zoom || 15) + delta));
    handleChange('zoom', newZoom);
  };

  const presetLocations = [
    { name: 'Warszawa', lat: 52.2297, lng: 21.0122 },
    { name: 'Kraków', lat: 50.0647, lng: 19.945 },
    { name: 'Wrocław', lat: 51.1079, lng: 17.0385 },
    { name: 'Gdańsk', lat: 54.352, lng: 18.6466 },
    { name: 'Poznań', lat: 52.4064, lng: 16.9252 },
  ];

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
          placeholder="np. Nasza lokalizacja"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Szybki wybór miasta
        </label>
        <div className="flex flex-wrap gap-2">
          {presetLocations.map((location) => (
            <button
              key={location.name}
              onClick={() => {
                handleChange('latitude', location.lat);
                handleChange('longitude', location.lng);
              }}
              className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-primary hover:text-white dark:hover:bg-primary rounded-lg transition-colors"
            >
              {location.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Szerokość geograficzna *
          </label>
          <input
            type="number"
            step="0.0001"
            value={formData.latitude}
            onChange={(e) => handleChange('latitude', parseFloat(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Latitude (np. 52.2297 dla Warszawy)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Długość geograficzna *
          </label>
          <input
            type="number"
            step="0.0001"
            value={formData.longitude}
            onChange={(e) => handleChange('longitude', parseFloat(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Longitude (np. 21.0122 dla Warszawy)
          </p>
        </div>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
          💡 Jak znaleźć współrzędne?
        </h4>
        <ol className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-decimal list-inside">
          <li>Otwórz Google Maps</li>
          <li>Znajdź lokalizację i kliknij prawym przyciskiem</li>
          <li>Kliknij na współrzędne u góry (zostaną skopiowane)</li>
          <li>Wklej tutaj: najpierw latitude, potem longitude</li>
        </ol>
        <a
          href="https://www.google.com/maps"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2"
        >
          <MapPin className="w-4 h-4" />
          Otwórz Google Maps
        </a>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Poziom powiększenia: {formData.zoom}
        </label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => adjustZoom(-1)}
            className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            title="Oddal"
          >
            <Minus className="w-4 h-4" />
          </button>

          <input
            type="range"
            min="1"
            max="20"
            value={formData.zoom}
            onChange={(e) => handleChange('zoom', parseInt(e.target.value))}
            className="flex-1"
          />

          <button
            onClick={() => adjustZoom(1)}
            className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            title="Przybliż"
          >
            <Plus className="w-4 h-4" />
          </button>

          <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-right">
            {formData.zoom}/20
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>Daleko (cały kraj)</span>
          <span>Blisko (ulica)</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Wysokość mapy
        </label>
        <select
          value={formData.height}
          onChange={(e) => handleChange('height', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        >
          <option value="300px">Niska (300px)</option>
          <option value="400px">Średnia (400px)</option>
          <option value="500px">Wysoka (500px)</option>
          <option value="600px">Bardzo wysoka (600px)</option>
          <option value="100vh">Pełna wysokość ekranu</option>
        </select>
      </div>

      <div className="space-y-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.marker}
            onChange={(e) => handleChange('marker', e.target.checked)}
            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Pokaż marker (pineskę) na mapie
          </span>
        </label>

        {formData.marker && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tytuł markera (tooltip)
            </label>
            <input
              type="text"
              value={formData.markerTitle}
              onChange={(e) => handleChange('markerTitle', e.target.value)}
              placeholder="np. Nasza siedziba"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Pojawi się po najechaniu na marker
            </p>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Podgląd ustawień
        </h4>
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600 dark:text-gray-400">Lokalizacja:</dt>
            <dd className="text-gray-900 dark:text-white font-mono">
              {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600 dark:text-gray-400">Zoom:</dt>
            <dd className="text-gray-900 dark:text-white">{formData.zoom}/20</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600 dark:text-gray-400">Wysokość:</dt>
            <dd className="text-gray-900 dark:text-white">{formData.height}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600 dark:text-gray-400">Marker:</dt>
            <dd className="text-gray-900 dark:text-white">
              {formData.marker ? '✓ Włączony' : '✗ Wyłączony'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}