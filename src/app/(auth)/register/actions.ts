'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Initialize the admin client to bypass the native Supabase confirmation email rate limit
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 1. Create the user as confirmed from the start via the Admin client
  // This completely prevents Supabase from trying to send a confirmation email natively.
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })

  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`)
  }

  // 2. Set initial credits and authenticate the user
  const user = data.user
  if (user) {
    try {
      // Force initial credits to exactly 300 using the service role admin client (bypasses RLS)
      await supabaseAdmin
        .from('profiles')
        .update({ credits: 300 })
        .eq('id', user.id)
      
      // 3. Authenticate immediately to set cookies and create active session
      await supabase.auth.signInWithPassword({
        email,
        password
      })

      // 4. Send welcome email asynchronously via Resend (non-blocking)
      const resendKey = process.env.RESEND_API_KEY
      if (resendKey) {
        const { Resend } = await import('resend')
        const resendInstance = new Resend(resendKey)
        resendInstance.emails.send({
          from: 'ExtraJus <boasvindas@extrajus.pro>',
          to: email,
          subject: '⚡ Bem-vindo à ExtraJus: Sua Plataforma de Inteligência Jurídica',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Bem-vindo à ExtraJus</title>
              <style>
                body {
                  background-color: #050505;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                  margin: 0;
                  padding: 0;
                  -webkit-font-smoothing: antialiased;
                }
                .wrapper {
                  width: 100%;
                  background-color: #050505;
                  padding: 40px 20px;
                  box-sizing: border-box;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #0b0b0b;
                  border: 1px solid #1f1d1a;
                  border-radius: 24px;
                  padding: 40px;
                  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
                }
                .logo {
                  font-size: 26px;
                  font-weight: 900;
                  color: #ffffff;
                  letter-spacing: 0.15em;
                  text-transform: uppercase;
                  text-align: center;
                  margin-bottom: 30px;
                }
                .logo span {
                  color: #c5a880;
                }
                .divider {
                  height: 1px;
                  background: linear-gradient(90deg, transparent, #c5a880 50%, transparent);
                  margin-bottom: 30px;
                  opacity: 0.3;
                }
                h1 {
                  color: #ffffff;
                  font-size: 24px;
                  font-weight: 900;
                  text-align: center;
                  margin-top: 0;
                  margin-bottom: 8px;
                  letter-spacing: -0.02em;
                }
                .subheadline {
                  color: #c5a880;
                  font-size: 11px;
                  font-weight: 900;
                  text-transform: uppercase;
                  letter-spacing: 0.15em;
                  text-align: center;
                  margin-bottom: 30px;
                }
                p {
                  color: #a3a3a3;
                  font-size: 14px;
                  line-height: 1.6;
                  margin-top: 0;
                  margin-bottom: 25px;
                }
                .features {
                  background-color: #070707;
                  border: 1px solid #151412;
                  border-radius: 16px;
                  padding: 25px;
                  margin-bottom: 30px;
                }
                .feature-item {
                  margin-bottom: 20px;
                }
                .feature-item:last-child {
                  margin-bottom: 0;
                }
                .feature-title {
                  color: #ffffff;
                  font-size: 13px;
                  font-weight: 800;
                  margin-bottom: 4px;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                }
                .feature-title span {
                  color: #c5a880;
                }
                .feature-desc {
                  color: #8a8a8a;
                  font-size: 12.5px;
                  line-height: 1.5;
                  margin: 0;
                }
                .btn-container {
                  text-align: center;
                  margin-bottom: 35px;
                }
                .btn {
                  display: inline-block;
                  background-color: #c5a880;
                  color: #050505 !important;
                  text-decoration: none;
                  font-size: 11px;
                  font-weight: 900;
                  text-transform: uppercase;
                  letter-spacing: 0.15em;
                  padding: 16px 40px;
                  border-radius: 12px;
                  box-shadow: 0 10px 25px rgba(197, 168, 128, 0.25);
                  transition: all 0.3s ease;
                }
                .footer {
                  font-size: 10px;
                  color: #525252;
                  line-height: 1.5;
                  border-top: 1px solid #1f1d1a;
                  padding-top: 25px;
                  text-align: center;
                }
              </style>
            </head>
            <body>
              <div class="wrapper">
                <div class="container">
                  <div class="logo">
                    EXTRA<span>JUS</span>
                  </div>
                  <div class="divider"></div>
                  <h1>Bem-vindo à ExtraJus.</h1>
                  <div class="subheadline">Sua Plataforma de Inteligência Jurídica</div>
                  <p>
                    Seu acesso à <strong>ExtraJus</strong> foi ativado com sucesso. Você acaba de se conectar à inteligência cirúrgica mais eficiente do mercado corporativo para geração, revisão e assinatura eletrônica de contratos.
                  </p>
                  
                  <p style="text-align: center; font-weight: bold; color: #c5a880; font-size: 13px;">
                    ⚡ Sua conta foi ativada com 300 créditos de boas-vindas para você iniciar as suas análises imediatamente.
                  </p>

                  <div class="features">
                    <div class="feature-item">
                      <div class="feature-title"><span style="color: #c5a880;">⚡</span> IA CIRÚRGICA</div>
                      <p class="feature-desc">Edite cláusulas e parágrafos de forma milimétrica. O editor inteligente reescreve o conteúdo sem alterar formatação ou recuos externos.</p>
                    </div>
                    <div class="feature-item">
                      <div class="feature-title"><span style="color: #c5a880;">🛡️</span> RADAR DE CONFORMIDADE</div>
                      <p class="feature-desc">Analise seus documentos em tempo real. Identifique brechas de rescisão perigosas, multas incoerentes e termos ambíguos instantaneamente.</p>
                    </div>
                    <div class="feature-item">
                      <div class="feature-title"><span style="color: #c5a880;">📜</span> ASSINATURA DIGITAL</div>
                      <p class="feature-desc">Colete assinaturas válidas por lei direto do celular, com hash criptográfico SHA-256 e logs completos de IP e geolocalização.</p>
                    </div>
                  </div>
                  <div class="btn-container">
                    <a href="https://extrajus-v2.vercel.app/dashboard" class="btn">Entrar no Dashboard</a>
                  </div>
                  <div class="footer">
                    © 2026 ExtraJus S/A. Blindagem e Inteligência Corporativa.<br>
                    Esta é uma mensagem automática de boas-vindas do sistema.
                  </div>
                </div>
              </div>
            </body>
            </html>
          `
        }).catch(err => console.error("Failed to send welcome email via Resend:", err))
      }
    } catch (adminError) {
      console.error('Failed to auto-confirm user:', adminError)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}