import { useState } from 'react';
import Button from '../ui/button/Button';
import { useMedia } from '../../store/media';

export default function MediaUploadModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { upload, loading } = useMedia();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [alt, setAlt] = useState('');

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    await upload(file, { title, alt_text: alt });
    setFile(null);
    setTitle('');
    setAlt('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dodaj plik</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" type="button">
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="rounded-xl border border-dashed border-gray-300 p-4 dark:border-gray-700">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm"
            />
            {file && <p className="mt-2 text-xs text-gray-500">Wybrano: {file.name}</p>}
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tytuł (opcjonalnie)"
            className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2 text-sm dark:border-gray-700"
          />

          <input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="ALT (dla obrazów, opcjonalnie)"
            className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2 text-sm dark:border-gray-700"
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Anuluj
            </Button>
            <Button size="sm" disabled={loading || !file}>
              {loading ? 'Wgrywanie…' : 'Dodaj'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
