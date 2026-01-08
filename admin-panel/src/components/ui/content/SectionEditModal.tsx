import { useState, useEffect } from 'react';
import {
  useContentSections,
  type ContentSection,
  type SectionType,
} from '../../../store/contentSections';
import { X, GridIcon, Trash2 } from 'lucide-react';
import Button from '../../ui/button/Button';
import MediaLibraryModal from './MediaLibraryModal';
import RichTextEditor from './RichTextEditor';

interface SectionEditModalProps {
  open: boolean;
  onClose: () => void;
  section: ContentSection;
  contentId: string;
}

interface Media {
  media_id: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  thumbnail_path?: string;
}

export default function SectionEditModal({
  open,
  onClose,
  section,
  contentId,
}: SectionEditModalProps) {
  const { updateSection } = useContentSections();
  const [loading, setLoading] = useState(false);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaModalMode, setMediaModalMode] = useState<'single' | 'multiple'>('single');

  const [formData, setFormData] = useState({
    heading: section.heading || '',
    subheading: section.subheading || '',
    body: section.body || '',
    status: section.status,
    media_ids: section.media_ids || [],
    settings: section.settings || {},
  });

  useEffect(() => {
    if (section) {
      setFormData({
        heading: section.heading || '',
        subheading: section.subheading || '',
        body: section.body || '',
        status: section.status,
        media_ids: section.media_ids || [],
        settings: section.settings || {},
      });
    }
  }, [section]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateSection(contentId, section.section_id, formData);
      onClose();
    } catch (error) {
      console.error('Failed to update section:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSettingsChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      settings: { ...prev.settings, [key]: value },
    }));
  };

  const handleMediaSelect = (media: Media | Media[]) => {
    if (Array.isArray(media)) {
      const ids = media.map((m) => m.media_id);
      handleChange('media_ids', ids);
    } else {
      handleChange('media_ids', [media.media_id]);
    }
  };

  const handleRemoveMedia = (mediaId: string) => {
    handleChange(
      'media_ids',
      formData.media_ids.filter((id) => id !== mediaId)
    );
  };

  const openMediaModal = (mode: 'single' | 'multiple') => {
    setMediaModalMode(mode);
    setMediaModalOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Edytuj sekcję
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Typ: <span className="font-medium">{section.section_type}</span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nagłówek
                  </label>
                  <input
                    type="text"
                    value={formData.heading}
                    onChange={(e) => handleChange('heading', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Wprowadź nagłówek sekcji"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Podtytuł <span className="text-gray-400">(opcjonalnie)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.subheading}
                    onChange={(e) => handleChange('subheading', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Wprowadź podtytuł"
                  />
                </div>

                {renderTypeEditor(
                  section.section_type,
                  formData,
                  handleChange,
                  handleSettingsChange,
                  openMediaModal,
                  handleRemoveMedia
                )}

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="status"
                    checked={formData.status}
                    onChange={(e) => handleChange('status', e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label
                    htmlFor="status"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Sekcja widoczna
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <Button variant="outline" onClick={onClose} disabled={loading}>
                  Anuluj
                </Button>
                <Button variant="primary" disabled={loading}>
                  {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <MediaLibraryModal
        open={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={handleMediaSelect}
        multiple={mediaModalMode === 'multiple'}
        maxSelection={20}
      />
    </>
  );
}

function renderTypeEditor(
  type: SectionType,
  formData: any,
  handleChange: (field: string, value: any) => void,
  handleSettingsChange: (key: string, value: any) => void,
  openMediaModal: (mode: 'single' | 'multiple') => void,
  handleRemoveMedia: (mediaId: string) => void
) {
  switch (type) {
    case 'text':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Treść
          </label>
          <RichTextEditor
            value={formData.body}
            onChange={(value) => handleChange('body', value)}
            height={400}
            placeholder="Wprowadź treść..."
          />
        </div>
      );

    case 'image':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Zdjęcie
          </label>
          {formData.media_ids.length > 0 ? (
            <div className="space-y-2">
              <div className="relative inline-block">
                <div className="w-48 h-48 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <img
                    src={`/uploads/${formData.media_ids[0]}`}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMedia(formData.media_ids[0])}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <Button variant="outline" onClick={() => openMediaModal('single')}>
                Zmień zdjęcie
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openMediaModal('single')}
              className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-primary transition-colors"
            >
              <GridIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600 dark:text-gray-400">Kliknij aby wybrać zdjęcie</p>
            </button>
          )}
        </div>
      );

    case 'gallery':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Galeria ({formData.media_ids.length} zdjęć)
            </label>
            {formData.media_ids.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-3">
                  {formData.media_ids.map((mediaId: string) => (
                    <div key={mediaId} className="relative group">
                      <div className="aspect-square border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                        <img
                          src={`/uploads/${mediaId}`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(mediaId)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" onClick={() => openMediaModal('multiple')}>
                  Dodaj więcej zdjęć
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openMediaModal('multiple')}
                className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-primary transition-colors"
              >
                <GridIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Kliknij aby wybrać zdjęcia</p>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Layout
              </label>
              <select
                value={formData.settings?.layout || 'grid'}
                onChange={(e) => handleSettingsChange('layout', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="grid">Grid</option>
                <option value="carousel">Carousel</option>
                <option value="masonry">Masonry</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kolumny
              </label>
              <input
                type="number"
                min="1"
                max="6"
                value={formData.settings?.columns || 3}
                onChange={(e) => handleSettingsChange('columns', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      );

    case 'pdf':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Dokument PDF
          </label>
          {formData.media_ids.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                <span className="text-4xl">📄</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">PDF Selected</p>
                  <p className="text-sm text-gray-500">ID: {formData.media_ids[0]}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMedia(formData.media_ids[0])}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <Button variant="outline" onClick={() => openMediaModal('single')}>
                Zmień PDF
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openMediaModal('single')}
              className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-primary transition-colors"
            >
              <span className="text-4xl block mb-2">📄</span>
              <p className="text-gray-600 dark:text-gray-400">Kliknij aby wybrać PDF</p>
            </button>
          )}
        </div>
      );

    case 'video':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL Wideo
            </label>
            <input
              type="url"
              value={formData.settings?.video_url || ''}
              onChange={(e) => handleSettingsChange('video_url', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Platforma
            </label>
            <select
              value={formData.settings?.video_provider || 'youtube'}
              onChange={(e) => handleSettingsChange('video_provider', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="youtube">YouTube</option>
              <option value="vimeo">Vimeo</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="autoplay"
              checked={formData.settings?.autoplay || false}
              onChange={(e) => handleSettingsChange('autoplay', e.target.checked)}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="autoplay" className="text-sm text-gray-700 dark:text-gray-300">
              Autoplay
            </label>
          </div>
        </div>
      );

    case 'html':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Kod HTML
          </label>
          <textarea
            value={formData.body}
            onChange={(e) => handleChange('body', e.target.value)}
            rows={12}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
            placeholder="<div>...</div>"
          />
        </div>
      );

    case 'embed':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Embed Code
          </label>
          <textarea
            value={formData.settings?.embed_code || ''}
            onChange={(e) => handleSettingsChange('embed_code', e.target.value)}
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white font-mono text-sm"
            placeholder='<iframe src="..." width="100%" height="400"></iframe>'
          />
          <p className="text-xs text-gray-500 mt-1">
            Wklej kod iframe lub script z zewnętrznych serwisów
          </p>
        </div>
      );

    default:
      return null;
  }
}
