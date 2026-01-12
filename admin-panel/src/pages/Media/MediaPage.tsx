import { useEffect, useState } from 'react';
import ComponentCard from '../../components/common/ComponentCard';
import Button from '../../components/ui/button/Button';
import { useMedia } from '../../store/media';
import MediaGrid from '../../components/media/MediaGrid';
import MediaUploadModal from '../../components/media/MediaUploadModal';
import MediaDetailsDrawer from '../../components/media/MediaDetailsDrawer';
import MediaInUseModal from '../../components/media/MediaInUseModal';
import { usePermission } from '../../utils/permissions';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

export default function MediaPage() {
  const {
    items,
    loading,
    total,
    fetchMedia,
    fetchMediaDetails,
    selected,
    selectedUsage,
    clearSelected,
    deleteOne,
  } = useMedia();

  const [filters, setFilters] = useState<{ type?: 'image' | 'document' | 'all'; search?: string }>({
    type: 'all',
    search: '',
  });

  const [uploadOpen, setUploadOpen] = useState(false);
  const [inUseOpen, setInUseOpen] = useState(false);
  const [inUsePlaces, setInUsePlaces] = useState<any[]>([]);

  const canUpload = usePermission('media.upload');
  const canDelete = usePermission('media.delete');
  const canUpdate = usePermission('media.update');
  useEffect(() => {
    fetchMedia({ type: filters.type, search: filters.search });
  }, [filters.type, filters.search, fetchMedia]);

  const openDetails = async (id: string) => {
    await fetchMediaDetails(id);
  };

  const handleDelete = async (id: string) => {
    const res = await deleteOne(id);
    if (res.ok === false && res.code === 'MEDIA_IN_USE') {
      setInUsePlaces(res.places);
      setInUseOpen(true);
    }
  };

  return (
    <>
      <PageMeta
        title="Zarządzanie mediami"
        description="Strona zarządzania mediami w panelu administracyjnym"
      />
      <PageBreadcrumb pageTitle="Zarządzanie mediami" />
      <ComponentCard
        title={`Media (${total})`}
        button={
          canUpload ? (
            <Button size="sm" variant="primary" onClick={() => setUploadOpen(true)}>
              Dodaj plik
            </Button>
          ) : null
        }
      >
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilters((f) => ({ ...f, type: 'image' }))}
              className={`rounded-full px-4 py-2 text-sm border ${
                filters.type === 'image'
                  ? 'border-primary text-primary'
                  : 'border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300'
              }`}
            >
              Obrazy
            </button>
            <button
              onClick={() => setFilters((f) => ({ ...f, type: 'document' }))}
              className={`rounded-full px-4 py-2 text-sm border ${
                filters.type === 'document'
                  ? 'border-primary text-primary'
                  : 'border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300'
              }`}
            >
              Dokumenty
            </button>
            <button
              onClick={() => setFilters((f) => ({ ...f, type: 'all' }))}
              className={`rounded-full px-4 py-2 text-sm border ${
                filters.type === 'all'
                  ? 'border-primary text-primary'
                  : 'border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300'
              }`}
            >
              Wszystkie
            </button>
          </div>

          <input
            value={filters.search ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            placeholder="Szukaj (nazwa, tytuł, alt)..."
            className="w-full md:w-[360px] rounded-lg border border-gray-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-gray-700"
          />
        </div>

        <MediaGrid
          items={items}
          loading={loading}
          onOpen={(m) => openDetails(m.media_id)}
          onDelete={canDelete ? (m) => handleDelete(m.media_id) : undefined}
        />
      </ComponentCard>

      <MediaUploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />

      <MediaDetailsDrawer
        open={!!selected}
        media={selected}
        usage={selectedUsage}
        onClose={clearSelected}
        canUpdate={canUpdate}
      />

      <MediaInUseModal open={inUseOpen} places={inUsePlaces} onClose={() => setInUseOpen(false)} />
    </>
  );
}
