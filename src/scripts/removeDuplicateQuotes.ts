import { supabase } from '@/integrations/supabase/client';

interface DuplicateQuote {
  id1: string;
  id2: string;
  cnpj: string;
  product_type: string;
  data1: string;
  data2: string;
  diferenca_minutos: number;
}

// Função para detectar orçamentos duplicados
export async function detectDuplicateQuotes(): Promise<DuplicateQuote[]> {
  try {
    console.log('Detectando orçamentos duplicados...');

    const { data, error } = await supabase.rpc('detect_duplicate_quotes', {
      time_window_hours: 1 // Janela de 1 hora para considerar duplicação
    });

    if (error) {
      // Se a função RPC não existir, usar query manual
      const { data: manualData, error: manualError } = await supabase
        .from('pending_quotes')
        .select(`
          id,
          form_data,
          product_type,
          submitted_at,
          status
        `)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false });

      if (manualError) throw manualError;

      // Detectar duplicatas manualmente
      const duplicates: DuplicateQuote[] = [];
      const processed = new Set<string>();

      for (let i = 0; i < (manualData || []).length; i++) {
        const quote1 = manualData![i];
        if (processed.has(quote1.id)) continue;

        for (let j = i + 1; j < manualData!.length; j++) {
          const quote2 = manualData![j];
          if (processed.has(quote2.id)) continue;

          const cnpj1 = (quote1.form_data as any)?.cnpj;
          const cnpj2 = (quote2.form_data as any)?.cnpj;

          if (cnpj1 === cnpj2 && quote1.product_type === quote2.product_type) {
            const time1 = new Date(quote1.submitted_at).getTime();
            const time2 = new Date(quote2.submitted_at).getTime();
            const diffMinutes = Math.abs(time1 - time2) / (1000 * 60);

            if (diffMinutes < 60) { // Menos de 1 hora de diferença
              duplicates.push({
                id1: quote1.id,
                id2: quote2.id,
                cnpj: cnpj1,
                product_type: quote1.product_type,
                data1: quote1.submitted_at,
                data2: quote2.submitted_at,
                diferenca_minutos: diffMinutes
              });
              processed.add(quote2.id); // Marcar o mais recente para remoção
            }
          }
        }
      }

      return duplicates;
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao detectar duplicatas:', error);
    return [];
  }
}

// Função para remover orçamentos duplicados
export async function removeDuplicateQuotes(dryRun: boolean = true): Promise<{
  detected: number;
  removed: number;
  errors: string[];
}> {
  try {
    console.log(`${dryRun ? 'Simulando' : 'Executando'} remoção de duplicatas...`);

    const duplicates = await detectDuplicateQuotes();
    const errors: string[] = [];
    let removed = 0;

    if (duplicates.length === 0) {
      console.log('Nenhuma duplicata encontrada.');
      return { detected: 0, removed: 0, errors: [] };
    }

    console.log(`Encontradas ${duplicates.length} duplicatas:`);
    duplicates.forEach(dup => {
      console.log(`- CNPJ: ${dup.cnpj}, Produto: ${dup.product_type}, Diferença: ${dup.diferenca_minutos.toFixed(1)} min`);
      console.log(`  ID1: ${dup.id1} (${dup.data1})`);
      console.log(`  ID2: ${dup.id2} (${dup.data2}) <- ${dryRun ? 'SERIA REMOVIDO' : 'REMOVENDO'}`);
    });

    if (!dryRun) {
      // Remover as duplicatas (sempre manter o mais antigo)
      for (const duplicate of duplicates) {
        try {
          // Determinar qual é o mais recente para remover
          const date1 = new Date(duplicate.data1).getTime();
          const date2 = new Date(duplicate.data2).getTime();
          const idToRemove = date1 > date2 ? duplicate.id1 : duplicate.id2;

          const { error } = await supabase
            .from('pending_quotes')
            .delete()
            .eq('id', idToRemove);

          if (error) {
            errors.push(`Erro ao remover ${idToRemove}: ${error.message}`);
          } else {
            removed++;
            console.log(`Removido: ${idToRemove}`);
          }
        } catch (error) {
          errors.push(`Erro ao processar duplicata: ${error}`);
        }
      }
    }

    return {
      detected: duplicates.length,
      removed,
      errors
    };
  } catch (error) {
    console.error('Erro ao remover duplicatas:', error);
    return {
      detected: 0,
      removed: 0,
      errors: [`Erro geral: ${error}`]
    };
  }
}

// Função para executar limpeza completa
export async function cleanupDuplicates() {
  console.log('=== LIMPEZA DE DUPLICATAS ===');
  
  // Primeiro, simular para ver o que seria removido
  console.log('\n1. Simulação (dry run):');
  const dryRunResult = await removeDuplicateQuotes(true);
  
  if (dryRunResult.detected === 0) {
    console.log('✅ Nenhuma duplicata encontrada!');
    return;
  }

  console.log(`\n📊 Resumo da simulação:`);
  console.log(`- Duplicatas detectadas: ${dryRunResult.detected}`);
  console.log(`- Seriam removidas: ${dryRunResult.detected}`);

  // Perguntar confirmação (em ambiente de desenvolvimento)
  if (typeof window !== 'undefined' && window.confirm) {
    const confirmed = window.confirm(
      `Foram encontradas ${dryRunResult.detected} duplicatas.\n\nDeseja remover as duplicatas? Esta ação não pode ser desfeita.`
    );

    if (confirmed) {
      console.log('\n2. Executando remoção:');
      const result = await removeDuplicateQuotes(false);
      
      console.log(`\n📊 Resultado final:`);
      console.log(`- Duplicatas detectadas: ${result.detected}`);
      console.log(`- Removidas com sucesso: ${result.removed}`);
      console.log(`- Erros: ${result.errors.length}`);
      
      if (result.errors.length > 0) {
        console.error('Erros encontrados:');
        result.errors.forEach(error => console.error(`- ${error}`));
      }
    } else {
      console.log('❌ Operação cancelada pelo usuário.');
    }
  } else {
    console.log('\n⚠️  Para executar a remoção, chame: removeDuplicateQuotes(false)');
  }
}

// Executar se chamado diretamente
if (typeof window !== 'undefined') {
  // Disponibilizar funções globalmente para debug
  (window as any).detectDuplicateQuotes = detectDuplicateQuotes;
  (window as any).removeDuplicateQuotes = removeDuplicateQuotes;
  (window as any).cleanupDuplicates = cleanupDuplicates;
}