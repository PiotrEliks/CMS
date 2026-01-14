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
    type: 'contact_form' as ComponentType,
    icon: Mail,
    label: 'Formularz kontaktowy',
    description: 'Konfigurowalny formularz kontaktowy',
    category: 'Formularze',
  },
  {
    type: 'map' as ComponentType,
    icon: MapPin,
    label: 'Mapa',
    description: 'Wyświetlanie lokalizacji Google Maps',
    category: 'Lokalizacja',
  },
];

export default function ComponentTypeSelector({
  open,
  onClose,
  onSelect,
}: ComponentTypeSelectorProps) {

  if (!open) return null;

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
                {componentTypes.length} dostępnych komponentów do dodania na stronę
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {componentTypes.map((type) => {
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
                      <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary dark:text-white transition-colors">
                        <Icon className="w-6 h-6 text-primary dark:text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {type.label}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {componentTypes.length} komponentów
            </p>
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