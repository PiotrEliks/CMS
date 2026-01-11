import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/button/Button';
import type { MediaItem, MediaUsagePlace } from '../../store/media';
import { useMedia } from '../../store/media';

export default function MediaDetailsDrawer({
  open,
  media,
  usage,
  onClose,
  canUpdate,
}: {
  open: boolean;
  media: MediaItem | null;
  usage: any;
  onClose: () => void;
  canUpdate: boolean;
}) {
  const { update, loading } = useMedia();
  const [title, setTitle] = useState('');
  const [alt, setAlt] = useState('');
  const [status, setStatus] = useState(true);

  const places: MediaUsagePlace[] = Array.isArray(usage) ? usage : (usage?.places ?? []);

  useEffect(() => {
    if (media) {
      setTitle(media.title ?? '');
      setAlt(media.alt_text ?? '');
      setStatus(media.status ?? true);
    }
  }, [media]);

  if (!open || !media) return null;

  const isImage = (media.mime_type ?? '').startsWith('image/');
  const isPdf = media.mime_type === 'application/pdf';
  const previewUrl = media.storage_path;

  const save = async () => {
    try {
      await update(media.media_id, { title, alt_text: alt, status });
    } catch (err) {
      console.error('Błąd podczas zapisywania:', err);
    }
  };

  const getUsageLabel = (type: string) => {
    switch (type) {
      case 'content.cover':
        return 'Okładka';
      case 'content.section':
        return 'Sekcja wpisu';
      case 'content.attachment':
        return 'Załącznik';
      default:
        return 'Inne';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 top-19">
      <div className="h-full w-full max-w-xl bg-white p-5 dark:bg-gray-900 overflow-y-auto shadow-2xl animate-in slide-in-from-right">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Szczegóły zasobu</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2" type="button">
            ✕
          </button>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="aspect-video bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
            {isImage && (
              <img
                src={`${import.meta.env.VITE_API_UPLOADS}${previewUrl}`}
                alt={alt}
                className="h-full w-full object-contain"
              />
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

          <div className="p-4 text-xs font-mono bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
            <p className="text-gray-700 dark:text-gray-200 truncate">
              <span className="font-bold">PATH:</span> {media.storage_path}
            </p>
            <p className="text-gray-500 mt-1 uppercase">
              {media.mime_type} • {(media.file_size / 1024).toFixed(2)} KB
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 ml-1 uppercase">
              Tytuł (SEO)
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Wprowadź tytuł zasobu..."
              className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2 text-sm dark:border-gray-700 focus:ring-2 focus:ring-primary"
              disabled={!canUpdate}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 ml-1 uppercase">
              Tekst alternatywny (Alt)
            </label>
            <input
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Opis dla czytników ekranu..."
              className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2 text-sm dark:border-gray-700 focus:ring-2 focus:ring-primary"
              disabled={!canUpdate}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Publiczny status
              </p>
              <p className="text-xs text-gray-500">Czy plik jest dostępny dla użytkowników.</p>
            </div>
            <button
              type="button"
              onClick={() => canUpdate && setStatus((s) => !s)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                status ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
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
            <div className="flex justify-end pt-2">
              <Button size="sm" disabled={loading} onClick={save}>
                {loading ? 'Zapisywanie…' : 'Zapisz zmiany'}
              </Button>
            </div>
          )}
        </div>

        <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-6">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
            Wykorzystanie w serwisie
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 px-2 py-0.5 rounded-full text-xs">
              {places.length}
            </span>
          </h4>

          {places.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-gray-200 p-4 text-center">
              <p className="text-sm text-gray-400">
                Ten zasób nie jest przypisany do żadnej treści.
              </p>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {places.map((p, idx) => (
                <li
                  key={`${p.content_id}-${idx}`}
                  className="group rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-800 hover:border-primary transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-700 dark:text-gray-200 font-medium">{p.title}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded">
                          {getUsageLabel(p.type)}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          ID: {p.content_id.split('-')[0]}...
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/content/${p.content_id}`}
                      className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                    >
                      Edytuj treść ↗
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-10 mb-6 flex flex-col gap-3">
          <a
            href={`${import.meta.env.VITE_API_UPLOADS}${previewUrl}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 p-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition"
          >
            Otwórz plik w nowej karcie ↗
          </a>
        </div>
      </div>
    </div>
  );
}
