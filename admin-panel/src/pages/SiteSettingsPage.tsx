import { useEffect, useState } from 'react';
import { Globe, Layout, Share2 } from 'lucide-react';
import PageMeta from '../components/common/PageMeta';
import PageBreadcrumb from '../components/common/PageBreadCrumb';
import ComponentCard from '../components/common/ComponentCard';
import { useSiteSettings } from '../store/siteSettings';
import GeneralSettings from '../components/ui/settings/GeneralSettings';
import HeaderSettings from '../components/ui/settings/HeaderSettings';
import FooterSettings from '../components/ui/settings/FooterSettings';
import SocialMediaSettings from '../components/ui/settings/SocialMediaSettings';

type Tab =
  | 'general'
  | 'header'
  | 'footer'
  | 'social'
  | 'contact'
  | 'seo'
  | 'analytics'
  | 'advanced';

export default function SiteSettingsPage() {
  const { settings, loading, saving, fetchSettings } = useSiteSettings();
  const [activeTab, setActiveTab] = useState<Tab>('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'Ogólne', icon: Globe },
    { id: 'header', label: 'Header', icon: Layout },
    { id: 'footer', label: 'Footer', icon: Layout },
    { id: 'social', label: 'Social Media', icon: Share2 },
  ] as const;

  return (
    <>
      <PageMeta title="Ustawienia Strony" description="" />
      <PageBreadcrumb pageTitle="Ustawienia Strony" />

      <div className="space-y-6">
        <ComponentCard title="" desc="">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`
                      group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                      ${
                        isActive
                          ? 'border-primary text-primary'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </ComponentCard>

        {settings && (
          <>
            {activeTab === 'general' && <GeneralSettings settings={settings.general} />}
            {activeTab === 'header' && <HeaderSettings settings={settings.header} />}
            {activeTab === 'footer' && <FooterSettings settings={settings.footer} />}
            {activeTab === 'social' && <SocialMediaSettings settings={settings.social_media} />}
          </>
        )}
      </div>
    </>
  );
}
