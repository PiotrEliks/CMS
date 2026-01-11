import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, EyeIcon, EyeOffIcon } from 'lucide-react';
import PageMeta from '../../components/common/PageMeta';
import Button from '../../ui/button/Button';
import { api } from '../../api/axios';

interface Content {
  content_id: string;
  title: string;
  slug: string;
  lead?: string;
  body?: string;
  status: string;
  published_at: string | null;
  meta_title?: string;
  meta_description?: string;
}

interface ContentSection {
  section_id: string;
  section_type: string;
  heading?: string;
  subheading?: string;
  body?: string;
  status: boolean;
  position: number;
  media_ids: string[];
  settings: any;
}

interface Media {
  media_id: string;
  title: string;
  storage_path: string;
  thumbnail_path?: string;
  mime_type: string;
}

export default function ContentPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState<Content | null>(null);
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [mediaCache, setMediaCache] = useState<Map<string, Media>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showHidden, setShowHidden] = useState(false);

  useEffect(() => {
    if (id) {
      fetchContent();
      fetchSections();
    }
  }, [id]);

  const fetchContent = async () => {
    try {
      const res = await api.get(`contents/${id}`);
      setContent(res.data);
    } catch (error) {
      console.error('Failed to fetch content:', error);
    }
  };

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/contents/${id}/sections`);

      const sectionsArray = res.data?.sections;

      if (!Array.isArray(sectionsArray)) {
        console.error('Oczekiwano tablicy w res.data.sections, otrzymano:', res.data);
        setSections([]);
        return;
      }

      const sortedSections = [...sectionsArray].sort(
        (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
      );

      setSections(sortedSections);

      const allMediaIds = sortedSections.flatMap((s) => s.media_ids || []);
      const uniqueMediaIds = [...new Set(allMediaIds.filter((id) => !!id))];

      if (uniqueMediaIds.length > 0) {
        await fetchMedia(uniqueMediaIds);
      }
    } catch (error) {
      console.error('Failed to fetch sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedia = async (mediaIds: string[]) => {
    const idsToFetch = mediaIds.filter((id) => !mediaCache.has(id));

    if (idsToFetch.length === 0) return;

    const promises = idsToFetch.map((id) =>
      api.get(`/media/${id}`).catch((err) => {
        console.error(`Błąd pobierania medium ${id}:`, err);
        return null;
      })
    );

    const responses = await Promise.all(promises);
    const newCache = new Map(mediaCache);

    responses.forEach((res) => {
      if (res?.data) {
        const mediaData = res.data.media || res.data;
        newCache.set(mediaData.media_id, mediaData);
      }
    });

    setMediaCache(newCache);
  };

  const getMediaUrl = (mediaId: string): string => {
    const media = mediaCache.get(mediaId);
    if (!media) return '';
    return `${import.meta.env.VITE_API_UPLOADS}${media.storage_path}`;
  };

  const getThumbnailUrl = (mediaId: string): string => {
    const media = mediaCache.get(mediaId);
    if (!media) return '';
    const path = media.thumbnail_path || media.storage_path;
    return `${import.meta.env.VITE_API_UPLOADS}${path}`;
  };

  const visibleSections = showHidden ? sections : sections.filter((s) => s.status);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Nie znaleziono treści</p>
        <Link to="/contents">
          <Button className="mt-4">Powrót do listy</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageMeta title={`Podgląd: ${content.title}`} description="" />

      <div className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/contents">
              <Button variant="outline" size="sm" startIcon={<ArrowLeft />}>
                Powrót
              </Button>
            </Link>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {visibleSections.length} / {sections.length} sekcji widocznych
              </span>
              <Button
                size="sm"
                variant={showHidden ? 'primary' : 'outline'}
                onClick={() => setShowHidden(!showHidden)}
                startIcon={showHidden ? <EyeIcon /> : <EyeOffIcon />}
              >
                {showHidden ? 'Ukryj nieaktywne' : 'Pokaż wszystkie'}
              </Button>
              <Link to={`/contents/${id}/edit`}>
                <Button size="sm" variant="primary">
                  Edytuj
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{content.title}</h1>
          {content.lead && (
            <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              {content.lead}
            </p>
          )}
          <div className="flex items-center gap-4 mt-6 text-sm text-gray-500 dark:text-gray-400">
            <span
              className={`px-3 py-1 rounded-full ${
                content.status === 'P'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {content.status === 'P' ? 'Opublikowane' : 'Szkic'}
            </span>
            {content.published_at && (
              <span>
                Opublikowano: {new Date(content.published_at).toLocaleDateString('pl-PL')}
              </span>
            )}
          </div>
        </header>

        {content.body && (
          <div
            className="prose dark:prose-invert max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: content.body }}
          />
        )}

        <div className="space-y-12">
          {visibleSections.map((section) => (
            <SectionRenderer
              key={section.section_id}
              section={section}
              getMediaUrl={getMediaUrl}
              getThumbnailUrl={getThumbnailUrl}
              mediaCache={mediaCache}
              showHidden={showHidden}
            />
          ))}
        </div>

        {sections.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">
              Brak sekcji. Dodaj sekcje w edytorze.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

interface SectionRendererProps {
  section: ContentSection;
  getMediaUrl: (id: string) => string;
  getThumbnailUrl: (id: string) => string;
  mediaCache: Map<string, Media>;
  showHidden: boolean;
}

function SectionRenderer({
  section,
  getMediaUrl,
  getThumbnailUrl,
  mediaCache,
  showHidden,
}: SectionRendererProps) {
  const isHidden = !section.status;

  return (
    <section
      className={`relative ${
        isHidden && showHidden
          ? 'opacity-50 border-2 border-dashed border-yellow-400 dark:border-yellow-600 rounded-lg p-4'
          : ''
      }`}
    >
      {isHidden && showHidden && (
        <div className="absolute -top-3 left-4 bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded text-xs font-medium text-yellow-800 dark:text-yellow-200">
          Ukryta sekcja
        </div>
      )}

      {section.heading && (
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{section.heading}</h2>
      )}

      {section.subheading && (
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">{section.subheading}</p>
      )}

      {section.section_type === 'text' && section.body && (
        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: section.body }}
        />
      )}

      {section.section_type === 'image' && section.media_ids[0] && (
        <div className="my-6">
          <img
            src={getMediaUrl(section.media_ids[0])}
            alt={section.heading || 'Image'}
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      )}

      {section.section_type === 'gallery' && section.media_ids.length > 0 && (
        <div
          className={`grid gap-4 my-6 ${
            section.settings?.layout === 'masonry'
              ? 'columns-2 md:columns-3'
              : `grid-cols-2 md:grid-cols-${section.settings?.columns || 3}`
          }`}
        >
          {section.media_ids.map((mediaId) => (
            <div key={mediaId} className="overflow-hidden rounded-lg">
              <img
                src={getMediaUrl(mediaId)}
                alt=""
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      )}

      {section.section_type === 'pdf' && section.media_ids[0] && (
        <div className="my-6 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={getThumbnailUrl(section.media_ids[0])}
              alt="PDF thumbnail"
              className="w-24 h-24 object-cover rounded"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                {mediaCache.get(section.media_ids[0])?.title || 'Dokument PDF'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Plik PDF</p>
            </div>
            <a
              href={getMediaUrl(section.media_ids[0])}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-primary dark:text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Otwórz PDF
            </a>
          </div>
        </div>
      )}

      {section.section_type === 'video' && section.settings?.video_url && (
        <div className="my-6 aspect-video">
          {section.settings.video_provider === 'youtube' && (
            <iframe
              src={`https://www.youtube.com/embed/${extractYouTubeId(
                section.settings.video_url
              )}${section.settings.autoplay ? '?autoplay=1' : ''}`}
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
          {section.settings.video_provider === 'vimeo' && (
            <iframe
              src={`https://player.vimeo.com/video/${extractVimeoId(
                section.settings.video_url
              )}${section.settings.autoplay ? '?autoplay=1' : ''}`}
              className="w-full h-full rounded-lg"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          )}
          {section.settings.video_provider === 'custom' && (
            <video
              src={section.settings.video_url}
              controls
              autoPlay={section.settings.autoplay}
              className="w-full h-full rounded-lg"
            />
          )}
        </div>
      )}

      {section.section_type === 'html' && section.body && (
        <div className="my-6" dangerouslySetInnerHTML={{ __html: section.body }} />
      )}

      {section.section_type === 'embed' && section.settings?.embed_code && (
        <div className="my-6" dangerouslySetInnerHTML={{ __html: section.settings.embed_code }} />
      )}
    </section>
  );
}

function extractYouTubeId(url: string): string {
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  );
  return match ? match[1] : '';
}

function extractVimeoId(url: string): string {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : '';
}
