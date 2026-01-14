import { useState } from 'react';
import { Plus, Trash2, MessageSquare, Star } from 'lucide-react';
import { type TestimonialComponentData } from '../../../store/pageComponents';
import Button from '../../ui/button/Button';
import MediaSelector from '../content/MediaSelector';

interface TestimonialEditorProps {
  data: TestimonialComponentData;
  onChange: (data: TestimonialComponentData) => void;
}

export default function TestimonialEditor({ data, onChange }: TestimonialEditorProps) {
  const [formData, setFormData] = useState<TestimonialComponentData>({
    title: data.title || 'Co mówią nasi klienci',
    items: data.items || [],
    layout: data.layout || 'grid',
  });

  const handleChange = (field: keyof TestimonialComponentData, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const addTestimonial = () => {
    const newTestimonial = {
      quote: 'Świetna obsługa i profesjonalne podejście!',
      author: 'Jan Kowalski',
      role: '',
      company: '',
      rating: 5,
      media_id: undefined,
    };

    handleChange('items', [...formData.items, newTestimonial]);
  };

  const updateTestimonial = (index: number, updates: any) => {
    const updatedItems = formData.items.map((item, i) =>
      i === index ? { ...item, ...updates } : item
    );
    handleChange('items', updatedItems);
  };

  const removeTestimonial = (index: number) => {
    handleChange(
      'items',
      formData.items.filter((_, i) => i !== index)
    );
  };

  const renderStars = (rating: number, onChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            className={`transition-colors ${onChange ? 'cursor-pointer hover:scale-110' : ''}`}
            disabled={!onChange}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>
    );
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
          placeholder="np. Co mówią nasi klienci"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Układ
        </label>
        <select
          value={formData.layout}
          onChange={(e) => handleChange('layout', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        >
          <option value="slider">Slider (przewijanie)</option>
          <option value="grid">Siatka</option>
          <option value="masonry">Masonry (kafelki)</option>
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Opinie ({formData.items.length})
          </label>
          <Button size="sm" variant="primary" startIcon={<Plus />} onClick={addTestimonial}>
            Dodaj opinię
          </Button>
        </div>

        {formData.items.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-3">
              Brak opinii. Dodaj pierwszą opinię klienta.
            </p>
            <Button size="sm" variant="primary" onClick={addTestimonial}>
              Dodaj pierwszą opinię
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {formData.items.map((testimonial, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {testimonial.author}
                      </h4>
                      <div className="flex items-center gap-1 mt-1">
                        {renderStars(testimonial.rating || 0)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeTestimonial(index)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Opinia / Cytat *
                  </label>
                  <textarea
                    value={testimonial.quote}
                    onChange={(e) => updateTestimonial(index, { quote: e.target.value })}
                    rows={3}
                    placeholder="Treść opinii..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ocena (gwiazdki)
                  </label>
                  <div className="flex items-center gap-3">
                    {renderStars(testimonial.rating || 0, (rating) =>
                      updateTestimonial(index, { rating })
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.rating || 0} / 5
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Imię i nazwisko *
                    </label>
                    <input
                      type="text"
                      value={testimonial.author}
                      onChange={(e) => updateTestimonial(index, { author: e.target.value })}
                      placeholder="Jan Kowalski"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Rola / Stanowisko
                    </label>
                    <input
                      type="text"
                      value={testimonial.role || ''}
                      onChange={(e) => updateTestimonial(index, { role: e.target.value })}
                      placeholder="CEO"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Firma
                    </label>
                    <input
                      type="text"
                      value={testimonial.company || ''}
                      onChange={(e) => updateTestimonial(index, { company: e.target.value })}
                      placeholder="Firma ABC"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Zdjęcie autora
                  </label>
                  <MediaSelector
                    selectedMediaId={testimonial.media_id}
                    onSelect={(mediaId) => updateTestimonial(index, { media_id: mediaId })}
                    onRemove={() => updateTestimonial(index, { media_id: undefined })}
                    allowedTypes={['image']}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {formData.items.length > 0 && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Statystyki opinii
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Liczba opinii</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formData.items.length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Średnia ocena</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(
                    formData.items.reduce((sum, item) => sum + (item.rating || 0), 0) /
                    formData.items.length
                  ).toFixed(1)}
                </p>
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">5 gwiazdek</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formData.items.filter((item) => item.rating === 5).length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Ze zdjęciem</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formData.items.filter((item) => item.media_id).length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
