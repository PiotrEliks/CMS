import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import type { Menu, SiteSettings } from '../types';

interface LayoutProps {
  menu?: Menu;
  settings: SiteSettings;
}

export default function Layout({ menu, settings }: LayoutProps) {
  const siteName = settings.general?.site_name || 'CMS Site';

  return (
    <div className="site-wrap">
      <Navbar menu={menu} settings={settings} />
      <main>
        <Outlet />
      </main>
      <Footer settings={settings} />
    </div>
  );
}
