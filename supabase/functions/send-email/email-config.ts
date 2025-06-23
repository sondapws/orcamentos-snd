
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { EmailConfig } from './types.ts'

export const fetchEmailConfig = async (): Promise<{ config: EmailConfig | null; error: string | null }> => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  console.log('Buscando configurações SMTP...')

  const { data: emailConfig, error: configError } = await supabaseClient
    .from('email_config')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)

  if (configError) {
    console.error('Erro ao buscar configurações SMTP:', configError)
    return { config: null, error: `Erro ao buscar configurações SMTP: ${configError.message}` }
  }

  if (!emailConfig || emailConfig.length === 0) {
    console.error('Nenhuma configuração SMTP encontrada')
    return { config: null, error: 'Configurações SMTP não encontradas. Configure o SMTP nas configurações do sistema.' }
  }

  const config = Array.isArray(emailConfig) ? emailConfig[0] : emailConfig

  if (!config.servidor || !config.usuario || !config.senha) {
    console.error('Configurações SMTP incompletas:', {
      servidor: !!config.servidor,
      usuario: !!config.usuario,
      senha: !!config.senha
    })
    return { config: null, error: 'Configurações SMTP incompletas. Verifique servidor, usuário e senha.' }
  }

  console.log('Configurações SMTP encontradas:', {
    servidor: config.servidor,
    porta: config.porta,
    usuario: config.usuario,
    ssl: config.ssl
  })

  return { config, error: null }
}
