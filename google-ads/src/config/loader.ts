import fs from 'fs';
import path from 'path';
import toml from 'toml';

export interface GoogleAdsConfig {
  clientId: string;
  clientSecret: string;
  developerToken: string;
  refreshToken: string;
  customerId: string;
}

const DEFAULT_CONFIG_PATH = 'C:\\Users\\felip\\.extrajus\\config.toml';

/**
 * Carrega as credenciais da API do Google Ads do arquivo TOML centralizado ou variáveis de ambiente.
 */
export function loadConfig(): GoogleAdsConfig {
  let configFromToml: any = {};

  if (fs.existsSync(DEFAULT_CONFIG_PATH)) {
    try {
      const fileContent = fs.readFileSync(DEFAULT_CONFIG_PATH, 'utf-8');
      const parsed = toml.parse(fileContent);
      configFromToml = parsed['google-ads'] || {};
    } catch (error: any) {
      console.warn(`\x1b[33m[System Warning] Erro ao ler ou analisar o arquivo TOML em ${DEFAULT_CONFIG_PATH}: ${error.message}\x1b[0m`);
    }
  }

  // Sanitiza o customerId removendo traços se houver
  const rawCustomerId = configFromToml.customer_id || process.env.GOOGLE_ADS_CUSTOMER_ID || '';
  const customerId = rawCustomerId.replace(/-/g, '').trim();

  return {
    clientId: (configFromToml.client_id || process.env.GOOGLE_ADS_CLIENT_ID || '').trim(),
    clientSecret: (configFromToml.client_secret || process.env.GOOGLE_ADS_CLIENT_SECRET || '').trim(),
    developerToken: (configFromToml.developer_token || process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '').trim(),
    refreshToken: (configFromToml.refresh_token || process.env.GOOGLE_ADS_REFRESH_TOKEN || '').trim(),
    customerId,
  };
}

/**
 * Grava ou atualiza apenas o refresh token na seção [google-ads] do arquivo TOML.
 */
export function saveRefreshToken(refreshToken: string): void {
  const dir = path.dirname(DEFAULT_CONFIG_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let fileContent = '';
  let fullConfig: any = {};

  if (fs.existsSync(DEFAULT_CONFIG_PATH)) {
    try {
      fileContent = fs.readFileSync(DEFAULT_CONFIG_PATH, 'utf-8');
      fullConfig = toml.parse(fileContent) || {};
    } catch (e) {
      fullConfig = {};
    }
  }

  if (!fullConfig['google-ads']) {
    fullConfig['google-ads'] = {};
  }

  fullConfig['google-ads'].refresh_token = refreshToken;

  // Reconstrói o arquivo TOML preservando outras seções
  let tomlString = '';
  for (const section of Object.keys(fullConfig)) {
    tomlString += `[${section}]\n`;
    for (const key of Object.keys(fullConfig[section])) {
      const val = fullConfig[section][key];
      tomlString += `${key} = "${val}"\n`;
    }
    tomlString += '\n';
  }

  fs.writeFileSync(DEFAULT_CONFIG_PATH, tomlString, 'utf-8');
  console.log(`\x1b[32m[System Success] Refresh Token gravado com sucesso em: ${DEFAULT_CONFIG_PATH}\x1b[0m`);
}
