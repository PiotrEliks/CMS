import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  FileText,
  FolderTree,
  Menu,
  Image,
  Users,
  Shield,
  Settings,
  Layout,
  Newspaper,
} from 'lucide-react';
import PageMeta from '../components/common/PageMeta';
import PageBreadcrumb from '../components/common/PageBreadCrumb';
import { api } from '../api/axios';

interface DashboardCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  color: string;
  bgColor: string;
}

interface DashboardStats {
  contentsCount: number;
  mediaCount: number;
  usersCount: number;
  categoriesCount: number;
  menusCount: number;
}

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats>({
    contentsCount: 0,
    mediaCount: 0,
    usersCount: 0,
    categoriesCount: 0,
    menusCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [contents, media, users, categories, menus] = await Promise.all([
        api.get('/contents', { params: { limit: 1 } }).catch(() => ({ data: { total: 0 } })),
        api.get('/media', { params: { limit: 1 } }).catch(() => ({ data: { total: 0 } })),
        api.get('/users', { params: { limit: 1 } }).catch(() => ({ data: { total: 0 } })),
        api.get('/categories', { params: { limit: 1 } }).catch(() => ({ data: { total: 0 } })),
        api.get('/menus').catch(() => ({ data: { menus: [] } })),
      ]);

      setStats({
        contentsCount: contents.data.total || 0,
        mediaCount: media.data.total || 0,
        usersCount: users.data.total || 0,
        categoriesCount: categories.data.total || 0,
        menusCount: menus.data.menus?.length || 0,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardCards: DashboardCard[] = [
    {
      title: 'Strony',
      description: 'Zarządzaj stronami, artykułami i postami',
      icon: <FileText className="w-8 h-8" />,
      link: '/contents',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Kategorie',
      description: 'Organizuj treści w kategorie',
      icon: <FolderTree className="w-8 h-8" />,
      link: '/categories',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Menu',
      description: 'Twórz i edytuj nawigację strony',
      icon: <Menu className="w-8 h-8" />,
      link: '/menus',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'Media',
      description: 'Biblioteka plików i obrazów',
      icon: <Image className="w-8 h-8" />,
      link: '/media',
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    },
    {
      title: 'Użytkownicy',
      description: 'Zarządzaj użytkownikami systemu',
      icon: <Users className="w-8 h-8" />,
      link: '/users',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      title: 'Role i uprawnienia',
      description: 'Konfiguruj dostęp użytkowników',
      icon: <Shield className="w-8 h-8" />,
      link: '/roles',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      title: 'Ustawienia strony',
      description: 'Header, footer, SEO, social media',
      icon: <Settings className="w-8 h-8" />,
      link: '/settings',
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    },
  ];

  return (
    <>
      <PageMeta
        title="Strona główna panelu administracyjnego"
        description="To jest strona główna panelu administracyjnego systemu CMS"
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Panel Administracyjny
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Witaj w systemie zarządzania treścią. Wybierz funkcję poniżej, aby rozpocząć.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Treści</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? '...' : stats.contentsCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Newspaper className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Media</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? '...' : stats.mediaCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-pink-50 dark:bg-pink-900/20 rounded-lg flex items-center justify-center">
              <Image className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Użytkownicy</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? '...' : stats.usersCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Kategorie</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? '...' : stats.categoriesCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <FolderTree className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {dashboardCards.map((card, index) => (
          <Link
            key={index}
            to={card.link}
            className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary"
          >
            <div className="p-6">
              <div
                className={`w-16 h-16 ${card.bgColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}
              >
                <div className={card.color}>{card.icon}</div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                {card.title}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400">{card.description}</p>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-dark transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
          </Link>
        ))}
      </div>
    </>
  );
}