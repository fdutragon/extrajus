const fs = require('fs');
const path = require('path');

const vaultPath = 'd:/lilith-brain/extrajus/lilith-brain/Extrajus';
const canvasPath = path.join(vaultPath, 'Fluxo de Batalha (Extrajus).canvas');

if (fs.existsSync(canvasPath)) {
    const canvasData = JSON.parse(fs.readFileSync(canvasPath, 'utf8'));

    // Create the new node for the Data Table
    const tableNode = {
      "id": "file-res-data-table",
      "type": "file",
      "file": "06. ANÁLISES E RESULTADOS/Tabela de Conversão e Dados.md",
      // Place it directly below the Ads Report or at the very end. 
      // Let's put it below the step-6 Checkout at the end but centered.
      "x": 5000,
      "y": -500, // Put it above step 6
      "width": 500,
      "height": 400
    };

    // Add node
    canvasData.nodes.push(tableNode);

    // Add edges from Google Ads (Step 1) and Checkout Webhook (Step 6)
    canvasData.edges.push({
      "id": "e-table-1",
      "fromNode": "step-1",
      "fromSide": "top",
      "toNode": "file-res-data-table",
      "toSide": "left",
      "label": "Tráfego CPL"
    });

    canvasData.edges.push({
      "id": "e-table-6",
      "fromNode": "step-6",
      "fromSide": "top",
      "toNode": "file-res-data-table",
      "toSide": "right",
      "label": "Faturamento LTV"
    });

    fs.writeFileSync(canvasPath, JSON.stringify(canvasData, null, 2), 'utf8');
    console.log('Canvas atualizado com a Tabela de Conversão e Dados.');
} else {
    console.log('Canvas não encontrado.');
}
