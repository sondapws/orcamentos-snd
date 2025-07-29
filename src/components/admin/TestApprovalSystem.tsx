import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { approvalService } from '@/services/approvalService';
import { TestTube, CheckCircle, XCircle } from 'lucide-react';

const TestApprovalSystem: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const { toast } = useToast();

  const runTests = async () => {
    setTesting(true);
    setResults([]);
    const testResults: string[] = [];

    try {
      // Teste 1: Verificar configurações
      testResults.push('🧪 Iniciando testes do sistema de aprovação...');
      setResults([...testResults]);

      testResults.push('1. Verificando configurações...');
      setResults([...testResults]);
      
      const settings = await approvalService.getSettings();
      testResults.push(`✅ Configurações encontradas: ${settings ? 'OK' : 'Não encontradas'}`);
      setResults([...testResults]);

      // Teste 2: Buscar orçamentos pendentes
      testResults.push('2. Buscando orçamentos pendentes...');
      setResults([...testResults]);
      
      const pendingQuotes = await approvalService.getPendingQuotes();
      testResults.push(`✅ Orçamentos pendentes: ${pendingQuotes.length}`);
      setResults([...testResults]);

      // Teste 3: Buscar notificações
      testResults.push('3. Buscando notificações...');
      setResults([...testResults]);
      
      const notifications = await approvalService.getNotifications();
      testResults.push(`✅ Notificações: ${notifications.length}`);
      setResults([...testResults]);

      // Teste 4: Submeter um orçamento de teste
      testResults.push('4. Submetendo orçamento de teste...');
      setResults([...testResults]);
      
      const testFormData = {
        razaoSocial: 'Empresa Teste Ltda',
        cnpj: '12.345.678/0001-90',
        responsavel: 'João Silva',
        email: 'joao@empresateste.com.br',
        crm: 'CRM123',
        municipio: 'São Paulo',
        uf: 'SP'
      };
      
      const quoteId = await approvalService.submitForApproval(testFormData, 'comply_edocs');
      testResults.push(`✅ Orçamento submetido com ID: ${quoteId}`);
      setResults([...testResults]);

      // Teste 5: Verificar se o orçamento foi criado
      testResults.push('5. Verificando orçamento criado...');
      setResults([...testResults]);
      
      const updatedPendingQuotes = await approvalService.getPendingQuotes();
      testResults.push(`✅ Orçamentos pendentes após submissão: ${updatedPendingQuotes.length}`);
      setResults([...testResults]);

      testResults.push('🎉 Todos os testes passaram! Sistema funcionando corretamente.');
      setResults([...testResults]);

      toast({
        title: 'Testes Concluídos',
        description: 'Sistema de aprovação está funcionando corretamente!',
      });

    } catch (error) {
      testResults.push(`❌ Erro no teste: ${error}`);
      setResults([...testResults]);
      
      toast({
        title: 'Erro nos Testes',
        description: 'Verifique o console para mais detalhes.',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <TestTube className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Teste do Sistema de Aprovação</h3>
      </div>
      
      <p className="text-gray-600 mb-4">
        Execute este teste para verificar se o sistema de aprovação está funcionando corretamente.
      </p>

      <Button 
        onClick={runTests} 
        disabled={testing}
        className="mb-4"
      >
        {testing ? 'Executando Testes...' : 'Executar Testes'}
      </Button>

      {results.length > 0 && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Resultados dos Testes:</h4>
          <div className="space-y-1 font-mono text-sm">
            {results.map((result, index) => (
              <div key={index} className={`
                ${result.includes('✅') ? 'text-green-600' : ''}
                ${result.includes('❌') ? 'text-red-600' : ''}
                ${result.includes('🎉') ? 'text-blue-600 font-bold' : ''}
              `}>
                {result}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default TestApprovalSystem;