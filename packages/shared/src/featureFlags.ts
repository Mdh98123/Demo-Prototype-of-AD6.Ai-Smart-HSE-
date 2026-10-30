/**
 * AD6.Ai Smart HSE Platform — Enterprise Feature Flags Module
 *
 * Env-driven feature flags with strict Phase 0 defaults:
 * - durablePersistence: false
 * - statutoryClock: false
 * - auditLogV2: false
 * - sodDbEnforced: false
 * - aiGates: false
 * - offlineSyncV2: false
 * - integrations: false
 *
 * In accordance with Phase 0 directives, every subsequent phase flips exactly one flag.
 */

export interface FeatureFlags {
  durablePersistence: boolean;
  statutoryClock: boolean;
  auditLogV2: boolean;
  sodDbEnforced: boolean;
  aiGates: boolean;
  offlineSyncV2: boolean;
  integrations: boolean;
}

export const DEFAULT_FEATURE_FLAGS: Readonly<FeatureFlags> = Object.freeze({
  durablePersistence: false,
  statutoryClock: false,
  auditLogV2: false,
  sodDbEnforced: false,
  aiGates: false,
  offlineSyncV2: false,
  integrations: false,
});

export type FeatureFlagKey = keyof FeatureFlags;

const ENV_VAR_MAPPING: Record<FeatureFlagKey, string> = {
  durablePersistence: 'FEATURE_FLAG_DURABLE_PERSISTENCE',
  statutoryClock: 'FEATURE_FLAG_STATUTORY_CLOCK',
  auditLogV2: 'FEATURE_FLAG_AUDIT_LOG_V2',
  sodDbEnforced: 'FEATURE_FLAG_SOD_DB_ENFORCED',
  aiGates: 'FEATURE_FLAG_AI_GATES',
  offlineSyncV2: 'FEATURE_FLAG_OFFLINE_SYNC_V2',
  integrations: 'FEATURE_FLAG_INTEGRATIONS',
};

export class FeatureFlagRegistry {
  private static overrides: Partial<FeatureFlags> = {};

  /**
   * Resolves current active feature flags from environment variables,
   * applying explicit programmatic overrides (e.g. for unit testing),
   * and falling back to default values.
   */
  public static getAllFlags(envSource?: Record<string, string | undefined>): FeatureFlags {
    const env = envSource || (typeof process !== 'undefined' ? process.env : {});

    const flags: FeatureFlags = {
      durablePersistence: this.parseBoolean(env[ENV_VAR_MAPPING.durablePersistence], DEFAULT_FEATURE_FLAGS.durablePersistence),
      statutoryClock: this.parseBoolean(env[ENV_VAR_MAPPING.statutoryClock], DEFAULT_FEATURE_FLAGS.statutoryClock),
      auditLogV2: this.parseBoolean(env[ENV_VAR_MAPPING.auditLogV2], DEFAULT_FEATURE_FLAGS.auditLogV2),
      sodDbEnforced: this.parseBoolean(env[ENV_VAR_MAPPING.sodDbEnforced], DEFAULT_FEATURE_FLAGS.sodDbEnforced),
      aiGates: this.parseBoolean(env[ENV_VAR_MAPPING.aiGates], DEFAULT_FEATURE_FLAGS.aiGates),
      offlineSyncV2: this.parseBoolean(env[ENV_VAR_MAPPING.offlineSyncV2], DEFAULT_FEATURE_FLAGS.offlineSyncV2),
      integrations: this.parseBoolean(env[ENV_VAR_MAPPING.integrations], DEFAULT_FEATURE_FLAGS.integrations),
    };

    return {
      ...flags,
      ...this.overrides,
    };
  }

  public static isEnabled(key: FeatureFlagKey, envSource?: Record<string, string | undefined>): boolean {
    const all = this.getAllFlags(envSource);
    return Boolean(all[key]);
  }

  public static setOverride(key: FeatureFlagKey, value: boolean): void {
    this.overrides[key] = value;
  }

  public static clearOverrides(): void {
    this.overrides = {};
  }

  private static parseBoolean(val: string | undefined, defaultVal: boolean): boolean {
    if (val === undefined || val === null || val === '') {
      return defaultVal;
    }
    const normalized = val.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes';
  }
}

export const getFeatureFlags = (envSource?: Record<string, string | undefined>) => FeatureFlagRegistry.getAllFlags(envSource);
export const isFeatureEnabled = (key: FeatureFlagKey, envSource?: Record<string, string | undefined>) => FeatureFlagRegistry.isEnabled(key, envSource);
