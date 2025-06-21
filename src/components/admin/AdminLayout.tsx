
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Menu className="h-6 w-6 mr-3" />
              <h1 className="text-xl font-bold">Painel Administrativo</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/admin/dashboard')}
                className="text-white hover:bg-blue-700"
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/admin/aplicativos')}
                className="text-white hover:bg-blue-700"
              >
                Aplicativos
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/admin/dados-produtos')}
                className="text-white hover:bg-blue-700"
              >
                Dados Produtos
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/admin/email-config')}
                className="text-white hover:bg-blue-700"
              >
                E-mails
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/admin/precificacao')}
                className="text-white hover:bg-blue-700"
              >
                Precificação
              </Button>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="text-sm">{user?.email}</span>
              </div>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-white hover:bg-blue-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
