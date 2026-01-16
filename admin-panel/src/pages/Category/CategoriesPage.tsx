import { useState, useEffect } from 'react'
import { Plus, Eye, EyeOff, ListFilter, Calendar, X } from 'lucide-react'
import { PencilIcon, TrashBinIcon } from '../../icons'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import PageMeta from '../../components/common/PageMeta'
import PageBreadcrumb from '../../components/common/PageBreadCrumb'
import ComponentCard from '../../components/common/ComponentCard'
import Button from '../../components/ui/button/Button'
import { useCategories } from '../../store/categories'
import CategoryModal from '../../components/ui/categories/CategoryModal'
import DeleteConfirmModal from '../../components/modal/DeleteConfirmModal'
import { useUsers } from '../../store/users'
import type { Category } from '../../store/categories'
import { Access } from '../../components/permissions/Access'

interface Filters {
  display_name: string
  status: string
  created_by: string
  updated_by: string
  created_from: Date | null
  created_to: Date | null
  updated_from: Date | null
  updated_to: Date | null
}

export default function CategoriesPage() {
  const { items, loading, total, fetchCategories, deleteCategory } =
    useCategories()
  const { users, fetchUsers } = useUsers()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  )
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  )
  const [showFilters, setShowFilters] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  const [filters, setFilters] = useState<Filters>({
    display_name: '',
    status: '',
    created_by: '',
    updated_by: '',
    created_from: null,
    created_to: null,
    updated_from: null,
    updated_to: null,
  })

  const [appliedFilters, setAppliedFilters] = useState<Filters>(filters)

  const totalPages = Math.ceil(total / itemsPerPage)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    loadCategories()
  }, [currentPage, itemsPerPage, appliedFilters])

  const loadCategories = async () => {
    try {
      const offset = (currentPage - 1) * itemsPerPage

      const params: any = {
        limit: itemsPerPage,
        offset,
      }

      if (appliedFilters.display_name)
        params.search = appliedFilters.display_name
      if (appliedFilters.status !== '')
        params.status = appliedFilters.status === 'true'
      if (appliedFilters.created_by)
        params.created_by = appliedFilters.created_by
      if (appliedFilters.updated_by)
        params.updated_by = appliedFilters.updated_by

      if (appliedFilters.created_from) {
        params.created_from = appliedFilters.created_from
          .toISOString()
          .split('T')[0]
      }
      if (appliedFilters.created_to) {
        params.created_to = appliedFilters.created_to
          .toISOString()
          .split('T')[0]
      }
      if (appliedFilters.updated_from) {
        params.updated_from = appliedFilters.updated_from
          .toISOString()
          .split('T')[0]
      }
      if (appliedFilters.updated_to) {
        params.updated_to = appliedFilters.updated_to
          .toISOString()
          .split('T')[0]
      }

      await fetchCategories(params)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const handleCreate = () => {
    setSelectedCategory(null)
    setModalOpen(true)
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setModalOpen(true)
  }

  const confirmDelete = async () => {
    if (categoryToDelete) {
      await deleteCategory(categoryToDelete.category_id)
      setDeleteModalOpen(false)
      setCategoryToDelete(null)

      if (items.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      } else {
        loadCategories()
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'przed chwilą'
    if (diffMins < 60) return `${diffMins} min temu`
    if (diffHours < 24) return `${diffHours}h temu`
    if (diffDays < 7) return `${diffDays} dni temu`
    return formatDate(dateString)
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit)
    setCurrentPage(1)
  }

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    setAppliedFilters(filters)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    const emptyFilters: Filters = {
      display_name: '',
      status: '',
      created_by: '',
      updated_by: '',
      created_from: null,
      created_to: null,
      updated_from: null,
      updated_to: null,
    }
    setFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
    setCurrentPage(1)
  }

  const hasActiveFilters =
    appliedFilters.display_name !== '' ||
    appliedFilters.status !== '' ||
    appliedFilters.created_by !== '' ||
    appliedFilters.updated_by !== '' ||
    appliedFilters.created_from !== null ||
    appliedFilters.created_to !== null ||
    appliedFilters.updated_from !== null ||
    appliedFilters.updated_to !== null

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      if (currentPage > 3) {
        pages.push('...')
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('...')
      }

      pages.push(totalPages)
    }

    return pages
  }

  const handleOpenFilterPanel = async (showFilters: boolean) => {
    setShowFilters(showFilters)
    if (showFilters) {
      await fetchUsers()
    }
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (appliedFilters.display_name) count++
    if (appliedFilters.status) count++
    if (appliedFilters.created_by) count++
    if (appliedFilters.updated_by) count++
    if (appliedFilters.created_from) count++
    if (appliedFilters.created_to) count++
    if (appliedFilters.updated_from) count++
    if (appliedFilters.updated_to) count++
    return count
  }

  return (
    <>
      <PageMeta
        title="Zarządzanie kategoriami"
        description="Zarządzaj kategoriami treści w systemie CMS"
      />
      <PageBreadcrumb pageTitle="Kategorie" />

      <div className="space-y-6">
        <ComponentCard
          title="Kategorie"
          button={
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={showFilters ? 'primary' : 'outline'}
                startIcon={showFilters ? <X /> : <ListFilter />}
                onClick={() => handleOpenFilterPanel(!showFilters)}
              >
                {showFilters ? 'Ukryj filtry' : 'Filtry'}
                {hasActiveFilters && !showFilters && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-600 text-white rounded-full">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </Button>
              <Access allOf={['category.create']}>
                <Button
                  size="sm"
                  variant="primary"
                  startIcon={<Plus />}
                  onClick={handleCreate}
                >
                  Dodaj kategorię
                </Button>
              </Access>
            </div>
          }
        >
          {showFilters && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nazwa kategorii
                  </label>
                  <input
                    type="text"
                    value={filters.display_name}
                    onChange={(e) =>
                      handleFilterChange('display_name', e.target.value)
                    }
                    placeholder="Szukaj po nazwie..."
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange('status', e.target.value)
                    }
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
                  >
                    <option value="">Wszystkie</option>
                    <option value="true">Aktywne</option>
                    <option value="false">Nieaktywne</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Utworzone przez
                  </label>
                  <select
                    value={filters.created_by}
                    onChange={(e) =>
                      handleFilterChange('created_by', e.target.value)
                    }
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
                  >
                    <option value="">Wszyscy</option>
                    {users.map((user) => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.display_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Zaktualizowane przez
                  </label>
                  <select
                    value={filters.updated_by}
                    onChange={(e) =>
                      handleFilterChange('updated_by', e.target.value)
                    }
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
                  >
                    <option value="">Wszyscy</option>
                    {users.map((user) => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.display_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Utworzone od
                  </label>
                  <DatePicker
                    selected={filters.created_from}
                    onChange={(date) =>
                      handleFilterChange('created_from', date)
                    }
                    dateFormat="dd.MM.yyyy"
                    placeholderText="Wybierz datę"
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
                    isClearable
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Utworzone do
                  </label>
                  <DatePicker
                    selected={filters.created_to}
                    onChange={(date) => handleFilterChange('created_to', date)}
                    dateFormat="dd.MM.yyyy"
                    placeholderText="Wybierz datę"
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
                    isClearable
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    minDate={filters.created_from || undefined}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Zaktualizowane od
                  </label>
                  <DatePicker
                    selected={filters.updated_from}
                    onChange={(date) =>
                      handleFilterChange('updated_from', date)
                    }
                    dateFormat="dd.MM.yyyy"
                    placeholderText="Wybierz datę"
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
                    isClearable
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Zaktualizowane do
                  </label>
                  <DatePicker
                    selected={filters.updated_to}
                    onChange={(date) => handleFilterChange('updated_to', date)}
                    dateFormat="dd.MM.yyyy"
                    placeholderText="Wybierz datę"
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
                    isClearable
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    minDate={filters.updated_from || undefined}
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="primary" onClick={applyFilters}>
                  Zastosuj filtry
                </Button>
                <Button size="sm" variant="outline" onClick={clearFilters}>
                  Wyczyść filtry
                </Button>
              </div>
            </div>
          )}

          {hasActiveFilters && !showFilters && (
            <div className="mb-4 flex flex-wrap gap-2">
              {appliedFilters.display_name && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                  Nazwa: {appliedFilters.display_name}
                </span>
              )}
              {appliedFilters.status && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                  Status:{' '}
                  {appliedFilters.status === 'true' ? 'Aktywne' : 'Nieaktywne'}
                </span>
              )}
              {appliedFilters.created_by && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                  Utworzył:{' '}
                  {users.find((u) => u.user_id === appliedFilters.created_by)
                    ?.display_name || appliedFilters.created_by}
                </span>
              )}
              {appliedFilters.updated_by && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                  Zaktualizowane przez:{' '}
                  {users.find((u) => u.user_id === appliedFilters.updated_by)
                    ?.display_name || appliedFilters.updated_by}
                </span>
              )}
              {appliedFilters.created_from && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                  Utworzone od:{' '}
                  {appliedFilters.created_from.toLocaleDateString('pl-PL')}
                </span>
              )}
              {appliedFilters.created_to && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                  Utworzone do:{' '}
                  {appliedFilters.created_to.toLocaleDateString('pl-PL')}
                </span>
              )}
              {appliedFilters.updated_from && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                  Zaktualizowane od:{' '}
                  {appliedFilters.updated_from.toLocaleDateString('pl-PL')}
                </span>
              )}
              {appliedFilters.updated_to && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                  Zaktualizowane do:{' '}
                  {appliedFilters.updated_to.toLocaleDateString('pl-PL')}
                </span>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {hasActiveFilters
                  ? 'Nie znaleziono kategorii spełniających kryteria wyszukiwania.'
                  : 'Brak kategorii. Utwórz pierwszą kategorię aby rozpocząć.'}
              </p>
              {hasActiveFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Wyczyść filtry
                </Button>
              ) : (
                <Access allOf={['category.create']}>
                  <Button
                    variant="primary"
                    startIcon={<Plus />}
                    onClick={handleCreate}
                  >
                    Dodaj kategorię
                  </Button>
                </Access>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                        Nazwa
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                        Slug
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                        Utworzone przez
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                        Data utworzenia
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                        Zaktualizowane przez
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                        Data aktualizacji
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                        Akcje
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((category) => (
                      <tr
                        key={category.category_id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {category.display_name}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                            /{category.slug}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                              category.status
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
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
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {category.creator ? (
                            <div className="text-sm">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {category.creator.display_name}
                              </div>
                              <div className="text-gray-500 dark:text-gray-400 text-xs">
                                {category.creator.email}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500">
                              Nieznany
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(category.created_at)}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {getTimeSince(category.created_at)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {category.updater ? (
                            <div className="text-sm">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {category.updater.display_name}
                              </div>
                              <div className="text-gray-500 dark:text-gray-400 text-xs">
                                {category.updater.email}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500">
                              -
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {category.updater === null ? (
                            <span className="text-sm text-gray-400 dark:text-gray-500">
                              -
                            </span>
                          ) : (
                            <>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {formatDate(category.updated_at)}
                              </div>
                              <div className="text-xs text-gray-400 dark:text-gray-500">
                                {getTimeSince(category.updated_at)}
                              </div>
                            </>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Access allOf={['category.update_any']}>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(category)}
                              >
                                <PencilIcon className="w-4 h-4" />
                              </Button>
                            </Access>

                            <Access allOf={['category.delete_any']}>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setCategoryToDelete(category)
                                  setDeleteModalOpen(true)
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

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      Pokazuję {(currentPage - 1) * itemsPerPage + 1} -{' '}
                      {Math.min(currentPage * itemsPerPage, total)} z {total}{' '}
                      kategorii
                    </div>

                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="itemsPerPage"
                        className="text-sm text-gray-700 dark:text-gray-300"
                      >
                        Na stronie:
                      </label>
                      <select
                        id="itemsPerPage"
                        value={itemsPerPage}
                        onChange={(e) =>
                          handleItemsPerPageChange(Number(e.target.value))
                        }
                        className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2 py-1 text-sm"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className="px-3"
                    >
                      ««
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3"
                    >
                      «
                    </Button>

                    {getPageNumbers().map((page, idx) =>
                      page === '...' ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-3 py-1 text-gray-500 dark:text-gray-400"
                        >
                          ...
                        </span>
                      ) : (
                        <Button
                          key={page}
                          size="sm"
                          variant={currentPage === page ? 'primary' : 'outline'}
                          onClick={() => handlePageChange(page as number)}
                          className="px-3"
                        >
                          {page}
                        </Button>
                      )
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3"
                    >
                      »
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-3"
                    >
                      »»
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </ComponentCard>
      </div>

      <CategoryModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedCategory(null)
        }}
        category={selectedCategory}
        onSuccess={() => {
          setModalOpen(false)
          setSelectedCategory(null)
          loadCategories()
        }}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        onCancel={() => {
          setDeleteModalOpen(false)
          setCategoryToDelete(null)
        }}
        onConfirm={confirmDelete}
        title="Usuń kategorię"
        message={`Czy na pewno chcesz usunąć kategorię "${categoryToDelete?.display_name}"?`}
      />
    </>
  )
}
