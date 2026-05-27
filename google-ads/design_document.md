# DESIGN DOCUMENTATION: TRADEMARK INTEGRATION ENGINE (INTERNAL CLI TOOL)
**System Architecture & API Integration Specification**

## 1. Executive Summary & Tool Purpose
"Trademark Integration Engine" is an internal Command Line Interface (CLI) and backend service built in Node.js and TypeScript. The primary goal of the tool is to automate and streamline daily marketing operations for our consulting firm.vv

The tool interacts with the Google Ads API to perform three core functions:
1. **Performance Reporting:** Fetching daily performance statistics (clicks, impressions, cost, CTR, and conversions) to aggregate ROI and feed our internal business intelligence databases.
2. **Campaign Status Management:** Programmatically enabling or pausing our trademark search campaigns to quickly manage daily budget caps and avoid waste.
3. **Keyword Research Automation:** Pulling search volume metrics and competition statistics directly from the Keyword Planner service to help our team identify optimal keyword bids for local trademark services.

The tool is strictly for **internal use** by our company employees and does not serve any external clients or the public.

---

## 2. System Architecture & Tech Stack

```
   +-------------------------------------------------------+
   |             Trademark Integration Engine              |
   |                                                       |
   |   +-------------------+       +-------------------+   |
   |   |   src/config/     |       |     src/core/     |   |
   |   |   loader.ts       |       |   AdsClient.ts    |   |
   |   +---------+---------+       +---------+---------+   |
   |             |                           |             |
   |   +---------v---------+                 |             |
   |   |  C:\.okx\         |                 |             |
   |   |  config.toml      |                 |             |
   |   +---------+---------+                 |             |
   |             |                           |             |
   |   +---------v---------+       +---------v---------+   |
   |   |   src/auth/       |       |   src/services/   |   |
   |   |   token-gen.ts    |       |   AdsService.ts   |   |
   |   +-------------------+       +---------+---------+   |
   |                                         |             |
   +-----------------------------------------|-------------+
                                             |
                                  [HTTPS REST / OAuth2]
                                             |
                                   +---------v---------+
                                   |  Google Ads API   |
                                   +-------------------+
```

- **Runtime & Language:** Node.js (v20+) and TypeScript.
- **API Protocol:** Secure HTTP/2 and HTTP REST communication over SSL/TLS.
- **Config Storage:** Multi-profile TOML configuration loader stored securely at the OS user profile directory (`C:\Users\<user>\.okx\config.toml`), isolated from source control.
- **Dependencies:** `google-ads-api` (Opteo) client client library, `express` (for temporary OAuth2 local callback loopback), `toml` (parser).

---

## 3. Core Functional Flows

### Flow A: Multi-Profile Authentication & OAuth2 Consent
To authorize communication, we use a secure loopback flow with an ephemeral HTTP Express server:
1. The administrator triggers the authentication script: `npm run auth`.
2. The script launches a temporary local server listening on `http://localhost:3000`.
3. It opens the default system browser targeting Google's official OAuth2 endpoint:
   `https://accounts.google.com/o/oauth2/v2/auth`
4. The user completes the Google Sign-in flow and grants the `https://www.googleapis.com/auth/adwords` scope.
5. Google redirects the authorization code back to `http://localhost:3000/oauth2callback`.
6. The CLI intercepts the authorization code, exchanges it for a permanent `refresh_token` using Google's secure token exchange endpoint, and writes the `refresh_token` into the encrypted/secured `config.toml` file.
7. The temporary Express server immediately shuts down.

### Flow B: Performance Reporting (GAQL Querying)
Our reporting module downloads operational performance metrics using Google Ads Query Language (GAQL) over REST:
- **Endpoint:** `POST https://googleads.googleapis.com/v17/customers/{customerId}/googleAds:search`
- **Typical Query Structure:**
  ```sql
  SELECT 
    campaign.id, 
    campaign.name, 
    campaign.status,
    metrics.impressions, 
    metrics.clicks, 
    metrics.ctr,
    metrics.cost_micros, 
    metrics.average_cpc,
    metrics.conversions, 
    metrics.conversions_value
  FROM campaign
  WHERE segments.date BETWEEN '{startDate}' AND '{endDate}'
  AND campaign.status IN ('ENABLED', 'PAUSED')
  ```
- **Formatting:** The raw micro-currency values returned by the API (`metrics.cost_micros`) are divided by `1,000,000` to format expenses into national currency (BRL).

### Flow C: Campaign Creation & Status Mutate
- **Campaign Mutate Endpoint:** `POST https://googleads.googleapis.com/v17/customers/{customerId}/googleAds:mutate`
- **Data Payload:**
  - Standard Search campaigns are created in `PAUSED` state with CPC limits (`manual_cpc` bidding strategy) to ensure budget control before review.
  - EU political advertising flag is declared programmatically (`contains_eu_political_advertising: false`).

---

## 4. Design Mockups & Output Demonstration

### Command Line Reporting Table
Below is an output demonstration of the performance report table rendered directly inside the developer console:

```
================================================================
📊 PERFORMANCE REPORT SYSTEM - GOOGLE ADS METRICS 📊
Conta Operada: 304-980-7699
Período de Análise: 2025-05-26 até 2026-05-26
================================================================

┌─────────────┬──────────────────────────┬────────┬─────────┬─────────────┬────────────┐
│ ID          │ Campanha                 │ Status │ Cliques │ Custo (R$)  │ Conversões │
├─────────────┼──────────────────────────┼────────┼─────────┼─────────────┼────────────┤
│ 20973047183 │ 'Registro INPI - Mobile' │ PAUSED │ 2,333   │ R$ 4,413.60 │ 289        │
│ 20986552949 │ 'Registro INPI Discover' │ PAUSED │ 65      │ R$ 72.32    │ 2          │
│ 20986567907 │ 'Registro INPI Display'  │ PAUSED │ 405     │ R$ 125.60   │ 73         │
│ 20988147815 │ 'Registro INPI Desktop'  │ PAUSED │ 87      │ R$ 277.90   │ 40         │
└─────────────┴──────────────────────────┴────────┴─────────┴─────────────┴────────────┘

================================================================
💰 SUMÁRIO CONSOLIDADO DE PERFORMANCE 💰
================================================================
Impressões Totais  : 44.486
Cliques Totais     : 2.890
CTR Médio Geral    : 6.50%
Investimento Total : R$ 4.889,42
CPC Médio Geral    : R$ 1,69
Conversões Totais  : 404
================================================================
```
