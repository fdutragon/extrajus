import { getGoogleAdsClient } from '../src/core/GoogleAdsClient';
import { loadConfig } from '../src/config/loader';

async function main() {
  const args = process.argv.slice(2);
  let adGroupId = '196591962389'; // ID fornecido pelo log anterior
  let customerIdOverride: string | undefined = undefined;

  const groupIdx = args.indexOf('--adGroupId');
  if (groupIdx !== -1 && args[groupIdx + 1]) {
    adGroupId = args[groupIdx + 1].trim();
  }

  const cidIdx = args.indexOf('--customerId');
  if (cidIdx !== -1 && args[cidIdx + 1]) {
    customerIdOverride = args[cidIdx + 1].trim();
  }

  const config = loadConfig();
  const activeCid = (customerIdOverride || config.customerId).replace(/-/g, '').trim();

  console.log('\n================================================================');
  console.log(`🤖 ADS KEYWORD INJECTOR - NOTIFICAÇÃO EXTRAJUDICIAL 🤖`);
  console.log(`Conta de Operação   : \x1b[35m${activeCid}\x1b[0m`);
  console.log(`Grupo de Anúncios   : \x1b[36m${adGroupId}\x1b[0m`);
  console.log('================================================================\n');

  try {
    const client = getGoogleAdsClient();
    const customer = client.getCustomer(activeCid);

    // Lista de palavras-chave estratégicas
    // PHRASE (2) = Correspondência de Frase ("termo")
    // EXACT (3) = Correspondência Exata ([termo])
    const keywords = [
      { text: 'notificação extrajudicial', matchType: 'PHRASE' },
      { text: 'notificação extrajudicial', matchType: 'EXACT' },
      { text: 'como fazer notificação extrajudicial', matchType: 'PHRASE' },
      { text: 'modelo de notificação extrajudicial', matchType: 'PHRASE' },
      { text: 'notificação extrajudicial online', matchType: 'PHRASE' },
      { text: 'notificação extrajudicial online', matchType: 'EXACT' },
      { text: 'enviar notificação extrajudicial', matchType: 'PHRASE' },
      { text: 'fazer notificação extrajudicial', matchType: 'PHRASE' },
      { text: 'minuta notificação extrajudicial', matchType: 'PHRASE' },
      { text: 'notificação extrajudicial valor', matchType: 'PHRASE' },
    ];

    console.log(`Injetando ${keywords.length} palavras-chave no grupo...`);

    const adGroupCriteria = keywords.map(kw => ({
      ad_group: `customers/${activeCid}/adGroups/${adGroupId}`,
      status: 'ENABLED',
      type: 'KEYWORD',
      keyword: {
        text: kw.text,
        match_type: kw.matchType,
      },
    }));

    const response = await customer.adGroupCriteria.create(adGroupCriteria as any);

    console.log(`\x1b[32m[Sucesso] ${response.results.length} palavras-chave injetadas com sucesso!\x1b[0m`);
    console.log('----------------------------------------------------------------');
    keywords.forEach((kw, idx) => {
      const type = kw.matchType === 'PHRASE' ? `"${kw.text}"` : `[${kw.text}]`;
      console.log(`  ${idx + 1}. \x1b[36m${type}\x1b[0m`);
    });
    console.log('================================================================\n');

  } catch (error: any) {
    console.error('\n\x1b[31m[Erro] Falha ao injetar palavras-chave:\x1b[0m');
    console.error(error.message || error);
    if (error.errors || error.failure) {
      console.error(JSON.stringify(error.errors || error.failure, null, 2));
    }
  }
}

main();
