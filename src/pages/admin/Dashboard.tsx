
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/LayoutAdmin';
import QuickStats from '@/components/admin/QuickStats';
import TestApprovalSystem from '@/components/admin/TestApprovalSystem';
import { Mail, Calculator, FileText, Users, Activity } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Bem-vindo ao painel administrativo</p>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Estatísticas Rápidas</h2>
          <QuickStats />
        </div>

        {/* Teste do Sistema de Aprovação */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Sistema de Aprovação</h2>
          <TestApprovalSystem />
        </div>



        {/* Atividade Recente */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Atividade Recente</h2>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Activity className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium">Últimas Ações</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-medium">Novo orçamento criado</p>
                    <p className="text-xs text-gray-500">Cliente: Empresa XYZ</p>
                  </div>
                  <span className="text-xs text-gray-400">5 min atrás</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-medium">Configuração de email atualizada</p>
                    <p className="text-xs text-gray-500">SMTP configurado</p>
                  </div>
                  <span className="text-xs text-gray-400">1 hora atrás</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">Backup realizado</p>
                    <p className="text-xs text-gray-500">Backup automático diário</p>
                  </div>
                  <span className="text-xs text-gray-400">2 horas atrás</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
