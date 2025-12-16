import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/axios';
import Hero from '../components/Hero';
import ContentCard from '../components/ContentCard';
import type { Content, Category } from '../types';

export default function ContentList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [contents, setContents] = useState<Content[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 9;

  const selectedCategory = searchParams.get('kategoria');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [contentsRes, categoriesRes] = await Promise.all([
          api.get('/contents', {
            params: {
              limit,
              offset: (page - 1) * limit,
              category: selectedCategory || undefined,
            },
          }),
          api.get('/categories'),
        ]);

        setContents(contentsRes.data.contents || []);
        setTotal(contentsRes.data.total || 0);
        setCategories(categoriesRes.data.categories || []);
      } catch (err) {
        setError('Nie udalo sie zaladowac artykulow');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, selectedCategory]);

  const totalPages = Math.ceil(total / limit);

  const handleCategoryChange = (categorySlug: string | null) => {
    setPage(1);
    if (categorySlug) {
      setSearchParams({ kategoria: categorySlug });
    } else {
      setSearchParams({});
    }
  };

  return (
    <>
      <Hero title="Artykuly" backgroundImage="/images/hero_bg_2.jpg" />

      <div className="site-section">
        <div className="container">
          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="row justify-content-center mb-5">
              <div className="col-md-10">
                <div className="d-flex flex-wrap justify-content-center">
                  <button
                    className={`btn ${!selectedCategory ? 'btn-primary' : 'btn-outline-primary'} m-1`}
                    onClick={() => handleCategoryChange(null)}
                  >
                    Wszystkie
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.category_id}
                      className={`btn ${selectedCategory === cat.slug ? 'btn-primary' : 'btn-outline-primary'} m-1`}
                      onClick={() => handleCategoryChange(cat.slug)}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Content Grid */}
          {loading ? (
            <div className="text-center py-5">
              <p>Ladowanie...</p>
            </div>
          ) : error ? (
            <div className="text-center py-5">
              <p className="text-danger">{error}</p>
            </div>
          ) : contents.length === 0 ? (
            <div className="text-center py-5">
              <p>Brak artykulow w tej kategorii.</p>
            </div>
          ) : (
            <>
              <div className="row">
                {contents.map(content => (
                  <ContentCard key={content.content_id} content={content} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="row justify-content-center mt-5">
                  <div className="col-md-6">
                    <nav aria-label="Nawigacja stron">
                      <ul className="pagination justify-content-center">
                        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                          >
                            &laquo; Poprzednia
                          </button>
                        </li>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                          <li key={p} className={`page-item ${page === p ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => setPage(p)}>
                              {p}
                            </button>
                          </li>
                        ))}
                        <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                          >
                            Nastepna &raquo;
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
