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
  LogOut
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
      icon: Smartphone,
      label: 'Aplicativos',
      path: '/admin/aplicativos'
    },

    {
      icon: Mail,
      label: 'E-mails',
      path: '/admin/email-config'
    },
    {
      icon: Calculator,
      label: 'Precificação',
      path: '/admin/precificacao'
    }
  ];

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header com Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <img 
                src="/images/logo-sonda.png" 
                alt="Sonda Logo" 
                className="h-8 w-auto"
              />
              <span className="font-bold text-gray-900">Sonda Admin</span>
            </div>
          )}
          {isCollapsed && (
            <div className="flex items-center justify-between w-full">
              <img 
                src="/images/logo-sonda-16x16.png" 
                alt="Sonda Logo" 
                className="h-6 w-6"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="p-1 h-6 w-6"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          )}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="p-1 h-6 w-6"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          const buttonContent = (
            <Button
              key={item.path}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full",
                isCollapsed ? "justify-center px-2" : "justify-start px-3",
                isActive && "bg-blue-50 text-blue-700 border-blue-200"
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
      <div className="p-2 border-t border-gray-200 space-y-1">
        {isCollapsed ? (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-center px-2"
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
                  className="w-full justify-center px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
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
              className="w-full justify-start px-3"
              onClick={() => navigate('/admin/user-config')}
            >
              <User className="h-4 w-4 mr-3" />
              <span>Configurações</span>
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
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