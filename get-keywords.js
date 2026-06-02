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
        for (const item of sorted) {
            if (count >= 100) break;
            const text = item.text;
            const vol = item.keyword_idea_metrics?.avg_monthly_searches;
            console.log(`${text} - ${vol}`);
            count++;
        }
    } catch (err) {
        console.error("Erro na API do Google Ads:", err);
    }
}

run();
