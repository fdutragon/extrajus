// Nota de importação: o tsconfig está na raiz e configurado para resolver caminhos relativos
import { runTokenGenerator as run } from '../src/auth/token-generator';

console.log('\x1b[35m[System] Disparando fluxo de autenticação automatizada...\x1b[0m');
run().catch((err) => {
  console.error('[System Error] Falha geral ao executar o gerador de chaves:', err);
  process.exit(1);
});
