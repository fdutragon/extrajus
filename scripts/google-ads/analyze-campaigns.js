require('dotenv').config({ path: '.env' });
const { GoogleAdsApi } = require('google-ads-api');

async function run() {
    try {
        const client = new GoogleAdsApi({
            client_id: process.env.GOOGLE_ADS_CLIENT_ID,
            client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
            developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
        });

        const customerIdRaw = process.env.GOOGLE_ADS_CUSTOMER_ID.replace(/-/g, '');
        const customer = client.Customer({
            customer_id: customerIdRaw,
            refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
        });

        const fs = require('fs');
        const path = require('path');
        const { exec } = require('child_process');
        const vaultPath = 'd:/lilith-brain/01. SINAPSES DE TRÁFEGO (Ads)';
        
        console.log("Consultando campanhas...");

        const query = `
            SELECT
                campaign.id,
                campaign.name,
                campaign.status,
                campaign.bidding_strategy_type,
                campaign.network_settings.target_google_search,
                campaign.network_settings.target_search_network,
                campaign.network_settings.target_content_network,
                campaign.network_settings.target_partner_search_network,
                campaign_budget.amount_micros,
                metrics.clicks,
                metrics.impressions,
                metrics.cost_micros
            FROM campaign
            WHERE campaign.status != 'REMOVED'
        `;

        const campaigns = await customer.query(query);

        let markdownOutput = `---
tags: [ads, relatorio, campanhas]
gerado_em: ${new Date().toISOString()}
---
# 📊 Relatório Automático de Campanhas
> *Dados extraídos diretamente da API do Google Ads pela Lilith.*

## Resumo das Campanhas

| Campanha | Status | Orçamento (R$) | Estratégia | Cliques | Impressões | Custo (R$) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

        console.log("CAMPANHAS ENCONTRADAS:");
        for (const row of campaigns) {
            const orcamento = (row.campaign_budget?.amount_micros || 0) / 1000000;
            const cliques = row.metrics?.clicks || 0;
            const imp = row.metrics?.impressions || 0;
            const custo = (row.metrics?.cost_micros || 0) / 1000000;
            
            markdownOutput += `| **${row.campaign?.name}** | ${row.campaign?.status} | ${orcamento.toFixed(2)} | ${row.campaign?.bidding_strategy_type} | ${cliques} | ${imp} | ${custo.toFixed(2)} |\n`;
            
            console.log(`- ${row.campaign?.name} (${row.campaign?.status})`);
        }
        
        // Vamos checar grupos de anuncios
        const queryGroups = `
            SELECT
                ad_group.id,
                ad_group.name,
                ad_group.status,
                campaign.name
            FROM ad_group
            WHERE ad_group.status != 'REMOVED'
        `;
        const groups = await customer.query(queryGroups);
        
        markdownOutput += `\n## Grupos de Anúncios Ativos\n\n`;
        markdownOutput += `| Campanha | Grupo de Anúncio | Status |\n`;
        markdownOutput += `| :--- | :--- | :--- |\n`;
        
        for(const row of groups) {
            markdownOutput += `| ${row.campaign?.name} | **${row.ad_group?.name}** | ${row.ad_group?.status} |\n`;
        }

        // Lilith: Escrevendo o arquivo diretamente em UTF-8 com Node para não corromper charset no Windows
        const vaultName = 'Extrajus';
        const vaultBasePath = 'd:/lilith-brain/extrajus/lilith-brain/Extrajus';
        const relativePath = '01. SINAPSES DE TRÁFEGO (Ads)/Relatório Automático de Campanhas.md';
        
        try {
            console.log(`\n[⚡] Escrevendo relatório de Campanhas no Obsidian em puro UTF-8...`);
            const vaultPath = path.join(vaultBasePath, '01. SINAPSES DE TRÁFEGO (Ads)');
            const filePath = path.join(vaultPath, 'Relatório Automático de Campanhas.md');
            
            // Cria a pasta se não existir
            if (!fs.existsSync(vaultPath)) fs.mkdirSync(vaultPath, { recursive: true });
            
            // Salva o arquivo perfeitamente sem passar pelo CMD
            fs.writeFileSync(filePath, markdownOutput, 'utf8');
            console.log(`[✔] Arquivo escrito com sucesso no cofre ${vaultName}!`);
            
            // Força abrir a URI no Obsidian
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
