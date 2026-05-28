import { getGoogleAdsClient } from '../src/core/GoogleAdsClient';
import { loadConfig } from '../src/config/loader';

async function main() {
  const args = process.argv.slice(2);
  let campaignId = '23891691352'; // ID da campanha Notificação Extrajudicial
  let customerIdOverride: string | undefined = undefined;

  const campIdx = args.indexOf('--campaignId');
  if (campIdx !== -1 && args[campIdx + 1]) {
    campaignId = args[campIdx + 1].trim();
  }

  const config = loadConfig();
  const activeCid = (customerIdOverride || config.customerId).replace(/-/g, '').trim();

  console.log('\n================================================================');
  console.log(`🤖 ADS CAMPAIGN KEYWORD INJECTOR (NEGATIVE) 🤖`);
  console.log(`Conta de Operação   : \x1b[35m${activeCid}\x1b[0m`);
  console.log(`ID da Campanha      : \x1b[36m${campaignId}\x1b[0m`);
  console.log('================================================================\n');

  try {
    const client = getGoogleAdsClient();
    const customer = client.getCustomer(activeCid);

    // No Google Ads Search, Keywords de disparo são sempre em AdGroups.
    // Keywords em Campanha são quase sempre NEGATIVAS para evitar tráfego ruim.
    const negativeKeywords = [
      { text: 'grátis', matchType: 'BROAD' },
      { text: 'gratuito', matchType: 'BROAD' },
      { text: 'vagas', matchType: 'BROAD' },
      { text: 'emprego', matchType: 'BROAD' },
      { text: 'curso', matchType: 'BROAD' },
      { text: 'faculdade', matchType: 'BROAD' },
      { text: 'pdf grátis', matchType: 'PHRASE' },
    ];

    console.log(`Injetando ${negativeKeywords.length} palavras-chave NEGATIVAS na campanha...`);

    const campaignCriteria = negativeKeywords.map(kw => ({
      campaign: `customers/${activeCid}/campaigns/${campaignId}`,
      status: 'ENABLED',
      type: 'KEYWORD',
      negative: true, // Define como palavra-chave negativa
      keyword: {
        text: kw.text,
        match_type: kw.matchType,
      },
    }));

    const response = await customer.campaignCriteria.create(campaignCriteria as any);

    console.log(`\x1b[32m[Sucesso] ${response.results.length} palavras-chave negativas adicionadas!\x1b[0m`);
    console.log('----------------------------------------------------------------');
    negativeKeywords.forEach((kw, idx) => {
      console.log(`  ${idx + 1}. \x1b[31m[-] ${kw.text}\x1b[0m`);
    });
    console.log('================================================================\n');

  } catch (error: any) {
    console.error('\n\x1b[31m[Erro] Falha ao injetar keywords de campanha:\x1b[0m');
    console.error(error.message || error);
  }
}

main();
