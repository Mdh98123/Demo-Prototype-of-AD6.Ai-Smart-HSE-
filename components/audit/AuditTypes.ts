export type AuditStatus = 'Draft' | 'Scheduled' | 'In Progress' | 'Under Review' | 'Completed' | 'Overdue';

export interface AuditTemplate {
    id: string;
    name: string;
    type: string;
    description: string;
    sections: AuditSection[];
    frameworks: string[];
}

export interface AuditSection {
    id: string;
    name: string;
    questions: AuditQuestion[];
}

export interface AuditQuestion {
    id: string;
    question: string;
    type: 'YesNo' | 'Rating' | 'PassFail' | 'Numeric' | 'Photo' | 'Voice' | 'MultipleChoice';
    weight: number;
    guidance: string;
}

export interface SafetyAudit {
    id: string;
    templateId: string;
    title: string;
    location: string;
    department: string;
    contractor?: string;
    auditorId: string;
    auditorName: string;
    scheduledDate: string;
    completionDate?: string;
    status: AuditStatus;
    score: number;
    findings: Finding[];
}

export interface Finding {
    id: string;
    auditId: string;
    questionId: string;
    description: string;
    category: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    evidenceUrls: string[];
    responsiblePersonId: string;
    status: 'Open' | 'Assigned' | 'Under Action' | 'Pending Verification' | 'Closed' | 'Rejected';
    dueDate: string;
    correctiveAction?: CorrectiveAction;
    rca?: RootCauseAnalysis;
    regulationRef?: string;
}

export interface CorrectiveAction {
    id: string;
    description: string;
    assignedTo: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    targetDate: string;
    status: 'Pending' | 'In Progress' | 'Completed' | 'Verified';
}

export interface RootCauseAnalysis {
    method: '5Why' | 'Fishbone';
    causes: string[];
    rootCause: string;
    preventiveAction: string;
}

export interface AuditorProfile {
    id: string;
    name: string;
    certifications: string[];
    experienceYears: number;
    department: string;
    assignedAudits: number;
    performanceScore: number;
    completionRate: number;
}
