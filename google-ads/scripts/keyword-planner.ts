import { googleAdsService } from '../src/services/GoogleAdsService';
import { loadConfig } from '../src/config/loader';

async function main() {
  const args = process.argv.slice(2);
  let keywordsInput = 'registro de marca, inpi';
  let customerIdOverride: string | undefined = undefined;

  const kwIndex = args.indexOf('--keywords');
  if (kwIndex !== -1 && args[kwIndex + 1]) {
    keywordsInput = args[kwIndex + 1];
  }

  const cidIndex = args.indexOf('--customerId');
  if (cidIndex !== -1 && args[cidIndex + 1]) {
    customerIdOverride = args[cidIndex + 1];
  }

  const keywords = keywordsInput.split(',').map((k) => k.trim()).filter((k) => k.length > 0);

  const config = loadConfig();
  const activeCid = customerIdOverride || config.customerId;

  console.log('\n================================================================');
  console.log(`🧠 GOOGLE ADS KEYWORD PLANNER - IDEIAS E METRICAS 🧠`);
  console.log(`Conta de Operação   : \x1b[35m${activeCid || 'Nenhuma configurada'}\x1b[0m`);
  console.log(`Palavras Semente    : \x1b[36m${keywords.join(', ')}\x1b[0m`);
  console.log(`Foco Geográfico     : \x1b[32mBrasil (BR)\x1b[0m | Idioma: \x1b[32mPortuguês (PT)\x1b[0m`);
  console.log('================================================================\n');

  try {
    const suggestions = await googleAdsService.getKeywordSuggestions(keywords, customerIdOverride);

    if (suggestions.length === 0) {
      console.log('\x1b[33m[System Info] Nenhuma ideia de palavra-chave sugerida para essa busca.\x1b[0m\n');
      return;
    }

    // Formata a exibição
    const formattedList = suggestions.map((s) => ({
      'Palavra-Chave': s.keyword,
      'Busca Mensal (Avg)': s.avgMonthlySearches,
      Competição: s.competition === 'HIGH' ? '🔴 ALTA' : s.competition === 'MEDIUM' ? '🟡 MÉDIA' : '🟢 BAIXA',
      'CPC Mín Estimado': `R$ ${s.lowBid.toFixed(2)}`,
      'CPC Máx Estimado': `R$ ${s.highBid.toFixed(2)}`,
    }));

    // Ordenado por volume de busca decrescente e exibe apenas top 30 sugestões
    const sorted = formattedList.sort((a, b) => b['Busca Mensal (Avg)'] - a['Busca Mensal (Avg)']).slice(0, 30);

    // Formata as buscas com separador de milhar para exibição limpa na tabela
    const printableList = sorted.map((item) => ({
      ...item,
      'Busca Mensal (Avg)': item['Busca Mensal (Avg)'].toLocaleString(),
    }));

    console.table(printableList);
    console.log(`\n\x1b[32m[System Success] Top ${printableList.length} ideias de palavras-chave ordenadas por volume de buscas registradas!\x1b[0m\n`);

  } catch (error: any) {
    console.error('\n\x1b[31m[System Error] Erro ao tentar consultar o Keyword Planner:\x1b[0m');
    console.error(error.message);
  }
}

main();
