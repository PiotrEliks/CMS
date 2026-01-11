import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import PageMeta from '../components/common/PageMeta';
import PageBreadcrumb from '../components/common/PageBreadCrumb';
import ComponentCard from '../components/common/ComponentCard';
import Button from '../ui/button/Button';
import MenuBuilder from '../components/ui/menu/MenuBuilder';
import { api } from '../api/axios';

interface Menu {
  menu_id: string;
  code: string;
  name: string;
  status: boolean;
}

export default function EditMenuPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Menu>>({
    code: '',
    name: '',
    status: true,
  });

  useEffect(() => {
    if (!isNew && id && id !== 'new') {
      fetchMenu();
    }
  }, [id, isNew]);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/menus/${id}`);
      setFormData(res.data);
    } catch (error) {
      console.error('Failed to fetch menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Menu, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.code || !formData.name) {
      alert('Kod i nazwa są wymagane');
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        const res = await api.post('/menus', formData);
        navigate(`/menus/${res.data.menu_id}/edit`);
      } else {
        await api.put(`/menus/${id}`, formData);
      }
    } catch (error: any) {
      console.error('Failed to save menu:', error);
      alert(error.response?.data?.error || 'Nie udało się zapisać menu');
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
      <PageMeta title={isNew ? 'Utwórz menu' : `Edycja: ${formData.name}`} description="" />
      <PageBreadcrumb pageTitle={isNew ? 'Utwórz menu' : 'Edytuj menu'} />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/menus">
            <Button variant="outline" startIcon={<ArrowLeft />}>
              Powrót do listy
            </Button>
          </Link>

          <Button variant="primary" startIcon={<Save />} onClick={handleSave} disabled={saving}>
            {saving ? 'Zapisywanie...' : 'Zapisz menu'}
          </Button>
        </div>

        <ComponentCard title="Ustawienia menu">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kod menu *
                </label>
                <input
                  type="text"
                  value={formData.code || ''}
                  onChange={(e) => handleChange('code', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="main, footer, mobile"
                  disabled={!isNew}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Unikalny identyfikator dla tego menu (nie można zmienić po utworzeniu)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nazwa wyświetlana *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Główna nawigacja"
                />
              </div>
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
                  Menu aktywne
                </span>
              </label>
            </div>
          </div>
        </ComponentCard>

        {!isNew && (
          <ComponentCard
            title="Pozycje menu"
            desc="Buduj strukturę nawigacji za pomocą przeciągania i upuszczania"
          >
            <MenuBuilder menuId={id!} />
          </ComponentCard>
        )}

        {isNew && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>Wskazówka:</strong> Najpierw zapisz menu, aby rozpocząć dodawanie pozycji
              menu.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
