
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const logEmailAttempt = async (
  destinatario: string,
  assunto: string,
  status: 'enviado' | 'erro',
  erro?: string
) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  await supabaseClient
    .from('email_logs')
    .insert({
      destinatario,
      assunto,
      status,
      erro: erro || null,
      enviado_em: new Date().toISOString()
    })
}
