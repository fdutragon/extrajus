import { getGoogleAdsClient } from '../src/core/GoogleAdsClient';
import { loadConfig } from '../src/config/loader';

async function main() {
  const args = process.argv.slice(2);
  let campaignId = '23883333812'; // Default to the newly created campaign in 511-889-4801
  let customerIdOverride: string | undefined = undefined;
  let finalUrl = 'https://www.registrodemarca-oficial.com.br';

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

  const config = loadConfig();
  const activeCid = (customerIdOverride || config.customerId).replace(/-/g, '').trim();

  console.log('\n================================================================');
  console.log(`🤖 ADS CREATOR - CRIANDO GRUPO E ANUNCIOS (CRIATIVOS) 🤖`);
  console.log(`Conta de Operação   : \x1b[35m${activeCid}\x1b[0m`);
  console.log(`Campanha de Destino : \x1b[36m${campaignId}\x1b[0m`);
  console.log(`URL de Destino (Site): \x1b[32m${finalUrl}\x1b[0m`);
  console.log('================================================================\n');

  try {
    const client = getGoogleAdsClient();
    const customer = client.getCustomer(activeCid);

    // 1. Criar o Ad Group
    console.log('1. Criando o Grupo de Anúncios (Ad Group)...');
    
    // Nome do grupo de anúncios (com sufixo temporal para evitar erros de duplicidade)
    const adGroupName = `Grupo de Pesquisa INPI - Principal - ${Date.now()}`;

    const adGroupResponse = await customer.adGroups.create([
      {
        name: adGroupName,
        campaign: `customers/${activeCid}/campaigns/${campaignId}`,
        status: 'PAUSED', // Começa pausado por segurança
        type: 'SEARCH_STANDARD',
        cpc_bid_micros: 2.50 * 1000000, // Lance padrão de R$ 2,50
      }
    ] as any);

    const adGroupResourceName = adGroupResponse.results?.[0]?.resource_name;
    if (!adGroupResourceName) {
      throw new Error('Falha ao obter o resource name do Grupo de Anúncios.');
    }
    const adGroupId = adGroupResourceName.split('/').pop() || '';
    
    console.log(`\x1b[32m[System Success] Grupo de Anúncios criado:\x1b[0m ${adGroupResourceName} (ID: ${adGroupId})`);
    console.log('----------------------------------------------------------------');

    // 2. Criar os criativos (Responsive Search Ad)
    console.log('2. Criando os criativos do anúncio responsivo de pesquisa (RSA)...');

    // Lista de Headlines de alta conversão para Registro de Marca
    const headlines = [
      { text: 'Registro de Marca Oficial' },
      { text: 'Proteja Sua Marca no INPI' },
      { text: 'Consulta de Marca Gratuita' },
      { text: 'Registro de Logotipo INPI' },
      { text: 'Evite Plágios e Cópias' },
      { text: 'Garanta Seu Nome Comercial' },
      { text: 'Proteção Exclusiva de Marca' },
      { text: 'Registro Rápido e Seguro' },
    ];

    // Lista de Descrições de alta conversão (Máximo de 90 caracteres por descrição no Google Ads!)
    const descriptions = [
      { text: 'Evite cópias e proteja sua empresa. Faça uma consulta de viabilidade gratuita hoje.' },
      { text: 'Garanta a propriedade exclusiva da sua marca. Assessoria completa e especializada.' },
      { text: 'Seu nome comercial protegido por lei no Brasil. Registro rápido e sem burocracia.' },
      { text: 'Consulta grátis de marcas e patentes. Fale com um consultor e registre sua marca.' },
    ];

    const adGroupAdResponse = await customer.adGroupAds.create([
      {
        ad_group: adGroupResourceName,
        status: 'PAUSED', // Começa pausado
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
    if (!adGroupAdResourceName) {
      throw new Error('Falha ao obter o resource name do Anúncio.');
    }
    const adGroupAdId = adGroupAdResourceName.split('/').pop() || '';

    console.log(`\x1b[32m[System Success] Criativos de anúncio criados com sucesso via gRPC!\x1b[0m`);
    console.log('================================================================');
    console.log('🏆 ANÚNCIO E CRIATIVOS PUBLICADOS COM SUCESSO 🏆');
    console.log('================================================================');
    console.log(`ID do Grupo       : \x1b[32m${adGroupId}\x1b[0m`);
    console.log(`ID do Anúncio     : \x1b[32m${adGroupAdId}\x1b[0m`);
    console.log(`Resource Anúncio  : \x1b[37m${adGroupAdResourceName}\x1b[0m`);
    console.log('----------------------------------------------------------------');
    console.log('📝 Títulos Criados (Headlines):');
    headlines.forEach((h, idx) => console.log(`  ${idx + 1}. \x1b[36m"${h.text}"\x1b[0m`));
    console.log('----------------------------------------------------------------');
    console.log('📝 Descrições Criadas (Descriptions):');
    descriptions.forEach((d, idx) => console.log(`  ${idx + 1}. \x1b[33m"${d.text}"\x1b[0m`));
    console.log('================================================================\n');

  } catch (error: any) {
    console.error('\n\x1b[31m[System Error] Erro crítico ao criar criativos de anúncio:\x1b[0m');
    if (error && typeof error === 'object') {
      console.error(error.message || error);
      if (error.errors || error.failure) {
        console.error(JSON.stringify(error.errors || error.failure, null, 2));
      }
    } else {
      console.error(error);
    }
  }
}

main();
