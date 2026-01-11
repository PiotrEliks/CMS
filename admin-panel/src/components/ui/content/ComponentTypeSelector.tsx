import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Layout,
  Grid,
  MessageSquare,
  MousePointer,
  Users,
  DollarSign,
  Clock,
  Star,
  Images,
  ChevronDown,
  List,
  BarChart3,
  Mail,
  MapPin,
  Send,
} from 'lucide-react';
import Button from '../../ui/button/Button';
import { type ComponentType } from '../../../store/pageComponents';

interface ComponentTypeSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (type: ComponentType) => void;
}

const componentTypes = [
  {
    type: 'hero' as ComponentType,
    icon: Layout,
    label: 'Slider główny',
    description: 'Slider z obrazami tła i przyciskami CTA',
    category: 'Marketing',
  },
  {
    type: 'services' as ComponentType,
    icon: Grid,
    label: 'Usługi',
    description: 'Siatka usług z ikonami, opisami i cenami',
    category: 'Biznes',
  },
  {
    type: 'testimonial' as ComponentType,
    icon: MessageSquare,
    label: 'Opinie klientów',
    description: 'Opinie klientów z ocenami i zdjęciami',
    category: 'Dowód społeczny',
  },
  {
    type: 'cta' as ComponentType,
    icon: MousePointer,
    label: 'Wezwanie do działania',
    description: 'Sekcja CTA z przyciskami i tłem',
    category: 'Marketing',
  },
  {
    type: 'team' as ComponentType,
    icon: Users,
    label: 'Zespół',
    description: 'Członkowie zespołu ze zdjęciami i linkami społecznościowymi',
    category: 'O nas',
  },
  {
    type: 'pricing' as ComponentType,
    icon: DollarSign,
    label: 'Cennik',
    description: 'Tabele cenowe z funkcjami i planami',
    category: 'Biznes',
  },
  {
    type: 'hours' as ComponentType,
    icon: Clock,
    label: 'Godziny otwarcia',
    description: 'Godziny pracy i harmonogram',
    category: 'Informacje',
  },
  {
    type: 'features' as ComponentType,
    icon: Star,
    label: 'Funkcje',
    description: 'Lista funkcji z ikonami i opisami',
    category: 'Produkt',
  },
  {
    type: 'gallery_advanced' as ComponentType,
    icon: Images,
    label: 'Galeria',
    description: 'Zaawansowana galeria obrazów z lightboxem',
    category: 'Media',
  },
  {
    type: 'accordion' as ComponentType,
    icon: ChevronDown,
    label: 'Akordeon',
    description: 'FAQ akordeon z rozwijalnymi elementami',
    category: 'Zawartość',
  },
  {
    type: 'tabs' as ComponentType,
    icon: List,
    label: 'Karty',
    description: 'Sekcje zawartości w kartach',
    category: 'Zawartość',
  },
  {
    type: 'stats' as ComponentType,
    icon: BarChart3,
    label: 'Statystyki',
    description: 'Liczniki i wyświetlanie statystyk',
    category: 'Informacje',
  },
  {
    type: 'contact_form' as ComponentType,
    icon: Mail,
    label: 'Formularz kontaktowy',
    description: 'Konfigurowalny formularz kontaktowy',
    category: 'Formularz',
  },
  {
    type: 'map' as ComponentType,
    icon: MapPin,
    label: 'Mapa',
    description: 'Wyświetlanie lokalizacji Google Maps',
    category: 'Lokalizacja',
  },
  {
    type: 'newsletter' as ComponentType,
    icon: Send,
    label: 'Newsletter',
    description: 'Formularz zapisu do newslettera',
    category: 'Marketing',
  },
];

export default function ComponentTypeSelector({
  open,
  onClose,
  onSelect,
}: ComponentTypeSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  if (!open) return null;

  const categories = ['All', ...new Set(componentTypes.map((t) => t.category))];

  const filteredTypes = componentTypes.filter((type) => {
    const matchesCategory = selectedCategory === 'All' || type.category === selectedCategory;
    const matchesSearch =
      searchTerm === '' ||
      type.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Wybierz typ komponentu
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Wybierz komponent do dodania na stronę
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Szukaj komponentów..."
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary"
              />
              <div className="flex gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-primary text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.type}
                    onClick={() => {
                      onSelect(type.type);
                      onClose();
                    }}
                    className="group relative p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary hover:shadow-lg transition-all text-left"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                        <Icon className="w-6 h-6 text-primary group-hover:text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {type.label}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          {type.description}
                        </p>
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                          {type.category}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredTypes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  Nie znaleziono komponentów spełniających Twoje kryteria wyszukiwania
                </p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Anuluj
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
