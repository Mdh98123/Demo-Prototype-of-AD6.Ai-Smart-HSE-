export type ContractorStatus = 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE' | 'SUSPENDED' | 'BLACKLISTED' | 'REJECTED';

export interface ContractorDocument {
  id: string;
  type: 'TRADE_LICENSE' | 'INSURANCE' | 'ISO_CERT' | 'HSE_PLAN' | 'ICV_CERT' | 'OTHER';
  title: string;
  filename: string;
  url: string;
  version: number;
  uploadDate: string;
  expiryDate: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason?: string;
}

export interface ContractorProfile {
  id: string;
  companyName: string;
  registrationNumber: string; // Trade License
  pdoIcvNumber?: string; // Integration field
  contactPerson: {
    name: string;
    email: string;
    phone: string;
  };
  status: ContractorStatus;
  documents: ContractorDocument[];
  performance: {
    incidentCount: number;
    inspectionAverage: number;
    trainingCompliance: number;
    lastAuditDate?: string;
  };
  riskScore?: number; // 0-100 (0 is perfect, 100 is critical risk)
  riskCategory?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class ContractorRiskEngine {
  static calculateRiskScore(profile: ContractorProfile): { score: number; category: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; breakdown: any } {
    let score = 0;
    const breakdown: any = {};

    // 1. Incident History (Weight: 40%)
    // Assume each incident adds 15 points
    const incidentPenalty = Math.min(profile.performance.incidentCount * 15, 40);
    score += incidentPenalty;
    breakdown['incidents'] = incidentPenalty;

    // 2. Inspection Scores (Weight: 30%)
    // Average score 0-100. Lower is worse. 100 = 0 penalty, 0 = 30 penalty.
    const inspectionPenalty = 30 - (profile.performance.inspectionAverage * 0.3);
    score += inspectionPenalty;
    breakdown['inspections'] = Math.round(inspectionPenalty);

    // 3. Training Compliance (Weight: 15%)
    // 0-100%. 100% = 0 penalty.
    const trainingPenalty = 15 - (profile.performance.trainingCompliance * 0.15);
    score += trainingPenalty;
    breakdown['training'] = Math.round(trainingPenalty);

    // 4. Document Compliance (Weight: 15%)
    // Overdue or missing critical docs.
    const now = new Date().getTime();
    let docPenalty = 0;
    let expiredDocs = 0;
    
    profile.documents.forEach(doc => {
      const exp = new Date(doc.expiryDate).getTime();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      if (exp < now) {
        docPenalty += 5; // Expired doc
        expiredDocs++;
      } else if (exp - now < thirtyDays) {
        docPenalty += 2; // Expiring soon
      }
    });
    const finalDocPenalty = Math.min(docPenalty, 15);
    score += finalDocPenalty;
    breakdown['documents'] = finalDocPenalty;

    let category: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (score >= 75 || expiredDocs > 0) category = 'CRITICAL';
    else if (score >= 50) category = 'HIGH';
    else if (score >= 25) category = 'MEDIUM';

    return { score: Math.round(score), category, breakdown };
  }
}

// Stub for Oman Ministry of Labour API Integration
export class omanMoLIntegrationStub {
  static async verifyLaborCard(OmanId: string, cardNumber: string): Promise<{ valid: boolean; status: string; expiry?: string }> {
    console.log(`[Oman Ministry of Labour MOCK] Verifying Labor Card: EID=${OmanId}, Card=${cardNumber}`);
    return new Promise(resolve => setTimeout(() => {
      // Mock validation
      const valid = cardNumber.length > 5;
      resolve({
        valid,
        status: valid ? 'ACTIVE' : 'INVALID',
        expiry: valid ? '2027-01-01' : undefined
      });
    }, 800));
  }
}

// Stub for ERP Export
export class ERPIntegrationService {
  static exportToSAP(contractors: ContractorProfile[]): string {
    // Generate SAP IDoc or generic XML/CSV format
    const lines = ['LIFNR,NAME1,STRAS,ORT01,LAND1,TELF1,STCD1'];
    contractors.forEach(c => {
      lines.push(`${c.id},${c.companyName},-,Sohar,AE,${c.contactPerson.phone},${c.registrationNumber}`);
    });
    return 'SAP_EXPORT_CSV\n' + lines.join('\n');
  }
  
  static exportToOracle(contractors: ContractorProfile[]): object {
    return {
      BatchId: `ORACLE_SYNC_${Date.now()}`,
      Suppliers: contractors.map(c => ({
        SupplierNum: c.id,
        SupplierName: c.companyName,
        TaxRegistrationCode: c.registrationNumber,
        Contacts: [{
           FirstName: c.contactPerson.name,
           EmailAddress: c.contactPerson.email
        }]
      }))
    };
  }
}
