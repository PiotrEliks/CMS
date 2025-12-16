import { Link } from 'react-router-dom';
import type { Content } from '../types';

interface ContentCardProps {
  content: Content;
}

export default function ContentCard({ content }: ContentCardProps) {
  const excerpt = content.meta_description ||
    content.body.replace(/<[^>]*>/g, '').substring(0, 150) + '...';

  const coverImage = content.cover_media?.url || '/images/img_1.jpg';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="col-md-6 col-lg-4 mb-5">
      <div className="h-100 bg-white shadow-sm">
        <Link to={`/artykul/${content.slug}`} className="d-block">
          <figure className="hover-bg-enlarge mb-0">
            <div
              className="bg-image card-cover-image"
              style={{ backgroundImage: `url(${coverImage})` }}
            ></div>
          </figure>
        </Link>
        <div className="p-4">
          <span className="text-primary small d-block mb-2">
            {formatDate(content.published_at || content.created_at)}
          </span>
          <h3 className="h5 text-black mb-3">
            <Link to={`/artykul/${content.slug}`} className="text-black">
              {content.title}
            </Link>
          </h3>
          <p className="text-muted small mb-3">{excerpt}</p>
          {content.categories && content.categories.length > 0 && (
            <div className="mb-3">
              {content.categories.map(cat => (
                <span key={cat.category_id} className="badge badge-light mr-1">
                  {cat.name}
                </span>
              ))}
            </div>
          )}
          <Link to={`/artykul/${content.slug}`} className="text-primary small font-weight-bold">
            Czytaj wiecej &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
