import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, X, ArrowRight, Zap, Target, LayoutDashboard, ShieldAlert, Activity, FileText } from 'lucide-react';
import { View } from '../types';
import { useUser } from '../contexts/UserContext';
import { canAccessView } from '../services/permissionService';

interface GlobalCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: View, params?: any) => void;
}

const GLOBAL_SEARCH_INDEX = [
  // 1. My Work
  { id: 'cockpit', title: 'Daily Operational Cockpit', subtitle: 'Personalized task queue, actions & shift handover', type: 'My Work', view: View.TASKS },
  { id: 'obs', title: 'My Observations', subtitle: 'Hazard reports & safe acts logged by me', type: 'My Work', view: View.OBSERVATIONS },
  { id: 'toolbox', title: 'Toolbox Talks', subtitle: 'Pre-shift safety briefings & attendance', type: 'My Work', view: View.TOOLBOX },
  { id: 'forms', title: 'Digital Forms & Submissions', subtitle: 'Dynamic checklists and electronic forms', type: 'My Work', view: View.FORMS_BUILDER },

  // 2. Command Center
  { id: 'gis', title: 'Live Operational Map', subtitle: 'Multi-site GIS telemetry, asset geofences & SIMOPS', type: 'Command Center', view: View.GIS_MAP },
  { id: 'exec', title: 'Executive Command Center', subtitle: 'C-suite KPI cockpit, LTIFR, TRIR & board reports', type: 'Command Center', view: View.EXECUTIVE_COMMAND_CENTER },
  { id: 'live-ops', title: 'Active Permits & Live Operations', subtitle: 'Real-time PTW status, workforce count & alarms', type: 'Command Center', view: View.HSE_OPERATIONS },
  { id: 'heat', title: 'Heat Stress Monitor & Risk', subtitle: 'Thermal index forecasting & mid-day work ban enforcement', type: 'Command Center', view: View.PREDICTIVE_RISK },
  { id: 'twin', title: 'Digital Twin 3D', subtitle: '3D facility spatial model & danger zone simulator', type: 'Command Center', view: View.DIGITAL_TWIN },
  { id: 'iot', title: 'IoT Sensor Telemetry', subtitle: 'Fixed H2S gas sensors, noise & environmental gateways', type: 'Command Center', view: View.IOT_STATUS },

  // 3. Control of Work
  { id: 'ptw', title: 'Permit to Work (PTW)', subtitle: 'Electronic permit issuance, hot work, confined space & isolations', type: 'Control of Work', view: View.PERMIT_TO_WORK },
  { id: 'loto', title: 'LOTO Energy Isolations', subtitle: 'Lockout/tagout registers, isolation certificates & boundary tracking', type: 'Control of Work', view: View.LOTO },
  { id: 'simops', title: 'SIMOPS De-Confliction', subtitle: 'Simultaneous operations matrix & hazardous boundary de-confliction', type: 'Control of Work', view: View.PDO_MOL_WORKFLOW },
  { id: 'lifting', title: 'Lifting Operations', subtitle: 'Critical crane lift plans, rigger competency & wind limits', type: 'Control of Work', view: View.LIFTING },
  { id: 'excavation', title: 'Excavation Control', subtitle: 'Underground service detection & trench safety permits', type: 'Control of Work', view: View.EXCAVATION },
  { id: 'rams', title: 'RAMS Method Statements', subtitle: 'Risk assessment method statement builder & reviewer', type: 'Control of Work', view: View.RAMS },
  { id: 'jsa', title: 'Job Safety Analysis (JSA)', subtitle: 'Task hazard breakdown & required safety controls', type: 'Control of Work', view: View.JSA },

  // 4. Risk & Governance
  { id: 'hazards', title: 'Hazard Register', subtitle: 'Enterprise 5x5 risk matrix, bowtie links & mitigation tracking', type: 'Risk & Governance', view: View.HAZARDS },
  { id: 'regulatory-updates', title: 'Latest Regulatory Updates & Announcements', subtitle: 'Live gazettes, ministerial decrees & legal register sync (/api/regulatory/latest)', type: 'Risk & Governance', view: View.REGULATORY_INTELLIGENCE },
  { id: 'bowtie', title: 'Bowtie Risk Visualizer', subtitle: 'Threat barrier analysis, escalation factors & consequence controls', type: 'Risk & Governance', view: View.BOWTIE },
  { id: 'legal', title: 'Legal Register (Compliance)', subtitle: 'Oman Royal Decrees & Labour Law, Oman MoL MD 286/2008 & PDO Specifications & Oman MD 286/2008 statutory tracker', type: 'Risk & Governance', view: View.COMPLIANCE_INTELLIGENCE },
  { id: 'moc', title: 'Management of Change (MOC)', subtitle: 'Engineering, operational & organizational change authorization', type: 'Risk & Governance', view: View.MOC },
  { id: 'esg', title: 'ESG & Carbon Accounting', subtitle: 'MSX, MSX & MSX Oman Scope 1, 2, 3 carbon accounting & ICV', type: 'Risk & Governance', view: View.ESG },
  { id: 'env', title: 'Environmental Monitoring', subtitle: 'Effluent discharge, stack emissions & hazardous waste manifests', type: 'Risk & Governance', view: View.ENVIRONMENTAL },
  { id: 'bcms', title: 'Business Continuity (BCMS)', subtitle: 'Crisis recovery playbooks & disaster simulation', type: 'Risk & Governance', view: View.BUSINESS_CONTINUITY },

  // 5. Incidents & Assurance
  { id: 'incident', title: 'Incident Management', subtitle: 'Near-miss, injury & environmental release reporting with statutory escalation', type: 'Incidents & Assurance', view: View.INCIDENT_MANAGEMENT },
  { id: 'rca', title: 'Root Cause Analysis (RCA)', subtitle: '5-Why, Fishbone & TapRoot systematic investigation engine', type: 'Incidents & Assurance', view: View.RCA_TOOL },
  { id: 'capa', title: 'CAPA Action Manager', subtitle: 'Corrective & preventive actions SLA tracking with escalations', type: 'Incidents & Assurance', view: View.CAPA },
  { id: 'audits', title: 'Audits & Assurance', subtitle: 'ISO 45001, Oman MoL MD 286/2008 & PDO Specifications & corporate compliance scoring', type: 'Incidents & Assurance', view: View.SAFETY_AUDIT },
  { id: 'inspections', title: 'Checklist Inspections', subtitle: 'Routine facility, equipment & scaffolding walkthroughs', type: 'Incidents & Assurance', view: View.INSPECTIONS },
  { id: 'pwa', title: 'Mobile PWA Inspection', subtitle: 'Offline-ready mobile auditor with photo evidence & geo-tagging', type: 'Incidents & Assurance', view: View.PWA_INSPECTIONS },
  { id: 'lessons', title: 'Lessons Learned Base', subtitle: 'Safety alerts, bulletin broadcasts & institutional memory', type: 'Incidents & Assurance', view: View.LESSONS_LEARNED },

  // 6. Workforce & Health
  { id: 'contractors', title: 'Contractor Passports & Portal', subtitle: 'Vendor HSE pre-qualification, gate access & insurance verification', type: 'Workforce & Health', view: View.CONTRACTOR_PORTAL },
  { id: 'training', title: 'Training Matrix & Competency', subtitle: 'Mandatory cert expiry tracker, OPITO & OSHA verification', type: 'Workforce & Health', view: View.TRAINING_COMPETENCY },
  { id: 'health', title: 'Occupational Fitness & Health', subtitle: 'Medical surveillance, audiometry & fit-to-work fitness certs', type: 'Workforce & Health', view: View.HEALTH },
  { id: 'wearables', title: 'Connected Worker Wearables', subtitle: 'Smart helmets, gas clips, biometric vitals & man-down alerts', type: 'Workforce & Health', view: View.CONNECTED_WORKER },
  { id: 'ppe', title: 'PPE Inventory & Allocation', subtitle: 'Protective gear lifecycle, replenishment & inspection logs', type: 'Workforce & Health', view: View.PPE },
  { id: 'transport', title: 'Transport & Fleet Safety', subtitle: 'IVMS GPS tracking, journey management & driver rollover alerts', type: 'Workforce & Health', view: View.TRANSPORT },

  // 7. Enterprise Admin
  { id: 'facilities', title: 'Facility Configuration', subtitle: 'Sites, concessions, operational zones & GPS boundaries', type: 'Enterprise Admin', view: View.PROJECTS },
  { id: 'iam', title: 'RBAC & IAM Permissions', subtitle: 'Multi-tenant role-based access control, security policies & SSO', type: 'Enterprise Admin', view: View.IAM },
  { id: 'comply-flow', title: 'GCC Compliance Settings', subtitle: 'Statutory regulation thresholds, Oman MoL MD 286/2008 & PDO standards', type: 'Enterprise Admin', view: View.COMPLY_FLOW },
  { id: 'dms', title: 'Document Management (DMS)', subtitle: 'Controlled safety procedures, drawings & SOP versioning', type: 'Enterprise Admin', view: View.DMS },
  { id: 'syslogs', title: 'System Audit Logs', subtitle: 'Tamper-evident operational audit trail & security events', type: 'Enterprise Admin', view: View.SYSTEM_LOGS },
  { id: 'design-system', title: 'Design System Gallery', subtitle: 'Enterprise UI component tokens, contrast guides & badges', type: 'Enterprise Admin', view: View.DESIGN_SYSTEM },

  // Key Operational Sites Quick Jumps
  { id: 'site-fhd', title: 'Fahud Field - Oman (PDO)', subtitle: 'Switch active operational context to Concession Block 6', type: 'Site Asset', view: View.GIS_MAP },
  { id: 'site-hbs', title: 'Khazzan Gas Asset Asset - Oman (PDO)', subtitle: 'Switch active operational context to Khazzan Tight Gas Complex Block 61', type: 'Site Asset', view: View.GIS_MAP },
  { id: 'site-ruw', title: 'Mina Al Fahal Refinery Complex - Oman', subtitle: 'Downstream refinery and petrochemical industrial area', type: 'Site Asset', view: View.GIS_MAP },
];

