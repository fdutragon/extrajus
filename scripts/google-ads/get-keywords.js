require('dotenv').config({ path: '.env' });
const { GoogleAdsApi } = require('google-ads-api');

async function run() {
    try {
        const client = new GoogleAdsApi({
            client_id: process.env.GOOGLE_ADS_CLIENT_ID,
            client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
            developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
        });

        const customerIdRaw = process.env.GOOGLE_ADS_CUSTOMER_ID;
        const customerId = customerIdRaw.replace(/-/g, '');

        const customer = client.Customer({
            customer_id: customerIdRaw,
            refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
        });

        console.log("Buscando ideias de palavras-chave...");

        const response = await customer.keywordPlanIdeas.generateKeywordIdeas({
            customer_id: customerId,
            language: "languageConstants/1014",
            geo_target_constants: ["geoTargetConstants/2076"],
            keyword_plan_network: "GOOGLE_SEARCH",
            keyword_seed: {
                keywords: ["contrato de", "contrato comercial", "contrato civil"]
            }
        });

        const sorted = response.sort((a, b) => {
            const volA = a.keyword_idea_metrics?.avg_monthly_searches || 0;
            const volB = b.keyword_idea_metrics?.avg_monthly_searches || 0;
            return volB - volA;
        });

        console.log("TOP 100 PALAVRAS CHAVES:");
        let count = 0;
        
        let markdownOutput = `---
tags: [ads, keywords, pesquisa]
gerado_em: ${new Date().toISOString()}
---
# 🔑 Oportunidades de Palavras-Chave
> *Extraído da API do Google Ads pela Lilith*

| Palavra-Chave | Volume de Busca Mensal |
| :--- | :--- |\n`;

        for (const item of sorted) {
            if (count >= 100) break;
            const text = item.text;
            const vol = item.keyword_idea_metrics?.avg_monthly_searches || 0;
            console.log(`${text} - ${vol}`);
            markdownOutput += `| ${text} | ${vol} |\n`;
            count++;
        }

        // Lilith: Escrevendo o arquivo diretamente em UTF-8 com Node para não corromper charset no Windows
        const fs = require('fs');
        const path = require('path');
        const vaultName = 'Extrajus';
        const vaultBasePath = 'd:/lilith-brain/extrajus/lilith-brain/Extrajus';
        const relativePath = '01. SINAPSES DE TRÁFEGO (Ads)/Oportunidades de Palavras-chave.md';
        
        try {
            console.log(`\n[⚡] Escrevendo relatório de Keywords no Obsidian em puro UTF-8...`);
            const vaultPath = path.join(vaultBasePath, '01. SINAPSES DE TRÁFEGO (Ads)');
            const filePath = path.join(vaultPath, 'Oportunidades de Palavras-chave.md');
            
            if (!fs.existsSync(vaultPath)) fs.mkdirSync(vaultPath, { recursive: true });
            fs.writeFileSync(filePath, markdownOutput, 'utf8');
            console.log(`[✔] Relatório de Keywords escrito com sucesso no cofre ${vaultName}!`);
            
            // Força abrir a URI manualmente
            const { exec } = require('child_process');
            exec(`start "" "obsidian://open?vault=${vaultName}&file=${encodeURIComponent(relativePath)}"`);
            console.log(`[✔] Obsidian ativado para exibir a nota.`);
        } catch (error) {
            console.log(`[!] Falha crítica: ${error.message}`);
        }

    } catch (err) {
        console.error("Erro na API do Google Ads:", err);
    }
}

run();
