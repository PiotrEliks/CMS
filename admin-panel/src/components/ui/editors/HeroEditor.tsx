import { useState } from 'react'
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import Button from '../../../ui/button/Button'
import { type HeroComponentData } from '../../../store/pageComponents'
import MediaLibraryModal from '../../ui/content/MediaLibraryModal'

interface HeroEditorProps {
  data: HeroComponentData
  onChange: (data: HeroComponentData) => void
}

export default function HeroEditor({ data, onChange }: HeroEditorProps) {
  const [mediaModalOpen, setMediaModalOpen] = useState(false)
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number | null>(
    null
  )

  const slides = data.slides || []

  const handleSlideChange = (index: number, field: string, value: any) => {
    const newSlides = [...slides]
    newSlides[index] = { ...newSlides[index], [field]: value }
    onChange({ ...data, slides: newSlides })
  }

  const handleAddSlide = () => {
    onChange({
      ...data,
      slides: [
        ...slides,
        {
          title: '',
          subtitle: '',
          buttonText: '',
          buttonLink: '',
        },
      ],
    })
  }

  const handleRemoveSlide = (index: number) => {
    const newSlides = slides.filter((_, i) => i !== index)
    onChange({ ...data, slides: newSlides })
  }

  const handleMediaSelect = (media: any) => {
    if (selectedSlideIndex !== null) {
      handleSlideChange(selectedSlideIndex, 'media_id', media.media_id)
    }
    setMediaModalOpen(false)
    setSelectedSlideIndex(null)
  }

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Słajdy
            </h4>
            <Button
              size="sm"
              variant="outline"
              startIcon={<Plus />}
              onClick={handleAddSlide}
            >
              Dodaj słajd
            </Button>
          </div>

          {slides.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Brak słajdów
              </p>
              <Button
                variant="primary"
                startIcon={<Plus />}
                onClick={handleAddSlide}
              >
                Dodaj swój pierwszy słajd
              </Button>
            </div>
          ) : (
            slides.map((slide, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Słajd {index + 1}
                  </span>
                  <button
                    onClick={() => handleRemoveSlide(index)}
                    className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tytuł
                  </label>
                  <input
                    type="text"
                    value={slide.title || ''}
                    onChange={(e) =>
                      handleSlideChange(index, 'title', e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="Tytuł słajdu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Podtytuł
                  </label>
                  <input
                    type="text"
                    value={slide.subtitle || ''}
                    onChange={(e) =>
                      handleSlideChange(index, 'subtitle', e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="Podtytuł słajdu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Opis (opcjonalnie)
                  </label>
                  <textarea
                    value={slide.description || ''}
                    onChange={(e) =>
                      handleSlideChange(index, 'description', e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="Dodatkowy opis"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tekst przycisku
                    </label>
                    <input
                      type="text"
                      value={slide.buttonText || ''}
                      onChange={(e) =>
                        handleSlideChange(index, 'buttonText', e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      placeholder="Zaczynaj"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Link przycisku
                    </label>
                    <input
                      type="text"
                      value={slide.buttonLink || ''}
                      onChange={(e) =>
                        handleSlideChange(index, 'buttonLink', e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      placeholder="/kontakt"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Obraz tła
                  </label>
                  {slide.media_id ? (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                        Obraz wybrany: {slide.media_id}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSlideIndex(index)
                          setMediaModalOpen(true)
                        }}
                      >
                        Zmień
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleSlideChange(index, 'media_id', undefined)
                        }
                      >
                        Usuń
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      startIcon={<ImageIcon />}
                      onClick={() => {
                        setSelectedSlideIndex(index)
                        setMediaModalOpen(true)
                      }}
                    >
                      Wybierz obraz tła
                    </Button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nieprzezroczystość przysłony: {slide.overlayOpacity || 50}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={slide.overlayOpacity || 50}
                    onChange={(e) =>
                      handleSlideChange(
                        index,
                        'overlayOpacity',
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full"
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            Ustawienia suwaka
          </h4>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.autoplay ?? true}
              onChange={(e) =>
                onChange({
                  ...data,
                  autoplay: e.target.checked,
                })
              }
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Odtwarzanie automatyczne
            </span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Interwał (ms)
            </label>
            <input
              type="number"
              value={data.interval || 5000}
              onChange={(e) =>
                onChange({
                  ...data,
                  interval: parseInt(e.target.value),
                })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="5000"
              min="1000"
              step="1000"
            />
          </div>
        </div>
      </div>

      <MediaLibraryModal
        open={mediaModalOpen}
        onClose={() => {
          setMediaModalOpen(false)
          setSelectedSlideIndex(null)
        }}
        onSelect={handleMediaSelect}
        allowedTypes={['image']}
        multiple={false}
      />
    </>
  )
}
