import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import Button from '../../ui/button/Button';
import { api } from '../../api/axios';
import RichTextEditor from '../../components/ui/content/RichTextEditor';
import MediaSelector from '../../components/ui/content/MediaSelector';
import CategorySelector from '../../components/ui/content/CategorySelector';
import PageBuilder from '../../components/ui/content/PageBuilder';
import ContentSections from '../../components/ui/content/ContentSections';

interface Content {
  content_id: string;
  title: string;
  slug: string;
  type?: string;
  status: string;
  lead?: string;
  body?: string;
  cover_media_id?: string;
  author?: string;
  published_at?: string;
  meta_title?: string;
  meta_description?: string;
  og_title?: string;
  og_description?: string;
  created_at: string;
  updated_at: string;
}

export default function EditContentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'sections' | 'components' | 'seo'>('basic');

  const [formData, setFormData] = useState<Partial<Content>>({
    title: '',
    slug: '',
    type: 'page',
    status: 'D',
    lead: '',
    body: '',
    cover_media_id: undefined,
    author: '',
    meta_title: '',
    meta_description: '',
    og_title: '',
    og_description: '',
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!isNew && id) {
      fetchContent();
      fetchCategories();
    }
  }, [id, isNew]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/contents/${id}`);
      setFormData(res.data);
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get(`/categories/contents/${id}/categories`);
      setSelectedCategories(res.data.map((c: any) => c.category_id));
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleChange = (field: keyof Content, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let contentId = id;

      if (isNew) {
        const res = await api.post('/contents', formData);
        contentId = res.data.content_id;

        if (selectedCategories.length > 0) {
          await api.post(`/contents/${contentId}/categories`, {
            category_ids: selectedCategories,
          });
        }

        navigate(`/contents/${contentId}/edit`);
      } else {
        await api.put(`/contents/${id}`, formData);

        await api.post(`/categories/contents/${id}/categories`, {
          category_ids: selectedCategories,
        });
      }
    } catch (error) {
      console.error('Failed to save content:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      await api.post(`/contents/${id}/publish`);
      setFormData((prev) => ({ ...prev, status: 'P' }));
    } catch (error) {
      console.error('Failed to publish:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUnpublish = async () => {
    setSaving(true);
    try {
      await api.post(`/contents/${id}/unpublish`);
      setFormData((prev) => ({ ...prev, status: 'D' }));
    } catch (error) {
      console.error('Failed to unpublish:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title={isNew ? 'Utwórz treść' : `Edytuj: ${formData.title}`} description="" />
      <PageBreadcrumb pageTitle={isNew ? 'Utwórz treść' : 'Edytuj treść'} />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/contents">
            <Button variant="outline" startIcon={<ArrowLeft />}>
              Wróć do listy
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            {!isNew && (
              <>
                <Link to={`/contents/${id}/preview`}>
                  <Button variant="outline" startIcon={<Eye />}>
                    Podgląd
                  </Button>
                </Link>
                {formData.status === 'P' ? (
                  <Button variant="outline" onClick={handleUnpublish} disabled={saving}>
                    Cofnij publikację
                  </Button>
                ) : (
                  <Button variant="primary" onClick={handlePublish} disabled={saving}>
                    Opublikuj
                  </Button>
                )}
              </>
            )}
            <Button variant="primary" startIcon={<Save />} onClick={handleSave} disabled={saving}>
              {saving ? 'Zapisywanie...' : 'Zapisz'}
            </Button>
          </div>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex gap-4">
            {[
              { key: 'basic', label: 'Informacje podstawowe' },
              { key: 'sections', label: 'Proste sekcje' },
              { key: 'components', label: 'Konstruktor stron' },
              { key: 'seo', label: 'SEO i metadane' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'basic' && (
          <ComponentCard title="Informacje podstawowe">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tytuł *
                  </label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="Tytuł strony"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) => handleChange('slug', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="slug-strony"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Typ
                  </label>
                  <select
                    value={formData.type || 'page'}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="page">Strona</option>
                    <option value="post">Artykuł</option>
                    <option value="homepage">Strona główna</option>
                    <option value="service">Usługa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Autor
                  </label>
                  <input
                    type="text"
                    value={formData.author || ''}
                    onChange={(e) => handleChange('author', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="Imię i nazwisko autora"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Wstęp / Streszczenie
                </label>
                <textarea
                  value={formData.lead || ''}
                  onChange={(e) => handleChange('lead', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Krótkie wprowadzenie..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Zawartość
                </label>
                <RichTextEditor
                  value={formData.body || ''}
                  onChange={(value) => handleChange('body', value)}
                  height={400}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Zdjęcie okładki
                </label>
                <MediaSelector
                  selectedMediaId={formData.cover_media_id}
                  onSelect={(mediaId) => handleChange('cover_media_id', mediaId)}
                  onRemove={() => handleChange('cover_media_id', undefined)}
                  allowedTypes={['image']}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kategorie
                </label>
                <CategorySelector
                  selectedCategories={selectedCategories}
                  onChange={setSelectedCategories}
                />
              </div>
            </div>
          </ComponentCard>
        )}

        {activeTab === 'sections' && !isNew && (
          <ComponentCard title="Proste sekcje">
            <ContentSections contentId={id!} />
          </ComponentCard>
        )}

        {activeTab === 'components' && !isNew && (
          <ComponentCard title="Konstruktor stron (Zaawansowane komponenty)">
            <PageBuilder contentId={id!} />
          </ComponentCard>
        )}

        {activeTab === 'seo' && (
          <ComponentCard title="SEO i metadane">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tytuł meta
                </label>
                <input
                  type="text"
                  value={formData.meta_title || ''}
                  onChange={(e) => handleChange('meta_title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Tytuł SEO"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Opis meta
                </label>
                <textarea
                  value={formData.meta_description || ''}
                  onChange={(e) => handleChange('meta_description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Opis SEO"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tytuł OG (Media społecznościowe)
                </label>
                <input
                  type="text"
                  value={formData.og_title || ''}
                  onChange={(e) => handleChange('og_title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Tytuł do mediów społecznościowych"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Opis OG
                </label>
                <textarea
                  value={formData.og_description || ''}
                  onChange={(e) => handleChange('og_description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Opis dla mediów społecznościowych"
                />
              </div>
            </div>
          </ComponentCard>
        )}
      </div>
    </>
  );
}
