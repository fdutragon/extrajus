import { googleAdsService } from '../src/services/GoogleAdsService';
import { loadConfig } from '../src/config/loader';

async function main() {
  const args = process.argv.slice(2);
  let campaignId = '';
  let status: 'ENABLED' | 'PAUSED' | '' = '';
  let customerIdOverride: string | undefined = undefined;

  const idIdx = args.indexOf('--id');
  if (idIdx !== -1 && args[idIdx + 1]) {
    campaignId = args[idIdx + 1].trim();
  }

  const statusIdx = args.indexOf('--status');
  if (statusIdx !== -1 && args[statusIdx + 1]) {
    const inputStatus = args[statusIdx + 1].toUpperCase().trim();
    if (inputStatus === 'ENABLED' || inputStatus === 'PAUSED') {
      status = inputStatus;
    }
  }

  const cidIndex = args.indexOf('--customerId');
  if (cidIndex !== -1 && args[cidIndex + 1]) {
    customerIdOverride = args[cidIndex + 1].trim();
  }

  // Validação dos parâmetros obrigatórios
  if (!campaignId || !status) {
    console.error('\n\x1b[31m[System Error] Faltam parâmetros fundamentais no seu comando!\x1b[0m');
    console.log('Uso obrigatório:');
    console.log('  npx tsx scripts/toggle-campaign.ts --id <CAMPAIGN_ID> --status <ENABLED|PAUSED>\n');
    console.log('Exemplos de comando:');
    console.log('  \x1b[36mnpx tsx scripts/toggle-campaign.ts --id 123456789 --status PAUSED\x1b[0m');
    console.log('  \x1b[36mnpx tsx scripts/toggle-campaign.ts --id 123456789 --status ENABLED\x1b[0m\n');
    process.exit(1);
  }

  const config = loadConfig();
  const activeCid = customerIdOverride || config.customerId;

  console.log('\n================================================================');
  console.log(`🤖 ADS COMMAND - MUTANDO CAMPANHA DO GOOGLE ADS 🤖`);
  console.log(`Conta de Operação: \x1b[35m${activeCid || 'Nenhuma configurada'}\x1b[0m`);
  console.log(`Campanha Alvo     : \x1b[33m${campaignId}\x1b[0m`);
  console.log(`Ação Solicitada   : \x1b[36m${status}\x1b[0m`);
  console.log('================================================================\n');

  try {
    await googleAdsService.updateCampaignStatus(campaignId, status, customerIdOverride);
    console.log(`\x1b[32m[System Success] A alteração foi enviada e executada com sucesso!\x1b[0m\n`);
  } catch (error: any) {
    console.error('\n\x1b[31m[System Error] A alteração da campanha falhou:\x1b[0m');
    console.error(error.message);
    console.log('\nVerifique se o ID da campanha existe ou se você possui permissões de escrita na conta.');
  }
}

main();
