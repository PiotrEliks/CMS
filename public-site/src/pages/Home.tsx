import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getMediaUrl } from '../api/axios';
import type { Content } from '../types';

interface HeroSlide {
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundImage: string;
}

interface ServiceItem {
  icon: string;
  name: string;
  description: string;
  price: string;
}

interface OpeningHour {
  days: string;
  time: string;
}

interface HomePageData {
  hero: {
    slides: HeroSlide[];
  };
  welcome: {
    title: string;
    subtitle: string;
    description: string;
    image: string;
  };
  openingHours: {
    title: string;
    hours: OpeningHour[];
  };
  services: {
    title: string;
    items: ServiceItem[];
  };
  testimonial: {
    title: string;
    quote: string;
    author: string;
    image: string;
  };
  cta: {
    title: string;
    backgroundImage: string;
  };
}

export default function Home() {
  const [pageData, setPageData] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomepage = async () => {
      try {
        const res = await api.get('/contents/home');
        const content: Content = res.data.content || res.data;
        if (content?.body) {
          const parsed = typeof content.body === 'string'
            ? JSON.parse(content.body)
            : content.body;
          setPageData(parsed);
        }
      } catch (err) {
        setError('Nie udalo sie zaladowac strony');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomepage();
  }, []);

  if (loading) {
    return (
      <div className="site-section">
        <div className="container text-center py-5">
          <p>Ladowanie...</p>
        </div>
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="site-section">
        <div className="container text-center py-5">
          <p className="text-danger">{error || 'Brak danych strony'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Slider */}
      <div className="slide-one-item home-slider owl-carousel">
        {pageData.hero.slides.map((slide, index) => (
          <div
            key={index}
            className="site-blocks-cover"
            style={{ backgroundImage: `url(${getMediaUrl(slide.backgroundImage)})` }}
            data-aos="fade"
            data-stellar-background-ratio="0.5"
          >
            <div className="container">
              <div className="row align-items-center justify-content-center text-center">
                <div className="col-md-8" data-aos="fade-up" data-aos-delay="400">
                  {slide.subtitle && (
                    <h5 className="text-white font-weight-light text-uppercase">
                      {slide.subtitle}
                    </h5>
                  )}
                  <h2 className="text-white font-weight-light mb-2 display-1">
                    {slide.title}
                  </h2>
                  {slide.buttonText && slide.buttonLink && (
                    <p>
                      <Link to={slide.buttonLink} className="btn btn-black py-3 px-5">
                        {slide.buttonText}
                      </Link>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Welcome Section */}
      <div className="site-section">
        <div className="container">
          <div className="row">
            <div className="col-md-6 col-lg-4 text-center">
              <h3 className="line-height-1 mb-3">
                <span className="d-block display-4 line-height-1 text-black">
                  {pageData.welcome.subtitle}
                </span>
                <span className="d-block display-4 line-height-1">
                  <em className="text-primary font-weight-bold">{pageData.welcome.title}</em>
                </span>
              </h3>
              <p>{pageData.welcome.description}</p>
              <p>
                <Link to="/about">
                  <small className="text-uppercase font-weight-bold">Read More</small>
                </Link>
              </p>
            </div>
            <div className="col-md-6 col-lg-4">
              <figure className="h-100 hover-bg-enlarge">
                <div
                  className="bg-image h-100 bg-image-md-height"
                  style={{ backgroundImage: `url('${getMediaUrl(pageData.welcome.image)}')` }}
                ></div>
              </figure>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="border p-4 d-flex align-items-center justify-content-center h-100">
                <div className="text-center">
                  <h2 className="text-primary h2 mb-5">{pageData.openingHours.title}</h2>
                  {pageData.openingHours.hours.map((hour, index) => (
                    <p key={index} className="mb-4">
                      <span className="d-block font-weight-bold">{hour.days}</span>
                      {hour.time}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="site-section">
        <div className="container">
          <div className="row justify-content-center mb-5">
            <div className="col-md-7">
              <h2 className="site-section-heading font-weight-light text-black text-center">
                {pageData.services.title}
              </h2>
            </div>
          </div>

          <div className="row">
            {pageData.services.items.map((service, index) => (
              <div key={index} className="col-md-6 col-lg-4 text-center mb-5 mb-lg-5">
                <div className="h-100 p-4 p-lg-5 bg-light site-block-feature-7">
                  <span className={`icon ${service.icon} display-3 text-primary mb-4 d-block`}></span>
                  <h3 className="text-black h4">{service.name}</h3>
                  <p>{service.description}</p>
                  <p>
                    <strong className="font-weight-bold text-primary">{service.price}</strong>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="site-section bg-light">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 mb-5">
              <img src={getMediaUrl(pageData.testimonial.image)} alt="Image" className="img-md-fluid" />
            </div>
            <div className="col-lg-6 bg-white p-md-5 align-self-center">
              <h2 className="display-1 text-black line-height-1 site-section-heading mb-4 pb-3">
                {pageData.testimonial.title}
              </h2>
              <p className="text-black lead">
                <em>&ldquo;{pageData.testimonial.quote}&rdquo;</em>
              </p>
              <p className="lead text-black">
                &mdash; <em>{pageData.testimonial.author}</em>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div
        className="site-blocks-cover overlay inner-page-cover cta-fixed-background"
        style={{ backgroundImage: `url(${getMediaUrl(pageData.cta.backgroundImage)})` }}
      >
        <div className="container">
          <div className="row align-items-center justify-content-center text-center">
            <div className="col-md-10" data-aos="fade-up" data-aos-delay="400">
              <h2 className="text-white font-weight-light mb-5 display-3">
                {pageData.cta.title}
              </h2>
              <Link to="/kontakt" className="btn btn-black py-3 px-5">
                Kontakt
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
