import type { UserRole } from '../types';
import type { WorkflowRecordType } from '../types/workflow';

export interface WorkflowRule {
  ownerRole: UserRole;
  approverRole?: UserRole;
  notifyRoles: UserRole[];
  slaHours: number;
  escalationRole: UserRole;
  followUpRecordType?: WorkflowRecordType;
  followUpRole?: UserRole;
  followUpApproverRole?: UserRole;
  finalApproverRole?: UserRole;
  highPotentialRole?: UserRole;
  seriousNotifyRoles?: UserRole[];
}

export const WORKFLOW_RULES: Partial<Record<WorkflowRecordType, WorkflowRule>> = {
  Incident: {
    ownerRole: 'HSE_Officer',
    approverRole: 'Site_HSE_Manager',
    notifyRoles: ['Site_Supervisor', 'HSE_Officer'],
    slaHours: 24,
    escalationRole: 'Site_HSE_Manager',
    highPotentialRole: 'HSE_Officer',
    seriousNotifyRoles: ['CEO', 'HR_Coordinator']
  },
  Investigation: {
    ownerRole: 'HSE_Officer',
    approverRole: 'Site_HSE_Manager',
    notifyRoles: ['HSE_Officer', 'Site_HSE_Manager'],
    slaHours: 48,
    escalationRole: 'Site_HSE_Manager'
  },
  Observation: {
    ownerRole: 'Site_Supervisor',
    notifyRoles: ['Site_Supervisor'],
    slaHours: 24,
    escalationRole: 'HSE_Officer',
    followUpRecordType: 'Observation',
    followUpRole: 'HSE_Officer',
    followUpApproverRole: 'Site_HSE_Manager',
    highPotentialRole: 'HSE_Officer'
  },
  NearMiss: {
    ownerRole: 'Site_Supervisor',
    notifyRoles: ['Site_Supervisor', 'HSE_Officer'],
    slaHours: 24,
    escalationRole: 'HSE_Officer',
    followUpRecordType: 'NearMiss',
    followUpRole: 'HSE_Officer',
    followUpApproverRole: 'Site_HSE_Manager',
    highPotentialRole: 'HSE_Officer'
  },
  NCR: {
    ownerRole: 'QA_QC_Manager',
    notifyRoles: ['QA_QC_Manager'],
    slaHours: 24,
    escalationRole: 'Site_HSE_Manager',
    followUpRecordType: 'CAPA',
    followUpRole: 'QA_QC_Inspector',
    followUpApproverRole: 'QA_QC_Manager',
    finalApproverRole: 'Site_HSE_Manager'
  },
  CAPA: {
    ownerRole: 'QA_QC_Inspector',
    approverRole: 'Site_HSE_Manager',
    notifyRoles: ['QA_QC_Inspector'],
    slaHours: 72,
    escalationRole: 'QA_QC_Manager'
  },
  Inspection: {
    ownerRole: 'QA_QC_Inspector',
    notifyRoles: ['QA_QC_Inspector'],
    slaHours: 72,
    escalationRole: 'QA_QC_Manager',
    followUpRecordType: 'CAPA',
    followUpRole: 'QA_QC_Inspector',
    followUpApproverRole: 'QA_QC_Manager'
  },
  Audit: {
    ownerRole: 'QA_QC_Inspector',
    notifyRoles: ['QA_QC_Inspector'],
    slaHours: 72,
    escalationRole: 'QA_QC_Manager',
    followUpRecordType: 'CAPA',
    followUpRole: 'QA_QC_Inspector',
    followUpApproverRole: 'QA_QC_Manager'
  },
  Permit: {
    ownerRole: 'Site_Supervisor',
    notifyRoles: ['Site_Supervisor'],
    slaHours: 4,
    escalationRole: 'Site_HSE_Manager',
    followUpRole: 'HSE_Officer',
    followUpApproverRole: 'Site_Supervisor'
  },
  Training: {
    ownerRole: 'HR_Coordinator',
    notifyRoles: ['HR_Coordinator'],
    slaHours: 168,
    escalationRole: 'Project_Manager'
  },
  Medical: {
    ownerRole: 'HR_Coordinator',
    notifyRoles: ['HR_Coordinator'],
    slaHours: 168,
    escalationRole: 'Project_Manager'
  },
  Calibration: {
    ownerRole: 'QA_QC_Inspector',
    notifyRoles: ['QA_QC_Inspector'],
    slaHours: 72,
    escalationRole: 'QA_QC_Manager'
  },
  StatutoryNotification: {
    ownerRole: 'HR_Coordinator',
    approverRole: 'CEO',
    notifyRoles: ['HR_Coordinator', 'HSE_Officer'],
    slaHours: 12,
    escalationRole: 'CEO'
  }
};

export const WORKFLOW_ROLE_CHAINS: UserRole[][] = [
  ['Worker', 'Site_Supervisor', 'HSE_Officer', 'Site_HSE_Manager', 'Regional_HSE_Director', 'Head_Group_HSE', 'CEO', 'Board_Director'],
  ['QA_QC_Inspector', 'QA_QC_Manager'],
  ['HR_Coordinator', 'Project_Manager']
];

export function roleRankInChain(role: UserRole, chain: UserRole[]): number {
  return chain.indexOf(role);
}

export function getRoleChain(role: UserRole): UserRole[] | undefined {
  return WORKFLOW_ROLE_CHAINS.find(chain => chain.includes(role));
}
