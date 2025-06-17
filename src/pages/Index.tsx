
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import { Calculator, FileText, Settings, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-blue-600" />
                Formulário Inteligente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Formulário em duas etapas que coleta todas as informações necessárias 
                para gerar um orçamento preciso e personalizado.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="mr-2 h-5 w-5 text-blue-600" />
                Cálculo Automatizado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Sistema de precificação baseado em regras de negócio configuráveis 
                que considera todos os parâmetros do projeto.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5 text-blue-600" />
                Painel Administrativo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Interface completa para configuração de parâmetros, 
                aprovação de orçamentos e gestão do sistema.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
