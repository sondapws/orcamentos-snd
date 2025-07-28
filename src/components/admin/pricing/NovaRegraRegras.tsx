import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAplicativos } from '@/hooks/useAplicativos';
import { useRegrasPrecificacao, RegraPrecificacao } from '@/hooks/useRegrasPrecificacao';
import { Stepper } from '@/components/ui/stepper';

interface NovaRegraProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const RegrasNovaRegra = ({ onSuccess, onCancel }: NovaRegraProps) => {
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [dados, setDados] = useState<Partial<RegraPrecificacao>>({
    ano: new Date().getFullYear(),
    lu_meses: 12,
    lu_ma_minima: 30,
    margem_venda: 38.65,
    calibracao_lu: 80
  });

  const { aplicativos } = useAplicativos();
  const { criarRegra, calcularCampos } = useRegrasPrecificacao();

  const etapas = [
    { numero: 1, titulo: 'Produto e Ano' },
    { numero: 2, titulo: 'Dados Básicos' },
    { numero: 3, titulo: 'Valores Operacionais' }
  ];

  const dadosCalculados = calcularCampos(dados);
  
  // Verificar se o produto selecionado é Comply e-Docs
  const produtoSelecionado = aplicativos.find(app => app.id === dados.aplicativo_id);
  const isComplyEDocs = produtoSelecionado?.nome?.toLowerCase().includes('comply e-docs') || 
                        produtoSelecionado?.nome?.toLowerCase().includes('comply e docs');

  // Função para formatar valores monetários
  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    const formattedValue = (parseInt(numericValue) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return formattedValue;
  };

  // Função para converter valor formatado para número
  const parseCurrency = (value: string) => {
    return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
  };

  const handleNext = () => {
    if (etapaAtual < 3) {
      setEtapaAtual(etapaAtual + 1);
    }
  };

  const handlePrevious = () => {
    if (etapaAtual > 1) {
      setEtapaAtual(etapaAtual - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!dados.aplicativo_id || !dados.ano) {
        throw new Error('Produto e ano são obrigatórios');
      }

      // Para Comply e-Docs, definir valores padrão para campos não utilizados
      const dadosParaEnvio = isComplyEDocs ? {
        ...dados,
        bloco_k_lu: 0,
        reinf_lu: 0,
        bloco_k_ma: 0,
        reinf_ma: 0
      } : dados;

      await criarRegra(dadosParaEnvio as Omit<RegraPrecificacao, 'id' | 'created_at' | 'updated_at'>);
      onSuccess();
    } catch (error) {
      console.error('Erro ao criar regra:', error);
    }
  };

