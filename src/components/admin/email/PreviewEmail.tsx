import React from 'react';
import { Label } from '@/components/ui/label';
import { useEmailTemplatePreview } from '@/hooks/useEmailTemplatePreview';

interface EmailPreviewProps {
  template: {
    assunto: string;
    corpo: string;
  };
}

const EmailPreview: React.FC<EmailPreviewProps> = ({ template }) => {
  const { sampleData, previewData } = useEmailTemplatePreview(template);

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <Label className="text-sm font-medium text-gray-600">Assunto:</Label>
        <p className="font-semibold mt-1">{previewData.assuntoComDados}</p>
      </div>
      
      <div className="border rounded-lg p-4 bg-white min-h-[400px]">
        <Label className="text-sm font-medium text-gray-600 mb-3 block">Preview do E-mail:</Label>
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: previewData.corpoComDados 
          }} 
        />
      </div>
      
      <div className="bg-blue-50 p-3 rounded-lg text-sm">
        <strong>Dados de exemplo utilizados no preview:</strong>
        <ul className="mt-2 space-y-1">
          {Object.entries(sampleData).map(([key, value]) => (
            <li key={key}>• {key}: {value}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EmailPreview;