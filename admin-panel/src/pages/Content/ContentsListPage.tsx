import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { PlusIcon, PencilIcon, TrashBinIcon, EyeIcon } from '../../icons'
import { X, ListFilter, Calendar } from 'lucide-react'
import PageBreadcrumb from '../../components/common/PageBreadCrumb'
import PageMeta from '../../components/common/PageMeta'
import ComponentCard from '../../components/common/ComponentCard'
import Button from '../../ui/button/Button'
import { api } from '../../api/axios'
import { Access } from '../../components/permissions/Access'
import DeleteConfirmModal from '../../components/modal/DeleteConfirmModal'
import { useUsers } from '../../store/users'

interface User {
    user_id: string
    display_name: string
    email: string
}

interface Content {
    content_id: string
    title: string
    slug: string
    status: string
    published_at: string | null
    created_at: string
    updated_at: string
    creator: User | null
    updater: User | null
    last_edit_date: string
    has_sections: boolean
    has_components: boolean
}

interface Filters {
    title: string
    status: string
    created_by: string
    updated_by: string
    created_from: Date | null
    created_to: Date | null
    updated_from: Date | null
    updated_to: Date | null
}

export default function ContentsListPage() {
    const [contents, setContents] = useState<Content[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [contentToDelete, setContentToDelete] = useState<Content | null>(null)
    const [showFilters, setShowFilters] = useState(false)

    const [currentPage, setCurrentPage] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [itemsPerPage, setItemsPerPage] = useState(20)

    const [filters, setFilters] = useState<Filters>({
        title: '',
        status: '',
        created_by: '',
        updated_by: '',
        created_from: null,
        created_to: null,
        updated_from: null,
        updated_to: null,
    })

    const [appliedFilters, setAppliedFilters] = useState<Filters>(filters)

    const { users, fetchUsers } = useUsers()
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    useEffect(() => {
        fetchContents()
    }, [currentPage, itemsPerPage, appliedFilters])

    const fetchContents = async () => {
        setLoading(true)
        try {
            const offset = (currentPage - 1) * itemsPerPage

            const params: any = {
                limit: itemsPerPage,
                offset,
            }

            if (appliedFilters.title) params.title = appliedFilters.title
            if (appliedFilters.status) params.status = appliedFilters.status
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

            const res = await api.get('/contents', { params })
            setContents(res.data.items || [])
            setTotalItems(res.data.total || 0)
        } catch (error) {
            console.error('Failed to fetch contents:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!contentToDelete) return

        try {
            await api.delete(`/contents/${contentToDelete.content_id}`)
            setContents((prev) =>
                prev.filter((c) => c.content_id !== contentToDelete.content_id)
            )
            setTotalItems((prev) => prev - 1)
            setDeleteModalOpen(false)
            setContentToDelete(null)

            if (contents.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1)
            }
        } catch (error) {
            console.error('Failed to delete content:', error)
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
            title: '',
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
        appliedFilters.title !== '' ||
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
        if (appliedFilters.title) count++
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
                title="Zarządzanie Treścią"
                description="Lista wszystkich treści w systemie"
            />
            <PageBreadcrumb pageTitle="Treści" />

            <div className="space-y-6">
                <ComponentCard
                    title="Wszystkie Treści"
                    button={
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant={showFilters ? 'primary' : 'outline'}
                                startIcon={showFilters ? <X /> : <ListFilter />}
                                onClick={() =>
                                    handleOpenFilterPanel(!showFilters)
                                }
                            >
                                {showFilters ? 'Ukryj filtry' : 'Filtry'}
                                {hasActiveFilters && !showFilters && (
                                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-600 text-white rounded-full">
                                        {getActiveFiltersCount()}
                                    </span>
                                )}
                            </Button>
                            <Access allOf={['content.create']}>
                                <Link to="/contents/new">
                                    <Button
                                        size="sm"
                                        variant="primary"
                                        startIcon={<PlusIcon />}
                                    >
                                        Utwórz nową treść
                                    </Button>
                                </Link>
                            </Access>
                        </div>
                    }
                >
                    {showFilters && (
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Tytuł
                                    </label>
                                    <input
                                        type="text"
                                        value={filters.title}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                'title',
                                                e.target.value
                                            )
                                        }
                                        placeholder="Szukaj..."
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
                                            handleFilterChange(
                                                'status',
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
                                    >
                                        <option value="">Wszystkie</option>
                                        <option value="P">Opublikowane</option>
                                        <option value="D">Szkic</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Utworzył
                                    </label>
                                    <select
                                        value={filters.created_by}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                'created_by',
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
                                    >
                                        <option value="">Wszyscy</option>
                                        {users.map((user) => (
                                            <option
                                                key={user.user_id}
                                                value={user.user_id}
                                            >
                                                {user.display_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Edytował treść
                                    </label>
                                    <select
                                        value={filters.updated_by}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                'updated_by',
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
                                    >
                                        <option value="">Wszyscy</option>
                                        {users.map((user) => (
                                            <option
                                                key={user.user_id}
                                                value={user.user_id}
                                            >
                                                {user.display_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Utworzono od
                                    </label>
                                    <DatePicker
                                        selected={filters.created_from}
                                        onChange={(date) =>
                                            handleFilterChange(
                                                'created_from',
                                                date
                                            )
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
                                        Utworzono do
                                    </label>
                                    <DatePicker
                                        selected={filters.created_to}
                                        onChange={(date) =>
                                            handleFilterChange(
                                                'created_to',
                                                date
                                            )
                                        }
                                        dateFormat="dd.MM.yyyy"
                                        placeholderText="Wybierz datę"
                                        className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
                                        isClearable
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                        minDate={
                                            filters.created_from || undefined
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Edytowano treść od
                                    </label>
                                    <DatePicker
                                        selected={filters.updated_from}
                                        onChange={(date) =>
                                            handleFilterChange(
                                                'updated_from',
                                                date
                                            )
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
                                        Edytowano treść do
                                    </label>
                                    <DatePicker
                                        selected={filters.updated_to}
                                        onChange={(date) =>
                                            handleFilterChange(
                                                'updated_to',
                                                date
                                            )
                                        }
                                        dateFormat="dd.MM.yyyy"
                                        placeholderText="Wybierz datę"
                                        className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
                                        isClearable
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                        minDate={
                                            filters.updated_from || undefined
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={applyFilters}
                                >
                                    Zastosuj filtry
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={clearFilters}
                                >
                                    Wyczyść filtry
                                </Button>
                            </div>
                        </div>
                    )}

                    {hasActiveFilters && !showFilters && (
                        <div className="mb-4 flex flex-wrap gap-2">
                            {appliedFilters.title && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                                    Tytuł: {appliedFilters.title}
                                </span>
                            )}
                            {appliedFilters.status && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                                    Status:{' '}
                                    {appliedFilters.status === 'P'
                                        ? 'Opublikowane'
                                        : 'Szkic'}
                                </span>
                            )}
                            {appliedFilters.created_by && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                                    Utworzył:{' '}
                                    {users.find(
                                        (u) =>
                                            u.user_id ===
                                            appliedFilters.created_by
                                    )?.display_name ||
                                        appliedFilters.created_by}
                                </span>
                            )}
                            {appliedFilters.updated_by && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                                    Edytował treść:{' '}
                                    {users.find(
                                        (u) =>
                                            u.user_id ===
                                            appliedFilters.updated_by
                                    )?.display_name ||
                                        appliedFilters.updated_by}
                                </span>
                            )}
                            {appliedFilters.created_from && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                                    Utworzono od:{' '}
                                    {appliedFilters.created_from.toLocaleDateString(
                                        'pl-PL'
                                    )}
                                </span>
                            )}
                            {appliedFilters.created_to && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                                    Utworzono do:{' '}
                                    {appliedFilters.created_to.toLocaleDateString(
                                        'pl-PL'
                                    )}
                                </span>
                            )}
                            {appliedFilters.updated_from && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                                    Edytowano treść od:{' '}
                                    {appliedFilters.updated_from.toLocaleDateString(
                                        'pl-PL'
                                    )}
                                </span>
                            )}
                            {appliedFilters.updated_to && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                                    Edytowano treść do:{' '}
                                    {appliedFilters.updated_to.toLocaleDateString(
                                        'pl-PL'
                                    )}
                                </span>
                            )}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : contents.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                {hasActiveFilters
                                    ? 'Nie znaleziono treści spełniających kryteria wyszukiwania.'
                                    : 'Brak treści. Utwórz pierwszą treść aby rozpocząć.'}
                            </p>
                            {hasActiveFilters ? (
                                <Button
                                    variant="outline"
                                    onClick={clearFilters}
                                >
                                    Wyczyść filtry
                                </Button>
                            ) : (
                                <Access allOf={['content.create_any']}>
                                    <Link to="/contents/new">
                                        <Button
                                            variant="primary"
                                            startIcon={<PlusIcon />}
                                        >
                                            Utwórz nową treść
                                        </Button>
                                    </Link>
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
                                                Tytuł
                                            </th>
                                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                                                Status
                                            </th>
                                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                                                Utworzył
                                            </th>
                                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                                                Utworzono
                                            </th>
                                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                                                Edytował treść
                                            </th>
                                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                                                Ostatnia edycja
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
                                                    {(content.has_sections ||
                                                        content.has_components) && (
                                                        <div className="flex gap-1 mt-1">
                                                            {content.has_sections && (
                                                                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                                    Sekcje
                                                                </span>
                                                            )}
                                                            {content.has_components && (
                                                                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                                                    Komponenty
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span
                                                        className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                                                            content.status ===
                                                            'P'
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                                        }`}
                                                    >
                                                        {content.status === 'P'
                                                            ? 'Opublikowane'
                                                            : 'Szkic'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {content.creator ? (
                                                        <div className="text-sm">
                                                            <div className="font-medium text-gray-900 dark:text-white">
                                                                {
                                                                    content
                                                                        .creator
                                                                        .display_name
                                                                }
                                                            </div>
                                                            <div className="text-gray-500 dark:text-gray-400 text-xs">
                                                                {
                                                                    content
                                                                        .creator
                                                                        .email
                                                                }
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
                                                        {formatDate(
                                                            content.created_at
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-400 dark:text-gray-500">
                                                        {getTimeSince(
                                                            content.created_at
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {content.updater ? (
                                                        <div className="text-sm">
                                                            <div className="font-medium text-gray-900 dark:text-white">
                                                                {
                                                                    content
                                                                        .updater
                                                                        .display_name
                                                                }
                                                            </div>
                                                            <div className="text-gray-500 dark:text-gray-400 text-xs">
                                                                {
                                                                    content
                                                                        .updater
                                                                        .email
                                                                }
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400 dark:text-gray-500">
                                                            -
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {content.updater ? (
                                                        <>
                                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                {formatDate(
                                                                    content.last_edit_date
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-400 dark:text-gray-500">
                                                                {getTimeSince(
                                                                    content.last_edit_date
                                                                )}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span className="text-sm text-gray-400 dark:text-gray-500">
                                                            -
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Access
                                                            allOf={[
                                                                'content.read_any',
                                                            ]}
                                                        >
                                                            <Link
                                                                to={`/contents/${content.content_id}/preview`}
                                                            >
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    title="Podgląd"
                                                                >
                                                                    <EyeIcon className="w-4 h-4" />
                                                                </Button>
                                                            </Link>
                                                        </Access>

                                                        <Access
                                                            allOf={[
                                                                'content.update_any',
                                                            ]}
                                                        >
                                                            <Link
                                                                to={`/contents/${content.content_id}/edit`}
                                                            >
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    title="Edytuj"
                                                                >
                                                                    <PencilIcon className="w-4 h-4" />
                                                                </Button>
                                                            </Link>
                                                        </Access>

                                                        <Access
                                                            allOf={[
                                                                'content.delete_any',
                                                            ]}
                                                        >
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setContentToDelete(
                                                                        content
                                                                    )
                                                                    setDeleteModalOpen(
                                                                        true
                                                                    )
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
                                            Pokazuję{' '}
                                            {(currentPage - 1) * itemsPerPage +
                                                1}{' '}
                                            -{' '}
                                            {Math.min(
                                                currentPage * itemsPerPage,
                                                totalItems
                                            )}{' '}
                                            z {totalItems} treści
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
                                                    handleItemsPerPageChange(
                                                        Number(e.target.value)
                                                    )
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
                                            onClick={() =>
                                                handlePageChange(
                                                    currentPage - 1
                                                )
                                            }
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
                                                    variant={
                                                        currentPage === page
                                                            ? 'primary'
                                                            : 'outline'
                                                    }
                                                    onClick={() =>
                                                        handlePageChange(
                                                            page as number
                                                        )
                                                    }
                                                    className="px-3"
                                                >
                                                    {page}
                                                </Button>
                                            )
                                        )}

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                handlePageChange(
                                                    currentPage + 1
                                                )
                                            }
                                            disabled={
                                                currentPage === totalPages
                                            }
                                            className="px-3"
                                        >
                                            »
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                handlePageChange(totalPages)
                                            }
                                            disabled={
                                                currentPage === totalPages
                                            }
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

            <DeleteConfirmModal
                open={deleteModalOpen}
                onCancel={() => {
                    setDeleteModalOpen(false)
                    setContentToDelete(null)
                }}
                onConfirm={handleDelete}
                title="Usuń treść"
                message={
                    contentToDelete
                        ? `Czy na pewno chcesz usunąć treść "${contentToDelete.title}"? Wszystkie sekcje i komponenty zostaną również usunięte.`
                        : 'Czy na pewno chcesz usunąć tę treść?'
                }
            />
        </>
    )
}
