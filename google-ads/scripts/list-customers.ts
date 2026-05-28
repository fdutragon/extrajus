import { getGoogleAdsClient } from '../src/core/GoogleAdsClient';
import { loadConfig } from '../src/config/loader';
import { GoogleAdsApi } from 'google-ads-api';

async function main() {
  const config = loadConfig();
  
  console.log('\n================================================================');
  console.log(`🤖 ADS SYSTEM - LISTANDO CONTAS ACESSÍVEIS PELO OAUTH2 🤖`);
  console.log('================================================================\n');

  try {
    const api = new GoogleAdsApi({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      developer_token: config.developerToken,
    });

    console.log('Solicitando contas vinculadas a este Refresh Token no Google Ads...');
    const result = await api.listAccessibleCustomers(config.refreshToken);
    
    console.log('\n================================================================');
    console.log('🏆 CONTAS DETECTADAS NO SEU ECOSSISTEMA 🏆');
    console.log('================================================================');
    if (!result.resource_names || result.resource_names.length === 0) {
      console.log('Nenhuma conta acessível encontrada.');
    } else {
      result.resource_names.forEach((res, index) => {
        const id = res.split('/').pop() || res;
        // Formata com traços para legibilidade (ex: 5118894801 -> 511-889-4801)
        const formattedId = id.length === 10 ? `${id.slice(0, 3)}-${id.slice(3, 6)}-${id.slice(6)}` : id;
        console.log(`  ${index + 1}. Conta: \x1b[32m${formattedId}\x1b[0m (Resource: ${res})`);
      });
    }
    console.log('================================================================\n');

  } catch (error: any) {
    console.error('\n\x1b[31m[System Error] Falha ao listar contas acessíveis:\x1b[0m');
    console.error(error.message || error);
  }
}

main();
