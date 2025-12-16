import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { api } from './api/axios';
import Layout from './components/Layout';
import Home from './pages/Home';
import ContentList from './pages/ContentList';
import ContentDetail from './pages/ContentDetail';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import type { Menu, SiteSettings } from './types';

// Default site name fallback
const DEFAULT_SITE_NAME = 'Hairsal';

function App() {
  const [menu, setMenu] = useState<Menu | undefined>();
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    SITE_HEADER_NAME: DEFAULT_SITE_NAME,
  });

  useEffect(() => {
    // Fetch site settings from API
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        setSiteSettings(res.data.settings || {});
      } catch (err) {
        console.error('Failed to fetch site settings:', err);
      }
    };

    // Fetch main menu from API
    const fetchMenu = async () => {
      try {
        const res = await api.get('/menus');
        const menus = res.data.menus || res.data || [];
        // Use first menu as main navigation
        if (menus.length > 0) {
          const mainMenuRes = await api.get(`/menus/${menus[0].menu_id}/tree`);
          setMenu(mainMenuRes.data.menu || mainMenuRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch menu:', err);
      }
    };

    fetchSettings();
    fetchMenu();
  }, []);

  const siteName = siteSettings.SITE_HEADER_NAME || DEFAULT_SITE_NAME;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout menu={menu} siteName={siteName} />}>
          <Route index element={<Home />} />
          <Route path="artykuly" element={<ContentList />} />
          <Route path="artykul/:slug" element={<ContentDetail />} />
          <Route path="kontakt" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
