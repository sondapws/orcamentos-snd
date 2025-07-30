import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Smartphone,
  Mail,
  Calculator,
  User,
  LogOut,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
    navigate('/auth');
  };

  const menuItems = [
    {
      icon: Home,
      label: 'Dashboard',
      path: '/admin/dashboard'
    },
    {
      icon: CheckCircle,
      label: 'Aprovações',
      path: '/admin/aprovacoes'
    },
    {
      icon: Calculator,
      label: 'Precificação',
      path: '/admin/precificacao'
    },
    {
      icon: Mail,
      label: 'E-mails',
      path: '/admin/email-config'
    },
    {
      icon: Smartphone,
      label: 'Aplicativos',
      path: '/admin/aplicativos'
    }
  ];

  return (
    <div className={cn(
      "bg-blue-600 flex flex-col transition-all duration-300 ease-in-out h-screen fixed left-0 top-0 z-10",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header com Logo */}
      <div className="p-4 border-b border-blue-700 relative">
        <div className="flex items-center justify-center">
          {!isCollapsed && (
            <img
              src="/images/logo-sonda.png"
              alt="Sonda Logo"
              className="h-12 w-auto"
            />
          )}
          {isCollapsed && (
            <img
              src="/images/logo-sonda-16x16.png"
              alt="Sonda Logo"
              className="h-6 w-6 bg-white rounded p-1"
            />
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-6 w-6 absolute -right-3 top-1/2 transform -translate-y-1/2 text-white hover:bg-blue-700 bg-blue-600"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          const buttonContent = (
            <Button
              key={item.path}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full text-white hover:bg-blue-700",
                isCollapsed ? "justify-center px-2" : "justify-start px-3",
                isActive && "bg-blue-800 text-white"
              )}
              onClick={() => navigate(item.path)}
            >
              <Icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
              {!isCollapsed && <span>{item.label}</span>}
            </Button>
          );

          if (isCollapsed) {
            return (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  {buttonContent}
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          }

          return buttonContent;
        })}
      </nav>

      {/* User Actions */}
      <div className="p-2 border-t border-blue-700 space-y-1">
        {isCollapsed ? (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-center px-2 text-white hover:bg-blue-700"
                  onClick={() => navigate('/admin/user-config')}
                >
                  <User className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Configurações</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-center px-2 text-red-300 hover:text-red-200 hover:bg-blue-700"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Sair</p>
              </TooltipContent>
            </Tooltip>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              className="w-full justify-start px-3 text-white hover:bg-blue-700"
              onClick={() => navigate('/admin/user-config')}
            >
              <User className="h-4 w-4 mr-3" />
              <span>Configurações</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start px-3 text-red-300 hover:text-red-200 hover:bg-blue-700"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-3" />
              <span>Sair</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;