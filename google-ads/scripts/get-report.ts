import { googleAdsService } from '../src/services/GoogleAdsService';
import { loadConfig } from '../src/config/loader';

function formatDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

async function main() {
  const args = process.argv.slice(2);

  // Parsing de argumentos
  let days = 7;
  const daysIndex = args.indexOf('--days');
  if (daysIndex !== -1 && args[daysIndex + 1]) {
    days = parseInt(args[daysIndex + 1], 10);
  }

  let startDateStr = '';
  let endDateStr = '';

  const startIdx = args.indexOf('--startDate');
  if (startIdx !== -1 && args[startIdx + 1]) {
    startDateStr = args[startIdx + 1];
  }

  const endIdx = args.indexOf('--endDate');
  if (endIdx !== -1 && args[endIdx + 1]) {
    endDateStr = args[endIdx + 1];
  }

  let customerIdOverride: string | undefined = undefined;
  const cidIndex = args.indexOf('--customerId');
  if (cidIndex !== -1 && args[cidIndex + 1]) {
    customerIdOverride = args[cidIndex + 1];
  }

  // Se datas personalizadas não foram passadas, calcula com base nos dias
  if (!startDateStr || !endDateStr) {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - days);

    startDateStr = formatDate(pastDate);
    endDateStr = formatDate(today); // Inclui o dia de hoje
  }

  const config = loadConfig();
  const activeCid = customerIdOverride || config.customerId;

  console.log('\n================================================================');
  console.log(`📊 ADS REPORT SYSTEM - PERFORMANCE DO GOOGLE ADS 📊`);
  console.log(`Conta Operada: \x1b[35m${activeCid || 'Nenhuma configurada'}\x1b[0m`);
  console.log(`Período de Análise: \x1b[36m${startDateStr}\x1b[0m até \x1b[36m${endDateStr}\x1b[0m`);
  console.log('================================================================\n');

  try {
    const metrics = await googleAdsService.getPerformanceReport(
      startDateStr,
      endDateStr,
      customerIdOverride
    );

    if (metrics.length === 0) {
      console.log('\x1b[33m[System Info] Nenhuma métrica ou campanha registrada no período solicitado.\x1b[0m\n');
      return;
    }

    // Formatar os dados para exibição estilizada na tabela
    let totalCost = 0;
    let totalClicks = 0;
    let totalImpressions = 0;
    let totalConversions = 0;
    let totalValue = 0;

    const formattedMetrics = metrics.map((m) => {
      totalCost += m.cost;
      totalClicks += m.clicks;
      totalImpressions += m.impressions;
      totalConversions += m.conversions;
      totalValue += m.conversionsValue;

      return {
        ID: m.id,
        Campanha: m.name,
        Status: m.status === 'ENABLED' ? '🟢' : '🔴',
        Impressões: m.impressions.toLocaleString(),
        Cliques: m.clicks.toLocaleString(),
        'CTR (%)': `${m.ctr.toFixed(2)}%`,
        'Custo (R$)': `R$ ${m.cost.toFixed(2)}`,
        'CPC Médio': `R$ ${m.averageCpc.toFixed(2)}`,
        Conversões: m.conversions.toLocaleString(),
        'Valor Conv. (R$)': `R$ ${m.conversionsValue.toFixed(2)}`,
        'ROAS (x)': m.roas > 0 ? `${m.roas.toFixed(2)}x` : '0.00x',
      };
    });

    console.table(formattedMetrics);

    // Sumário Financeiro consolidado
    const averageCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const averageCpc = totalClicks > 0 ? totalCost / totalClicks : 0;
    const averageRoas = totalCost > 0 ? totalValue / totalCost : 0;

    console.log('\n================================================================');
    console.log('💰 SUMÁRIO CONSOLIDADO DE PERFORMANCE 💰');
    console.log('================================================================');
    console.log(`Impressões Totais  : \x1b[37m${totalImpressions.toLocaleString()}\x1b[0m`);
    console.log(`Cliques Totais     : \x1b[37m${totalClicks.toLocaleString()}\x1b[0m`);
    console.log(`CTR Médio Geral    : \x1b[36m${averageCtr.toFixed(2)}%\x1b[0m`);
    console.log(`Investimento Total : \x1b[31mR$ ${totalCost.toFixed(2)}\x1b[0m`);
    console.log(`CPC Médio Geral    : \x1b[33mR$ ${averageCpc.toFixed(2)}\x1b[0m`);
    console.log(`Conversões Totais  : \x1b[32m${totalConversions.toLocaleString()}\x1b[0m`);
    console.log(`Retorno Bruto (R$) : \x1b[32mR$ ${totalValue.toFixed(2)}\x1b[0m`);
    console.log(`ROAS Consolidado   : \x1b[35m${averageRoas.toFixed(2)}x\x1b[0m`);
    console.log('================================================================\n');

  } catch (error: any) {
    console.error('\n\x1b[31m[System Error] Erro ao tentar calcular métricas:\x1b[0m');
    console.error(error.message);
    console.log('\nVerifique as datas inseridas e garanta que sua conta possui histórico de tráfego.');
  }
}

main();
