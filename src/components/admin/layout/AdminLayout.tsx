import { ReactNode } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import type { User } from '@supabase/supabase-js';

interface AdminLayoutProps {
  children: ReactNode;
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  onSignOut: () => void;
  onPublishChanges: () => void;
}

export const AdminLayout = ({
  children,
  user,
  activeTab,
  setActiveTab,
  isDarkMode,
  toggleDarkMode,
  mobileSidebarOpen,
  setMobileSidebarOpen,
  onSignOut,
  onPublishChanges,
}: AdminLayoutProps) => {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
        onSignOut={onSignOut}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0 bg-white dark:bg-zinc-950">
        <AdminHeader
          activeTab={activeTab}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          setMobileSidebarOpen={setMobileSidebarOpen}
          onPublishChanges={onPublishChanges}
        />

        {/* Content Area */}
        <main className="flex-1 p-3 lg:p-6 bg-zinc-50 dark:bg-zinc-950">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};
