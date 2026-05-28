import { googleAdsService } from '../src/services/GoogleAdsService';
import { getGoogleAdsClient } from '../src/core/GoogleAdsClient';
import { loadConfig } from '../src/config/loader';

async function main() {
  const args = process.argv.slice(2);
  let campaignName = 'Teste Comunicacao Formal ' + Date.now();
  let budgetDaily = 50.0;
  let finalUrl = 'https://extrajus.com.br/'; // Usando a root URL para evitar DESTINATION_NOT_WORKING

  const config = loadConfig();
  const activeCid = config.customerId.replace(/-/g, '').trim();

  console.log('\n================================================================');
  console.log(`🤖 ADS TEST - NOVA TENTATIVA SEM TERMOS SENSÍVEIS 🤖`);
  console.log(`Conta de Operação   : \x1b[35m${activeCid}\x1b[0m`);
  console.log(`Nome da Campanha    : \x1b[36m"${campaignName}"\x1b[0m`);
  console.log(`URL de Destino      : \x1b[32m${finalUrl}\x1b[0m`);
  console.log('================================================================\n');

  try {
    // 1. Criar a Campanha
    console.log('Passo 1: Criando a nova Campanha...');
    const campResult = await googleAdsService.createSearchCampaign(
      campaignName,
      budgetDaily,
      activeCid
    );

    const campaignId = campResult.campaignId;
    console.log(`\x1b[32m[Sucesso] Campanha Criada! ID: ${campaignId}\x1b[0m\n`);

    // 2. Ad Group
    const client = getGoogleAdsClient();
    const customer = client.getCustomer(activeCid);

    console.log('Passo 2: Criando o Grupo de Anúncios...');
    const adGroupName = `Grupo Teste - ${Date.now()}`;
    const adGroupResponse = await customer.adGroups.create([
      {
        name: adGroupName,
        campaign: `customers/${activeCid}/campaigns/${campaignId}`,
        status: 'PAUSED',
        type: 'SEARCH_STANDARD',
        cpc_bid_micros: 2.00 * 1000000,
      }
    ] as any);

    const adGroupResourceName = adGroupResponse.results?.[0]?.resource_name;
    if (!adGroupResourceName) {
      throw new Error('Falha ao obter o resource name do Grupo de Anúncios.');
    }
    const adGroupId = adGroupResourceName.split('/').pop() || '';
    console.log(`\x1b[32m[Sucesso] Grupo de Anúncios Criado! ID: ${adGroupId}\x1b[0m\n`);

    // 3. Criativos com termos GENÉRICOS e SEGUROS
    console.log('Passo 3: Criando criativos com termos genéricos...');

    const headlines = [
      { text: 'Editor de Documentos Online' },
      { text: 'Crie Documentos Formais' },
      { text: 'Plataforma de Redação Ágil' },
      { text: 'Sua Comunicação Inteligente' },
      { text: 'Documentos Prontos na Hora' },
      { text: 'Edição de Textos Profissionais' },
      { text: 'Redija com Facilidade' },
      { text: 'ExtraJus: Agilidade Digital' },
    ];

    const descriptions = [
      { text: 'Crie e edite seus documentos formais com agilidade e inteligência na nossa plataforma.' },
      { text: 'Uma ferramenta completa para organizar sua comunicação de forma simples e rápida.' },
      { text: 'Redija textos profissionais em poucos cliques. Simples, intuitivo e muito eficiente.' },
      { text: 'Otimize sua rotina de criação de documentos com nossa tecnologia de redação ágil.' },
    ];

    await customer.adGroupAds.create([
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

    console.log('\x1b[32m🏆 CAMPANHA DE TESTE CRIADA COM SUCESSO 🏆\x1b[0m');
    console.log('================================================================');
  } catch (error: any) {
    console.error('\n\x1b[31m[Erro] Falha na criação do teste:\x1b[0m');
    console.error(error.message || error);
    if (error.errors || error.failure) {
      console.error(JSON.stringify(error.errors || error.failure, null, 2));
    }
  }
}

main();
