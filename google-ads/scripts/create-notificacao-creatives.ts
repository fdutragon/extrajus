import { getGoogleAdsClient } from '../src/core/GoogleAdsClient';
import { loadConfig } from '../src/config/loader';

async function main() {
  const args = process.argv.slice(2);
  let campaignId = ''; 
  let customerIdOverride: string | undefined = undefined;
  let finalUrl = 'https://extrajus.pro/';

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
  console.log(`🤖 ADS CREATOR - NOTIFICAÇÃO EXTRAJUDICIAL (PRO) 🤖`);
  console.log(`Conta de Operação   : \x1b[35m${activeCid}\x1b[0m`);
  console.log(`Campanha de Destino : \x1b[36m${campaignId}\x1b[0m`);
  console.log(`URL de Destino      : \x1b[32m${finalUrl}\x1b[0m`);
  console.log('================================================================\n');

  try {
    const client = getGoogleAdsClient();
    const customer = client.getCustomer(activeCid);

    console.log('1. Criando o Grupo de Anúncios (Ad Group)...');
    const adGroupName = `Notificação Extrajudicial - PRO - ${Date.now()}`;

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
    
    console.log(`\x1b[32m[Sucesso] Grupo de Anúncios criado: ${adGroupId}\x1b[0m`);

    console.log('2. Criando os criativos (RSA)...');

    const headlines = [
      { text: 'Notificação Extrajudicial' }, 
      { text: 'Crie Sua Notificação Agora' },    
      { text: 'Documento Jurídico Pronto' },   
      { text: 'Resolva Conflitos Agora' },      
      { text: 'Notificação Oficial Pronta' },   
      { text: 'IA Especialista Jurídica' },     
      { text: 'Sem Burocracia Judicial' },      
      { text: 'Documento Seguro e Válido' },    
      { text: 'Notificação Pronta em 1 Min' },  
      { text: 'Solução Jurídica Imediata' },    
      { text: 'ExtraJus: IA Jurídica' },        
      { text: 'Recupere Seus Direitos' },       
    ];

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

    const adGroupAdResourceName = adGroupAdResponse.results?.[0]?.resource_name;
    const adGroupAdId = adGroupAdResourceName?.split('/').pop() || '';

    console.log(`\x1b[32m[Sucesso] Criativos de Notificação Extrajudicial criados com sucesso!\x1b[0m`);
    console.log('----------------------------------------------------------------');
    console.log(`ID do Anúncio: ${adGroupAdId}`);
    console.log('================================================================\n');

  } catch (error: any) {
    console.error('\n\x1b[31m[Erro] Erro ao criar criativos:\x1b[0m');
    console.error(error.message || error);
    if (error.errors || error.failure) {
      console.error(JSON.stringify(error.errors || error.failure, null, 2));
    }
  }
}

main();
