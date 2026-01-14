import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Copy, Trash2, Edit, Layout, Grid } from 'lucide-react';
import { useState } from 'react';
import { type PageComponent, usePageComponents } from '../../../store/pageComponents';
import DeleteConfirmModal from '../../modal/DeleteConfirmModal';

interface ComponentItemProps {
  component: PageComponent;
  onEdit: (component: PageComponent) => void;
  showInactive: boolean;
}

const componentIcons: Record<string, any> = {
  hero: Layout,
  services: Grid,
  // TODO: Add other component icons here
};

const componentLabels: Record<string, string> = {
  hero: 'Hero Slider',
  services: 'Services',
  testimonial: 'Testimonials',
  //TODO: Add other component labels here
};

export default function ComponentItem({ component, onEdit, showInactive }: ComponentItemProps) {
  const { duplicateComponent, deleteComponent, toggleComponentStatus } = usePageComponents();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: component.component_id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = componentIcons[component.component_type] || Grid;
  const label = componentLabels[component.component_type] || component.component_type;

  const handleDuplicate = async () => {
    try {
      await duplicateComponent(component.component_id);
    } catch (error) {
      console.error('Failed to duplicate:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComponent(component.component_id);
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleToggle = async () => {
    try {
      await toggleComponentStatus(component.component_id);
    } catch (error) {
      console.error('Failed to toggle:', error);
    }
  };

  const getPreviewText = () => {
    const data = component.data;
    switch (component.component_type) {
      case 'hero':
        return data.slides?.[0]?.title || 'No title';
      case 'services':
        return `${data.items?.length || 0} services`;
      // TODO: Add other component preview texts here
      default:
        return data.title || 'Component';
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`group relative bg-white dark:bg-gray-800 border-2 rounded-lg transition-all ${
          component.status
            ? 'border-gray-200 dark:border-gray-700 hover:border-primary'
            : 'border-yellow-300 dark:border-yellow-600 opacity-60'
        } ${isDragging ? 'shadow-2xl z-50' : 'hover:shadow-lg'}`}
      >
        {!component.status && showInactive && (
          <div className="absolute -top-3 left-4 bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded text-xs font-medium text-yellow-800 dark:text-yellow-200">
            Inactive
          </div>
        )}

        <div className="flex items-center gap-3 p-4">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <GripVertical className="w-5 h-5 text-gray-400" />
          </button>

          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="w-5 h-5 text-primary dark:text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">{label}</h4>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                #{component.order_index}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{getPreviewText()}</p>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleToggle}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title={component.status ? 'Hide' : 'Show'}
            >
              {component.status ? (
                <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            <button
              onClick={() => onEdit(component)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>

            <button
              onClick={handleDuplicate}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Duplicate"
            >
              <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>

            <button
              onClick={() => setDeleteModalOpen(true)}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        open={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Usuwanie komponentu"
        message={`Czy na pewno chcesz usunąć ten komponent ${label}? Tej czynności nie można cofnąć.`}
      />
    </>
  );
}
