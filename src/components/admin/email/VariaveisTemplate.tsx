import React from 'react';

const TemplateVariables = () => {
  const variables = [
    '{{razaoSocial}}',
    '{{responsavel}}',
    '{{cnpj}}',
    '{{segmento}}',
    '{{modalidade}}',
    '{{valor}}'
  ];

  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <h4 className="font-semibold mb-2">Variáveis Disponíveis:</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
        {variables.map((variable) => (
          <span key={variable} className="bg-white px-2 py-1 rounded">
            {variable}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TemplateVariables;