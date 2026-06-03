# ROTA: `/editor/[id]`

O Campo de Sangue. A interface onde o usuário trabalha, constrói e audita.

## OBJETIVOS TÁTICOS
- **Imersão Total**: Interface estilo IDE/Documento. Modos minimalistas de foco absoluto. Sem distrações.

## FUNCIONALIDADES E ENGENHARIA
- **Núcleo TipTap**: A superfície de edição que sincroniza o JSONB silenciosamente com o Supabase.
- **Painel da Lilith**: Uma aba ou modal flutuante. O usuário seleciona um parágrafo falho e aciona a Lilith. O sistema consome 1 crédito e cospe uma cláusula blindada e impiedosa através da `/api/ai/generate`.
- **Botão de Guerra (Exportar)**: Conversão client-side para PDF através de bibliotecas eficientes (html2pdf ou react-pdf), garantindo que a estrutura visual seja perfeita para assinatura.

🔗 *Voltar para:* [[Árvore de Rotas (Next.js)]]