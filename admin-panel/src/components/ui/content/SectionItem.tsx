import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type ContentSection, useContentSections } from '../../../store/contentSections';
import {
  GripVerticalIcon,
  EditIcon,
  TrashIcon,
  CopyIcon,
  ImageIcon,
  FileTextIcon,
  VideoIcon,
  CodeIcon,
} from 'lucide-react';
import Button from '../../ui/button/Button';
import DeleteConfirmModal from '../../modal/DeleteConfirmModal';
import SectionEditModal from './SectionEditModal';
import { Access } from '../../permissions/Access';

interface SectionItemProps {
  section: ContentSection;
  contentId: string;
}

const sectionTypeIcons: Record<string, React.ReactNode> = {
  text: <FileTextIcon className="w-4 h-4" />,
  image: <ImageIcon className="w-4 h-4" />,
  gallery: <ImageIcon className="w-4 h-4" />,
  pdf: <FileTextIcon className="w-4 h-4" />,
  video: <VideoIcon className="w-4 h-4" />,
  html: <CodeIcon className="w-4 h-4" />,
  embed: <CodeIcon className="w-4 h-4" />,
};

const sectionTypeLabels: Record<string, string> = {
  text: 'Tekst',
  image: 'Zdjęcie',
  gallery: 'Galeria',
  pdf: 'PDF',
  video: 'Wideo',
  html: 'HTML',
  embed: 'Embed',
};

export default function SectionItem({ section, contentId }: SectionItemProps) {
  const { deleteSection, duplicateSection } = useContentSections();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.section_id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = async () => {
    try {
      await deleteSection(contentId, section.section_id);
      setDeleteModalOpen(false);
    } catch (error) {}
  };

  const handleDuplicate = async () => {
    try {
      await duplicateSection(contentId, section.section_id);
    } catch (error) {}
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary transition-colors"
      >
        <div className="flex items-start gap-3">
          <button
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <GripVerticalIcon className="w-5 h-5" />
          </button>

          <div className="mt-1 text-primary">{sectionTypeIcons[section.section_type]}</div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {sectionTypeLabels[section.section_type]}
                  </span>
                  {!section.status && (
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                      Ukryte
                    </span>
                  )}
                </div>

                {section.heading && (
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {section.heading}
                  </h4>
                )}

                {section.subheading && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-0.5">
                    {section.subheading}
                  </p>
                )}

                {section.body && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 line-clamp-2">
                    {section.body.replace(/<[^>]*>/g, '').substring(0, 150)}...
                  </p>
                )}

                {section.media && section.media.length > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <ImageIcon className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {section.media.length} {section.media.length === 1 ? 'plik' : 'plików'}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <Access allOf={['content.create']}>
                  <Button size="sm" variant="outline" onClick={handleDuplicate}>
                    <CopyIcon className="w-4 h-4" />
                  </Button>
                </Access>

                <Access allOf={['content.update_any']}>
                  <Button size="sm" variant="outline" onClick={() => setEditModalOpen(true)}>
                    <EditIcon className="w-4 h-4" />
                  </Button>
                </Access>

                <Access allOf={['content.delete_any']}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteModalOpen(true)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </Access>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SectionEditModal
        key={section.section_id}
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        section={section}
        contentId={contentId}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Usuń sekcję"
        message={`Czy na pewno chcesz usunąć tę sekcję${section.heading ? ` "${section.heading}"` : ''}?`}
      />
    </>
  );
}
