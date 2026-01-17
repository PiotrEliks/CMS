import { Link } from 'react-router-dom';
import type { SiteSettings, SocialMedia } from '../types';

interface FooterProps {
  settings: SiteSettings;
}

const socialIcons: Record<string, string> = {
  facebook: 'icon-facebook',
  twitter: 'icon-twitter',
  instagram: 'icon-instagram',
  linkedin: 'icon-linkedin',
  youtube: 'icon-youtube',
  tiktok: 'icon-tiktok',
  github: 'icon-github',
};

export default function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const siteName = settings.general?.site_name || 'CMS Site';
  const description = settings.general?.site_description;
  const copyrightText = settings.footer?.footer_copyright_text;
  const showSocial = settings.footer?.footer_show_social !== false;
  const socialLinks = settings.social_media?.social_media || [];
  const contact = settings.contact || {};

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="row">
          <div className="col-lg-4">
            <div className="mb-5">
              <h3 className="footer-heading mb-4">O {siteName}</h3>
              <p>{description || 'Witamy na naszej stronie. Znajdziesz tutaj najnowsze artykuly i informacje.'}</p>

              {(contact.contact_address || contact.contact_phone || contact.contact_email) && (
                <div className="mt-4">
                  {contact.contact_address && (
                    <p className="mb-2">
                      <span className="icon-map-marker mr-2"></span>
                      {contact.contact_address}
                    </p>
                  )}
                  {contact.contact_phone && (
                    <p className="mb-2">
                      <span className="icon-phone mr-2"></span>
                      <a href={`tel:${contact.contact_phone}`}>{contact.contact_phone}</a>
                    </p>
                  )}
                  {contact.contact_email && (
                    <p className="mb-2">
                      <span className="icon-envelope mr-2"></span>
                      <a href={`mailto:${contact.contact_email}`}>{contact.contact_email}</a>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-4 mb-5 mb-lg-0">
            <div className="row mb-5">
              <div className="col-md-12">
                <h3 className="footer-heading mb-4">Menu</h3>
              </div>
              <div className="col-md-6 col-lg-6">
                <ul className="list-unstyled">
                  <li><Link to="/">Strona Glowna</Link></li>
                  <li><Link to="/artykuly">Artykuly</Link></li>
                </ul>
              </div>
              <div className="col-md-6 col-lg-6">
                <ul className="list-unstyled">
                  <li><Link to="/kontakt">Kontakt</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-lg-4 mb-5 mb-lg-0">
            <div className="mb-5">
              <h3 className="footer-heading mb-2">Newsletter</h3>
              <p>Zapisz sie do naszego newslettera, aby otrzymywac najnowsze informacje.</p>

              <form onSubmit={(e) => e.preventDefault()}>
                <div className="input-group mb-3">
                  <input
                    type="email"
                    className="form-control border-secondary text-white bg-transparent"
                    placeholder="Wpisz email"
                    aria-label="Wpisz email"
                  />
                  <div className="input-group-append">
                    <button className="btn btn-primary text-white" type="submit">
                      Wyslij
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="row pt-5 mt-5 text-center">
          <div className="col-md-12">
            {showSocial && socialLinks.length > 0 && (
              <div className="mb-5">
                {socialLinks.map((social: SocialMedia, index: number) => (
                  <a
                    key={`${social.platform}-${index}`}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={index === 0 ? 'pl-0 pr-3' : 'pl-3 pr-3'}
                  >
                    <span className={socialIcons[social.platform] || 'icon-link'}></span>
                  </a>
                ))}
              </div>
            )}

            <p>
              {copyrightText || `Copyright © ${currentYear} ${siteName}. Wszelkie prawa zastrzezone.`}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
