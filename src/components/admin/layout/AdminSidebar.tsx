import { Button } from '../../ui/button';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  Coffee,
  Grid3X3,
  Menu as MenuIcon,
  Ruler,
  Tag,
  Users, // Add this import
  X,
} from '@/lib/icons';
import type { User } from '@supabase/supabase-js';

interface AdminSidebarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  onSignOut: () => void;
}

export const AdminSidebar = ({
  user,
  activeTab,
  setActiveTab,
  mobileSidebarOpen,
  setMobileSidebarOpen,
  onSignOut,
}: AdminSidebarProps) => {
  const navigate = useNavigate();

  const navigationItems = [
    {
      id: 'categories',
      label: 'Categories',
      icon: Grid3X3,
    },
    {
      id: 'menu-items',
      label: 'Menu Items',
      icon: MenuIcon,
    },
    {
      id: 'sizes',
      label: 'Sizes',
      icon: Ruler,
    },
    {
      id: 'attributes',
      label: 'Attributes',
      icon: Tag,
    },
    {
      id: 'accounts', // Add this new tab
      label: 'Accounts',
      icon: Users,
    },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 flex flex-col
          transition-all duration-300 ease-in-out
          ${
            mobileSidebarOpen
              ? 'translate-x-0'
              : '-translate-x-full lg:translate-x-0'
          }
          w-64
          bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800
        `}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-center h-16 border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => {
              navigate('/');
              setMobileSidebarOpen(false);
            }}
            className="flex items-center gap-3 px-3 py-2 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Coffee className="w-8 h-8 text-emerald-600" />
            <span className="font-semibold text-zinc-900 dark:text-white whitespace-nowrap">
              Vintage Cafe
            </span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={`
                  flex items-center w-full px-3 py-2 rounded-lg transition-colors
                  ${
                    isActive
                      ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="ml-3 whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sign Out Button - Desktop Only */}
        <div className="hidden p-2 border-b border-zinc-200 lg:block dark:border-zinc-800">
          <Button
            variant="outline"
            onClick={() => {
              onSignOut();
              navigate('/');
            }}
            className="w-full text-zinc-700 border-zinc-300 dark:border-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* User Section */}
        <div className="p-2 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/20">
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-zinc-900 dark:text-zinc-100">
                Admin
              </p>
              <p className="text-xs truncate text-zinc-500 dark:text-zinc-400">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Sign Out Button - Mobile Only */}
        <div className="p-2 border-t border-zinc-200 lg:hidden dark:border-zinc-800">
          <Button
            variant="outline"
            onClick={() => {
              onSignOut();
              navigate('/');
            }}
            className="w-full text-zinc-700 border-zinc-300 dark:border-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar Close Button */}
      {mobileSidebarOpen && (
        <button
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed z-50 p-2 bg-white rounded-lg shadow-lg top-4 right-4 lg:hidden dark:bg-zinc-800"
        >
          <X className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
        </button>
      )}
    </>
  );
};
