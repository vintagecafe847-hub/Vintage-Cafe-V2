import { Button } from '../../ui/button';
import { Menu as MenuIcon, Sun, Moon, Globe } from '@/lib/icons';

interface AdminHeaderProps {
  activeTab: string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  onPublishChanges: () => void;
}

const getTabInfo = (activeTab: string) => {
  switch (activeTab) {
    case 'categories':
      return {
        title: 'Categories Management',
        description: 'Organize your menu structure with categories',
      };
    case 'menu-items':
      return {
        title: 'Menu Items Management',
        description: 'Manage individual items and their details',
      };
    case 'sizes':
      return {
        title: 'Sizes Management',
        description: 'Configure available sizes and pricing adjustments',
      };
    case 'attributes':
      return {
        title: 'Attributes Management',
        description: 'Manage item attributes like Hot, Iced, Vegan, etc.',
      };
    default:
      return {
        title: 'Admin Panel',
        description: 'Manage your coffee shop menu',
      };
  }
};

export const AdminHeader = ({
  activeTab,
  isDarkMode,
  toggleDarkMode,
  setMobileSidebarOpen,
  onPublishChanges,
}: AdminHeaderProps) => {
  const { title, description } = getTabInfo(activeTab);

  return (
    <header className="px-4 py-4 bg-white border-b border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-lg lg:hidden hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <MenuIcon className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
          </button>
          <div>
            <h1 className="text-xl font-bold lg:text-2xl text-zinc-900 dark:text-zinc-100">
              {title}
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <Button
              onClick={onPublishChanges}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Globe className="w-4 h-4 mr-2" />
              Publish Changes to Website
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleDarkMode}
            className="text-zinc-700 border-zinc-200 dark:border-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};
