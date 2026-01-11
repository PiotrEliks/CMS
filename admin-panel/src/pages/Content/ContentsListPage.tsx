import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashBinIcon, EyeIcon } from '../../icons';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import Button from '../../ui/button/Button';
import { api } from '../../api/axios';
import { Access } from '../../components/permissions/Access';
import DeleteConfirmModal from '../../components/modal/DeleteConfirmModal';

interface Content {
  content_id: string;
  title: string;
  slug: string;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function ContentsListPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<Content | null>(null);

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/contents');
      setContents(res.data.items || []);
    } catch (error) {
      console.error('Failed to fetch contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!contentToDelete) return;

    try {
      await api.delete(`/contents/${contentToDelete.content_id}`);
      setContents((prev) => prev.filter((c) => c.content_id !== contentToDelete.content_id));
      setDeleteModalOpen(false);
      setContentToDelete(null);
    } catch (error) {
      console.error('Failed to delete content:', error);
    }
  };

  return (
    <>
      <PageMeta title="Zarządzanie Treścią" description="Lista wszystkich treści w systemie" />
      <PageBreadcrumb pageTitle="Treści" />

      <div className="space-y-6">
        <ComponentCard
          title="Wszystkie Treści"
          button={
            <Access allOf={['content.create']}>
              <Link to="/contents/new">
                <Button size="sm" variant="primary" startIcon={<PlusIcon />}>
                  Utwórz nową treść
                </Button>
              </Link>
            </Access>
          }
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : contents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Brak treści. Utwórz pierwszą treść aby rozpocząć.
              </p>
              <Access allOf={['content.create_any']}>
                <Link to="/contents/new">
                  <Button variant="primary" startIcon={<PlusIcon />}>
                    Utwórz nową treść
                  </Button>
                </Link>
              </Access>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                      Tytuł
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                      Slug
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                      Utworzono
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {contents.map((content) => (
                    <tr
                      key={content.content_id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                    >
                      <td className="py-3 px-4">
                        <Link
                          to={`/contents/${content.content_id}/edit`}
                          className="text-gray-900 dark:text-white hover:text-primary font-medium"
                        >
                          {content.title}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {content.slug}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                            content.status === 'P'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                          }`}
                        >
                          {content.status === 'P' ? 'Opublikowane' : 'Szkic'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(content.created_at).toLocaleDateString('pl-PL')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Access allOf={['content.read_any']}>
                            <Link to={`/contents/${content.content_id}/preview`}>
                              <Button size="sm" variant="outline">
                                <EyeIcon className="w-4 h-4" />
                              </Button>
                            </Link>
                          </Access>

                          <Access allOf={['content.update_any']}>
                            <Link to={`/contents/${content.content_id}/edit`}>
                              <Button size="sm" variant="outline">
                                <PencilIcon className="w-4 h-4" />
                              </Button>
                            </Link>
                          </Access>

                          <Access allOf={['content.delete_any']}>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setContentToDelete(content);
                                setDeleteModalOpen(true);
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <TrashBinIcon className="w-4 h-4" />
                            </Button>
                          </Access>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ComponentCard>
      </div>

      <DeleteConfirmModal
        open={deleteModalOpen}
        onCancel={() => {
          setDeleteModalOpen(false);
          setContentToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Usuń treść"
        message={
          contentToDelete
            ? `Czy na pewno chcesz usunąć treść "${contentToDelete.title}"? Wszystkie sekcje zostaną również usunięte.`
            : 'Czy na pewno chcesz usunąć tę treść?'
        }
      />
    </>
  );
}
