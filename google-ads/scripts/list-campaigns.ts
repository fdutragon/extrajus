import { googleAdsService } from '../src/services/GoogleAdsService';
import { loadConfig } from '../src/config/loader';

async function main() {
  // Analisa argumentos da linha de comando de forma simples
  const args = process.argv.slice(2);
  let customerIdOverride: string | undefined = undefined;

  const cidIndex = args.indexOf('--customerId');
  if (cidIndex !== -1 && args[cidIndex + 1]) {
    customerIdOverride = args[cidIndex + 1];
  }

  const config = loadConfig();
  const activeCid = customerIdOverride || config.customerId;

  console.log('\n================================================================');
  console.log(`🤖 GOOGLE ADS INTEGRATION - LISTANDO CAMPANHAS DA CONTA 🤖`);
  console.log(`Conta de Operação: \x1b[35m${activeCid || 'Nenhuma configurada'}\x1b[0m`);
  console.log('================================================================\n');

  try {
    const campaigns = await googleAdsService.listCampaigns(customerIdOverride);

    if (campaigns.length === 0) {
      console.log('\x1b[33m[System Info] Nenhuma campanha ativa ou pausada encontrada nesta conta.\x1b[0m\n');
      return;
    }

    // Formata a exibição
    const formattedList = campaigns.map((c) => ({
      ID: c.id,
      Campanha: c.name,
      Status: c.status === 'ENABLED' ? '🟢 ATIVA' : '🔴 PAUSADA',
      Tipo: c.channelType,
      'Orçamento Diário': `R$ ${c.budgetDaily.toFixed(2)}`,
      Estratégia: c.biddingStrategy,
    }));

    console.table(formattedList);
    console.log(`\n\x1b[32m[System Success] Total de campanhas carregadas: ${campaigns.length}\x1b[0m\n`);

  } catch (error: any) {
    console.error('\n\x1b[31m[System Error] Não foi possível obter as campanhas da API:\x1b[0m');
    if (error && typeof error === 'object') {
      console.error(error.message || error);
      if (error.errors || error.failure) {
        console.error(JSON.stringify(error.errors || error.failure, null, 2));
      }
    } else {
      console.error(error);
    }
    console.log('\nVerifique se o seu Developer Token é válido e se as credenciais no config.toml estão corretas.');
    console.log('Para gerar um novo Refresh Token, rode: \x1b[36mnpm run auth\x1b[0m\n');
  }
}

main();
