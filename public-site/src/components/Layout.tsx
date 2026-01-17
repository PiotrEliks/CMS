import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import type { Menu, SiteSettings } from '../types';

interface LayoutProps {
  headerMenu?: Menu;
  footerMenu?: Menu;
  settings: SiteSettings;
}

export default function Layout({ headerMenu, footerMenu, settings }: LayoutProps) {
   return (
    <div className="site-wrap">
      <Navbar menu={headerMenu} settings={settings} />
      <main>
        <Outlet />
      </main>
      <Footer menu={footerMenu} settings={settings} />
    </div>
  );
}
