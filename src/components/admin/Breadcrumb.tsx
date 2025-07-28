import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const breadcrumbMap: Record<string, string> = {
    admin: 'Administração',
    dashboard: 'Dashboard',
    aplicativos: 'Aplicativos',

    'email-config': 'Configuração de E-mail',
    precificacao: 'Precificação',
    'user-config': 'Configurações de Usuário'
  };

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-600">
      <Link 
        to="/admin/dashboard" 
        className="flex items-center hover:text-blue-600 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = breadcrumbMap[name] || name;

        return (
          <React.Fragment key={name}>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            {isLast ? (
              <span className="font-medium text-blue-600">{displayName}</span>
            ) : (
              <Link 
                to={routeTo} 
                className="hover:text-blue-600 transition-colors"
              >
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;