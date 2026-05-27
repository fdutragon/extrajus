import { googleAdsService } from '../src/services/GoogleAdsService';
import { loadConfig } from '../src/config/loader';

async function main() {
  const args = process.argv.slice(2);
  let campaignName = 'Campanha Estratégica INPI';
  let budgetDaily = 50.0;
  let customerIdOverride: string | undefined = undefined;

  const nameIdx = args.indexOf('--name');
  if (nameIdx !== -1 && args[nameIdx + 1]) {
    campaignName = args[nameIdx + 1];
  }

  const budgetIdx = args.indexOf('--budget');
  if (budgetIdx !== -1 && args[budgetIdx + 1]) {
    budgetDaily = parseFloat(args[budgetIdx + 1]);
  }

  const cidIdx = args.indexOf('--customerId');
  if (cidIdx !== -1 && args[cidIdx + 1]) {
    customerIdOverride = args[cidIdx + 1].trim();
  }

  // Se nenhum customer_id foi passado, tentamos usar o padrão do config.toml
  const config = loadConfig();
  const activeCid = customerIdOverride || config.customerId;

  if (!activeCid) {
    console.error('\n\x1b[31m[System Error] Customer ID não definido! Precisamos saber em qual conta do Google Ads vamos operar.\x1b[0m');
    console.log('Passe o parâmetro --customerId ou defina no seu config.toml\n');
    process.exit(1);
  }

  console.log('\n================================================================');
  console.log(`🤖 ADS SYSTEM - CRIANDO CAMPANHA DE PESQUISA 🤖`);
  console.log(`Conta de Operação   : \x1b[35m${activeCid}\x1b[0m`);
  console.log(`Nome da Campanha    : \x1b[36m"${campaignName}"\x1b[0m`);
  console.log(`Orçamento Diário    : \x1b[32mR$ ${budgetDaily.toFixed(2)}\x1b[0m`);
  console.log('================================================================\n');

  try {
    const result = await googleAdsService.createSearchCampaign(
      campaignName,
      budgetDaily,
      activeCid
    );

    console.log('================================================================');
    console.log('🏆 CAMPANHA CRIADA COM SUCESSO 🏆');
    console.log('================================================================');
    console.log(`ID da Campanha     : \x1b[32m${result.campaignId}\x1b[0m`);
    console.log(`Resource Campanha  : \x1b[37m${result.resourceName}\x1b[0m`);
    console.log(`Resource Orçamento : \x1b[37m${result.budgetResourceName}\x1b[0m`);
    console.log('----------------------------------------------------------------');
    console.log('\x1b[33mNota: A campanha foi criada em modo "PAUSADO" por segurança do seu caixa.\x1b[0m');
    console.log('Acesse o painel do Google Ads ou utilize o script de toggle para ativá-la.');
    console.log('================================================================\n');

  } catch (error: any) {
    console.error('\n\x1b[31m[System Error] Erro ao criar campanha:\x1b[0m');
    console.error(error.message);
  }
}

main();
