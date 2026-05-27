import { getGoogleAdsClient } from '../src/core/GoogleAdsClient';
import { loadConfig } from '../src/config/loader';

async function main() {
  const config = loadConfig();
  const activeCid = '5118894801';
  const campaignId = '23884108760';

  console.log(`Buscando grupos e anúncios na campanha ${campaignId}...`);
  const client = getGoogleAdsClient();
  const customer = client.getCustomer(activeCid);

  try {
    const query = `
      SELECT 
        ad_group.id, 
        ad_group.name, 
        ad_group.status,
        campaign.id
      FROM ad_group
      WHERE campaign.id = '${campaignId}'
    `;
    const rows = await customer.query(query);
    console.log('--- GRUPOS DE ANÚNCIOS ENCONTRADOS ---');
    console.log(JSON.stringify(rows, null, 2));

    const adQuery = `
      SELECT
        ad_group_ad.ad.id,
        ad_group_ad.ad.type,
        ad_group_ad.status,
        ad_group.id
      FROM ad_group_ad
      WHERE campaign.id = '${campaignId}'
    `;
    const adRows = await customer.query(adQuery);
    console.log('--- ANÚNCIOS ENCONTRADOS ---');
    console.log(JSON.stringify(adRows, null, 2));

  } catch (err: any) {
    console.error('Erro ao verificar:', err.message || err);
  }
}

main();
