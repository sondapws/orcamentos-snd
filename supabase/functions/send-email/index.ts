
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { handleCors, corsHeaders } from './cors.ts'
import { validateEmailRequest } from './validator.ts'
import { fetchEmailConfig } from './email-config.ts'
import { sendEmailViaSMTP } from './smtp-client.ts'
import { logEmailAttempt } from './logger.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const body = await req.json()
    
    // Validate request
    const validation = validateEmailRequest(body)
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: validation.error 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const emailData = validation.data!

    // Fetch email configuration
    const { config, error: configError } = await fetchEmailConfig()
    if (!config) {
      await logEmailAttempt(emailData.to, emailData.subject, 'erro', configError)
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: configError 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send email via SMTP
    const result = await sendEmailViaSMTP(config, emailData)
    
    if (result.success) {
      await logEmailAttempt(emailData.to, emailData.subject, 'enviado')
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'E-mail enviado com sucesso via SMTP' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      await logEmailAttempt(emailData.to, emailData.subject, 'erro', result.error)
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: result.error
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
