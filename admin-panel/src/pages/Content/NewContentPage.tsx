import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SaveIcon, ArrowLeftIcon } from 'lucide-react'
import PageBreadcrumb from '../../components/common/PageBreadCrumb'
import PageMeta from '../../components/common/PageMeta'
import Button from '../../ui/button/Button'
import { api } from '../../api/axios'
import { useAlerts } from '../../store/alerts'

export default function NewContentPage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const { showAlert } = useAlerts()

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    lead: '',
    body: '',
    meta_title: '',
    meta_description: '',
    status: 'D',
  })

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ł/g, 'l')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    })
  }

  const handleCreate = async () => {
    if (!formData.title || !formData.slug) {
      showAlert({
        variant: 'error',
        title: 'Tytuł i slug są wymagane',
        message: 'Treść nie została utworzona.',
        duration: 3000,
      })
      return
    }

    setSaving(true)
    try {
      const res = await api.post('/contents', formData)
      const newContentId = res.data.content_id

      showAlert({
        variant: 'success',
        title: 'Utworzono treśc',
        message: 'Treść została utworzona.',
        duration: 3000,
      })

      navigate(`/contents/${newContentId}/edit`)
    } catch (error: any) {
      console.error('Failed to create content:', error)
      alert(error?.response?.data?.error || 'Błąd tworzenia treści')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageMeta
        title="Dodawanie nowej treści"
        description="To jest strona dodawania nowej treści w panelu administracyjnym"
      />
      <PageBreadcrumb
        pageTitle="Nowa Treść"
        items={[{ label: 'Treści', path: '/contents' }]}
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            startIcon={<ArrowLeftIcon />}
            onClick={() => navigate('/contents')}
          >
            Powrót do listy
          </Button>

          <Button
            variant="primary"
            startIcon={<SaveIcon />}
            onClick={handleCreate}
            disabled={saving || !formData.title || !formData.slug}
          >
            {saving ? 'Tworzenie...' : 'Utwórz treść'}
          </Button>
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
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Wprowadź tytuł strony"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    slug: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white font-mono"
                placeholder="strona-o-nas"
              />
              <p className="text-xs text-gray-500 mt-1">
                Slug jest generowany automatycznie z tytułu, ale możesz go
                edytować
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lead (krótki opis)
              </label>
              <textarea
                value={formData.lead}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lead: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Krótki opis strony..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                value={formData.meta_title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    meta_title: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="Tytuł dla wyszukiwarek"
                maxLength={70}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meta Description
              </label>
              <textarea
                value={formData.meta_description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    meta_description: e.target.value,
                  })
                }
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="Opis dla wyszukiwarek"
                maxLength={160}
              />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            💡 <strong>Wskazówka:</strong> Po utworzeniu treści będziesz mógł
            dodać sekcje (tekst, zdjęcia, galerie, wideo, etc.) na stronie
            edycji.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pb-8">
          <Button variant="outline" onClick={() => navigate('/contents')}>
            Anuluj
          </Button>

          <Button
            variant="primary"
            startIcon={<SaveIcon />}
            onClick={handleCreate}
            disabled={saving || !formData.title || !formData.slug}
          >
            {saving ? 'Tworzenie...' : 'Utwórz i przejdź do edycji'}
          </Button>
        </div>
      </div>
    </>
  )
}
