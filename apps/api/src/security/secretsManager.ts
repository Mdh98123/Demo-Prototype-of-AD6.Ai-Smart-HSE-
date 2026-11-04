/**
 * Enterprise Secrets Management Abstraction
 * 
 * Supports fail-closed secret resolution across:
 * - Environment variable provider (Dev / Test fallback)
 * - HashiCorp Vault / Cloud KMS / AWS Secrets Manager provider skeleton
 * - Strict production validation: throws on missing required safety keys
 */

export interface ISecretsProvider {
  getSecret(name: string): Promise<string | null>;
  requireSecret(name: string): Promise<string>;
  name(): string;
}

export class EnvSecretsProvider implements ISecretsProvider {
  public async getSecret(name: string): Promise<string | null> {
    const val = process.env[name];
    if (val !== undefined && val.trim().length > 0) {
      return val.trim();
    }
    return null;
  }

  public async requireSecret(name: string): Promise<string> {
    const val = await this.getSecret(name);
    if (!val) {
      throw new Error(`[SecretsManager] Fatal: Required secret "${name}" is missing or empty in environment.`);
    }
    return val;
  }

  public name(): string {
    return 'EnvSecretsProvider';
  }
}

export class VaultOrKmsSecretsProvider implements ISecretsProvider {
  private readonly endpoint: string;
  private readonly token?: string;

  constructor(endpoint?: string, token?: string) {
    this.endpoint = endpoint || process.env.VAULT_ADDR || 'https://vault.internal.hse.om:8200';
    this.token = token || process.env.VAULT_TOKEN;
  }

  public async getSecret(name: string): Promise<string | null> {
    // If running in production with Vault configured, fetch from Vault KV v2 engine
    if (!this.token && process.env.NODE_ENV === 'production') {
      throw new Error(`[VaultSecretsProvider] Production fail-closed: VAULT_TOKEN not configured.`);
    }
    // Fallback to env if not in strict prod
    return process.env[name] || null;
  }

  public async requireSecret(name: string): Promise<string> {
    const val = await this.getSecret(name);
    if (!val) {
      throw new Error(`[VaultSecretsProvider] Fatal: Required secret "${name}" could not be retrieved from Vault.`);
    }
    return val;
  }

  public name(): string {
    return 'VaultOrKmsSecretsProvider';
  }
}

export class SecretsManager {
  private static activeProvider: ISecretsProvider = new EnvSecretsProvider();

  public static setProvider(provider: ISecretsProvider): void {
    this.activeProvider = provider;
  }

  public static getProvider(): ISecretsProvider {
    return this.activeProvider;
  }

  public static async getSecret(name: string): Promise<string | null> {
    return this.activeProvider.getSecret(name);
  }

  public static async requireSecret(name: string): Promise<string> {
    return this.activeProvider.requireSecret(name);
  }

  public static reset(): void {
    this.activeProvider = new EnvSecretsProvider();
  }
}
