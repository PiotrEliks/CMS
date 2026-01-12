import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Menu as MenuIcon } from 'lucide-react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import Button from '../../ui/button/Button';
import DeleteConfirmModal from '../../components/modal/DeleteConfirmModal';
import { api } from '../../api/axios';

interface Menu {
  menu_id: string;
  code: string;
  name: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export default function MenusListPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const res = await api.get('/menus');
      setMenus(res.data.items || []);
    } catch (error) {
      console.error('Failed to fetch menus:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (menuId: string) => {
    try {
      const menu = menus.find((m) => m.menu_id === menuId);
      if (!menu) return;

      await api.put(`/menus/${menuId}`, { status: !menu.status });
      fetchMenus();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedMenu) return;

    try {
      await api.delete(`/menus/${selectedMenu.menu_id}`);
      setDeleteModalOpen(false);
      setSelectedMenu(null);
      fetchMenus();
    } catch (error) {
      console.error('Failed to delete menu:', error);
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
      <PageMeta title="Zarządzanie menu" description="To jest strona zarządzania menu w panelu administracyjnym" />
      <PageBreadcrumb pageTitle="Zarządzanie menu" />

      <ComponentCard
        title="Menu Strony"
        desc="Zarządzaj menu nawigacyjnymi swojej strony"
        button={
          <Link to="/menus/new">
            <Button variant="primary" startIcon={<Plus />}>
              Utwórz Menu
            </Button>
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nazwa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Kod
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Utworzono
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {menus.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <MenuIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Brak menu</p>
                    <Link to="/menus/new">
                      <Button variant="primary">Utwórz Pierwsze Menu</Button>
                    </Link>
                  </td>
                </tr>
              ) : (
                menus.map((menu) => (
                  <tr key={menu.menu_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MenuIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {menu.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                        {menu.code}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(menu.menu_id)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          menu.status
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}
                      >
                        {menu.status ? 'Aktywne' : 'Nieaktywne'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(menu.created_at).toLocaleDateString('pl-PL')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/menus/${menu.menu_id}`}>
                          <Button size="sm" variant="outline" startIcon={<Edit />}>
                            Edytuj
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          startIcon={<Trash2 />}
                          onClick={() => {
                            setSelectedMenu(menu);
                            setDeleteModalOpen(true);
                          }}
                        >
                          Usuń
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ComponentCard>

      <DeleteConfirmModal
        open={deleteModalOpen}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedMenu(null);
        }}
        onConfirm={handleDelete}
        title="Usuń Menu"
        message={`Czy na pewno chcesz usunąć menu "${selectedMenu?.name}"? Spowoduje to również usunięcie wszystkich pozycji menu.`}
      />
    </>
  );
}
