import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search } from 'lucide-react';
import Button from '../../ui/button/Button';
import { api } from '../../../api/axios';

interface MenuItem {
  menu_item_id?: string;
  menu_id: string;
  label: string;
  content_id?: string;
  parent_id?: string;
  status: boolean;
}

interface Content {
  content_id: string;
  title: string;
  slug: string;
  type: string;
}

interface MenuItemEditModalProps {
  open: boolean;
  onClose: () => void;
  item: MenuItem;
  menuId: string;
  onSuccess: () => void;
}

export default function MenuItemEditModal({
  open,
  onClose,
  item,
  menuId,
  onSuccess,
}: MenuItemEditModalProps) {
  const [formData, setFormData] = useState<MenuItem>(item);
  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState<Content[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showContentPicker, setShowContentPicker] = useState(false);

  const isNew = !item.menu_item_id;

  useEffect(() => {
    if (open) {
      setFormData(item);
      fetchContents();
    }
  }, [open, item]);

  const fetchContents = async () => {
    try {
      const res = await api.get('/contents', { params: { limit: 100 } });
      setContents(res.data.items || []);
    } catch (error) {
      console.error('Failed to fetch contents:', error);
    }
  };

  if (!open) return null;

  const handleSave = async () => {
    if (!formData.label) {
      alert('Label is required');
      return;
    }

    setLoading(true);
    try {
      if (isNew) {
        await api.post(`/menus/${menuId}/items`, formData);
      } else {
        await api.put(`/menu-items/${item.menu_item_id}`, formData);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to save menu item:', error);
      alert(error.response?.data?.error || 'Failed to save menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof MenuItem, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectContent = (content: Content) => {
    setFormData((prev) => ({
      ...prev,
      content_id: content.content_id,
      label: prev.label || content.title,
    }));
    setShowContentPicker(false);
  };

  const selectedContent = contents.find((c) => c.content_id === formData.content_id);

  const filteredContents = contents.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {isNew ? 'Dodaj pozycję menu' : 'Edytuj pozycję menu'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Skonfiguruj etykietę i link pozycji menu
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nazwa *
              </label>
              <input
                type="text"
                value={formData.label || ''}
                onChange={(e) => handleChange('label', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="Strona główna, Stopka, itp."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Link do treści
              </label>

              {selectedContent ? (
                <div className="flex items-center gap-3">
                  <div className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {selectedContent.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      /{selectedContent.slug}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setShowContentPicker(true)}>
                    Zmień
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleChange('content_id', undefined)}
                  >
                    Usuń
                  </Button>
                </div>
              ) : (
                <Button variant="outline" onClick={() => setShowContentPicker(true)}>
                  Wybierz stronę
                </Button>
              )}

              {!selectedContent && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Zostaw puste, aby utworzyć niestandardowy link.
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.status ?? true}
                  onChange={(e) => handleChange('status', e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pozycja aktywna
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Anuluj
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={loading}>
              {loading ? 'Zapisywanie...' : isNew ? 'Dodaj pozycję' : 'Zapisz zmiany'}
            </Button>
          </div>
        </div>

        {showContentPicker && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setShowContentPicker(false)}
            />
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Wybierz stronę
                </h4>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Szukaj stron..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {filteredContents.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    Nie znaleziono stron
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredContents.map((content) => (
                      <button
                        key={content.content_id}
                        onClick={() => handleSelectContent(content)}
                        className="w-full p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="font-medium text-gray-900 dark:text-white">
                          {content.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          /{content.slug}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {content.type}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowContentPicker(false)}>
                  Anuluj
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
