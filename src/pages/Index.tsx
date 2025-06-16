
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, FileText, Settings, Shield, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Calculator className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">
                Sistema de Orçamento MIRO/MIGO
              </h1>
            </div>
            <Link to="/admin">
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Painel Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Automatize seus Processos MIRO e MIGO
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Gere orçamentos personalizados para automação de documentos fiscais eletrônicos. 
            Processo simples, rápido e totalmente online.
          </p>
          
          <Link to="/orcamento">
            <Button size="lg" className="flex items-center gap-2 text-lg px-8 py-3">
              <FileText className="w-5 h-5" />
              Solicitar Orçamento
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileText className="h-12 w-12 text-primary-600 mb-4" />
              <CardTitle>Formulário Inteligente</CardTitle>
              <CardDescription>
                Questionário em duas etapas que coleta todas as informações necessárias 
                para um orçamento preciso e personalizado.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Calculator className="h-12 w-12 text-primary-600 mb-4" />
              <CardTitle>Cálculo Automático</CardTitle>
              <CardDescription>
                Sistema inteligente de cálculo baseado em regras de negócio específicas 
                para cada segmento e necessidade.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="h-12 w-12 text-primary-600 mb-4" />
              <CardTitle>Envio Seguro</CardTitle>
              <CardDescription>
                Processo automatizado de envio de orçamentos com validação de domínio 
                e sistema de aprovação administrativa.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Process Steps */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Como Funciona
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">Identificação</h4>
              <p className="text-gray-600">
                Preencha os dados da sua empresa: razão social, CNPJ, localização e responsável.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">Questionário</h4>
              <p className="text-gray-600">
                Informe detalhes técnicos: segmento, escopo, volumetria e modalidade desejada.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">Orçamento</h4>
              <p className="text-gray-600">
                Receba seu orçamento personalizado diretamente no e-mail em minutos.
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link to="/orcamento">
              <Button size="lg" className="flex items-center gap-2">
                Começar Agora
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Scope Overview */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-8">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Documentos Suportados
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'NF-e', 'NFS-e', 'CT-e', 'NFCom', 
              'MDF-e', 'NFC-e', 'NFE3e', 'Faturas'
            ].map((doc) => (
              <div key={doc} className="bg-gray-50 rounded-lg p-4 text-center">
                <span className="font-semibold text-gray-700">{doc}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Sistema de Orçamento MIRO/MIGO. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
