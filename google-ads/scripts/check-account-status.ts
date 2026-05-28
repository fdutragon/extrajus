import { getGoogleAdsClient } from '../src/core/GoogleAdsClient';
import { loadConfig } from '../src/config/loader';

async function main() {
  const args = process.argv.slice(2);
  let customerIdOverride: string | undefined = undefined;

  const cidIndex = args.indexOf('--customerId');
  if (cidIndex !== -1 && args[cidIndex + 1]) {
    customerIdOverride = args[cidIndex + 1].trim();
  }

  const config = loadConfig();
  const activeCid = (customerIdOverride || config.customerId).replace(/-/g, '').trim();

  console.log('\n================================================================');
  console.log(`🛡️ ADS AUDITOR - CHECANDO STATUS DE BLOQUEIO DE CONTA 🛡️`);
  console.log(`Conta sob Auditoria : \x1b[35m${activeCid}\x1b[0m`);
  console.log('================================================================\n');

  try {
    const client = getGoogleAdsClient();
    const customer = client.getCustomer(activeCid);

    // Consulta os campos de status, suspensão e detalhes da conta do cliente
    const query = `
      SELECT 
        customer.id, 
        customer.descriptive_name, 
        customer.status, 
        customer.manager, 
        customer.test_account,
        customer.currency_code,
        customer.time_zone
      FROM customer
      LIMIT 1
    `;

    console.log('Enviando requisição profunda de metadados para os servidores do Google...');
    const rows = await customer.query(query);

    if (rows.length === 0) {
      console.log('\x1b[31m[System Error] Nenhum metadado de conta retornado.\x1b[0m\n');
      return;
    }

    const account = rows[0].customer;
    
    // Mapeamento de Status
    // Protobuf enums: 0 (UNSPECIFIED), 1 (UNKNOWN), 2 (ENABLED), 3 (CLOSED), 4 (SUSPENDED)
    const statusMap: { [key: number]: string } = {
      2: '🟢 ATIVA / OPERACIONAL (ENABLED)',
      3: '🔴 FECHADA / CANCELADA (CLOSED)',
      4: '🚫 SUSPENSA / BLOQUEADA (SUSPENDED)'
    };

    const statusLabel = statusMap[account.status] || `⚪ OUTRO (${account.status})`;

    console.log('================================================================');
    console.log('🏆 DIAGNÓSTICO DE STATUS DE CONTA 🏆');
    console.log('================================================================');
    console.log(`ID da Conta       : \x1b[32m${account.id}\x1b[0m`);
    console.log(`Nome da Conta     : \x1b[37m"${account.descriptive_name || 'Sem nome descriptivo'}"\x1b[0m`);
    console.log(`Status de Entrega : \x1b[36m${statusLabel}\x1b[0m`);
    console.log(`Tipo da Conta     : ${account.manager ? '💼 MCC (Administradora)' : '👤 Conta de Anúncios Individual'}`);
    console.log(`Conta de Testes?  : ${account.test_account ? '⚠️ SIM (Sem cobrança real)' : '✅ NÃO (Conta de Produção Real)'}`);
    console.log(`Moeda da Conta    : \x1b[33m${account.currency_code || 'BRL'}\x1b[0m`);
    console.log(`Fuso Horário      : ${account.time_zone || 'America/Sao_Paulo'}`);
    console.log('================================================================\n');

    if (account.status === 4) {
      console.log('\x1b[31m[ATENÇÃO] A conta consta como SUSPENSA no banco de dados do Google Ads!\x1b[0m');
      console.log('Isso explica o e-mail recebido. Verifique os alertas vermelhos de pagamento ou verificação de identidade no painel.\n');
    } else {
      console.log('\x1b[32m[SUCESSO] Nenhuma suspensão ativa detectada nesta conta via API de Anúncios!\x1b[0m');
      console.log('A conta está sinalizada como habilitada (ENABLED). Se houve e-mail de bloqueio, pode ser phishing ou delay da interface web.\n');
    }

  } catch (error: any) {
    console.error('\n\x1b[31m[System Error] Falha crítica ao auditar status da conta:\x1b[0m');
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
