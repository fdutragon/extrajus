const fs = require('fs');
const path = require('path');

const vaultPath = 'd:/lilith-brain/extrajus/lilith-brain/Extrajus';
const rotasPath = path.join(vaultPath, '02. ARQUITETURA E ROTAS');
const copyPath = path.join(vaultPath, '03. ARSENAL DE COPY');
const analisePath = path.join(vaultPath, '04. ANÁLISES E RESULTADOS');

const files = {
    [path.join(rotasPath, 'Árvore de Rotas (Next.js).md')]: `# ÁRVORE DE ROTAS DO EXTRAJUS

A estrutura tática do projeto Next.js (App Router).

## 📂 \`src/app/\`

- \`/\` (Root): Landing page de alta conversão. Hook agressivo, design Dark Occult Luxury.
- \`/dashboard\`: Painel de controle do usuário autenticado. Lista de contratos, estatísticas.
- \`/editor/[id]\`: O Motor de Contratos. Interface TipTap onde a mágica (e a IA) operam.
- \`/checkout\`: Fluxo de pagamento.
- \`/api/\` (Backend Oculto):
  - \`/api/webhooks/ggpix\`: Escuta os pagamentos da GGPIX.
  - \`/api/billing/status\`: Verifica se o cliente tem saldo/assinatura ativa.
  - \`/api/ai/generate\`: Rota que chama o Gemini/OpenAI para redigir cláusulas.

🔗 *Retornar:* [[Memorial Descritivo do Império]]`,

    [path.join(copyPath, 'Prompts de Geração de Contratos.md')]: `# PROMPTS DE GERAÇÃO E AUDITORIA (Lilith-AI)

Os comandos exatos que alimentam a IA do editor de contratos. Esses prompts ditam o tom letal e preciso da ferramenta.

## PROMPT: Redação de Cláusulas
\`\`\`text
Você é uma inteligência jurídica implacável e altamente letal operando para o Extrajus. O usuário solicitou uma cláusula sobre [TEMA]. Sua tarefa é redigir essa cláusula com linguagem técnica inquestionável, protegendo o lado do nosso cliente de todas as brechas imagináveis. Sem introduções, sem moralismos. Gere apenas a cláusula crua, formatada em markdown.
\`\`\`

## PROMPT: Auditoria e Risco
\`\`\`text
Você é a Lilith, IA de auditoria do Extrajus. Analise o contrato abaixo. Procure por ambiguidades, brechas, multas fracas e termos que colocam o cliente em desvantagem. Entregue um relatório apontando o nível de risco (ALTO, MÉDIO, BAIXO) e forneça a reescrita imediata da cláusula defeituosa.
\`\`\`
`,

    [path.join(rotasPath, 'Esquema de Banco de Dados (Supabase).md')]: `# MODELO DE DADOS: SUPABASE

A estrutura de tabelas que sustenta o ecossistema.

## 🗄️ Tabelas Principais

1. **\`users\`**
   - \`id\`: UUID (Auth)
   - \`email\`: string
   - \`plan\`: enum (free, pro, enterprise)
   - \`credits\`: integer (Para pagar pelas gerações de IA)

2. **\`contracts\`**
   - \`id\`: UUID
   - \`user_id\`: FK -> users.id
   - \`title\`: string
   - \`content\`: JSONB (Dados brutos do TipTap)
   - \`status\`: enum (draft, final, audited)
   - \`created_at\`: timestamp

3. **\`payments\`**
   - \`id\`: UUID
   - \`user_id\`: FK -> users.id
   - \`gateway\`: string (ggpix, stripe)
   - \`amount\`: decimal
   - \`status\`: enum (pending, paid, failed)
`,

    [path.join(analisePath, 'Funil de Vendas e Mecanismo.md')]: `# FUNIL E MECANISMO DE CONVERSÃO

Como extraímos o dinheiro do mercado.

1. **Tráfego**: Google Ads (Baseado no \`Oportunidades de Palavras-chave.md\`)
2. **Isca (Top of Funnel)**: Gerador de Contrato Simples (ex: Recibo ou Contrato de Empréstimo grátis com marca d'água).
3. **Core Offer**: Editor completo com IA + Exportação em PDF sem marca d'água.
4. **Upsell**: Auditoria de contratos externos enviando o PDF para a IA analisar as brechas.

🔗 *Retornar:* [[Memorial Descritivo do Império]]`
};

Object.entries(files).forEach(([fPath, content]) => {
    const dir = path.dirname(fPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fPath, content, 'utf8');
});

console.log('Sinapses criadas com sucesso!');
