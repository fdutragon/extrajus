const { Resend } = require('resend');
require('dotenv').config();

const resendKey = process.env.RESEND_API_KEY;

if (!resendKey) {
  console.error("Missing RESEND_API_KEY in .env");
  process.exit(1);
}

const resend = new Resend(resendKey);

const userEmail = "felipedutra@outlook.com";
const userName = "Felipe Dutra";
const userCredits = 929;

async function sendWelcomeEmail() {
  console.log(`Sending welcome email to ${userEmail}...`);
  try {
    const { data, error } = await resend.emails.send({
      from: 'ExtraJus <boasvindas@extrajus.pro>',
      to: userEmail,
      subject: '⚡ Bem-vindo à ExtraJus: Seu Arsenal de Inteligência Jurídica',
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
              display: flex;
              align-items: center;
              gap: 8px;
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
            .ledger-card {
              background: linear-gradient(135deg, #12100e 0%, #0a0a0a 100%);
              border: 1px solid rgba(197, 168, 128, 0.2);
              border-radius: 16px;
              padding: 20px;
              text-align: center;
              margin-bottom: 35px;
            }
            .ledger-label {
              font-size: 9px;
              font-weight: 900;
              color: #c5a880;
              text-transform: uppercase;
              letter-spacing: 0.2em;
              margin-bottom: 5px;
            }
            .ledger-val {
              font-size: 32px;
              font-weight: 900;
              color: #ffffff;
              margin: 0;
              letter-spacing: -0.02em;
            }
            .ledger-desc {
              font-size: 11px;
              color: #666;
              margin-top: 5px;
              margin-bottom: 0;
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
            .footer a {
              color: #c5a880;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <!-- Brand Logo -->
              <div class="logo">
                EXTRA<span>JUS</span>
              </div>
              
              <div class="divider"></div>
              
              <!-- Header -->
              <h1>Olá, ${userName}.</h1>
              <div class="subheadline">Bem-vindo ao Futuro da Inteligência Contratual</div>
              
              <!-- Intro -->
              <p>
                Seu acesso à <strong>ExtraJus</strong> foi ativado com sucesso. Você acaba de se conectar à inteligência cirúrgica mais perigosa e eficiente do mercado corporativo para geração, revisão e assinatura eletrônica de contratos.
              </p>
              
              <!-- Ledger Status -->
              <div class="ledger-card">
                <div class="ledger-label">Ledger de Sinapses Ativo</div>
                <div class="ledger-val">${userCredits} Sinapses</div>
                <p class="ledger-desc">Créditos de inteligência prontos para forjar e auditar seus documentos.</p>
              </div>

              <!-- Arsenal Overview -->
              <div class="features">
                <div class="feature-item">
                  <div class="feature-title"><span>⚡</span> IA CIRÚRGICA</div>
                  <p class="feature-desc">Edite cláusulas e parágrafos de forma milimétrica. O editor inteligente reescreve o conteúdo sem alterar formatação ou recuos externos.</p>
                </div>
                <div class="feature-item">
                  <div class="feature-title"><span>🛡️</span> RADAR DE SAÚDE</div>
                  <p class="feature-desc">Audite seus documentos em tempo real. Identifique brechas de rescisão perigosas, multas incoerentes e termos ambíguos instantaneamente.</p>
                </div>
                <div class="feature-item">
                  <div class="feature-title"><span>📜</span> ASSINATURA DIGITAL</div>
                  <p class="feature-desc">Colete assinaturas válidas por lei direto do celular, com hash criptográfico SHA-256 e logs completos de IP e geolocalização.</p>
                </div>
              </div>
              
              <!-- Action Button -->
              <div class="btn-container">
                <a href="https://extrajus-v2.vercel.app/dashboard" class="btn">Entrar no Dashboard</a>
              </div>
              
              <!-- Footer -->
              <div class="footer">
                © 2026 ExtraJus S/A. Blindagem e Inteligência Corporativa.<br>
                Esta é uma mensagem de boas-vindas do sistema.
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error("Resend API returned error:", error);
      process.exit(1);
    }

    console.log("Email sent successfully! Response data:", data);
  } catch (err) {
    console.error("Error sending welcome email:", err);
    process.exit(1);
  }
}

sendWelcomeEmail();
