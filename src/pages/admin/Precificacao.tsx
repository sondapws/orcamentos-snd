
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';
import RegrasListagem from '@/components/admin/pricing/RegrasListagem';
import RegrasNovaRegra from '@/components/admin/pricing/RegrasNovaRegra';
import ConfigPrefeituras from '@/components/admin/pricing/ConfigPrefeituras';
import ConfigSaas from '@/components/admin/pricing/ConfigSaas';
import ConfigSuporte from '@/components/admin/pricing/ConfigSuporte';
import ConfigVA from '@/components/admin/pricing/ConfigVA';

const Precificacao = () => {
  const [modo, setModo] = useState<'listagem' | 'nova' | 'editar'>('listagem');
  const [regraAtual, setRegraAtual] = useState<string | undefined>();

  const handleNovaRegra = () => setModo('nova');
  const handleEditarRegra = (id: string) => {
    setRegraAtual(id);
    setModo('editar');
  };
  const handleVoltar = () => {
    setModo('listagem');
    setRegraAtual(undefined);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">Sistema de Precificação 2025</h1>
          <p className="text-gray-600">Configure os parâmetros de precificação do sistema</p>
        </div>

        {modo === 'listagem' && (
          <RegrasListagem onNovaRegra={handleNovaRegra} onEditarRegra={handleEditarRegra} />
        )}

        {modo === 'nova' && (
          <RegrasNovaRegra onSuccess={handleVoltar} onCancel={handleVoltar} />
        )}

        {modo === 'editar' && regraAtual && (
          <Tabs defaultValue="prefeitura" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="prefeitura">Prefeitura</TabsTrigger>
              <TabsTrigger value="saas">SaaS</TabsTrigger>
              <TabsTrigger value="suporte">Suporte</TabsTrigger>
              <TabsTrigger value="va">VA</TabsTrigger>
            </TabsList>

            <TabsContent value="prefeitura">
              <ConfigPrefeituras regraId={regraAtual} />
            </TabsContent>

            <TabsContent value="saas">
              <ConfigSaas regraId={regraAtual} />
            </TabsContent>

            <TabsContent value="suporte">
              <ConfigSuporte regraId={regraAtual} />
            </TabsContent>

            <TabsContent value="va">
              <ConfigVA regraId={regraAtual} />
            </TabsContent>

            <div className="mt-4">
              <button onClick={handleVoltar} className="text-blue-600 hover:underline">
                ← Voltar para listagem
              </button>
            </div>
          </Tabs>
        )}
      </div>
    </AdminLayout>
  );
};

export default Precificacao;
