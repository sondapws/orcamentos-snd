
import { Button } from "@/components/ui/button";
import { Calculator, Settings, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <main className="container mx-auto px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sistema de Orçamentos Inteligente
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Gere orçamentos personalizados de forma rápida e eficiente
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/orcamento')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Calculator className="mr-2 h-5 w-5" />
              Solicitar Orçamento
            </Button>
            {user ? (
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/admin/dashboard')}
              >
                <Settings className="mr-2 h-5 w-5" />
                Acessar Painel Admin
              </Button>
            ) : (
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/auth')}
              >
                <Users className="mr-2 h-5 w-5" />
                Login Administrativo
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
