export function generateEmailTemplate(name: string, title: string): string {
  const currentYear = new Date().getFullYear();
  
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Seu Documento Oficial</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050505; color: #e4e4e7; margin: 0; padding: 40px 20px; -webkit-font-smoothing: antialiased;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050505; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" max-width="600px" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #0a0a0a; border: 1px solid #27272a; border-radius: 16px; padding: 40px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);">
              <tr>
                <td align="center" style="padding-bottom: 30px;">
                  <h2 style="color: #ffffff; font-weight: 900; letter-spacing: 0.15em; margin: 0; text-transform: uppercase; font-size: 24px;">EXTRAJUS</h2>
                  <div style="height: 2px; width: 40px; background-color: #d4af37; margin-top: 15px; margin-left: auto; margin-right: auto;"></div>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom: 20px;">
                  <h3 style="font-size: 18px; font-weight: 600; color: #ffffff; margin: 0;">Olá, ${name || 'Cliente'}!</h3>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom: 30px;">
                  <p style="font-size: 15px; line-height: 1.6; color: #a1a1aa; margin: 0; padding-bottom: 15px;">
                    Seu pagamento foi confirmado com sucesso. O sistema processou sua requisição e gerou a versão final do seu documento.
                  </p>
                  <p style="font-size: 15px; line-height: 1.6; color: #e4e4e7; margin: 0; padding-bottom: 15px;">
                    A minuta oficial de <strong>${title || 'Documento ExtraJus'}</strong> foi gerada e já está <strong style="color: #d4af37;">anexada a este e-mail no formato Word (.DOC)</strong>.
                  </p>
                  <p style="font-size: 14px; line-height: 1.6; color: #71717a; margin: 0;">
                    Caso precise realizar alterações, fazer novas exportações ou baixar novamente, acesse a plataforma ExtraJus. O seu documento permanecerá salvo e 100% editável em nossa base.
                  </p>
                </td>
              </tr>
              <tr>
                <td align="center" style="border-top: 1px solid #27272a; padding-top: 25px;">
                  <p style="font-size: 11px; color: #52525b; margin: 0; line-height: 1.5;">
                    Este é um e-mail automático emitido pelos servidores da ExtraJus.<br>Por favor, não responda a esta mensagem.
                  </p>
                  <p style="font-size: 11px; color: #3f3f46; margin-top: 10px; margin-bottom: 0;">
                    © ${currentYear} ExtraJus. Todos os direitos reservados.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
