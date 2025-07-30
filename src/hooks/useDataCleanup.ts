import { useEffect } from 'react';
import { cleanupOldData } from '@/scripts/applyMigration';

export const useDataCleanup = () => {
  useEffect(() => {
    // Executar limpeza ao carregar a aplicação
    const performCleanup = async () => {
      try {
        await cleanupOldData();
      } catch (error) {
        console.error('Erro na limpeza automática:', error);
      }
    };

    // Executar limpeza imediatamente
    performCleanup();

    // Configurar limpeza automática a cada 24 horas
    const cleanupInterval = setInterval(performCleanup, 24 * 60 * 60 * 1000);

    return () => {
      clearInterval(cleanupInterval);
    };
  }, []);

  return {
    performManualCleanup: cleanupOldData
  };
};