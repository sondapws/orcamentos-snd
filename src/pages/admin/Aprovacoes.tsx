import React from 'react';
import AdminLayout from '@/components/admin/LayoutAdmin';
import PainelAprovacao from '@/components/admin/approval/PainelAprovacao';

const Aprovacoes = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <PainelAprovacao />
      </div>
    </AdminLayout>
  );
};

export default Aprovacoes;