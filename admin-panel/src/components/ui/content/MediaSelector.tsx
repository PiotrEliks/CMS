import { useState, useEffect } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import Button from '../../ui/button/Button';
import MediaLibraryModal from './MediaLibraryModal';
import { api } from '../../../api/axios';

interface MediaSelectorProps {
  selectedMediaId?: string;
  onSelect: (mediaId: string) => void;
  onRemove: () => void;
  allowedTypes?: ('image' | 'video' | 'audio' | 'document' | 'pdf')[];
}

export default function MediaSelector({
  selectedMediaId,
  onSelect,
  onRemove,
  allowedTypes = ['image'],
}: MediaSelectorProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [mediaDetails, setMediaDetails] = useState<any>(null);

  useEffect(() => {
    if (selectedMediaId) {
      fetchMediaDetails();
    } else {
      setMediaDetails(null);
    }
  }, [selectedMediaId]);

  const fetchMediaDetails = async () => {
    if (!selectedMediaId) return;
    try {
      const res = await api.get(`/media/${selectedMediaId}`);
      setMediaDetails(res.data);
    } catch (error) {
      console.error('Failed to fetch media:', error);
    }
  };

  const handleSelect = (media: any) => {
    onSelect(media.media_id);
    setModalOpen(false);
  };

  return (
    <>
      {mediaDetails ? (
        <div className="relative inline-block">
          <div className="w-64 h-48 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <img
              src={`${import.meta.env.VITE_API_UPLOADS}${mediaDetails.media.storage_path}`}
              alt={mediaDetails.media.alt_text || mediaDetails.media.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -top-2 -right-2 flex gap-2">
            <button
              onClick={() => setModalOpen(true)}
              className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              onClick={onRemove}
              className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full shadow-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {mediaDetails.media.title || 'No title'}
          </p>
        </div>
      ) : (
        <Button variant="outline" startIcon={<ImageIcon />} onClick={() => setModalOpen(true)}>
          Select Image
        </Button>
      )}

      <MediaLibraryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={handleSelect}
        allowedTypes={allowedTypes}
        multiple={false}
      />
    </>
  );
}
