import { useEffect, useState } from 'react';
import Button from '../ui/button/Button';
import type { MediaItem, MediaUsagePlace } from '../../store/media';
import { useMedia } from '../../store/media';
import { Link } from 'react-router-dom';

export default function MediaDetailsDrawer({
  open,
  media,
  usage,
  onClose,
  canUpdate,
}: {
  open: boolean;
  media: MediaItem | null;
  usage: MediaUsagePlace[];
  onClose: () => void;
  canUpdate: boolean;
}) {
  const { update, loading } = useMedia();
  const [title, setTitle] = useState('');
  const [alt, setAlt] = useState('');
  const [status, setStatus] = useState(true);

  useEffect(() => {
    setTitle(media?.title ?? '');
    setAlt(media?.alt_text ?? '');
    setStatus(media?.status ?? true);
  }, [media]);

  if (!open || !media) return null;

  const isImage = (media.mime_type ?? '').startsWith('image/');
  const previewUrl = media.url ? media.url : `/uploads/${media.storage_path}`;

  const save = async () => {
    await update(media.media_id, { title, alt_text: alt, status });
  };

  const isPdf = media.mime_type === 'application/pdf';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 top-19">
      <div className="h-full w-full max-w-xl bg-white p-5 dark:bg-gray-900 overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Szczegóły</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" type="button">
            ✕
          </button>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="aspect-video bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
            {isImage && (
              <img src={`${import.meta.env.VITE_API_UPLOADS}${previewUrl}`} alt={alt} className="h-full w-full object-cover" />
            )}
            {isPdf && (
              <div className="mt-4 h-[500px] w-full rounded-lg border border-gray-200 overflow-hidden">
                <iframe
                  src={`${import.meta.env.VITE_API_UPLOADS}${previewUrl}`}
                  className="h-full w-full"
                  title={media.title ?? 'PDF preview'}
                />
              </div>
          )}
          </div>
          <div className="p-4 text-sm">
            <p className="text-gray-700 dark:text-gray-200">
              <span className="font-medium">Ścieżka:</span> {media.storage_path}
            </p>
            <p className="text-gray-500 mt-1">{media.mime_type}</p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tytuł"
            className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2 text-sm dark:border-gray-700"
            disabled={!canUpdate}
          />
          <input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="ALT"
            className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2 text-sm dark:border-gray-700"
            disabled={!canUpdate}
          />

          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Status</p>
              <p className="text-xs text-gray-500">Czy zasób jest aktywny/publiczny.</p>
            </div>
            <button
              type="button"
              onClick={() => canUpdate && setStatus((s) => !s)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                status ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
              } ${!canUpdate ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                  status ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {canUpdate && (
            <div className="flex justify-end">
              <Button size="sm" disabled={loading} onClick={save}>
                {loading ? 'Zapisywanie…' : 'Zapisz'}
              </Button>
            </div>
          )}
        </div>

        <div className="mt-7">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Wykorzystanie ({usage.length})
          </h4>

          {usage.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">Ten zasób nie jest używany.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {usage.map((p, idx) => (
                <li
                  key={idx}
                  className="rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-800"
                >
                  <p className="text-gray-700 dark:text-gray-200">
                    <span className="font-medium">
                      {p.type === 'content.cover' ? 'Okładka' : 'Treść'}
                    </span>{' '}
                    — {p.title}
                  </p>
                  <p className="text-xs text-gray-500">Slug: {p.slug}</p>

                  <Link to={`/content/${p.content_id}`} className="text-xs text-primary underline">
                    Przejdź
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6">
          <a
            href={`${import.meta.env.VITE_API_UPLOADS}${previewUrl}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-primary underline"
          >
            Otwórz plik w nowej karcie
          </a>
        </div>
      </div>
    </div>
  );
}
