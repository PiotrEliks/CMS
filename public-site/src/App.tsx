import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { api } from './api/axios'
import Layout from './components/Layout'
import Home from './pages/Home'
import ContentPage from './pages/ContentPage'
import CategoryPage from './pages/CategoryPage'
import CategoryContentPage from './pages/CategoryContentPage'
import NotFound from './pages/NotFound'
import type { Menu, SiteSettings } from './types'

const DEFAULT_SETTINGS: SiteSettings = {
  general: { site_name: 'CMS Site' },
  header: {},
  footer: {},
  social_media: {},
  contact: {},
}

function App() {
  const [headerMenu, setHeaderMenu] = useState<Menu | undefined>()
  const [footerMenu, setFooterMenu] = useState<Menu | undefined>()
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    // Fetch site settings from API
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings')
        setSiteSettings({ ...DEFAULT_SETTINGS, ...res.data })
      } catch (err) {
        console.error('Failed to fetch site settings:', err)
      }
    }

    fetchSettings()
  }, [])

  // Fetch header menu when settings are loaded
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const menuId = siteSettings.header?.header_menu_id
        if (menuId) {
          const menuRes = await api.get(`/menus/id/${menuId}`)
          setHeaderMenu(menuRes.data)
        }
      } catch (err) {
        console.error('Failed to fetch header menu:', err)
      }
    }

    fetchMenu()
  }, [siteSettings.header?.header_menu_id])

  // Fetch footer menu when settings are loaded
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const menuId = siteSettings.footer?.footer_menu_id
        if (menuId) {
          const menuRes = await api.get(`/menus/id/${menuId}`)
          setFooterMenu(menuRes.data)
        }
      } catch (err) {
        console.error('Failed to fetch footer menu:', err)
      }
    }

    fetchMenu()
  }, [siteSettings.footer?.footer_menu_id])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout headerMenu={headerMenu} footerMenu={footerMenu} settings={siteSettings} />}>
          <Route index element={<Home />} />
          {/* Category pages - display content list for a category */}
          <Route path="category/:slug" element={<CategoryPage />} />
          {/* Content pages with category prefix - e.g., /aktualnosci/my-article */}
          <Route path=":categorySlug/:pageSlug" element={<CategoryContentPage />} />
          {/* Dynamic content pages - all slugs load ContentPage */}
          <Route path=":slug" element={<ContentPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
