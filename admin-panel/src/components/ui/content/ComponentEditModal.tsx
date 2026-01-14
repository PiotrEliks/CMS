import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import Button from '../../ui/button/Button';
import { type PageComponent, usePageComponents } from '../../../store/pageComponents';
import HeroEditor from '../editors/HeroEditor';
import ServicesEditor from '../editors/ServicesEditor';
import MapEditor from '../editors/MapEditor';
import ContactFormEditor from '../editors/ContactFormEditor';
import TestimonialEditor from '../editors/TestimonialEditor';
import HoursEditor from '../editors/HoursEditor';
import PricingEditor from '../editors/PricingEditor';
import TeamEditor from '../editors/TeamEditor';

interface ComponentEditModalProps {
  open: boolean;
  onClose: () => void;
  component: PageComponent;
  contentId: string;
}

export default function ComponentEditModal({
  open,
  onClose,
  component,
  contentId,
}: ComponentEditModalProps) {
  const { createComponent, updateComponent } = usePageComponents();
  const [formData, setFormData] = useState(component.data || {});
  const [status, setStatus] = useState(component.status ?? true);
  const [loading, setLoading] = useState(false);

  const isNew = !component.component_id;

  useEffect(() => {
    if (open) {
      setFormData(component.data || {});
      setStatus(component.status ?? true);
    }
  }, [open, component]);

  if (!open) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      if (isNew) {
        await createComponent(contentId, {
          component_type: component.component_type,
          data: formData,
          status,
        });
      } else {
        await updateComponent(component.component_id, {
          data: formData,
          status,
        });
      }
      onClose();
    } catch (error) {
      console.error('Failed to save component:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDataChange = (newData: any) => {
    setFormData(newData);
  };

  const renderEditor = () => {
    const editorProps = {
      data: formData,
      onChange: handleDataChange,
    };

    switch (component.component_type) {
      case 'hero':
        return <HeroEditor {...editorProps} />;
      case 'services':
        return <ServicesEditor {...editorProps} />;
      case 'map':
        return <MapEditor {...editorProps} />;
      case 'contact_form':
        return <ContactFormEditor {...editorProps} />;
      case 'testimonial':
        return <TestimonialEditor {...editorProps} />;
      case 'team':
        return <TeamEditor {...editorProps} />;
      case 'pricing':
        return <PricingEditor {...editorProps} />;
      case 'hours':
        return <HoursEditor {...editorProps} />;
      default:
        return <div className="text-center py-8 text-gray-500">Nieznany typ komponentu</div>;
    }
  };

  const componentLabels: Record<string, string> = {
    hero: 'Slider',
    services: 'Usługi',
    testimonial: 'Opinie',
    team: 'Zespół',
    pricing: 'Cennik',
    hours: 'Godziny otwarcia',
    contact_form: 'Formularz kontaktowy',
    map: 'Mapa',
  };

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {isNew ? 'Utwórz' : 'Edytuj'} {componentLabels[component.component_type]}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Skonfiguruj ustawienia tego komponentu
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">{renderEditor()}</div>

          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={status}
                onChange={(e) => setStatus(e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Komponent widoczny na stronie
              </span>
            </label>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Anuluj
              </Button>
              <Button variant="primary" onClick={handleSave} disabled={loading}>
                {loading ? 'Zapisywanie...' : isNew ? 'Utwórz komponent' : 'Zapisz zmiany'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
