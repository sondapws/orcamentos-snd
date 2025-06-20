
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { to, subject, html, attachments } = await req.json()

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: 'Campos obrigatórios: to, subject, html' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar configurações SMTP do banco
    const { data: emailConfig, error: configError } = await supabaseClient
      .from('email_config')
      .select('*')
      .limit(1)
      .single()

    if (configError || !emailConfig) {
      console.error('Erro ao buscar configurações SMTP:', configError)
      return new Response(
        JSON.stringify({ error: 'Configurações SMTP não encontradas' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Enviar email usando fetch para serviço SMTP
    const emailData = {
      from: emailConfig.usuario,
      to: to,
      subject: subject,
      html: html,
      attachments: attachments || []
    }

    // Usar serviço SMTP através de API
    const smtpResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: 'service_smtp',
        template_id: 'template_email',
        user_id: Deno.env.get('EMAILJS_USER_ID'),
        template_params: {
          from_email: emailConfig.usuario,
          to_email: to,
          subject: subject,
          html_content: html,
        }
      })
    })

    if (!smtpResponse.ok) {
      throw new Error(`Erro no envio: ${smtpResponse.statusText}`)
    }

    // Log do envio bem-sucedido
    await supabaseClient
      .from('email_logs')
      .insert({
        destinatario: to,
        assunto: subject,
        status: 'enviado',
        enviado_em: new Date().toISOString()
      })

    return new Response(
      JSON.stringify({ success: true, message: 'Email enviado com sucesso' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro ao enviar email:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
