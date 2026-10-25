import type { UserProfile } from '../types';

export const WORKFLOW_DEMO_USERS: UserProfile[] = [
  {
    id: 'usr-workflow-qa-manager-oman',
    name: 'Maha Al-Hinai',
    email: 'maha.alhinai@alhajar-energy.om',
    role: 'QA_QC_Manager',
    jobTitle: 'QA/QC Manager',
    department: 'Quality Assurance & Quality Control',
    siteLocation: 'Sohar Industrial Port Terminal',
    assignedSites: ['Sohar Industrial Port Petrochemical Complex'],
    safetyScore: 900,
    recentIncidents: [],
    observations: [],
    certifications: [],
    achievements: []
  },
  {
    id: 'usr-workflow-qa-inspector-oman',
    name: 'Yousef Al-Raisi',
    email: 'yousef.alraisi@alhajar-energy.om',
    role: 'QA_QC_Inspector',
    jobTitle: 'QA/QC Inspector',
    department: 'Quality Assurance & Quality Control',
    siteLocation: 'Sohar Industrial Port Terminal',
    assignedSites: ['Sohar Industrial Port Petrochemical Complex'],
    safetyScore: 860,
    recentIncidents: [],
    observations: [],
    certifications: [],
    achievements: []
  }
];
