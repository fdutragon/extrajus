import { getGoogleAdsClient } from '../src/core/GoogleAdsClient';
import { loadConfig } from '../src/config/loader';

async function main() {
  const args = process.argv.slice(2);
  let campaignId = ''; 
  let customerIdOverride: string | undefined = undefined;
  let finalUrl = 'https://extrajus.com.br/editor';

  const campIdx = args.indexOf('--campaignId');
  if (campIdx !== -1 && args[campIdx + 1]) {
    campaignId = args[campIdx + 1].trim();
  }

  const cidIdx = args.indexOf('--customerId');
  if (cidIdx !== -1 && args[cidIdx + 1]) {
    customerIdOverride = args[cidIdx + 1].trim();
  }

  const urlIdx = args.indexOf('--url');
  if (urlIdx !== -1 && args[urlIdx + 1]) {
    finalUrl = args[urlIdx + 1].trim();
  }

  if (!campaignId) {
    console.error('\x1b[31m[Erro] É necessário fornecer o --campaignId\x1b[0m');
    process.exit(1);
  }

  const config = loadConfig();
  const activeCid = (customerIdOverride || config.customerId).replace(/-/g, '').trim();

  console.log('\n================================================================');
  console.log(`🤖 ADS CREATOR - NOTIFICAÇÃO EXTRAJUDICIAL 🤖`);
  console.log(`Conta de Operação   : \x1b[35m${activeCid}\x1b[0m`);
  console.log(`Campanha de Destino : \x1b[36m${campaignId}\x1b[0m`);
  console.log(`URL de Destino      : \x1b[32m${finalUrl}\x1b[0m`);
  console.log('================================================================\n');

  try {
    const client = getGoogleAdsClient();
    const customer = client.getCustomer(activeCid);

    console.log('1. Criando o Grupo de Anúncios (Ad Group)...');
    const adGroupName = `Notificação Extrajudicial - IA - ${Date.now()}`;

    const adGroupResponse = await customer.adGroups.create([
      {
        name: adGroupName,
        campaign: `customers/${activeCid}/campaigns/${campaignId}`,
        status: 'PAUSED',
        type: 'SEARCH_STANDARD',
        cpc_bid_micros: 3.50 * 1000000, 
      }
    ] as any);

    const adGroupResourceName = adGroupResponse.results?.[0]?.resource_name;
    if (!adGroupResourceName) {
      throw new Error('Falha ao obter o resource name do Grupo de Anúncios.');
    }
    const adGroupId = adGroupResourceName.split('/').pop() || '';
    
    console.log(`\x1b[32m[Sucesso] Grupo de Anúncios criado:\x1b[0m ${adGroupId}`);

    console.log('2. Criando os criativos (RSA)...');

    // Headlines para Notificação Extrajudicial (Máx 30 caracteres - Forçando < 25 por segurança)
    const headlines = [
      { text: 'Notificação Extrajudicial' }, // 24
      { text: 'Crie Sua Notificação' },      // 20
      { text: 'Documento Jurídico' },        // 18
      { text: 'Resolva Conflitos Agora' },    // 23
      { text: 'Notificação Oficial' },       // 19
      { text: 'IA Especialista' },           // 14
      { text: 'Sem Burocracia' },            // 14
      { text: 'Seguro e Válido' },           // 15
      { text: 'Notificação em 1 Min' },      // 20
      { text: 'Solução Imediata' },          // 16
      { text: 'ExtraJus: IA Jurídica' },      // 19
      { text: 'Direitos Garantidos' },       // 18
    ];

    // Descrições para Notificação Extrajudicial (Máx 90 caracteres)
    const descriptions = [
      { text: 'Crie notificações extrajudiciais seguras em segundos com nossa inteligência artificial.' }, // 84
      { text: 'Evite processos lentos. Resolva pendências com notificações oficiais redigidas por IA.' },    // 83
      { text: 'O jeito mais rápido e inteligente de formalizar cobranças e notificações legais.' },         // 80
      { text: 'Segurança jurídica total. Redija, revise e baixe sua notificação agora mesmo.' },           // 80
    ];

    const adGroupAdResponse = await customer.adGroupAds.create([
      {
        ad_group: adGroupResourceName,
        status: 'PAUSED',
        ad: {
          final_urls: [finalUrl],
          responsive_search_ad: {
            headlines,
            descriptions,
          },
        },
      }
    ] as any);

    console.log(`\x1b[32m[Sucesso] Criativos de Notificação Extrajudicial criados com sucesso!\x1b[0m`);
    console.log('----------------------------------------------------------------');
    console.log('📝 Títulos Criados (Headlines):');
    headlines.forEach((h, idx) => console.log(`  ${idx + 1}. \x1b[36m"${h.text}"\x1b[0m`));
    console.log('----------------------------------------------------------------');
    console.log('📝 Descrições Criadas (Descriptions):');
    descriptions.forEach((d, idx) => console.log(`  ${idx + 1}. \x1b[33m"${d.text}"\x1b[0m`));
    console.log('================================================================\n');

  } catch (error: any) {
    console.error('\n\x1b[31m[Erro] Erro ao criar criativos:\x1b[0m');
    console.error(error.message || error);
  }
}

main();
