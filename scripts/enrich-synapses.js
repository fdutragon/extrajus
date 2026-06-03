const fs = require('fs');
const path = require('path');

const vaultPath = 'd:/lilith-brain/extrajus/lilith-brain/Extrajus';

// We map relative paths to their enriched content.
const enrichedContent = {
    // NÚCLEO
    '00. NÚCLEO CENTRAL.md': `# NÚCLEO CENTRAL DA LILITH

A base de controle do Império. Este não é um mero repositório de anotações; é o cérebro operacional onde arquitetura, tráfego e monetização colidem. A partir deste nó absoluto, você tem visão panóptica sobre todas as dimensões da máquina de conversão do Extrajus.

## 🧭 O MAPA ABSOLUTO
- [[Memorial Descritivo do Império]]: A espinha dorsal. Arquitetura técnica, árvore de rotas, banco de dados, motor de contratos (TipTap) e as pontes de checkout. O coração que bate no ritmo do faturamento.

## 📊 TRÁFEGO E RESULTADOS (ZONA DE COMBATE)
- [[Relatório Automático de Campanhas]]: Visão implacável em tempo real do Google Ads. Saiba exatamente onde o dinheiro está sendo queimado e onde está retornando.
- [[Oportunidades de Palavras-chave]]: A mente do mercado exposta. Termos de busca com alto volume, aguardando captura.
- [[Sugestões de Copy e Campanhas]]: Ganchos venenosos e copies desenhados para extrair o máximo de conversão dos leads capturados pela isca.

## 💀 ARSENAL TÁTICO
- [[Arsenal Tecnológico]]: O catálogo das nossas armas de código (Next.js, Supabase, Tailwind, TipTap).
- [[Prompts de Geração de Contratos]]: A cartilha de doutrinação da Inteligência Artificial. Como a Lilith pensa e age ao redigir cláusulas.`,

    // ARQUITETURA E ROTAS
    '02. ARQUITETURA E ROTAS/Memorial Descritivo do Império.md': `# MEMORIAL DESCRITIVO: O IMPÉRIO EXTRAJUS

Este é o mapa central da dominação do Extrajus, a máquina de guerra estruturada para friction zero e faturamento implacável. Aqui reside a planta arquitetônica de todo o ecossistema tecnológico, desenhada sem brechas para a mediocridade.

## SINAPSES DA ARQUITETURA
- [[Árvore de Rotas (Next.js)]]: O esqueleto estratégico de navegação e as veias de API do projeto.
- [[Arsenal Tecnológico]]: O catálogo letal das tecnologias empregadas.
- [[Esquema de Banco de Dados (Supabase)]]: A espinha dorsal de dados, usuários e capital.
- [[Funil de Vendas e Mecanismo]]: A física da conversão. Do primeiro clique até o dinheiro no cofre.
- [[Prompts de Geração de Contratos]]: As amarras de inteligência da Lilith (Redação, Blindagem e Auditoria).
- [[Inteligência e Tráfego]]: A documentação da nossa dominação do território do Google Ads.

## RELATÓRIOS VIVOS (Alimentados pelo Sistema)
- [[Relatório Automático de Campanhas]]: Sangue do Google Ads atualizado em tempo real.
- [[Oportunidades de Palavras-chave]]: Termos de busca mapeados e expostos.

## FUNDAMENTOS DO PROJETO
- [[A Estética do Caos]]: A identidade psicológica, UI dark occult luxury e agressividade visual.
- [[Motor de Contratos (TipTap)]]: O reator nuclear operacional que gera os PDFs.
- [[Máquina de Conversão (Checkout)]]: Como o capital é processado sem engasgos.
- [[Supabase e Backend]]: Segurança em nível militar, garantindo a solidez dos dados.`,

    '02. ARQUITETURA E ROTAS/Árvore de Rotas (Next.js).md': `# ÁRVORE DE ROTAS DO EXTRAJUS

A estrutura tática e inflexível do projeto Next.js (App Router). Cada rota foi desenhada com um objetivo letal. Não há espaço para páginas irrelevantes ou perda de tempo de carregamento.

## 📂 \`src/app/\` (Interface de Frente de Batalha)

- \`/\` (Root): [[Rota - Landing Page (Root)]] - Alta conversão, promessa clara.
- \`/dashboard\`: [[Rota - Dashboard]] - O painel de controle de créditos e império pessoal do usuário.
- \`/editor/[id]\`: [[Rota - Editor de Contratos]] - O Motor de TipTap acoplado à Inteligência Artificial.
- \`/checkout\`: [[Rota - Checkout]] - A barreira pagável e o canal de fluxo de caixa (GGPIX).

## 📂 \`/api/\` (Backend Oculto e Frio)

- \`/api/webhooks/ggpix\`: [[Rota API - Webhook GGPIX]] - Recebimento de callbacks de PIX.
- \`/api/billing/status\`: [[Rota API - Billing Status]] - Verificação ultra-rápida de desbloqueio de conta.
- \`/api/ai/generate\`: [[Rota API - AI Generate]] - Gateway impiedoso para a geração e auditoria de texto via LLM.

🔗 *Retornar ao núcleo:* [[Memorial Descritivo do Império]]`,

    '02. ARQUITETURA E ROTAS/A Estética do Caos.md': `# A ESTÉTICA DO CAOS (Visual & Identidade)

O Extrajus renega interfaces amigáveis, cantos extremamente arredondados e cores pastéis de startups convencionais. O design obedece rigorosamente à estética **Dark Occult Luxury**.

## O NÚCLEO ESTÉTICO
- **Paleta de Cores Absoluta**: Fundos negros como o vácuo (\`zinc-950\`), textos de alto contraste e realces em Ouro Místico ou Néon Denso.
- **Micro-interações Sádicas**: Cada clique e hover deve ter transições fluídas e elegantes que transmitam uma sensação de poder e controle.
- **Shadcn UI + Tailwind**: Construção modular brutalista. Sem poluição no DOM. Cada classe tem uma função cirúrgica.
- **Tipografia Letal**: Fontes precisas (como Inter ou Geist) para uma leiturabilidade que não cansa, mas impõe autoridade.

🔗 *Retornar ao núcleo:* [[Memorial Descritivo do Império]]`,

    '02. ARQUITETURA E ROTAS/Esquema de Banco de Dados (Supabase).md': `# MODELO DE DADOS: SUPABASE

A fundação inabalável de armazenamento e regras (RLS). A premissa é segurança máxima; nenhum dado vaza.

## 🗄️ ESTRUTURA PRIMÁRIA (PostgreSQL)

### 1. Tabela \`users\`
- \`id\` (UUID): Chave primária ligada diretamente ao auth do Supabase.
- \`email\` (String): Para disparo implacável de webhooks via Resend.
- \`plan\` (Enum): \`free\`, \`pro\`, \`enterprise\`. Determina o nível de acesso à IA.
- \`credits\` (Integer): O combustível. A IA cobra por execução. O PIX injeta crédito.
- \`created_at\` (Timestamp).

### 2. Tabela \`contracts\`
- \`id\` (UUID): O registro do documento.
- \`user_id\` (UUID): Chave estrangeira, protegido por RLS (Row Level Security).
- \`title\` (String): O nome da peça.
- \`content\` (JSONB): O estado puro do TipTap, salvo sem perdas ou corrupção de tags HTML.
- \`status\` (Enum): \`draft\`, \`audited\`, \`final\`.

### 3. Tabela \`payments\`
- \`id\` (UUID): Identificador único da transação.
- \`user_id\` (UUID): Quem gerou a cobrança.
- \`gateway_id\` (String): O ID externo gerado pela GGPIX.
- \`amount\` (Decimal): Volume faturado.
- \`status\` (Enum): \`pending\`, \`paid\`, \`failed\`. O gatilho para o webhook atuar.

🔗 *Retornar:* [[Memorial Descritivo do Império]]`,

    '02. ARQUITETURA E ROTAS/Rota - Landing Page (Root).md': `# ROTA: \`/\` (Landing Page)

A Vitrine do Caos. Aqui, não pedimos por favor; provamos que somos a única escolha viável.

## OBJETIVOS TÁTICOS
- **Taxa de Conversão Letal**: Cada elemento (herói, prova social, CTAs) é posicionado via mapas de calor e hierarquia visual para arrastar o lead.
- **A Promessa**: "Proteja seus ativos. Gere contratos invioláveis com IA."

## FUNCIONALIDADES E ENGENHARIA
- **Hook Animado**: Interação de interface mostrando o TipTap operando sozinho, gerando cláusulas blindadas.
- **Gatekeeper**: Dois caminhos absolutos: "Acessar Motor" (Login) ou "Gerar Contrato Básico" (Isca para Top of Funnel).

🔗 *Voltar para:* [[Árvore de Rotas (Next.js)]]`,

    '02. ARQUITETURA E ROTAS/Rota - Editor de Contratos.md': `# ROTA: \`/editor/[id]\`

O Campo de Sangue. A interface onde o usuário trabalha, constrói e audita.

## OBJETIVOS TÁTICOS
- **Imersão Total**: Interface estilo IDE/Documento. Modos minimalistas de foco absoluto. Sem distrações.

## FUNCIONALIDADES E ENGENHARIA
- **Núcleo TipTap**: A superfície de edição que sincroniza o JSONB silenciosamente com o Supabase.
- **Painel da Lilith**: Uma aba ou modal flutuante. O usuário seleciona um parágrafo falho e aciona a Lilith. O sistema consome 1 crédito e cospe uma cláusula blindada e impiedosa através da \`/api/ai/generate\`.
- **Botão de Guerra (Exportar)**: Conversão client-side para PDF através de bibliotecas eficientes (html2pdf ou react-pdf), garantindo que a estrutura visual seja perfeita para assinatura.

🔗 *Voltar para:* [[Árvore de Rotas (Next.js)]]`,

    // ARSENAL DE COPY
    '03. ARSENAL DE COPY/Prompts de Geração de Contratos.md': `# PROMPTS DE GERAÇÃO E AUDITORIA (Lilith-AI)

Aqui jaz a doutrina da inteligência artificial. Os comandos abaixo são passados como *System Instructions* para forçar a IA a agir de maneira letal, fria e absolutamente técnica. O tom "ajudante amigável" foi executado a tiro.

## PROMPT 01: A REDAÇÃO IMPLACÁVEL (Criação de Cláusula)
\`\`\`text
Você é uma entidade jurídica predatória operando no núcleo do Extrajus. O usuário exigirá uma cláusula sobre [TEMA/SITUAÇÃO].
Sua tarefa é redigir uma cláusula blindada, usando linguagem técnica, impositiva e focada em aniquilar qualquer brecha de interpretação adversa.
Regras Absolutas:
1. Sem saudações. Sem encerramentos. Sem explicações morais.
2. Defenda o emissor do contrato como se a vida dependesse disso.
3. Se houver multas, elas devem ser severas, porém legais e executáveis.
Gere exclusivamente a redação da cláusula em markdown, pronta para ser injetada.
\`\`\`

## PROMPT 02: A AUDITORIA SÁDICA (Análise de Risco)
\`\`\`text
Você é a Lilith, motor de auditoria de risco do Extrajus. 
Analise a cláusula ou contrato fornecido. O foco é destruir qualquer ingenuidade.
Procure por: ambiguidades, prazos abertos, multas fracas, falta de fórum eleito ou condições que coloquem nosso cliente em submissão.
Formato de Entrega:
[NÍVEL DE RISCO]: (BAIXO, MÉDIO, ALTO, LETAL)
[ANÁLISE FRIA]: Apontamento cirúrgico de onde está a brecha.
[REDAÇÃO BLINDADA]: A mesma cláusula, reescrita de forma a inverter o poder a favor do nosso cliente.
\`\`\`

🔗 *Retornar ao núcleo:* [[Memorial Descritivo do Império]]`,

    // ANÁLISES E RESULTADOS
    '04. ANÁLISES E RESULTADOS/Funil de Vendas e Mecanismo.md': `# FUNIL DE VENDAS E MECANISMO DE CONVERSÃO

Como extraímos o dinheiro do mercado. Um sistema desenhado para escalar faturamento.

## A ARQUITETURA DA CONVERSÃO

### 1. ZONA DE CAPTURA (Tráfego Frio)
- **Origem**: Google Ads (baseado nos relatórios de [[Oportunidades de Palavras-chave]]).
- **Gatilho Mental**: Medo (de tomar calote, de perder bens, de assinar algo perigoso).

### 2. A ISCA SANGRENTA (Top of Funnel)
- Oferecemos um contrato básico (ex: recibo, comodato leve).
- **Fricção Zero**: O lead gera o documento e exporta em PDF. O arquivo vai com marca d'água robusta do Extrajus e um aviso de "Documento não auditado por IA".

### 3. O CORE OFFER (O Golpe)
- O usuário percebe a limitação e o risco.
- **A Oferta**: Assinar o plano mensal (ou pagar créditos avulsos via PIX) para desbloquear a edição limpa e, principalmente, ligar a motor da Inteligência Artificial (Lilith) para blindar seu documento de verdade.

### 4. A BARREIRA DO CHECKOUT
- O cliente clica em "Auditar Cláusula". Se o saldo é 0, o sistema intercepta de forma instantânea exibindo o Modal de Checkout com o QR Code GGPIX. A promessa é clara: Pague e a análise continua em 10 segundos.

🔗 *Retornar:* [[Memorial Descritivo do Império]]`,

    // CAMPANHAS E SUGESTÕES
    '05. CAMPANHAS E SUGESTÕES/Sugestões de Copy e Campanhas.md': `# SUGESTÕES DE COPY E CAMPANHAS (Google Ads)

Baseado no volume letal extraído diretamente das buscas reais no Brasil, mapeamos ângulos de ataque cruéis e focados em extrair a conversão pela dor e necessidade imediata.

## 🎯 ALVO 1: CONTRATO DE ALUGUEL (40.500 Buscas)
A dor absoluta do proprietário: O inquilino caloteiro que destrói a casa e se recusa a sair amparado por brechas na lei.

**Anúncios (Copy Tática):**
- *Título 1:* Contrato de Aluguel à Prova de Calote.
- *Título 2:* Gere seu Contrato de Aluguel em 2 Minutos.
- *Descrição:* O Google está cheio de modelos fracos. Blinde seu imóvel com um contrato redigido por Inteligência Artificial focado em expulsar caloteiros. Exporte agora em PDF.

**Isca Tática:** Contrato Residencial com marca d'água.

---

## 🎯 ALVO 2: COMPRA E VENDA (18.100 Buscas)
A dor absoluta do vendedor/comprador: Fraude documental e estelionato de veículos e imóveis. O alto ticket causa pânico.

**Anúncios (Copy Tática):**
- *Título 1:* Contrato de Compra e Venda Inviolável.
- *Título 2:* Vai Vender um Imóvel ou Veículo? Cuidado.
- *Descrição:* Não feche negócio sem um documento validado. Nossa IA escreve um contrato que protege seu dinheiro e garante o tribunal ao seu lado.

**Isca Tática:** Promessa de compra e venda engessada.

---

## 🎯 ALVO 3: PRESTAÇÃO DE SERVIÇOS (14.800 Buscas)
A dor absoluta do autônomo e agências: Trabalhar, entregar o serviço e não receber. Refações infinitas e escopo não respeitado.

**Anúncios (Copy Tática):**
- *Título 1:* Pare de Trabalhar Sem Contrato.
- *Título 2:* Contrato de Serviços Seguro (Geração Rápida).
- *Descrição:* Proteja as suas horas. Exija o pagamento e blinde seu escopo. Contrato gerado por IA com cláusulas anti-calote prontas em minutos.

**Isca Tática:** Acordo de prestação de serviço simples.

🔗 *Retornar ao núcleo:* [[NÚCLEO CENTRAL DA LILITH]]`
};

Object.entries(enrichedContent).forEach(([fPath, content]) => {
    const fullPath = path.join(vaultPath, fPath);
    if (fs.existsSync(fullPath)) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log("✅ Enriched: " + fPath);
    } else {
        console.log("⚠️ Not found: " + fPath);
    }
});

console.log('Enriquecimento global executado com sucesso e brutalidade!');
