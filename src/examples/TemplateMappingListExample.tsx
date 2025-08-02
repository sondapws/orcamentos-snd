import React, { useState } from 'react';
import TemplateMappingList from '@/components/admin/email/TemplateMappingList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw } from 'lucide-react';

/**
 * Exemplo de uso do componente TemplateMappingList
 * 
 * Este exemplo demonstra diferentes configurações e casos de uso
 * do componente de listagem de mapeamentos de templates.
 */
const TemplateMappingListExample: React.FC = () => {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Exemplos de TemplateMappingList
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Demonstração das diferentes configurações e funcionalidades do componente 
          de listagem de mapeamentos entre formulários, modalidades e templates de e-mail.
        </p>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Básico</TabsTrigger>
          <TabsTrigger value="auto-refresh">Auto-refresh</TabsTrigger>
          <TabsTrigger value="custom-style">Estilo Customizado</TabsTrigger>
          <TabsTrigger value="integration">Integração</TabsTrigger>
        </TabsList>

        {/* Exemplo básico */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Uso Básico</CardTitle>
              <p className="text-sm text-gray-600">
                Configuração padrão do componente com todas as funcionalidades básicas.
              </p>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <pre className="text-sm">
{`import TemplateMappingList from '@/components/admin/email/TemplateMappingList';

function AdminPanel() {
  return (
    <div>
      <TemplateMappingList />
    </div>
  );
}`}
                </pre>
              </div>
              
              <div className="border rounded-lg">
                <TemplateMappingList />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exemplo com auto-refresh */}
        <TabsContent value="auto-refresh" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Com Auto-refresh</CardTitle>
              <p className="text-sm text-gray-600">
                Configuração com atualização automática a cada 10 segundos.
              </p>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <pre className="text-sm">
{`import TemplateMappingList from '@/components/admin/email/TemplateMappingList';

function DashboardPanel() {
  return (
    <div>
      <TemplateMappingList 
        autoRefresh={true}
        refreshInterval={10000}
      />
    </div>
  );
}`}
                </pre>
              </div>
              
              <div className="border rounded-lg">
                <TemplateMappingList 
                  autoRefresh={true}
                  refreshInterval={10000}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exemplo com estilo customizado */}
        <TabsContent value="custom-style" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estilo Customizado</CardTitle>
              <p className="text-sm text-gray-600">
                Componente com classes CSS personalizadas para integração com diferentes layouts.
              </p>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <pre className="text-sm">
{`import TemplateMappingList from '@/components/admin/email/TemplateMappingList';

function CustomStyledPanel() {
  return (
    <div className="bg-blue-50 p-6 rounded-xl">
      <TemplateMappingList 
        className="shadow-lg border-blue-200"
      />
    </div>
  );
}`}
                </pre>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-xl">
                <TemplateMappingList 
                  className="shadow-lg border-blue-200"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exemplo de integração */}
        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integração Completa</CardTitle>
              <p className="text-sm text-gray-600">
                Exemplo de integração em um painel administrativo completo.
              </p>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <pre className="text-sm">
{`import React, { useState } from 'react';
import TemplateMappingList from '@/components/admin/email/TemplateMappingList';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

function AdminEmailPanel() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleForceRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciamento de Templates</h2>
        <Button onClick={handleForceRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Forçar Atualização
        </Button>
      </div>
      
      <TemplateMappingList 
        key={refreshKey}
        autoRefresh={true}
        refreshInterval={30000}
        className="bg-white shadow-sm"
      />
    </div>
  );
}`}
                </pre>
              </div>
              
              <AdminEmailPanelExample />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Seção de funcionalidades */}
      <Card>
        <CardHeader>
          <CardTitle>Funcionalidades Principais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-green-700">✅ Visualização de Mapeamentos</h3>
              <p className="text-sm text-gray-600">
                Exibe todos os mapeamentos entre formulários, modalidades e templates em uma tabela organizada.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-700">🔍 Filtros Avançados</h3>
              <p className="text-sm text-gray-600">
                Filtros por formulário (Comply e-DOCS/Fiscal), modalidade (On-premise/SaaS) e status (Ativo/Inativo).
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-purple-700">📊 Estatísticas</h3>
              <p className="text-sm text-gray-600">
                Mostra estatísticas em tempo real: total de mapeamentos, ativos, inativos e distribuição por formulário.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-orange-700">🔄 Auto-refresh</h3>
              <p className="text-sm text-gray-600">
                Atualização automática configurável para manter os dados sempre atualizados.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-red-700">⚠️ Indicadores Visuais</h3>
              <p className="text-sm text-gray-600">
                Badges coloridos para status, ícones intuitivos e indicadores de templates não encontrados.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">🎨 Customizável</h3>
              <p className="text-sm text-gray-600">
                Classes CSS personalizáveis e configurações flexíveis para diferentes contextos de uso.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção de props */}
      <Card>
        <CardHeader>
          <CardTitle>Props do Componente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Prop</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Tipo</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Padrão</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Descrição</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-mono text-sm">className</td>
                  <td className="border border-gray-300 px-4 py-2">string</td>
                  <td className="border border-gray-300 px-4 py-2">''</td>
                  <td className="border border-gray-300 px-4 py-2">Classe CSS adicional para customização</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-mono text-sm">autoRefresh</td>
                  <td className="border border-gray-300 px-4 py-2">boolean</td>
                  <td className="border border-gray-300 px-4 py-2">false</td>
                  <td className="border border-gray-300 px-4 py-2">Se deve atualizar automaticamente</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-mono text-sm">refreshInterval</td>
                  <td className="border border-gray-300 px-4 py-2">number</td>
                  <td className="border border-gray-300 px-4 py-2">30000</td>
                  <td className="border border-gray-300 px-4 py-2">Intervalo de atualização em milissegundos</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente de exemplo para integração
const AdminEmailPanelExample: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleForceRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6 border rounded-lg p-6 bg-gray-50">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Gerenciamento de Templates</h2>
        <button 
          onClick={handleForceRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Forçar Atualização
        </button>
      </div>
      
      <TemplateMappingList 
        key={refreshKey}
        autoRefresh={true}
        refreshInterval={30000}
        className="bg-white shadow-sm"
      />
    </div>
  );
};

export default TemplateMappingListExample;