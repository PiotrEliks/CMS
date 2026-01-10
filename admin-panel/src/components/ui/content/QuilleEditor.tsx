import { useRef, useMemo, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import MediaLibraryModal from './MediaLibraryModal';

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: number;
  placeholder?: string;
}

interface Media {
  media_id: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  thumbnail_path?: string;
}

export default function QuillEditor({
  value,
  onChange,
  height = 400,
  placeholder = 'Zacznij pisać...',
}: QuillEditorProps) {
  const quillRef = useRef<any>(null);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);

  const handleMediaSelect = (media: Media | Media[]) => {
    const selectedMedia = Array.isArray(media) ? media[0] : media;
    const imageUrl = selectedMedia.file_path || `/api/uploads/${selectedMedia.file_name}`;

    const editor = quillRef.current?.getEditor();
    if (editor) {
      const range = editor.getSelection(true);
      editor.insertEmbed(range.index, 'image', imageUrl);
      editor.setSelection(range.index + 1);
    }

    setMediaModalOpen(false);
  };

  const imageHandler = () => {
    setMediaModalOpen(true);
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ align: [] }],
          ['link', 'image'],
          ['clean'],
          [{ color: [] }, { background: [] }],
          ['code-block'],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    []
  );

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'align',
    'link',
    'image',
    'color',
    'background',
    'code-block',
  ];

  return (
    <>
      <div style={{ height: height + 60 }}>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          style={{ height }}
        />
      </div>

      <MediaLibraryModal
        open={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={handleMediaSelect}
        multiple={false}
        allowedTypes={['image']}
      />
    </>
  );
}
