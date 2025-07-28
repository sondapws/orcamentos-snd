
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, isReady } = useAuth();

  console.log('ProtectedRoute: Estado atual:', { user: !!user, loading, isReady });

  // Mostrar loading até que o AuthProvider esteja pronto
  if (loading || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Redirecionar para login se não autenticado
  if (!user) {
    console.log('ProtectedRoute: Usuário não autenticado, redirecionando para /auth');
    return <Navigate to="/auth" replace />;
  }

  console.log('ProtectedRoute: Usuário autenticado, renderizando conteúdo');
  return <>{children}</>;
};

export default ProtectedRoute;
