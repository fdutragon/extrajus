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

        console.log("CAMPANHAS ENCONTRADAS:");
        for (const row of campaigns) {
            console.log(`\n=== Campanha: ${row.campaign?.name} ===`);
            console.log(`Status: ${row.campaign?.status}`);
            console.log(`Estratégia de Lance: ${row.campaign?.bidding_strategy_type}`);
            const orcamento = (row.campaign_budget?.amount_micros || 0) / 1000000;
            console.log(`Orçamento Diário: R$ ${orcamento}`);
            console.log(`Rede de Pesquisa: ${row.campaign?.network_settings?.target_google_search}`);
            console.log(`Rede de Display (Content): ${row.campaign?.network_settings?.target_content_network}`);
            console.log(`Parceiros de Pesquisa: ${row.campaign?.network_settings?.target_partner_search_network}`);
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
        console.log("\nGRUPOS DE ANÚNCIO:");
        for(const row of groups) {
            console.log(`- [${row.campaign?.name}] ${row.ad_group?.name} (${row.ad_group?.status})`);
        }

    } catch (err) {
        console.error("Erro na API do Google Ads:", err);
    }
}

run();
