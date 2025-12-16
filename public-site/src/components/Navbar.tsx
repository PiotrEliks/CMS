import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { Menu, MenuItem } from '../types';

interface NavbarProps {
  menu?: Menu;
  siteName?: string;
}

export default function Navbar({ menu, siteName = 'CMS Site' }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

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

  const defaultMenuItems = (
    <>
      <li className={isActive('/') ? 'active' : ''}>
        <Link to="/">Strona Glowna</Link>
      </li>
      <li className={isActive('/artykuly') ? 'active' : ''}>
        <Link to="/artykuly">Artykuly</Link>
      </li>
      <li className={isActive('/kontakt') ? 'active' : ''}>
        <Link to="/kontakt">Kontakt</Link>
      </li>
    </>
  );

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
            {menu?.items ? menu.items.map(renderMenuItem) : defaultMenuItems}
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
                  {menu?.items ? menu.items.map(renderMenuItem) : defaultMenuItems}
                </ul>
              </nav>
            </div>

            <div className="col-6 col-xl-2 text-right" data-aos="fade-down">
              <div className="d-none d-xl-inline-block">
                <ul className="site-menu js-clone-nav ml-auto list-unstyled d-flex text-right mb-0">
                  <li>
                    <a href="#" className="pl-0 pr-3 text-black"><span className="icon-facebook"></span></a>
                  </li>
                  <li>
                    <a href="#" className="pl-3 pr-3 text-black"><span className="icon-twitter"></span></a>
                  </li>
                  <li>
                    <a href="#" className="pl-3 pr-3 text-black"><span className="icon-instagram"></span></a>
                  </li>
                </ul>
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
