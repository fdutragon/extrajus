const { LinearClient } = require('@linear/sdk');

async function createLinearIssue() {
  const apiKey = "lin_api_I3CD6MraItDCbrun7FexxE1xnUBM8dJ3rrm5YfXa";
  const client = new LinearClient({ apiKey });

  try {
    const me = await client.viewer;
    console.log(`Conectado como: ${me.name}`);

    const teams = await client.teams();
    if (teams.nodes.length === 0) {
      console.error("Nenhum time encontrado no Linear.");
      return;
    }

    const team = teams.nodes[0];
    console.log(`Usando time: ${team.name} (${team.id})`);

    const issue = await client.createIssue({
      teamId: team.id,
      title: "Otimização de Exportação PDF: Sanitização de Cores Soberana",
      description: `
## Objetivo
Garantir a integridade da exportação de documentos jurídicos independentemente do tema (Dark/Light).

## O que foi feito
- Implementado sistema de **Sanitização Dinâmica de Estilos** no ExportButton.
- Expurgo automático de funções de cores modernas (lab, oklch) que travavam o motor html2canvas.
- Override de modo claro durante a clonagem (Fundo Branco / Texto Preto).

## Resultados
- Fim dos erros de console "unsupported color function lab".
- PDFs legíveis em qualquer modo de visualização.
      `,
      priority: 1
    });

    if (issue.success) {
      const createdIssue = await issue.issue;
      console.log(`✅ Issue criada com sucesso: ${createdIssue.url}`);
    } else {
      console.error("❌ Falha ao criar a issue.");
    }
  } catch (error) {
    console.error("❌ Erro ao interagir com Linear:", error.message);
  }
}

createLinearIssue();
