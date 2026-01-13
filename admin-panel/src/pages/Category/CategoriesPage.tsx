import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import Button from '../../components/ui/button/Button';
import { useCategories } from '../../store/categories';
import CategoryModal from '../../components/ui/categories/CategoryModal';
import DeleteConfirmModal from '../../components/modal/DeleteConfirmModal';

export default function CategoriesPage() {
  const { items, loading, fetchCategories, deleteCategory, updateCategory } = useCategories();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = () => {
    setSelectedCategory(null);
    setModalOpen(true);
  };

  const handleEdit = (category: any) => {
    setSelectedCategory(category);
    setModalOpen(true);
  };

  const handleDelete = (category: any) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      await deleteCategory(categoryToDelete.category_id);
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleToggleStatus = async (category: any) => {
    await updateCategory(category.category_id, { status: !category.status });
  };

  const filteredCategories = items.filter((cat) =>
    cat?.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = items.filter((c) => c?.status === true).length;
  const inactiveCount = items.filter((c) => c?.status === false).length;

  return (
    <>
      <PageMeta
        title="Kategorie"
        description="Zarządzaj kategoriami treści w systemie CMS"
      />
      <PageBreadcrumb pageTitle="Kategorie" />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kategorie</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Zarządzaj kategoriami treści
            </p>
          </div>
          <Button variant="primary" startIcon={<Plus />} onClick={handleCreate}>
            Dodaj kategorię
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Szukaj kategorii..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600 dark:text-gray-400 mt-2">Ładowanie...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? 'Nie znaleziono kategorii' : 'Brak kategorii'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Nazwa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCategories.map((category) => (
                    <tr
                      key={category.category_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {category.display_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                          /{category.slug}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(category)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            category.status
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}
                        >
                          {category.status ? (
                            <>
                              <Eye className="w-3 h-3" />
                              Aktywna
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              Nieaktywna
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            startIcon={<Edit />}
                            onClick={() => handleEdit(category)}
                          >
                            Edytuj
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            startIcon={<Trash2 />}
                            onClick={() => handleDelete(category)}
                            className="text-red-600 hover:text-red-700 hover:border-red-600"
                          >
                            Usuń
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Wszystkie kategorie</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {items.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Aktywne</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {activeCount}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Nieaktywne</p>
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400 mt-1">
              {inactiveCount}
            </p>
          </div>
        </div>
      </div>

      <CategoryModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        onSuccess={() => {
          setModalOpen(false);
          setSelectedCategory(null);
          fetchCategories();
        }}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Usuń kategorię"
        message={`Czy na pewno chcesz usunąć kategorię "${categoryToDelete?.display_name}"?`}
      />
    </>
  );
}