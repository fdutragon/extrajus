require('dotenv').config({ path: '.env' });
const { OAuth2Client } = require('google-auth-library');
const readline = require('readline');
const fs = require('fs');

const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/oauth2callback'; // Alterado para bater com o Google Cloud

const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authorizeUrl = client.generateAuthUrl({
  access_type: 'offline',
  scope: 'https://www.googleapis.com/auth/adwords',
  prompt: 'consent'
});

console.log('====================================================');
console.log('🔗 ABRA ESTE LINK NO NAVEGADOR PARA AUTORIZAR A LILITH:');
console.log(authorizeUrl);
console.log('====================================================\n');
console.log('ATENÇÃO: Após autorizar, o navegador vai te redirecionar para http://localhost:3000/oauth2callback?code=...');
console.log('Vai dar erro de página não encontrada (isso é normal).');
console.log('Basta copiar tudo que vem depois de "code=" na barra de endereços (até o "&" se houver) e colar aqui abaixo.');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Cole o CÓDIGO de autorização (code) aqui: ', async (code) => {
  try {
    const { tokens } = await client.getToken(code);
    console.log('\n[✔] SUCESSO! Aqui está o seu Refresh Token:');
    console.log(tokens.refresh_token);
    
    // Injetar automaticamente no .env
    let envData = fs.readFileSync('.env', 'utf8');
    if (envData.includes('GOOGLE_ADS_REFRESH_TOKEN=')) {
        envData = envData.replace(/GOOGLE_ADS_REFRESH_TOKEN=.*/, `GOOGLE_ADS_REFRESH_TOKEN=${tokens.refresh_token}`);
    } else {
        envData += `\nGOOGLE_ADS_REFRESH_TOKEN=${tokens.refresh_token}`;
    }
    fs.writeFileSync('.env', envData);
    
    console.log('\n[⚡] O arquivo .env foi arrombado e atualizado com o novo token! Pode rodar os scripts agora.');
  } catch (error) {
    console.error('\n[!] Erro ao trocar o código pelo token:', error.message);
    console.log('Certifique-se de que o "Tipo de Aplicativo" no Google Cloud está configurado como "Desktop app" para usar o redirect urn:ietf:wg:oauth:2.0:oob.');
  }
  rl.close();
});
