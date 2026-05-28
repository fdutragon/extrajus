import { getGoogleAdsClient } from '../src/core/GoogleAdsClient';
import { loadConfig } from '../src/config/loader';

async function main() {
  const config = loadConfig();
  const activeCid = config.customerId.replace(/-/g, '').trim();

  console.log('\n================================================================');
  console.log(`🧹 ADS CLEANUP - REMOVENDO RECURSOS PAUSADOS/REPROVADOS 🧹`);
  console.log(`Conta de Operação : \x1b[35m${activeCid}\x1b[0m`);
  console.log('================================================================\n');

  try {
    const client = getGoogleAdsClient();
    const customer = client.getCustomer(activeCid);

    // 1. Limpar Anúncios (AdGroupAds) pausados
    console.log('--- Buscando Anúncios pausados para limpeza... ---');
    const adQuery = `
      SELECT ad_group_ad.resource_name 
      FROM ad_group_ad 
      WHERE ad_group_ad.status = 'PAUSED'
    `;
    const ads = await customer.query(adQuery);
    if (ads.length > 0) {
      console.log(`Detectados ${ads.length} anúncios pausados.`);
      // No Google Ads API v17+, para deletar você usa o método 'remove' em vez de 'update' com status REMOVED em alguns casos
      await customer.adGroupAds.remove(ads.map((ad: any) => ad.ad_group_ad.resource_name));
      console.log(`\x1b[32m[OK] Anúncios removidos.\x1b[0m`);
    }

    // 2. Limpar Grupos de Anúncios (AdGroups) pausados
    console.log('\n--- Buscando Grupos de Anúncios pausados... ---');
    const groupQuery = `
      SELECT ad_group.resource_name 
      FROM ad_group 
      WHERE ad_group.status = 'PAUSED'
    `;
    const groups = await customer.query(groupQuery);
    if (groups.length > 0) {
      console.log(`Detectados ${groups.length} grupos pausados.`);
      await customer.adGroups.remove(groups.map((g: any) => g.ad_group.resource_name));
      console.log(`\x1b[32m[OK] Grupos removidos.\x1b[0m`);
    }

    // 3. Limpar Campanhas pausadas
    console.log('\n--- Buscando Campanhas pausadas... ---');
    const campaignQuery = `
      SELECT campaign.resource_name 
      FROM campaign 
      WHERE campaign.status = 'PAUSED'
    `;
    const campaigns = await customer.query(campaignQuery);
    if (campaigns.length > 0) {
      console.log(`Detectadas ${campaigns.length} campanhas para remoção.`);
      await customer.campaigns.remove(campaigns.map((c: any) => c.campaign.resource_name));
      console.log(`\x1b[32m[OK] Campanhas removidas.\x1b[0m`);
    } else {
      console.log('Nenhuma campanha pausada encontrada.');
    }

    console.log('\n================================================================');
    console.log('✅ LIMPEZA DE ELITE CONCLUÍDA ✅');
    console.log('================================================================\n');

  } catch (error: any) {
    console.error('\n\x1b[31m[Erro] Falha crítica na limpeza:\x1b[0m');
    console.error(error.message || error);
  }
}

main();
