import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SaveIcon, ArrowLeftIcon } from 'lucide-react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import Button from '../../ui/button/Button';
import SectionManager from '../../components/ui/content/SectionManager';
import { api } from '../../api/axios';
import { Access } from '../../components/permissions/Access';
import { useAlerts, type AlertPayload } from '../../store/alerts';

interface Content {
  content_id: string;
  title: string;
  slug: string;
  lead?: string;
  body?: string;
  status: string;
  meta_title?: string;
  meta_description?: string;
  published_at?: string;
}

const showAlert = (payload: AlertPayload) => {
  useAlerts.getState().showAlert(payload);
};

export default function EditContentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    lead: '',
    meta_title: '',
    meta_description: '',
    status: 'draft',
  });

  useEffect(() => {
    if (id) {
      fetchContent();
    }
  }, [id]);

  const fetchContent = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const res = await api.get(`/contents/${id}`);
      const data = res.data;

      setContent(data);
      setFormData({
        title: data.title || '',
        slug: data.slug || '',
        lead: data.lead || '',
        meta_title: data.meta_title || '',
        meta_description: data.meta_description || '',
        status: data.status || 'draft',
      });
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id) return;

    setSaving(true);
    try {
      await api.put(`/contents/${id}`, formData);

      showAlert({
        variant: 'success',
        title: 'Zapisano treść',
        message: 'Treść została pomyślnie zapisana.',
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to save content:', error);
      showAlert({
        variant: 'error',
        title: 'Błąd zapisu',
        message: 'Nie udało się zapisać treści.',
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!id) return;

    setSaving(true);
    try {
      await api.post(`/contents/${id}/publish`);
      setFormData((prev) => ({ ...prev, status: 'published' }));
      alert('Opublikowano!');
    } catch (error) {
      console.error('Failed to publish content:', error);
      alert('Błąd publikacji');
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

  if (!content) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Nie znaleziono treści</p>
        <Button onClick={() => navigate('/contents')} className="mt-4">
          Powrót do listy
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`Edycja: ${content.title}`}
        description="Edytuj treść i zarządzaj sekcjami"
      />
      <PageBreadcrumb pageTitle={content.title} />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            startIcon={<ArrowLeftIcon />}
            onClick={() => navigate('/contents')}
          >
            Powrót do listy
          </Button>

          <div className="flex items-center gap-3">
            <Access allOf={['content.update']}>
              <Button
                variant="primary"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Zapisywanie...' : 'Zapisz'}
              </Button>
            </Access>

            <Access allOf={['content.update_any']}>
              {formData.status !== 'P' && (
                <Button variant="primary" onClick={handlePublish} disabled={saving}>
                  Opublikuj
                </Button>
              )}
            </Access>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Podstawowe informacje
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tytuł <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Wprowadź tytuł strony"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white font-mono"
                placeholder="strona-o-nas"
              />
              <p className="text-xs text-gray-500 mt-1">URL strony: /strony/{formData.slug}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lead (krótki opis)
              </label>
              <textarea
                value={formData.lead}
                onChange={(e) => setFormData({ ...formData, lead: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Krótki opis strony..."
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">SEO</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                value={formData.meta_title}
                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="Tytuł dla wyszukiwarek (60-70 znaków)"
                maxLength={70}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.meta_title.length}/70 znaków</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meta Description
              </label>
              <textarea
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="Opis dla wyszukiwarek (150-160 znaków)"
                maxLength={160}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.meta_description.length}/160 znaków
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <Access allOf={['content.read']}>
            <SectionManager contentId={id!} />
          </Access>
        </div>

        <div className="flex items-center justify-end gap-3 pb-8">
          <Button variant="outline" onClick={() => navigate('/contents')}>
            Anuluj
          </Button>

          <Access allOf={['content.update_any']}>
            <Button
              variant="primary"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </Button>
          </Access>
        </div>
      </div>
    </>
  );
}
