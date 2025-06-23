
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts"

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { to, subject, html, attachments } = await req.json()

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Campos obrigatórios: to, subject, html' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Buscando configurações SMTP...')

    // Buscar configurações SMTP do banco
    const { data: emailConfig, error: configError } = await supabaseClient
      .from('email_config')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)

    if (configError) {
      console.error('Erro ao buscar configurações SMTP:', configError)
      
      await supabaseClient
        .from('email_logs')
        .insert({
          destinatario: to,
          assunto: subject,
          status: 'erro',
          erro: `Erro ao buscar configurações: ${configError.message}`,
          enviado_em: new Date().toISOString()
        })

      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Erro ao buscar configurações SMTP: ${configError.message}` 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!emailConfig || emailConfig.length === 0) {
      console.error('Nenhuma configuração SMTP encontrada')
      
      await supabaseClient
        .from('email_logs')
        .insert({
          destinatario: to,
          assunto: subject,
          status: 'erro',
          erro: 'Configurações SMTP não encontradas',
          enviado_em: new Date().toISOString()
        })

      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Configurações SMTP não encontradas. Configure o SMTP nas configurações do sistema.' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const config = Array.isArray(emailConfig) ? emailConfig[0] : emailConfig

    // Validar configurações SMTP
    if (!config.servidor || !config.usuario || !config.senha) {
      console.error('Configurações SMTP incompletas:', {
        servidor: !!config.servidor,
        usuario: !!config.usuario,
        senha: !!config.senha
      })
      
      await supabaseClient
        .from('email_logs')
        .insert({
          destinatario: to,
          assunto: subject,
          status: 'erro',
          erro: 'Configurações SMTP incompletas',
          enviado_em: new Date().toISOString()
        })

      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Configurações SMTP incompletas. Verifique servidor, usuário e senha.' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Configurações SMTP encontradas:', {
      servidor: config.servidor,
      porta: config.porta,
      usuario: config.usuario,
      ssl: config.ssl
    })

    try {
      // Criar cliente SMTP real
      const client = new SMTPClient({
        connection: {
          hostname: config.servidor,
          port: config.porta,
          tls: config.ssl,
          auth: {
            username: config.usuario,
            password: config.senha,
          },
        },
      })

      console.log('Conectando ao servidor SMTP...')

      // Enviar e-mail real
      await client.send({
        from: config.usuario,
        to: to,
        subject: subject,
        content: html,
        html: html,
      })

      await client.close()

      console.log('E-mail enviado com sucesso via SMTP')

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
        JSON.stringify({ 
          success: true, 
          message: 'E-mail enviado com sucesso via SMTP' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (smtpError) {
      console.error('Erro no envio SMTP:', smtpError)
      
      // Tratar diferentes tipos de erro SMTP
      let errorMessage = 'Erro desconhecido no envio SMTP'
      
      if (smtpError.message.includes('authentication')) {
        errorMessage = 'Erro de autenticação SMTP. Verifique usuário e senha.'
      } else if (smtpError.message.includes('connection')) {
        errorMessage = 'Erro de conexão SMTP. Verifique servidor e porta.'
      } else if (smtpError.message.includes('timeout')) {
        errorMessage = 'Timeout na conexão SMTP. Tente novamente.'
      } else if (smtpError.message.includes('recipient')) {
        errorMessage = 'Endereço de destinatário inválido.'
      } else {
        errorMessage = `Erro SMTP: ${smtpError.message}`
      }
      
      await supabaseClient
        .from('email_logs')
        .insert({
          destinatario: to,
          assunto: subject,
          status: 'erro',
          erro: errorMessage,
          enviado_em: new Date().toISOString()
        })

      return new Response(
        JSON.stringify({ 
          success: false,
          error: errorMessage
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Erro geral na Edge Function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: `Erro interno: ${error.message}` 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
