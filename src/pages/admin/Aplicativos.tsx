
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AplicativosList from '@/components/admin/aplicativos/AplicativosList';

const Aplicativos = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Aplicativos</h1>
          <p className="text-gray-600">Cadastre e gerencie os aplicativos/produtos disponíveis</p>
        </div>

        <AplicativosList />
      </div>
    </AdminLayout>
  );
};

export default Aplicativos;
