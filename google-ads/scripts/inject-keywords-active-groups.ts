import { getGoogleAdsClient } from '../src/core/GoogleAdsClient';
import { loadConfig } from '../src/config/loader';

async function main() {
  try {
    const config = loadConfig();
    const activeCid = config.customerId.replace(/-/g, '').trim();
    const client = getGoogleAdsClient();
    const customer = client.getCustomer(activeCid);
    const campaignId = '23891691352';

    console.log(`\n--- INJETOR DE PALAVRAS-CHAVE EM GRUPOS ATIVOS ---`);
    console.log(`Campanha Alvo: ${campaignId}\n`);

    // 1. Buscar grupos habilitados
    const query = `SELECT ad_group.id, ad_group.name, ad_group.resource_name FROM ad_group WHERE campaign.id = '${campaignId}' AND ad_group.status = 'ENABLED'`;
    const groups = await customer.query(query);

    if (groups.length === 0) {
      console.log('❌ Nenhum Grupo de Anúncios ATIVO encontrado para esta campanha.');
      console.log('Dica: Verifique se você não excluiu os grupos ou se eles estão pausados.');
      return;
    }

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

    for (const group of groups) {
      if (!group.ad_group) continue;
      
      console.log(`>> Injetando 10 keywords no grupo: [${group.ad_group.name}]`);
      
      const criteria = keywords.map(kw => ({
        ad_group: group.ad_group!.resource_name,
        status: 'ENABLED',
        type: 'KEYWORD',
        keyword: {
          text: kw.text,
          match_type: kw.matchType,
        },
      }));

      try {
        const res = await customer.adGroupCriteria.create(criteria as any);
        console.log(`   ✅ Sucesso: ${res.results.length} palavras-chave adicionadas.`);
      } catch (err: any) {
        console.log(`   ⚠️  Aviso: Falha ao injetar (podem ser duplicadas).`);
      }
    }

    console.log('\n--- Operação Finalizada ---\n');

  } catch (error: any) {
    console.error('\n❌ Erro Crítico:', error.message);
  }
}

main();
