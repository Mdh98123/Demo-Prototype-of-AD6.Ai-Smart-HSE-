const fs = require('fs');
let content = fs.readFileSync('components/Sidebar.tsx', 'utf8');

const targetStart = "const NAV_GROUPS: NavGroup[] = [";
const targetEnd = "];\n\nimport { useLanguage }";

const startIndex = content.indexOf(targetStart);
const endIndex = content.indexOf(targetEnd);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find NAV_GROUPS block");
    process.exit(1);
}

const newNavGroups = `const NAV_GROUPS: NavGroup[] = [
  {
    labelKey: 'COMMAND CENTERS',
    items: [
      { view: View.EXECUTIVE_COMMAND_CENTER, icon: LayoutDashboard, labelKey: 'Executive Command Center', roles: ['ADMIN', 'Board_Director', 'CEO', 'Head_Group_HSE'] },
      { view: View.HSE_OPERATIONS, icon: Activity, labelKey: 'HSE Operations', roles: ['ADMIN', 'Head_Group_HSE', 'Regional_HSE_Director', 'Site_HSE_Manager', 'HSE_Officer'] },
      { view: View.PREDICTIVE_RISK, icon: ShieldAlert, labelKey: 'Predictive Risk', roles: ['ADMIN', 'Head_Group_HSE', 'Regional_HSE_Director'] },
    ]
  },
  {
    labelKey: 'OPERATIONS & COMPLIANCE',
    items: [
      { view: View.INCIDENT_MANAGEMENT, icon: AlertOctagon, labelKey: 'Incident Management', roles: ['ADMIN', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor', 'Worker'] },
      { view: View.INSPECTIONS, icon: ClipboardCheck, labelKey: 'Inspections', roles: ['ADMIN', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor'] },
      { view: View.SAFETY_AUDIT, icon: ShieldCheck, labelKey: 'AI Safety Audit', roles: ['ADMIN', 'Head_Group_HSE', 'Site_HSE_Manager', 'Internal_Auditor'] },
      { view: View.PERMIT_TO_WORK, icon: FileSignature, labelKey: 'Permit To Work', roles: ['ADMIN', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor', 'Maintenance_Lead'] },
      { view: View.OBSERVATIONS, icon: Eye, labelKey: 'Safety Observations', roles: ['ADMIN', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor', 'Worker'] },
      { view: View.RCA_TOOL, icon: GitPullRequest, labelKey: 'Root Cause Analysis', roles: ['ADMIN', 'Head_Group_HSE', 'Site_HSE_Manager', 'HSE_Officer'] },
    ]
  },
  {
    labelKey: 'RISK & PLANNING',
    items: [
      { view: View.RAMS, icon: FileText, labelKey: 'RAMS / Planning', roles: ['ADMIN', 'Site_HSE_Manager', 'Project_Manager', 'Site_Supervisor'] },
      { view: View.JSA, icon: CheckSquare, labelKey: 'Job Safety Analysis', roles: ['ADMIN', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor'] },
      { view: View.MOC, icon: GitMerge, labelKey: 'Management of Change', roles: ['ADMIN', 'Head_Group_HSE', 'Site_HSE_Manager', 'Project_Manager'] },
    ]
  },
  {
    labelKey: 'ENVIRONMENTAL & HEALTH',
    items: [
      { view: View.ENVIRONMENTAL, icon: Leaf, labelKey: 'Environmental', roles: ['ADMIN', 'Environmental_Officer', 'Head_Group_HSE', 'Site_HSE_Manager'] },
      { view: View.ESG, icon: Globe, labelKey: 'ESG & Carbon', roles: ['ADMIN', 'Environmental_Officer', 'Head_Group_HSE', 'Board_Director'] },
      { view: View.HEALTH, icon: HeartPulse, labelKey: 'Health Monitoring', roles: ['ADMIN', 'HR_Coordinator', 'Site_HSE_Manager'] },
    ]
  },
  {
    labelKey: 'ASSETS & LOGISTICS',
    items: [
      { view: View.MAINTENANCE, icon: Wrench, labelKey: 'Equipment Maintenance', roles: ['ADMIN', 'Maintenance_Lead', 'Site_HSE_Manager'] },
      { view: View.TRANSPORT, icon: Truck, labelKey: 'Transport & Fleet', roles: ['ADMIN', 'Transport_Manager', 'Site_HSE_Manager'] },
      { view: View.LIFTING, icon: Anchor, labelKey: 'Lifting Operations', roles: ['ADMIN', 'Site_HSE_Manager', 'Site_Supervisor'] },
      { view: View.PPE, icon: HardHat, labelKey: 'PPE Inventory', roles: ['ADMIN', 'Store_Keeper', 'HSE_Officer'] },
      { view: View.SECURITY, icon: Lock, labelKey: 'Security Access', roles: ['ADMIN', 'Security_Officer', 'Site_HSE_Manager'] },
    ]
  },
  {
    labelKey: 'WORKFORCE & CONTRACTORS',
    items: [
      { view: View.CONTRACTOR_PORTAL, icon: Briefcase, labelKey: 'Contractor Portal', roles: ['ADMIN', 'Site_HSE_Manager', 'Project_Manager'] },
      { view: View.TASKS, icon: CheckSquare, labelKey: 'Tasks & Workforce', roles: ['ADMIN', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor', 'Worker'] },
      { view: View.TRAINING, icon: GraduationCap, labelKey: 'Training & Competency', roles: ['ADMIN', 'HR_Coordinator', 'Site_HSE_Manager', 'HSE_Officer', 'Worker'] },
      { view: View.CONNECTED_WORKER, icon: Smartphone, labelKey: 'Connected Worker', roles: ['ADMIN', 'Site_HSE_Manager', 'HSE_Officer'] },
    ]
  },
  {
    labelKey: 'INTELLIGENCE & AI',
    items: [
      { view: View.COMPLIANCE_INTELLIGENCE, icon: Scale, labelKey: 'Compliance Center', roles: ['ADMIN', 'Head_Group_HSE', 'Site_HSE_Manager', 'Legal_Team'] },
      { view: View.COMPLIANCE_ASSISTANT, icon: BookOpen, labelKey: 'AI Safety Assistant', roles: ['ADMIN', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor'] },
      { view: View.ANALYTICS_REPORTING, icon: BarChart3, labelKey: 'Analytics & Reporting', roles: ['ADMIN', 'Board_Director', 'CEO', 'Head_Group_HSE'] },
      { view: View.DIGITAL_TWIN, icon: Box, labelKey: 'Digital Twin', roles: ['ADMIN', 'Head_Group_HSE', 'Site_HSE_Manager'] },
    ]
  },
  {
    labelKey: 'SYSTEM & GOVERNANCE',
    items: [
      { view: View.DMS, icon: FolderTree, labelKey: 'Document Management', roles: ['ADMIN', 'Head_Group_HSE', 'Site_HSE_Manager', 'Legal_Team'] },
      { view: View.IAM, icon: ShieldPlus, labelKey: 'IAM & Access', roles: ['ADMIN'] },
      { view: View.SYSTEM_LOGS, icon: FileClock, labelKey: 'System Logs', roles: ['ADMIN'] },
    ]
  }
];`;

content = content.substring(0, startIndex) + newNavGroups + content.substring(endIndex);

fs.writeFileSync('components/Sidebar.tsx', content);
console.log("Replaced NAV_GROUPS successfully!");
