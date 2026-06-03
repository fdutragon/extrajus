# ROTA: `/checkout`

A ponte para a monetização. 

## Objetivo
Facilitar ao máximo a conversão para planos pagos ou compra de avulsos.

## Funcionalidades Chave
- **Integração Front-end**: Componentes `checkout-modal.tsx` acionados quando os créditos acabam.
- **GGPIX**: Exibição do QR Code dinâmico gerado pelo backend.
- **Verificação de Status**: Fica realizando chamadas (polling) para `/api/billing/status` para desbloquear a tela assim que o PIX bater.

🔗 *Voltar para:* [[Árvore de Rotas (Next.js)]]