import { useEffect, useState } from 'react'
import { X, Plus, Search, Tag } from 'lucide-react'
import { api } from '../../../api/axios'
import Button from '../../ui/button/Button'

interface Category {
  category_id: string
  display_name: string
  slug: string
  type?: string
}

interface CategorySelectorProps {
  selectedCategories: string[]
  onChange: (categoryIds: string[]) => void
  type?: string
}

export default function CategorySelector({
  selectedCategories,
  onChange,
  type,
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [type])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const params = type ? { type } : {}
      const res = await api.get('/categories', { params })
      setCategories(res.data.items || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onChange(selectedCategories.filter((id) => id !== categoryId))
    } else {
      onChange([...selectedCategories, categoryId])
    }
  }

  const selectedCategoryObjects = categories.filter((c) =>
    selectedCategories.includes(c.category_id)
  )

  const availableCategories = categories.filter(
    (c) =>
      !selectedCategories.includes(c.category_id) &&
      c.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
        {selectedCategoryObjects.length > 0 ? (
          selectedCategoryObjects.map((category) => (
            <span
              key={category.category_id}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary dark:text-white rounded-full text-sm font-medium shadow-sm"
            >
              <Tag className="w-3 h-3" />
              {category.display_name}
              <button
                type="button"
                onClick={() => handleToggle(category.category_id)}
                className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                title="Usuń"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))
        ) : (
          <span className="text-sm text-gray-400 italic flex items-center gap-2">
            Kliknij "Dodaj kategorię", aby przypisać wpis do tematów...
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button
          size="sm"
          variant={showDropdown ? 'primary' : 'outline'}
          startIcon={
            showDropdown ? (
              <X className="w-4 h-4 dark:text-white" />
            ) : (
              <Plus className="w-4 h-4 dark:text-white" />
            )
          }
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <span className="dark:text-white">
            {showDropdown ? 'Anuluj wybieranie' : 'Dodaj kategorię'}
          </span>
        </Button>

        {showDropdown && (
          <span className="text-xs text-gray-500 dark:text-white animate-pulse">
            Wybierz kategorie z listy poniżej
          </span>
        )}
      </div>

      {showDropdown && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-sm overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white" />
              <input
                autoFocus
                type="text"
                className="w-full pl-9 pr-4 py-2 text-sm dark:text-white bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="Filtruj listę kategorii..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-2 custom-scrollbar">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-primary mb-2"></div>
                <p className="text-sm text-gray-500 dark:text-white">
                  Pobieranie danych...
                </p>
              </div>
            ) : availableCategories.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500 dark:text-white">
                {searchTerm ? (
                  <>
                    Nie znaleziono kategorii dla:{' '}
                    <strong className="text-primary">"{searchTerm}"</strong>
                  </>
                ) : (
                  'Wszystkie kategorie zostały już wybrane.'
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availableCategories.map((category) => (
                  <button
                    key={category.category_id}
                    type="button"
                    onClick={() => handleToggle(category.category_id)}
                    className="flex flex-col items-start px-4 py-3 text-left bg-gray-50 dark:bg-gray-900/30 hover:bg-primary/5 dark:hover:bg-primary/10 border border-gray-100 dark:border-gray-700 rounded-lg transition-all group"
                  >
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
                      {category.display_name}
                    </span>
                    <span className="text-[11px] text-gray-400 dark:text-white font-mono mt-1">
                      /{category.slug}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-2 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 text-center">
            <button
              type="button"
              onClick={() => setShowDropdown(false)}
              className="text-xs text-gray-500 dark:text-white hover:text-primary font-medium"
            >
              Gotowe
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
