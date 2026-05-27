import { GoogleAdsApi, Customer } from 'google-ads-api';
import { loadConfig } from '../config/loader';

// Força o resolvedor gRPC-js a usar DNS nativo do sistema operacional (cura bugs de All promises were rejected no Windows)
process.env.GRPC_DNS_RESOLVER = 'native';

export class GoogleAdsClient {
  private api: GoogleAdsApi;
  private customer: Customer | null = null;
  private cachedCustomerId: string = '';
  private cachedRefreshToken: string = '';

  constructor() {
    const config = loadConfig();

    if (!config.clientId || !config.clientSecret || !config.developerToken) {
      throw new Error(
        '[System Error] Configurações fundamentais ausentes (client_id, client_secret, developer_token). ' +
        'Configure o arquivo C:\\Users\\felip\\.extrajus\\config.toml antes de invocar o Google Ads.'
      );
    }

    // Inicializa a API
    this.api = new GoogleAdsApi({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      developer_token: config.developerToken,
    });
  }

  /**
   * Obtém a instância de operação da conta do cliente (Customer).
   * @param overrideCustomerId Permite forçar um ID de cliente diferente sob demanda
   */
  public getCustomer(overrideCustomerId?: string): Customer {
    const config = loadConfig();
    const targetCustomerId = (overrideCustomerId || config.customerId).replace(/-/g, '').trim();

    if (!targetCustomerId) {
      throw new Error(
        '[System Error] Customer ID não definido! Precisamos saber em qual conta do Google Ads vamos operar. ' +
        'Defina customer_id no seu config.toml ou passe como parâmetro.'
      );
    }

    if (!config.refreshToken) {
      throw new Error(
        '[System Error] Refresh Token ausente! Execute primeiro o gerador de token OAuth2: npx tsx scripts/auth.ts'
      );
    }

    // Se a instância já foi criada para o mesmo customer_id e refresh token, retorna ela
    if (this.customer && this.cachedCustomerId === targetCustomerId && this.cachedRefreshToken === config.refreshToken) {
      return this.customer;
    }

    // Criamos o objeto do Customer
    // Se o usuário possuir login_customer_id (Conta MCC Administradora) configurado, repassamos
    // isso ajuda a evitar erros de autorização "USER_PERMISSION_DENIED"
    let loginCustomerId: string | undefined = undefined;
    
    // Tentamos buscar login_customer_id do config.toml de forma segura
    try {
      const fs = require('fs');
      const toml = require('toml');
      const DEFAULT_CONFIG_PATH = 'C:\\Users\\felip\\.extrajus\\config.toml';
      if (fs.existsSync(DEFAULT_CONFIG_PATH)) {
        const fileContent = fs.readFileSync(DEFAULT_CONFIG_PATH, 'utf-8');
        const parsed = toml.parse(fileContent);
        const adsConfig = parsed['google-ads'] || {};
        if (adsConfig.login_customer_id) {
          loginCustomerId = adsConfig.login_customer_id.replace(/-/g, '').trim();
        }
      }
    } catch (e) {}

    this.customer = this.api.Customer({
      customer_id: targetCustomerId,
      login_customer_id: loginCustomerId,
      refresh_token: config.refreshToken,
    });

    this.cachedCustomerId = targetCustomerId;
    this.cachedRefreshToken = config.refreshToken;

    return this.customer;
  }
}

// Singleton conveniente para exportar
let clientInstance: GoogleAdsClient | null = null;

export function getGoogleAdsClient(): GoogleAdsClient {
  if (!clientInstance) {
    clientInstance = new GoogleAdsClient();
  }
  return clientInstance;
}
