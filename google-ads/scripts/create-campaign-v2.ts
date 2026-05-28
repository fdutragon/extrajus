import { googleAdsService } from '../src/services/GoogleAdsService';
import { getGoogleAdsClient } from '../src/core/GoogleAdsClient';
import { loadConfig } from '../src/config/loader';

async function main() {
  const args = process.argv.slice(2);
  let campaignName = 'Campanha ExtraJus - Elite V2';
  let budgetDaily = 50.0;
  let customerIdOverride: string | undefined = undefined;
  let finalUrl = 'https://extrajus.com.br/editor';

  const nameIdx = args.indexOf('--name');
  if (nameIdx !== -1 && args[nameIdx + 1]) {
    campaignName = args[nameIdx + 1];
  }

  const budgetIdx = args.indexOf('--budget');
  if (budgetIdx !== -1 && args[budgetIdx + 1]) {
    budgetDaily = parseFloat(args[budgetIdx + 1]);
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

  if (!activeCid) {
    console.error('\n\x1b[31m[System Error] Customer ID não definido! Precisamos saber em qual conta do Google Ads vamos operar.\x1b[0m');
    console.log('Passe o parâmetro --customerId ou defina no seu config.toml\n');
    process.exit(1);
  }

  console.log('\n================================================================');
  console.log(`🤖 ADS AUTOMATION - GERANDO NOVA CAMPANHA COM CRIATIVOS ELITE 🤖`);
  console.log(`Conta de Operação   : \x1b[35m${activeCid}\x1b[0m`);
  console.log(`Nome da Campanha    : \x1b[36m"${campaignName}"\x1b[0m`);
  console.log(`Orçamento Diário    : \x1b[32mR$ ${budgetDaily.toFixed(2)}\x1b[0m`);
  console.log(`URL de Destino (Site): \x1b[32m${finalUrl}\x1b[0m`);
  console.log('================================================================\n');

  try {
    // 1. Criar a Campanha de Pesquisa (usando o método REST que contorna restrições regulatórias do gRPC)
    console.log('Passo 1: Criando a nova Campanha de Pesquisa no Google Ads...');
    const campResult = await googleAdsService.createSearchCampaign(
      campaignName,
      budgetDaily,
      activeCid
    );

    const campaignId = campResult.campaignId;
    console.log(`\x1b[32m[System Success] Campanha Criada! ID: ${campaignId}\x1b[0m\n`);

    // 2. Conectar via gRPC para criar o Ad Group e os novos criativos
    const client = getGoogleAdsClient();
    const customer = client.getCustomer(activeCid);

    console.log('Passo 2: Criando o Grupo de Anúncios (Ad Group)...');
    const adGroupName = `Grupo ExtraJus Elite - ${Date.now()}`;
    const adGroupResponse = await customer.adGroups.create([
      {
        name: adGroupName,
        campaign: `customers/${activeCid}/campaigns/${campaignId}`,
        status: 'PAUSED', // Começa pausado por segurança
        type: 'SEARCH_STANDARD',
        cpc_bid_micros: 2.00 * 1000000, // Lance padrão de R$ 2,00 por clique
      }
    ] as any);

    const adGroupResourceName = adGroupResponse.results?.[0]?.resource_name;
    if (!adGroupResourceName) {
      throw new Error('Falha ao resgatar o resource name do Ad Group criado.');
    }
    const adGroupId = adGroupResourceName.split('/').pop() || '';
    console.log(`\x1b[32m[System Success] Grupo de Anúncios Criado! ID: ${adGroupId}\x1b[0m\n`);

    // 3. Criar os novos Criativos de Alta Conversão (Headlines <= 30 chars, Descriptions <= 90 chars)
    console.log('Passo 3: Criando os novos criativos responsivos de alta conversão (Lilith Elite Ads)...');

    const headlines = [
      { text: 'Crie Contratos com IA' },          // 22 chars
      { text: 'Editor de Contratos Premium' },     // 27 chars
      { text: 'Sem Mensalidade ou Taxas' },        // 25 chars
      { text: 'Proteção Jurídica Máxima' },       // 25 chars
      { text: 'Minuta Pronta em 1 Minuto' },       // 26 chars
      { text: 'Evite Processos e Riscos' },        // 24 chars
      { text: 'Crie, Edite e Assine Online' },     // 27 chars
      { text: 'Inteligência Jurídica Elite' },     // 27 chars
    ];

    const descriptions = [
      { text: 'Crie contratos blindados em segundos com nossa inteligência artificial especializada.' }, // 86 chars
      { text: 'Sem advogados lentos ou modelos genéricos. Edite online e baixe em PDF imediatamente.' }, // 86 chars
      { text: 'Proteja seu negócio com cláusulas robustas e análise de risco em tempo real.' },         // 78 chars
      { text: 'Crie, edite e assine minutas com precisão absoluta. Economize tempo e dinheiro.' },      // 79 chars
    ];

    const adGroupAdResponse = await customer.adGroupAds.create([
      {
        ad_group: adGroupResourceName,
        status: 'PAUSED', // Começa pausado por segurança
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
      throw new Error('Falha ao resgatar o resource name do criativo criado.');
    }
    const adGroupAdId = adGroupAdResourceName.split('/').pop() || '';

    console.log('================================================================');
    console.log('🏆 IMPÉRIO EXPANDIDO: CAMPANHA & CRIATIVOS CRIADOS 🏆');
    console.log('================================================================');
    console.log(`ID da Campanha     : \x1b[32m${campaignId}\x1b[0m`);
    console.log(`ID do Grupo (Ads)  : \x1b[32m${adGroupId}\x1b[0m`);
    console.log(`ID do Anúncio (RSA): \x1b[32m${adGroupAdId}\x1b[0m`);
    console.log(`URL do Anúncio     : \x1b[36m${finalUrl}\x1b[0m`);
    console.log('----------------------------------------------------------------');
    console.log('📝 Títulos de Conversão Criados (Headlines):');
    headlines.forEach((h, idx) => console.log(`  ${idx + 1}. \x1b[36m"${h.text}"\x1b[0m`));
    console.log('----------------------------------------------------------------');
    console.log('📝 Descrições Blindadas Criadas (Descriptions):');
    descriptions.forEach((d, idx) => console.log(`  ${idx + 1}. \x1b[33m"${d.text}"\x1b[0m`));
    console.log('----------------------------------------------------------------');
    console.log('\x1b[33mNota: Todo o ecossistema foi criado em modo "PAUSADO" por segurança do seu caixa.\x1b[0m');
    console.log('Acesse o Google Ads ou use o script de toggle para ativar quando estiver pronto para morder o mercado.');
    console.log('================================================================\n');

  } catch (error: any) {
    console.error('\n\x1b[31m[System Error] Falha fatal no fluxo de criação:\x1b[0m');
    if (error && typeof error === 'object') {
      console.error(error.message || error);
      if (error.errors || error.failure) {
        console.error(JSON.stringify(error.errors || error.failure, null, 2));
      }
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

main();
