import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FormularioNovoTemplateProps {
  onSuccess: () => void;
}

const FormularioNovoTemplateSimples: React.FC<FormularioNovoTemplateProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    assunto: 'Seu Orçamento - {{razaoSocial}}',
    corpo: 'Template básico'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Formulário submetido:', formData);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Novo Template (Versão Simples)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Template</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Ex: Template Comply e-DOCS SaaS"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="assunto">Assunto</Label>
            <Input
              id="assunto"
              value={formData.assunto}
              onChange={(e) => setFormData(prev => ({ ...prev, assunto: e.target.value }))}
              placeholder="Assunto do e-mail"
              required
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Criando...' : 'Criar Template'}
        </Button>
      </div>
    </form>
  );
};

export default FormularioNovoTemplateSimples;