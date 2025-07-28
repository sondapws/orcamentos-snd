
import React, { useState } from 'react';
import AdminLayout from '@/components/admin/LayoutAdmin';
import DadosProdutoTable from '@/components/admin/produtos/TabelaDadosProduto';
import DadosProdutoForm from '@/components/admin/produtos/FormularioDadosProduto';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const DadosProdutos = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dados Principais de Produtos</h1>
            <p className="text-gray-600">Gerencie os dados de precificação por ano de cada produto</p>
          </div>
          
          {showForm && (
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar à Lista
            </Button>
          )}
        </div>

        {showForm ? (
          <DadosProdutoForm
            onSave={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <DadosProdutoTable />
        )}
      </div>
    </AdminLayout>
  );
};

export default DadosProdutos;
