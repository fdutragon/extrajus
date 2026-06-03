const fs = require('fs');
const path = require('path');

const vaultPath = 'd:/lilith-brain/extrajus/lilith-brain/Extrajus';
const rotasPath = path.join(vaultPath, '02. ARQUITETURA E ROTAS');

if (!fs.existsSync(rotasPath)) {
    fs.mkdirSync(rotasPath, { recursive: true });
}

const files = {
    'Rota - Landing Page (Root).md': `# ROTA: \`/\` (Landing Page)

A página inicial do Império Extrajus.

## Objetivo
Conversão pura e bruta. A primeira impressão dita o ritmo: design Dark Occult Luxury, copys agressivos e uma promessa clara.

## Funcionalidades Chave
- **Hook Principal**: Demonstração de contratos gerados com IA.
- **Botão de Ação (CTA)**: Leva o usuário direto para o funil de criação gratuita (Isca) ou para criar conta.
- **Prova Social**: Estatísticas de contratos analisados e salvos (dados do Supabase).

🔗 *Voltar para:* [[Árvore de Rotas (Next.js)]]`,

    'Rota - Dashboard.md': `# ROTA: \`/dashboard\`

O Centro de Comando do Usuário.

## Objetivo
Onde o cliente vê o que ele controla e quanto poder (créditos) ele ainda tem.

## Funcionalidades Chave
- **Lista de Contratos**: Tabela de todos os contratos gerados, rascunhos e finalizados. (Busca na tabela \`contracts\`).
- **Gestão de Créditos**: Saldo atual do usuário (tabela \`users.credits\`).
- **Botão Novo Contrato**: Dispara a criação de uma linha no banco de dados e redireciona para \`/editor/[id]\`.

🔗 *Voltar para:* [[Árvore de Rotas (Next.js)]]`,

    'Rota - Editor de Contratos.md': `# ROTA: \`/editor/[id]\`

O Motor Principal. O Campo de Guerra.

## Objetivo
Permitir a edição fluida, redação automática e exportação do documento legal.

## Funcionalidades Chave
- **TipTap Core**: Editor WYSIWYG configurado para parecer um documento oficial.
- **Painel da Lilith (IA)**: Barra lateral onde o usuário pede para "reescrever", "blindar", ou "auditar". Dispara chamadas para \`/api/ai/generate\`.
- **Autosave**: Sincronização constante com a tabela \`contracts\` do Supabase.
- **Exportação**: Geração do PDF final. Se o usuário for \`free\`, injeta marca d'água. Se \`pro\`, PDF limpo.

🔗 *Voltar para:* [[Árvore de Rotas (Next.js)]]`,

    'Rota - Checkout.md': `# ROTA: \`/checkout\`

A ponte para a monetização. 

## Objetivo
Facilitar ao máximo a conversão para planos pagos ou compra de avulsos.

## Funcionalidades Chave
- **Integração Front-end**: Componentes \`checkout-modal.tsx\` acionados quando os créditos acabam.
- **GGPIX**: Exibição do QR Code dinâmico gerado pelo backend.
- **Verificação de Status**: Fica realizando chamadas (polling) para \`/api/billing/status\` para desbloquear a tela assim que o PIX bater.

🔗 *Voltar para:* [[Árvore de Rotas (Next.js)]]`,

    'Rota API - Webhook GGPIX.md': `# ROTA: \`/api/webhooks/ggpix\`

A Sentinela de Pagamentos.

## Objetivo
Ouvir em silêncio até o GGPIX gritar que o dinheiro caiu.

## Funcionalidades Chave
- **Recepção**: POST do GGPIX confirmando pagamento.
- **Segurança**: Validação do \`GGPIX_WEBHOOK_SECRET\`.
- **Ação**: Atualiza a tabela \`payments\` para \`paid\` e injeta os \`credits\` correspondentes na conta do usuário no Supabase.

🔗 *Voltar para:* [[Árvore de Rotas (Next.js)]]`,

    'Rota API - Billing Status.md': `# ROTA: \`/api/billing/status\`

O Validador de Fluxo.

## Objetivo
Informar ao front-end se o cliente já pagou para ele poder continuar operando.

## Funcionalidades Chave
- **Consulta Rápida**: Recebe um ID de pagamento ou de usuário e checa a tabela \`payments\`/\`users\`.
- **Retorno**: JSON simples \`{ "status": "paid", "credits": 50 }\`. Utilizado pesadamente pela rota de Checkout para destravar o UI imediatamente pós-pagamento.

🔗 *Voltar para:* [[Árvore de Rotas (Next.js)]]`,

    'Rota API - AI Generate.md': `# ROTA: \`/api/ai/generate\`

A Mente da Máquina.

## Objetivo
Comunicar com os LLMs (Gemini/OpenAI) sob os preceitos e prompts da Lilith.

## Funcionalidades Chave
- **Barreira Financeira**: Antes de rodar, checa se \`users.credits > 0\`. Se sim, subtrai 1. Se não, retorna erro 402 Payment Required (Aciona Checkout).
- **Injeção de Prompts**: Combina a entrada do usuário com o [[Prompts de Geração de Contratos]] (Blindagem, Auditoria).
- **Streaming**: Pode retornar dados via Server-Sent Events (SSE) para o TipTap ir digitando como se fosse um humano rápido.

🔗 *Voltar para:* [[Árvore de Rotas (Next.js)]]`
};

const masterRouteNode = `# ÁRVORE DE ROTAS DO EXTRAJUS

A estrutura tática do projeto Next.js (App Router).

## 📂 \`src/app/\`

- \`/\` (Root): [[Rota - Landing Page (Root)]]
- \`/dashboard\`: [[Rota - Dashboard]]
- \`/editor/[id]\`: [[Rota - Editor de Contratos]]
- \`/checkout\`: [[Rota - Checkout]]

## 📂 \`/api/\` (Backend Oculto)

- \`/api/webhooks/ggpix\`: [[Rota API - Webhook GGPIX]]
- \`/api/billing/status\`: [[Rota API - Billing Status]]
- \`/api/ai/generate\`: [[Rota API - AI Generate]]

🔗 *Retornar:* [[Memorial Descritivo do Império]]`;

Object.entries(files).forEach(([filename, content]) => {
    fs.writeFileSync(path.join(rotasPath, filename), content, 'utf8');
});

fs.writeFileSync(path.join(rotasPath, 'Árvore de Rotas (Next.js).md'), masterRouteNode, 'utf8');

console.log('Sinapses de rotas detalhadas criadas com sucesso!');
