
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '@/hooks/useSidebar';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Breadcrumb from './Breadcrumb';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';
import { User } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { isCollapsed, toggle } = useSidebar();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-sonda-black flex transition-colors">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} onToggle={toggle} />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Top Header */}
        <header className="bg-white dark:bg-sonda-gray1 border-b border-gray-200 dark:border-sonda-gray2 px-6 py-4 transition-colors">
          <div className={`flex justify-between items-center ${isCollapsed ? 'h-6' : 'h-12'} transition-all duration-300`}>
            <div className="flex flex-col justify-center">
              <h1 className={`font-bold text-blue-600 dark:text-blue-400 leading-tight ${isCollapsed ? 'text-lg' : 'text-xl'}`}>Painel Administrativo</h1>
              {!isCollapsed && <p className="text-sm text-gray-600 dark:text-sonda-gray3 leading-tight">Gerencie sua aplicação</p>}
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <NotificationBell />

              <div 
                className="flex items-center space-x-3 bg-gray-50 dark:bg-sonda-gray2 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-sonda-gray1 transition-colors"
                onClick={() => navigate('/admin/user-config')}
              >
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-sonda-white">Usuário</p>
                  <p className="text-gray-600 dark:text-sonda-gray3">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <div className="p-6">
            <Breadcrumb />
            <div className="p-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
