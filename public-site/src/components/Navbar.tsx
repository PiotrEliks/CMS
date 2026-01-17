import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { Menu, MenuItem, SiteSettings, SocialMedia } from '../types';

interface NavbarProps {
  menu?: Menu;
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

export default function Navbar({ menu, settings }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const siteName = settings.general?.site_name || 'CMS Site';
  const showSocial = settings.header?.header_show_social !== false;
  const socialLinks = settings.social_media?.social_media || [];

  const isActive = (path: string) => location.pathname === path;

  const renderMenuItem = (item: MenuItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const href = item.url || (item.content ? `/artykul/${item.content.slug}` : '#');

    if (hasChildren) {
      return (
        <li key={item.menu_item_id} className="has-children">
          <Link to={href}>{item.label}</Link>
          <ul className="dropdown">
            {item.children!.map(child => (
              <li key={child.menu_item_id}>
                <Link to={child.url || (child.content ? `/artykul/${child.content.slug}` : '#')}>
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      );
    }

    return (
      <li key={item.menu_item_id} className={isActive(href) ? 'active' : ''}>
        <Link to={href}>{item.label}</Link>
      </li>
    );
  };

  const renderSocialLinks = () => {
    if (!showSocial || socialLinks.length === 0) return null;

    return (
      <ul className="site-menu js-clone-nav ml-auto list-unstyled d-flex text-right mb-0">
        {socialLinks.map((social: SocialMedia, index: number) => (
          <li key={`${social.platform}-${index}`}>
            <a
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={index === 0 ? 'pl-0 pr-3 text-black' : 'pl-3 pr-3 text-black'}
            >
              <span className={socialIcons[social.platform] || 'icon-link'}></span>
            </a>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <>
      {/* Mobile Menu */}
      <div className={`site-mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <div className="site-mobile-menu-header">
          <div className="site-mobile-menu-close mt-3">
            <span
              className="icon-close2 js-menu-toggle clickable"
              onClick={() => setMobileMenuOpen(false)}
            ></span>
          </div>
        </div>
        <div className="site-mobile-menu-body">
          <ul className="site-nav-wrap">
            {menu?.items?.map(renderMenuItem)}
          </ul>
        </div>
      </div>

      {/* Header */}
      <header className="site-navbar py-1" role="banner">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-6 col-xl-2" data-aos="fade-down">
              <h1 className="mb-0">
                <Link to="/" className="text-black h2 mb-0">{siteName}</Link>
              </h1>
            </div>

            <div className="col-10 col-md-8 d-none d-xl-block" data-aos="fade-down">
              <nav className="site-navigation position-relative text-right text-lg-center" role="navigation">
                <ul className="site-menu js-clone-nav mx-auto d-none d-lg-block">
                  {menu?.items?.map(renderMenuItem)}
                </ul>
              </nav>
            </div>

            <div className="col-6 col-xl-2 text-right" data-aos="fade-down">
              <div className="d-none d-xl-inline-block">
                {renderSocialLinks()}
              </div>

              <div
                className="d-inline-block d-xl-none ml-md-0 mr-auto py-3 mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="icon-menu h3 text-black"></span>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
