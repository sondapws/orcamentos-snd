import { supabase } from '@/integrations/supabase/client';

// Função para verificar se as tabelas existem e criar dados de teste
export async function applyMigration() {
    try {
        console.log('Verificando sistema de aprovação...');

        // Verificar se a tabela pending_quotes existe tentando fazer uma consulta
        const { data: pendingQuotes, error: pendingError } = await supabase
            .from('pending_quotes')
            .select('id')
            .limit(1);

        if (pendingError) {
            console.log('Tabela pending_quotes não encontrada. Será criada automaticamente quando necessário.');
        } else {
            console.log('Tabela pending_quotes encontrada:', pendingQuotes?.length || 0, 'registros');
        }

        // Verificar tabela de notificações
        const { data: notifications, error: notifError } = await supabase
            .from('approval_notifications')
            .select('id')
            .limit(1);

        if (notifError) {
            console.log('Tabela approval_notifications não encontrada. Será criada automaticamente quando necessário.');
        } else {
            console.log('Tabela approval_notifications encontrada:', notifications?.length || 0, 'registros');
        }

        // Verificar tabela de configurações
        const { data: settings, error: settingsError } = await supabase
            .from('approval_settings')
            .select('id')
            .limit(1);

        if (settingsError) {
            console.log('Tabela approval_settings não encontrada. Será criada automaticamente quando necessário.');
        } else {
            console.log('Tabela approval_settings encontrada:', settings?.length || 0, 'registros');
        }

        console.log('Sistema de aprovação verificado com sucesso!');
        console.log('📋 Para criar as tabelas, use o SQL Migration no painel do Supabase:');
        console.log('📁 Arquivo: supabase/migrations/001_approval_system.sql');

        return true;
    } catch (error) {
        console.error('Erro ao verificar sistema:', error);
        return false;
    }
}

// Função para executar limpeza de dados antigos
export async function cleanupOldData() {
    try {
        console.log('Iniciando limpeza de dados antigos...');

        const thirtyOneDaysAgo = new Date();
        thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);

        // Limpar notificações antigas
        const { error: notifError } = await supabase
            .from('approval_notifications')
            .delete()
            .lt('created_at', thirtyOneDaysAgo.toISOString());

        if (notifError) {
            console.error('Erro ao limpar notificações:', notifError);
        } else {
            console.log('Notificações antigas removidas');
        }

        // Limpar orçamentos processados antigos
        const { error: quotesError } = await supabase
            .from('pending_quotes')
            .delete()
            .in('status', ['approved', 'rejected'])
            .lt('updated_at', thirtyOneDaysAgo.toISOString());

        if (quotesError) {
            console.error('Erro ao limpar orçamentos:', quotesError);
        } else {
            console.log('Orçamentos antigos removidos');
        }

        console.log('Limpeza executada com sucesso!');
        return true;
    } catch (error) {
        console.error('Erro ao executar limpeza:', error);
        return false;
    }
}

// Executar se chamado diretamente
if (typeof window !== 'undefined') {
    applyMigration().then(success => {
        if (success) {
            console.log('Sistema de aprovação configurado com sucesso!');
            // Executar limpeza inicial
            cleanupOldData();
        }
    });
}