  const canContinue = () => {
    switch (etapaAtual) {
      case 1:
        return dados.aplicativo_id && dados.ano;
      case 2:
        return dados.calibracao_lu && dados.lu_meses && dados.lu_ma_minima && dados.margem_venda;
      case 3:
        if (isComplyEDocs) {
          return dados.receita_mensal && dados.custo_mensal && dados.qtd_clientes;
        }
        return dados.receita_mensal && dados.custo_mensal && dados.qtd_clientes && 
               dados.bloco_k_lu && dados.reinf_lu && dados.bloco_k_ma && dados.reinf_ma;
      default:
        return false;
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nova Regra de Precificação</CardTitle>
        </CardHeader>
        <CardContent>
          <Stepper currentStep={etapaAtual} steps={etapas.map(e => e.titulo)} />
          
          <div className="mt-8">
            {etapaAtual === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Etapa 1: Produto e Ano</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ano</Label>
                    <Input
                      type="number"
                      value={dados.ano || ''}
                      onChange={(e) => setDados(prev => ({ ...prev, ano: parseInt(e.target.value) }))}
                      min={new Date().getFullYear()}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Produto</Label>
                    <Select value={dados.aplicativo_id} onValueChange={(value) => setDados(prev => ({ ...prev, aplicativo_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {aplicativos.map((app) => (
                          <SelectItem key={app.id} value={app.id}>
                            {app.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {etapaAtual === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Etapa 2: Dados Básicos</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Calibração LU</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Digite a porcentagem (%)"
                      value={dados.calibracao_lu || ''}
                      onChange={(e) => setDados(prev => ({ ...prev, calibracao_lu: parseFloat(e.target.value) }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>LU</Label>
                    <Input
                      type="number"
                      placeholder="Digite os meses"
                      value={dados.lu_meses || ''}
                      onChange={(e) => setDados(prev => ({ ...prev, lu_meses: parseInt(e.target.value) }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>LU x MA (mínima)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Digite a porcentagem (%)"
                      value={dados.lu_ma_minima || ''}
                      onChange={(e) => setDados(prev => ({ ...prev, lu_ma_minima: parseFloat(e.target.value) }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Margem de Venda</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Digite a porcentagem (%)"
                      value={dados.margem_venda || ''}
                      onChange={(e) => setDados(prev => ({ ...prev, margem_venda: parseFloat(e.target.value) }))}
                    />
                  </div>
                </div>

                {/* Campos Calculados */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-3">Campos Calculados</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium">Custo %:</span> {formatNumber(dadosCalculados.custo_percent || 0)}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {etapaAtual === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Etapa 3: Valores Operacionais</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Receita Mensal</Label>
                    <Input
                      type="text"
                      placeholder="R$ 0,00"
                      value={dados.receita_mensal ? formatCurrency(dados.receita_mensal.toString().replace(/\D/g, '').padStart(3, '0')) : ''}
                      onChange={(e) => {
                        const value = parseCurrency(e.target.value);
                        setDados(prev => ({ ...prev, receita_mensal: value }));
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Custo Mensal</Label>
                    <Input
                      type="text"
                      placeholder="R$ 0,00"
                      value={dados.custo_mensal ? formatCurrency(dados.custo_mensal.toString().replace(/\D/g, '').padStart(3, '0')) : ''}
                      onChange={(e) => {
                        const value = parseCurrency(e.target.value);
                        setDados(prev => ({ ...prev, custo_mensal: value }));
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Qtd Clientes</Label>
                    <Input
                      type="number"
                      placeholder="Digite a quantidade"
                      value={dados.qtd_clientes || ''}
                      onChange={(e) => setDados(prev => ({ ...prev, qtd_clientes: parseInt(e.target.value) }))}
                    />
                  </div>
                  
                  {!isComplyEDocs && (
                    <>
                      <div className="space-y-2">
                        <Label>Bloco K LU</Label>
                        <Input
                          type="text"
                          placeholder="R$ 0,00"
                          value={dados.bloco_k_lu ? formatCurrency(dados.bloco_k_lu.toString().replace(/\D/g, '').padStart(3, '0')) : ''}
                          onChange={(e) => {
                            const value = parseCurrency(e.target.value);
                            setDados(prev => ({ ...prev, bloco_k_lu: value }));
                          }}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>REINF LU</Label>
                        <Input
                          type="text"
                          placeholder="R$ 0,00"
                          value={dados.reinf_lu ? formatCurrency(dados.reinf_lu.toString().replace(/\D/g, '').padStart(3, '0')) : ''}
                          onChange={(e) => {
                            const value = parseCurrency(e.target.value);
                            setDados(prev => ({ ...prev, reinf_lu: value }));
                          }}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Bloco K MA</Label>
                        <Input
                          type="text"
                          placeholder="R$ 0,00 (será dividido por 12)"
                          value={dados.bloco_k_ma ? formatCurrency(dados.bloco_k_ma.toString().replace(/\D/g, '').padStart(3, '0')) : ''}
                          onChange={(e) => {
                            const value = parseCurrency(e.target.value);
                            setDados(prev => ({ ...prev, bloco_k_ma: value }));
                          }}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>REINF MA</Label>
                        <Input
                          type="text"
                          placeholder="R$ 0,00 (será dividido por 12)"
                          value={dados.reinf_ma ? formatCurrency(dados.reinf_ma.toString().replace(/\D/g, '').padStart(3, '0')) : ''}
                          onChange={(e) => {
                            const value = parseCurrency(e.target.value);
                            setDados(prev => ({ ...prev, reinf_ma: value }));
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Campos Calculados Finais */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-3">Resumo dos Cálculos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium">Receita x Custo:</span> {formatNumber(dadosCalculados.receita_custo_percent || 0)}%
                    </div>
                    <div>
                      <span className="font-medium">Custo Médio:</span> R$ {formatNumber(dadosCalculados.custo_medio || 0)}
                    </div>
                    <div>
                      <span className="font-medium">Custo Base:</span> R$ {formatNumber(dadosCalculados.custo_base || 0)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-8">
            <div>
              {etapaAtual > 1 && (
                <Button variant="outline" onClick={handlePrevious}>
                  Anterior
                </Button>
              )}
            </div>
            
            <div className="space-x-2">
              <Button variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              
              {etapaAtual < 3 ? (
                <Button onClick={handleNext} disabled={!canContinue()}>
                  Próximo
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!canContinue()}>
                  Criar Regra
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegrasNovaRegra;