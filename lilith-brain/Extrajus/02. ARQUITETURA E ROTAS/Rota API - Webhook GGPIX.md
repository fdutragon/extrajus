# ROTA: `/api/webhooks/ggpix`

A Sentinela de Pagamentos.

## Objetivo
Ouvir em silêncio até o GGPIX gritar que o dinheiro caiu.

## Funcionalidades Chave
- **Recepção**: POST do GGPIX confirmando pagamento.
- **Segurança**: Validação do `GGPIX_WEBHOOK_SECRET`.
- **Ação**: Atualiza a tabela `payments` para `paid` e injeta os `credits` correspondentes na conta do usuário no Supabase.

🔗 *Voltar para:* [[Árvore de Rotas (Next.js)]]