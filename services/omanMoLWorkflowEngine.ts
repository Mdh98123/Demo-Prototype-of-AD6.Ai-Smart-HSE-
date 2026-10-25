/**
 * omanMoLWorkflowEngine.ts
 * Automates and enforces Oman MoL MD 286/2008 & PDO SP-1143/PR-1172 Business Logic.
 * Operates independently of UI to maintain rigid compliance constraints.
 */

export interface RiskMatrixResult {
  probability: number;
  severity: number;
  score: number;
  rating: 'Low' | 'Medium' | 'High' | 'Critical';
  requiredAction: string;
}

export interface HardGateRequirement {
  code: string;
  isSatisfied: boolean;
  missingEvidence: string[];
}

export class omanMoLWorkflowEngine {
  
  // Statutory Element 1: Leadership & Management Accountability
  public static generateQuarterlyReviewTasks(tenantId: string, currentHseManagers: string[]) {
    const today = new Date();
    const currentQuarter = Math.floor(today.getMonth() / 3) + 1;
    
    // In a real DB, this inserts row records into `workflow_tasks` table
    const tasks = currentHseManagers.map(managerId => ({
      tenant_id: tenantId,
      mechanism_id: 1, // Element 1
      assigned_to: managerId,
      status: 'PENDING',
      due_date: new Date(today.getFullYear(), currentQuarter * 3, 0), // Last day of quarter
      payload: {
        task_type: 'POLICY_REVIEW',
        quarter: `Q${currentQuarter}-${today.getFullYear()}`
      }
    }));

    return tasks;
  }

  // Statutory Element 3: Risk Management (PDO 5x5 RAM Matrix Integration per SP-1143 / PR-1172)
  public static calculateRisk(probability: number, severity: number): RiskMatrixResult {
    // Both 1 to 5 scale
    const score = probability * severity;
    let rating: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
    let requiredAction = '';

    if (score >= 20) {
      rating = 'Critical';
      requiredAction = 'STOP WORK. Immediate intervention by Head of HSE required.';
    } else if (score >= 12) {
      rating = 'High';
      requiredAction = 'Requires mitigation plan approved by Site Manager.';
    } else if (score >= 5) {
      rating = 'Medium';
      requiredAction = 'ALARP demonstration required in Tool Box Talk.';
    } else {
      rating = 'Low';
      requiredAction = 'Standard operational controls apply.';
    }

    return { probability, severity, score, rating, requiredAction };
  }

  // Enforcement Logic: Hard Gates Assessment
  public static evaluateHardGates(
    actionType: 'SUBMIT_INCIDENT' | 'APPROVE_CONTRACTOR',
    providedData: Record<string, any>
  ): { canProceed: boolean; requirements: HardGateRequirement[] } {
    
    const requirements: HardGateRequirement[] = [];

    if (actionType === 'SUBMIT_INCIDENT') {
      // Oman MoL MD 286/2008 / PDO PR-1172 strict requirements for incident entry
      const hasDate = !!providedData.date;
      const hasLocation = !!providedData.location;
      const hasSeverity = !!providedData.severity;
      
      requirements.push({
        code: 'MOL-MD286-R1 (Event Details)',
        isSatisfied: hasDate && hasLocation && hasSeverity,
        missingEvidence: (!hasDate || !hasLocation || !hasSeverity) ? ['Core Metadata'] : []
      });

      // E.g. If it's a High severity incident, initial photos are a hard gate.
      if (providedData.severity === 'High' || providedData.severity === 'Critical') {
        requirements.push({
          code: 'PDO-PR1172-R4 (Visual Evidence for Serious Incident)',
          isSatisfied: Array.isArray(providedData.photos) && providedData.photos.length > 0,
          missingEvidence: (!providedData.photos?.length) ? ['Incident Scene Photos'] : []
        });
      }
    }

    return {
      canProceed: requirements.every(req => req.isSatisfied),
      requirements
    };
  }

  // Statutory Contractor Pre-qualification Expiry Enforcement per Oman Labour Law RD 53/2023 & OPAL Unified Standards
  public static assessContractorStatus(complianceDocs: { type: string; expiryDate: string }[]) {
    const today = new Date();
    const alerts: string[] = [];
    let isApproved = true;

    complianceDocs.forEach(doc => {
      const expDate = new Date(doc.expiryDate);
      const daysUntilExpiry = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      
      if (daysUntilExpiry <= 0) {
        isApproved = false;
        alerts.push(`CRITICAL: ${doc.type} has expired! Contractor suspension auto-triggered.`);
      } else if (daysUntilExpiry <= 30) {
        alerts.push(`WARNING: ${doc.type} will expire in ${daysUntilExpiry} days.`);
      }
    });

    return { isApproved, alerts };
  }
}
