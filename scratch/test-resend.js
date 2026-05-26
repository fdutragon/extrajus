const { Resend } = require("resend");
const dotenv = require("dotenv");
const path = require("path");

// Carregar variáveis do .env
dotenv.config({ path: path.join(__dirname, "../.env") });

const resendKey = process.env.RESEND_API_KEY;
console.log("Resend API Key carregada:", resendKey ? `${resendKey.substring(0, 10)}...` : "Não configurada");

if (!resendKey) {
  console.error("ERRO: RESEND_API_KEY não encontrada no arquivo .env");
  process.exit(1);
}

const resend = new Resend(resendKey);

async function testSend() {
  try {
    console.log("Tentando enviar e-mail de teste com remetente de onboarding para felipe.dutragon@gmail.com...");
    const data = await resend.emails.send({
      from: "ExtraJus AI <onboarding@resend.dev>",
      to: "felipe.dutragon@gmail.com",
      subject: "⚔️ Teste de Envio da API do Resend - ExtraJus",
      html: "<h1>Olá Felipe!</h1><p>Este é um teste direto da API do Resend feito via script local.</p>"
    });
    console.log("Sucesso absoluto! Retorno da API:", data);
  } catch (error) {
    console.error("Falha ao enviar e-mail. Erro retornado pela API do Resend:", error);
  }
}

testSend();
