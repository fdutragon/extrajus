import { getGoogleAdsClient } from '../src/core/GoogleAdsClient';
import { loadConfig } from '../src/config/loader';
import { GoogleAdsApi } from 'google-ads-api';

async function main() {
  const config = loadConfig();
  
  console.log('\n================================================================');
  console.log(`🧠 ADS DETECTIVE - ESCANEANDO TODO O ECOSSISTEMA DE CONTAS 🧠`);
  console.log('================================================================\n');

  try {
    const api = new GoogleAdsApi({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      developer_token: config.developerToken,
    });

    console.log('Buscando todas as contas acessíveis...');
    const result = await api.listAccessibleCustomers(config.refreshToken);
    const accounts = result.resource_names || [];

    if (accounts.length === 0) {
      console.log('Nenhuma conta acessível.');
      return;
    }

    console.log(`Detectadas ${accounts.length} contas. Iniciando varredura profunda de campanhas...\n`);

    const client = getGoogleAdsClient();

    for (const accResource of accounts) {
      const cid = accResource.split('/').pop() || '';
      const formattedCid = `${cid.slice(0, 3)}-${cid.slice(3, 6)}-${cid.slice(6)}`;
      
      try {
        const customer = client.getCustomer(cid);
        const query = `
          SELECT 
            campaign.id, 
            campaign.name, 
            campaign.status,
            campaign_budget.amount_micros
          FROM campaign
        `;
        const rows = await customer.query(query);

        if (rows.length > 0) {
          console.log(`\x1b[35m[Conta ${formattedCid}]\x1b[0m carregou ${rows.length} campanhas:`);
          rows.forEach((row: any) => {
            const statusLabel = row.campaign.status === 'ENABLED' ? '🟢 ATIVA' : row.campaign.status === 'PAUSED' ? '🔴 PAUSADA' : `⚪ ${row.campaign.status}`;
            console.log(`  - Campanha: \x1b[36m"${row.campaign.name}"\x1b[0m (ID: ${row.campaign.id}) | Status: ${statusLabel}`);
          });
          console.log('----------------------------------------------------------------');
        }
      } catch (err: any) {
        // Ignora erros individuais de contas sem permissão de acesso direto (ex: MCCs vazios ou subcontas inativas)
        // console.log(`[Conta ${formattedCid}] Erro de acesso: ${err.message}`);
      }
    }

    console.log('\n================================================================');
    console.log('🎯 ESCANEAMENTO DE CONTAS CONCLUÍDO COM SUCESSO 🎯');
    console.log('================================================================\n');

  } catch (error: any) {
    console.error('\n\x1b[31m[System Error] Falha crítica na auditoria de ecossistema:\x1b[0m');
    console.error(error.message || error);
  }
}

main();
