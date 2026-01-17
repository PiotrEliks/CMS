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

const DEFAULT_SETTINGS: SiteSettings = {
  general: { site_name: 'CMS Site' },
  header: {},
  footer: {},
  social_media: {},
  contact: {},
};

function App() {
  const [menu, setMenu] = useState<Menu | undefined>();
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    // Fetch site settings from API
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        setSiteSettings({ ...DEFAULT_SETTINGS, ...res.data });
      } catch (err) {
        console.error('Failed to fetch site settings:', err);
      }
    };

    fetchSettings();
  }, []);

  // Fetch menu when settings are loaded (use header_menu_id from settings)
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const menuId = siteSettings.header?.header_menu_id;
        if (menuId) {
          // Fetch menu by ID from the public API
          const menuRes = await api.get(`/menus/id/${menuId}`);
          setMenu(menuRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch menu:', err);
      }
    };

    fetchMenu();
  }, [siteSettings.header?.header_menu_id]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout menu={menu} settings={siteSettings} />}>
          <Route index element={<Home />} />
          <Route path="artykuly" element={<ContentList />} />
          <Route path="artykul/:slug" element={<ContentDetail />} />
          <Route path="kontakt" element={<Contact settings={siteSettings} />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
