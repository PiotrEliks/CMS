import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import type { Menu } from '../types';

interface LayoutProps {
  menu?: Menu;
  siteName?: string;
}

export default function Layout({ menu, siteName }: LayoutProps) {
  return (
    <div className="site-wrap">
      <Navbar menu={menu} siteName={siteName} />
      <main>
        <Outlet />
      </main>
      <Footer siteName={siteName} />
    </div>
  );
}
