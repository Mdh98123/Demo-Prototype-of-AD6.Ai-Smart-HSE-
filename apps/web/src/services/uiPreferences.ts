/**
 * UI Preferences Service
 *
 * Persists purely visual UI presentation settings (theme, sidebar collapsed state, zoom)
 * in browser localStorage in compliance with Guardrail G-1 (zero domain data).
 */

export interface UIPreferences {
  theme: 'dark' | 'light';
  sidebarCollapsed: boolean;
  density: 'compact' | 'comfortable';
  locale: string;
}

const UI_PREFS_KEY = 'ad6_ui_preferences';

const DEFAULT_PREFERENCES: UIPreferences = {
  theme: 'dark',
  sidebarCollapsed: false,
  density: 'comfortable',
  locale: 'en'
};

export class UIPreferencesService {
  public static getPreferences(): UIPreferences {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return DEFAULT_PREFERENCES;
      }
      const raw = window.localStorage.getItem(UI_PREFS_KEY);
      if (!raw) return DEFAULT_PREFERENCES;
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }

  public static setPreferences(prefs: Partial<UIPreferences>): UIPreferences {
    const current = this.getPreferences();
    const updated = { ...current, ...prefs };
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(UI_PREFS_KEY, JSON.stringify(updated));
      }
    } catch {
      // Ignore quota errors
    }
    return updated;
  }
}