export const GlobalCommandPalette: React.FC<GlobalCommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const { currentUser } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearchQuery('');
    }
  }, [isOpen]);

  const filteredResults = GLOBAL_SEARCH_INDEX.filter(item => {
    // Permission guard: Never reveal unauthorized views in the global command palette
    if (!canAccessView(currentUser, item.view)) {
      return false;
    }
    return (
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (!isOpen) return null;

  const handleSelect = (item: any) => {
    onClose();
    if (item.action === 'ai_chat') {
        window.dispatchEvent(new Event('open-ai-chat'));
    } else {
        onNavigate(item.view, item.action ? { action: item.action } : {});
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pt-[10vh]">
      <div 
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl glass-card/70 dark:bg-neutral-900/80 backdrop-blur-2xl rounded-3xl shadow-[0_30px_100px_-20px_rgba(0,0,0,0.5)] border border-white/50 dark:border-white/10 overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-200">
        
        {/* Glow Effects */}
        <div className="absolute -top-32 -start-32 w-64 h-64 bg-brand-500/20 dark:bg-brand-500/30 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
        <div className="absolute -bottom-32 -end-32 w-64 h-64 bg-emerald-500/20 dark:bg-emerald-500/30 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

        <div className="relative flex items-center px-4 py-4 border-b border-neutral-200/50 dark:border-neutral-800/50">
          <Search size={22} className="text-brand-500 ms-2 animate-pulse" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1   border-none text-xl md:text-2xl font-bold text-neutral-800 dark:text-white px-4 py-2 focus:ring-0 placeholder-neutral-400 dark:placeholder-neutral-600 outline-none"
            placeholder="Type a command or search..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Escape') onClose();
                if (e.key === 'Enter' && filteredResults.length > 0) {
                    handleSelect(filteredResults[0]);
                }
            }}
          />
          <div className="flex gap-2">
            <kbd className="hidden sm:inline-flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-2 py-1 rounded-lg text-[10px] font-bold text-neutral-500">
              <Command size={10} /> K
            </kbd>
            <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors text-neutral-400">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2 relative z-10">
          {searchQuery && filteredResults.length === 0 ? (
            <div className="py-14 text-center">
              <Search size={40} className="mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
              <p className="text-neutral-500 dark:text-neutral-400 font-bold">No results found for "{searchQuery}"</p>
              <p className="text-xs text-neutral-400 mt-1">Try another search term or ask AI</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              <div className="px-3 pb-2 pt-1 text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                Suggestions
              </div>
              {filteredResults.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all group text-start ${i === 0 && searchQuery ? 'bg-brand-50 dark:bg-brand-500/10 border-brand-200 dark:border-brand-500/20' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 border-transparent'} border`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl shadow-sm ${item.type === 'AI' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : 'glass-card dark:bg-neutral-800 text-brand-500'}`}>
                      {item.type === 'AI' ? <Zap size={18} /> : item.type === 'Action' ? <Activity size={18} /> : <LayoutDashboard size={18} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{item.title}</h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-medium">{item.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md">{item.type}</span>
                    <ArrowRight size={16} className="text-neutral-400 group-hover:text-brand-500 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 border-t border-neutral-200/50 dark:border-neutral-800/50 flex justify-between items-center text-xs font-medium text-neutral-500">
           <div className="flex gap-4">
              <span className="flex items-center gap-1"><kbd className="glass-card dark:bg-neutral-800 border dark:border-neutral-700 rounded px-1.5 shadow-sm">↑</kbd> <kbd className="glass-card dark:bg-neutral-800 border dark:border-neutral-700 rounded px-1.5 shadow-sm">↓</kbd> to navigate</span>
              <span className="flex items-center gap-1"><kbd className="glass-card dark:bg-neutral-800 border dark:border-neutral-700 rounded px-1.5 shadow-sm">↵</kbd> to select</span>
           </div>
           <span className="font-bold flex items-center gap-1 opacity-50"><Zap size={12}/> AD6.AI Engine</span>
        </div>
      </div>
    </div>
  );
};
