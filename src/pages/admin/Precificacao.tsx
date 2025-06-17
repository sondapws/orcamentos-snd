
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';
import PrecificacaoBase from '@/components/admin/pricing/PrecificacaoBase';

const Precificacao = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">Sistema de Precificação 2025</h1>
          <p className="text-gray-600">Configure os parâmetros de precificação do sistema</p>
        </div>

        <Tabs defaultValue="base" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="base">BASE - LU e MA</TabsTrigger>
            <TabsTrigger value="prefeitura">Prefeitura</TabsTrigger>
            <TabsTrigger value="saas">SaaS</TabsTrigger>
            <TabsTrigger value="suporte">Suporte</TabsTrigger>
            <TabsTrigger value="va">VA</TabsTrigger>
          </TabsList>

          <TabsContent value="base">
            <PrecificacaoBase />
          </TabsContent>

          <TabsContent value="prefeitura">
            <div className="text-center py-8">
              <p className="text-gray-500">Aba Prefeitura em desenvolvimento</p>
            </div>
          </TabsContent>

          <TabsContent value="saas">
            <div className="text-center py-8">
              <p className="text-gray-500">Aba SaaS em desenvolvimento</p>
            </div>
          </TabsContent>

          <TabsContent value="suporte">
            <div className="text-center py-8">
              <p className="text-gray-500">Aba Suporte em desenvolvimento</p>
            </div>
          </TabsContent>

          <TabsContent value="va">
            <div className="text-center py-8">
              <p className="text-gray-500">Aba VA em desenvolvimento</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Precificacao;
