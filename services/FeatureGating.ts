export type PlanType = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

export interface PlanFeature {
  id: string;
  name: string;
  isIncluded: boolean;
  tooltip?: string;
}

export interface CommercialPlan {
  id: PlanType;
  name: string;
  priceAed: number;
  priceUsd: number;
  priceSar: number;
  features: PlanFeature[];
}

export class FeatureGating {
  static checkAccess(currentPlan: PlanType, featureId: string): boolean {
    // Middleware simulation: Check if user's plan has the feature enabled.
    // In a real app, this would query the backend entitlements database schema.
    const entitlements: Record<PlanType, string[]> = {
      'STARTER': ['basic_reporting', 'incident_logging'],
      'PROFESSIONAL': ['basic_reporting', 'incident_logging', 'contractor_management', 'predictive_risk'],
      'ENTERPRISE': ['basic_reporting', 'incident_logging', 'contractor_management', 'predictive_risk', 'ai_assistant', 'custom_integration', 'executive_dashboard']
    };

    return entitlements[currentPlan]?.includes(featureId) ?? false;
  }
}
