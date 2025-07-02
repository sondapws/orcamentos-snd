import { useMemo } from 'react';

interface EmailTemplate {
  assunto: string;
  corpo: string;
}

export const useEmailTemplatePreview = (template: EmailTemplate) => {
  const sampleData = useMemo(() => ({
    razaoSocial: 'Empresa de Teste Ltda',
    responsavel: 'João da Silva',
    cnpj: '12.345.678/0001-90',
    segmento: 'Indústria',
    modalidade: 'SaaS',
    valor: 'R$ 5.000,00'
  }), []);

  const previewData = useMemo(() => {
    let assuntoComDados = template.assunto;
    let corpoComDados = template.corpo;

    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      assuntoComDados = assuntoComDados.replace(regex, value);
      corpoComDados = corpoComDados.replace(regex, value);
    });

    return { assuntoComDados, corpoComDados };
  }, [template, sampleData]);

  return {
    sampleData,
    previewData
  };
};