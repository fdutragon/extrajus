# ROTA: `/api/billing/status`

O Validador de Fluxo.

## Objetivo
Informar ao front-end se o cliente já pagou para ele poder continuar operando.

## Funcionalidades Chave
- **Consulta Rápida**: Recebe um ID de pagamento ou de usuário e checa a tabela `payments`/`users`.
- **Retorno**: JSON simples `{ "status": "paid", "credits": 50 }`. Utilizado pesadamente pela rota de Checkout para destravar o UI imediatamente pós-pagamento.

🔗 *Voltar para:* [[Árvore de Rotas (Next.js)]]