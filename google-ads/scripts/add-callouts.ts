import { getGoogleAdsClient } from '../src/core/GoogleAdsClient';
import { loadConfig } from '../src/config/loader';

async function main() {
  const config = loadConfig();
  const activeCid = config.customerId.replace(/-/g, '').trim();
  const campaignId = '23891691352'; // Campanha "Notificação Extrajudicial" (ATIVA)

  console.log('\n================================================================');
  console.log(`💬 ADS CALLOUT CREATOR - CAMPANHA ${campaignId} 💬`);
  console.log(`Conta de Operação : \\x1b[35m${activeCid}\\x1b[0m`);
  console.log('================================================================\n');

  try {
    const client = getGoogleAdsClient();
    const customer = client.getCustomer(activeCid);

    // 1. Definir as Frases de Destaque (Callout Assets)
    // Texto limitado a 25 caracteres.
    const calloutsData = [
      'IA Jurídica Avançada',
      'Edição Online Fácil',
      'Baixe em PDF/DOCX',
      'Sem Burocracia',
      'Proteção Legal',
      'Suporte Especializado',
      'Rápido e Eficaz',
    ];

    const calloutAssets = calloutsData.map(text => ({
      asset: {
        type: 'CALLOUT',
        callout_asset: {
          callout_text: text,
        },
      },
    }));

    // Criar os assets
    console.log(`Criando ${calloutAssets.length} assets de Frase de Destaque...`);
    const assetResponse = await customer.assets.create(calloutAssets as any);

    const assetResourceNames = assetResponse.results.map((result: any) => result.resource_name);
    console.log(`\x1b[32m[OK] Assets de Frase de Destaque criados.\x1b[0m`);

    // 2. Associar os Callouts (Assets) à Campanha
    console.log(`Associando os assets de Frase de Destaque à campanha ${campaignId}...`);

    const campaignAssetOperations = assetResourceNames.map((resourceName: string) => ({
      campaign_asset: {
        campaign: `customers/${activeCid}/campaigns/${campaignId}`,
        asset: resourceName,
        field_type: 'CALLOUT',
      },
    }));
    
    await customer.campaignAssets.create(campaignAssetOperations as any);

    console.log(`\x1b[32m[OK] Frases de Destaque associadas com sucesso à campanha ${campaignId}!\x1b[0m`);
    console.log('================================================================\n');

  } catch (error: any) {
    console.error('\n\x1b[31m[Erro] Falha ao criar/associar Frases de Destaque:\x1b[0m');
    console.error(error.message || error);
    if (error.errors || error.failure) {
      console.error(JSON.stringify(error.errors || error.failure, null, 2));
    }
  }
}

main();
