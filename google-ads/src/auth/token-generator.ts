import express from 'express';
import { loadConfig, saveRefreshToken } from '../config/loader';
import { exec } from 'child_process';

const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

export async function runTokenGenerator() {
  const config = loadConfig();

  if (!config.clientId || !config.clientSecret) {
    console.error('\n\x1b[31m[System Error] Credenciais ausentes no seu config.toml!\x1b[0m');
    console.error('Você precisa definir client_id e client_secret sob a seção [google-ads] antes de rodar o gerador.');
    console.error('Edite o arquivo: C:\\Users\\felip\\.extrajus\\config.toml e tente de novo.\n');
    process.exit(1);
  }

  const app = express();

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
    `client_id=${encodeURIComponent(config.clientId)}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fadwords` +
    `&access_type=offline` +
    `&prompt=consent`;

  let server: any;

  app.get('/oauth2callback', async (req, res) => {
    const code = req.query.code as string;

    if (!code) {
      res.status(400).send('<h1>Erro de Autorização</h1><p>Não foi possível capturar o código de autenticação.</p>');
      return;
    }

    res.send('<h1>Autorizado com Sucesso!</h1><p>Você pode fechar esta aba do navegador e voltar ao terminal.</p>');

    console.log('\n\x1b[36m[System Info] Código de autorização recebido! Solicitando Refresh Token ao Google...\x1b[0m');

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: config.clientId,
          client_secret: config.clientSecret,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      });

      const data = await response.json() as any;

      if (!response.ok || data.error) {
        throw new Error(data.error_description || data.error || 'Erro desconhecido ao obter o token.');
      }

      const refreshToken = data.refresh_token;

      if (!refreshToken) {
        throw new Error('O Google não retornou o Refresh Token. Certifique-se de que você removeu o acesso da sua conta de teste e concedeu novamente (precisa de prompt=consent).');
      }

      console.log('\n================================================================');
      console.log(`\x1b[32m[System Success] Refresh Token gerado:\x1b[0m \x1b[35m${refreshToken}\x1b[0m`);
      console.log('================================================================\n');

      saveRefreshToken(refreshToken);

      console.log('\x1b[32m[System Info] Tudo pronto para operar a API do Google Ads. Fechando o servidor local...\x1b[0m\n');
      
      setTimeout(() => {
        if (server) server.close();
        process.exit(0);
      }, 1500);

    } catch (err: any) {
      console.error(`\n\x1b[31m[System Error] Falha ao obter o Refresh Token:\x1b[0m ${err.message}\n`);
      setTimeout(() => {
        if (server) server.close();
        process.exit(1);
      }, 1500);
    }
  });

  server = app.listen(PORT, () => {
    console.log('\n================================================================');
    console.log('SYSTEM OAUTH2 PORTAL - GOOGLE ADS INTEGRATION');
    console.log('================================================================');
    console.log(`\x1b[36m1. Iniciando servidor de callback em:\x1b[0m ${REDIRECT_URI}`);
    console.log('\x1b[36m2. Tentando abrir o portal de login no seu navegador...\x1b[0m');
    console.log('================================================================\n');

    console.log(`Caso o navegador não abra automaticamente, copie e cole este link:`);
    console.log(`\x1b[34m${authUrl}\x1b[0m\n`);

    // Abre o navegador de forma multiplataforma e à prova de falhas no Windows usando PowerShell
    exec(`powershell -NoProfile -Command "Start-Process '${authUrl}'"`);
  });
}

if (require.main === module) {
  runTokenGenerator();
}
