import { getGoogleAdsClient } from '../src/core/GoogleAdsClient';
import { loadConfig } from '../src/config/loader';

async function main() {
  const config = loadConfig();
  const activeCid = config.customerId.replace(/-/g, '').trim();
  const campaignId = '23891691352'; // Campanha "Notificação Extrajudicial" (ATIVA)

  console.log('\n================================================================');
  console.log(`🔗 ADS SITELINK CREATOR - CAMPANHA ${campaignId} 🔗`);
  console.log(`Conta de Operação : \\x1b[35m${activeCid}\\x1b[0m`);
  console.log('================================================================\n');

  try {
    const client = getGoogleAdsClient();
    const customer = client.getCustomer(activeCid);

    // 1. Definir os Sitelinks (Assets)
    // Cada Sitelink deve ter um linkText e uma finalUrl. As descrições são opcionais, mas recomendadas.
    const sitelinksData = [
      {
        linkText: 'Contrato de Aluguel',
        description1: 'Crie seu contrato de aluguel',
        description2: 'Personalize e baixe em PDF/DOCX',
        finalUrl: 'https://extrajus.pro/editor#aluguel',
      },
      {
        linkText: 'Notificação Extrajudicial',
        description1: 'Redija sua notificação oficial',
        description2: 'Comunicação formal e eficiente',
        finalUrl: 'https://extrajus.pro/editor#notificacao',
      },
      {
        linkText: 'Termos de Uso',
        description1: 'Gere termos de uso para seu site',
        description2: 'Proteja seu negócio legalmente',
        finalUrl: 'https://extrajus.pro/editor#termos-de-uso',
      },
      {
        linkText: 'Política de Privacidade',
        description1: 'Crie sua política de privacidade',
        description2: 'Em conformidade com a LGPD',
        finalUrl: 'https://extrajus.pro/editor#politica-de-privacidade',
      },
    ];

    const sitelinkAssets = sitelinksData.map(sl => ({
      create: {
        type: client.enums.AssetType.SITELINK, // Usando o enum da API
        sitelink_asset: {
          link_text: sl.linkText,
          description1: sl.description1,
          description2: sl.description2,
          final_urls: [sl.finalUrl],
        },
      },
    }));

    // Criar os assets
    console.log(`Criando ${sitelinkAssets.length} assets de Sitelink...`);
    const assetResponse = await customer.assets.create(sitelinkAssets as any);

    const assetResourceNames = assetResponse.results.map((result: any) => result.resource_name);
    console.log(`\x1b[32m[OK] Assets de Sitelink criados.\x1b[0m`);

    // 2. Associar os Sitelinks (Assets) à Campanha
    console.log(`Associando os assets de Sitelink à campanha ${campaignId}...`);

    const campaignAssetOperations = assetResourceNames.map((resourceName: string) => ({
      campaign_asset: {
        campaign: `customers/${activeCid}/campaigns/${campaignId}`,
        asset: resourceName,
        field_type: 'SITELINK',
      },
    }));
    
    await customer.campaignAssets.create(campaignAssetOperations as any);

    console.log(`\x1b[32m[OK] Sitelinks associados com sucesso à campanha ${campaignId}!\x1b[0m`);
    console.log('================================================================\n');

  } catch (error: any) {
    console.error('\n\x1b[31m[Erro] Falha ao criar/associar Sitelinks:\x1b[0m');
    console.error(error.message || error);
    if (error.errors || error.failure) {
      console.error(JSON.stringify(error.errors || error.failure, null, 2));
    }
  }
}

main();
