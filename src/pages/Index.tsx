import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-blue-600 bg-no-repeat bg-contain bg-right flex items-center justify-center"
      style={{ backgroundImage: "url('/images/fundo-sonda.png')" }}
    >

      <main className="container mx-auto p-10 rounded-md bg-white bg-opacity-80">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Sistema de Orçamentos
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            Gere orçamentos personalizados de forma rápida e eficiente
          </p>

          {/* Seção de Produtos */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Escolha o Produto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Comply e-DOCS */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-blue-600 mb-3">Comply e-DOCS</h3>
                <p className="text-gray-600 mb-4">
                  Sistema de gestão de documentos fiscais eletrônicos
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate('/orcamento')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Calculator className="mr-2 h-5 w-5" />
                  Solicitar Orçamento E-Docs
                </Button>
              </div>

              {/* Comply Fiscal */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-blue-600 mb-3">Comply Fiscal</h3>
                <p className="text-gray-600 mb-4">
                  Orçamento para soluções de gestão tributária fiscal
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate('/orcamento-fiscal')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Calculator className="mr-2 h-5 w-5" />
                  Solicitar Orçamento Fiscal
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
