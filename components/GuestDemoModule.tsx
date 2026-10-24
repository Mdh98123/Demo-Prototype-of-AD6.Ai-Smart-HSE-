import { AITag } from './AITag';
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { AlertTriangle, ClipboardList, PenTool, ArrowRight, ShieldCheck, Download, ChevronRight, CheckCircle2, UserPlus, X, Languages } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LeadCaptureService } from '../services/leadCaptureService';

// --- Ephemeral Storage Hook ---
function useSessionState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (e) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(state) : value;
      setState(valueToStore);
      window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (e) {
      console.warn(e);
    }
  };

  return [state, setValue] as const;
}

// --- Types ---
interface IncidentData {
  date: string;
  location: string;
  severity: 'Minor' | 'Major' | 'Critical';
  description: string;
  witnesses: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  isCompliant: boolean | null;
  riskWeight: number;
}

interface CAPA {
  id: string;
  title: string;
  status: 'Open' | 'In Progress' | 'Verified' | 'Closed';
  type: 'Corrective' | 'Preventive';
  origin: string;
}

// --- Compliance Utilities ---
const getReportingTimeline = (severity: string) => {
  if (severity === 'Critical') return '1 Hour (OSHAD-SF Notification required immediately)';
  if (severity === 'Major') return '4 Hours (Form E submission within 4h)';
  return '24 Hours (Internal investigation, Form E optional pending assessment)';
};

// --- Mock Defaults ---
const adnocChecklistDraft: ChecklistItem[] = [
  { id: '1', text: 'Permit to Work available and authorized by Site Supervisor?', isCompliant: null, riskWeight: 5 },
  { id: '2', text: 'Lifting equipment SWL visible and current colored tag applied?', isCompliant: null, riskWeight: 4 },
  { id: '3', text: 'All workers utilizing correct task-specific PPE?', isCompliant: null, riskWeight: 3 },
  { id: '4', text: 'Excavation edge protection rigid and at least 1m high?', isCompliant: null, riskWeight: 5 },
  { id: '5', text: 'Spill controls and secondary containment in place for chemicals?', isCompliant: null, riskWeight: 4 },
];

const mockCAPAs: CAPA[] = [
  { id: 'CAPA-101', title: 'Replace faulty rigging slings', status: 'In Progress', type: 'Corrective', origin: 'Daily Inspection' },
  { id: 'CAPA-102', title: 'Conduct Working at Heights Refresher', status: 'Open', type: 'Preventive', origin: 'Incident Report #44' },
  { id: 'CAPA-103', title: 'Install physical barriers against excavation', status: 'Verified', type: 'Corrective', origin: 'Safety Walk' },
];

type ActiveView = 'incident' | 'checklist' | 'capa';

export const GuestDemoModule: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const { language, setLanguage, dir, t } = useLanguage();
  const [activeView, setActiveView] = useState<ActiveView>('incident');
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [leadEmail, setLeadEmail] = useState('');
  const [captureStatus, setCaptureStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  // Session Data
  const [incidentData, setIncidentData] = useSessionState<IncidentData>('demo_incident', {
    date: new Date().toISOString().split('T')[0],
    location: '',
    severity: 'Minor',
    description: '',
    witnesses: ''
  });
  const [checklist, setChecklist] = useSessionState<ChecklistItem[]>('demo_checklist', adnocChecklistDraft);
  const [capas, setCapas] = useSessionState<CAPA[]>('demo_capas', mockCAPAs);

  const tx = (arStr: string, enStr: string) => language === 'ar' ? arStr : enStr;

  const handleCapture = async () => {
    if (!leadEmail.includes('@')) return;
    setCaptureStatus('loading');
    await LeadCaptureService.captureEmail(leadEmail);
    // Simulate delay
    setTimeout(() => {
        setCaptureStatus('success');
        setTimeout(() => setShowSignupModal(false), 2000);
    }, 800);
  };

  const handleReportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(30, 58, 138); // Blue
    doc.text('OSHAD Incident Report (Demo)', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
    
    autoTable(doc, {
      startY: 40,
      head: [['Field', 'Details']],
      body: [
        ['Date', incidentData.date],
        ['Location', incidentData.location],
        ['Severity', incidentData.severity],
        ['Reporting Deadline', getReportingTimeline(incidentData.severity)],
        ['Witnesses', incidentData.witnesses],
      ],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 15,
      head: [['Description of Events']],
      body: [[incidentData.description || 'No description provided']],
      theme: 'plain',
    });

    doc.save(`Incident_Report_${Date.now()}.pdf`);
  };

  const currentScore = checklist.reduce((acc, curr) => curr.isCompliant ? acc + curr.riskWeight : acc, 0);
  const maxScore = checklist.reduce((acc, curr) => acc + curr.riskWeight, 0);
  const passRate = maxScore > 0 ? Math.round((currentScore / maxScore) * 100) : 0;

  return (
    <div className={`fixed inset-0 z-50 glass-panel flex flex-col font-sans overflow-hidden ${dir === 'rtl' ? 'rtl font-arabic' : 'ltr'}`} dir={dir}>
      {/* Demo Header */}
      <header className="bg-slate-900 border-b border-slate-800 shrink-0 px-4 md:px-8 py-4 flex items-center justify-between z-10 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <ShieldCheck className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-white font-black text-lg md:text-xl tracking-tight leading-none">AD6.Ai <span className="text-indigo-400">Guest Demo</span></h1>
            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mt-1 max-w-[200px] md:max-w-none truncate">
              {tx('بيئة التقييم لا تتطلب التسجيل - يتم مسح البيانات عند الإغلاق', 'Evaluation Environment - Ephemeral Storage')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')} className="hidden sm:flex px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold uppercase hover:text-white transition-colors items-center gap-2 border border-slate-700">
            <Languages size={14}/> {language === 'ar' ? 'English' : 'عربي'}
          </button>
          <button onClick={() => setShowSignupModal(true)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20 active:scale-95 whitespace-nowrap">
            {tx('حفظ تقدمي', 'Save to Account')}
          </button>
          <button onClick={onExit} className="p-2 text-slate-500 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition">
             <X size={18} />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        
        {/* Vertical Tabs Sidebar */}
        <div className="w-full md:w-64 glass-card border-b md:border-b-0 md:border-e border-slate-200 shrink-0 flex md:flex-col overflow-x-auto md:overflow-y-auto p-4 gap-2 shadow-sm relative z-0">
          <div className="md:mb-6 px-2 shrink-0 md:shrink">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
              {tx('سير العمل الأساسية', 'Core Workflows')}
            </p>
          </div>
          
          <button onClick={() => setActiveView('incident')} className={`flex items-center shrink-0 md:shrink gap-3 p-3 rounded-xl transition-all font-bold text-sm ${activeView === 'incident' ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-slate-500 hover:glass-button'}`}>
            <AlertTriangle size={18} /> <span>{tx('تقرير حادث', 'Incident Report')}</span>
          </button>
          
          <button onClick={() => setActiveView('checklist')} className={`flex items-center shrink-0 md:shrink gap-3 p-3 rounded-xl transition-all font-bold text-sm ${activeView === 'checklist' ? 'bg-teal-50 text-teal-700 shadow-sm border border-teal-100' : 'text-slate-500 hover:glass-button'}`}>
            <ClipboardList size={18} /> <span>{tx('قائمة التفتيش', 'Inspection Checklist')}</span>
          </button>
          
          <button onClick={() => setActiveView('capa')} className={`flex items-center shrink-0 md:shrink gap-3 p-3 rounded-xl transition-all font-bold text-sm ${activeView === 'capa' ? 'bg-amber-50 text-amber-700 shadow-sm border border-amber-100' : 'text-slate-500 hover:glass-button'}`}>
            <PenTool size={18} /> <span>{tx('متتبع الإجراءات التحيحية', 'CAPA Tracker')}</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 glass-panel">
          <div className="max-w-4xl mx-auto h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* INCIDENT VIEW */}
            {activeView === 'incident' && (
              <div className="space-y-6">
                <div className="glass-card p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight">{tx('سجل حادث جديد', 'Log New Incident')}</h2>
                      <p className="text-xs text-slate-500 font-medium mt-1">{tx('الامتثال لمتطلبات OSHAD الآلية', 'Automated OSHAD compliance categorization')}</p>
                    </div>
                    <button onClick={handleReportPDF} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md transition-colors w-full sm:w-auto justify-center">
                      <Download size={16} /> {tx('تصدير كـ PDF', 'Export Report PDF')}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest">{tx('تاريخ وقوع الحدث', 'Date of Occurrence')}</label>
                        <input type="date" value={incidentData.date} onChange={e => setIncidentData(p => ({...p, date: e.target.value}))} className="w-full glass-panel border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:glass-card transition-all font-bold text-slate-700" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest">{tx('الموقع', 'Location')}</label>
                        <input type="text" placeholder={tx('مثال: المنطقة ب المستودع', 'e.g. Zone B Warehouse')} value={incidentData.location} onChange={e => setIncidentData(p => ({...p, location: e.target.value}))} className="w-full glass-panel border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:glass-card transition-all font-bold text-slate-700" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest">{tx('الشدة (حسب OSHAD)', 'Severity (OSHAD CoP)')}</label>
                        <div className="flex flex-wrap gap-3">
                          {['Minor', 'Major', 'Critical'].map(sev => (
                            <button 
                              key={sev}
                              onClick={() => setIncidentData(p => ({...p, severity: sev as any}))}
                              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm border-2 transition-all ${
                                incidentData.severity === sev 
                                ? (sev === 'Critical' ? 'bg-red-50 border-red-500 text-red-700' : sev === 'Major' ? 'bg-orange-50 border-orange-400 text-orange-700' : 'bg-amber-50 border-amber-400 text-amber-700')
                                : 'glass-panel border-slate-100 text-slate-500 hover:border-slate-300'
                              }`}
                            >
                              {tx(sev === 'Minor' ? 'بسيط' : sev === 'Major' ? 'جسيم' : 'حرج', sev)}
                            </button>
                          ))}
                        </div>
                        {/* Auto-suggest guideline based on severity */}
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                           <AlertTriangle className="text-blue-500 shrink-0 mt-0.5" size={16} />
                           <div>
                             <p className="text-xs font-bold text-blue-900">{tx('متطلبات إعداد التقارير القانونية:', 'Statutory Reporting Requirement:')}</p>
                             <p className="text-[11px] text-blue-700 font-medium mt-1">{getReportingTimeline(incidentData.severity)}</p>
                           </div>
                        </div>
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest">{tx('وصف الحادث', 'Description of Event')}</label>
                        <textarea placeholder={tx('قدم تسلسلاً زمنيًا دقيقًا...', 'Provide a factual timeline of events...')} value={incidentData.description} onChange={e => setIncidentData(p => ({...p, description: e.target.value}))} className="w-full glass-panel border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:glass-card transition-all font-medium text-slate-700 h-32 resize-none leading-relaxed" />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest">{tx('الشهود', 'Witnesses')}</label>
                        <input type="text" placeholder={tx('الأسماء وأرقام الهوية...', 'Names and ID references...')} value={incidentData.witnesses} onChange={e => setIncidentData(p => ({...p, witnesses: e.target.value}))} className="w-full glass-panel border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:glass-card transition-all font-bold text-slate-700" />
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* CHECKLIST VIEW */}
            {activeView === 'checklist' && (
               <div className="space-y-6">
                  <div className="glass-card p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200">
                    <div className="mb-8">
                       <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-black text-slate-800 tracking-tight">{tx('قائمة تفتيش المواقع', 'Site Compliance Checklist')}</h2>
                          <span className="px-2 py-0.5 bg-teal-100 text-teal-800 text-[10px] font-black uppercase tracking-widest rounded">ADNOC CoP 7.3</span>
                       </div>
                       <p className="text-xs text-slate-500 font-medium">{tx('تقييم مقيس حسب المخاطر - اضغط للإجابة', 'Risk-weighted assessment matrix. Tap to evaluate.')}</p>
                    </div>

                    <div className="glass-panel rounded-2xl p-4 mb-6 flex items-center justify-between border border-slate-100">
                        <div className="flex items-center gap-4">
                           <div className="relative w-16 h-16 flex items-center justify-center">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-200" />
                                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="175.9" strokeDashoffset={175.9 - (175.9 * passRate) / 100} className={`transition-all duration-1000 ${passRate > 80 ? 'text-emerald-500' : passRate > 50 ? 'text-orange-500' : 'text-red-500'}`} />
                              </svg>
                              <span className="absolute text-sm font-black text-slate-700">{passRate}%</span>
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tx('مؤشر الامتثال', 'Compliance Index')}</p>
                              <p className="text-sm font-bold text-slate-800">{currentScore} / {maxScore} {tx('تم منح النقاط', 'Points Awarded')}</p>
                           </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                       {checklist.map((item) => (
                           <div key={item.id} className="p-4 rounded-xl border-2 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-card hover:border-slate-300 border-slate-100">
                               <div className="flex-1">
                                  <p className="text-sm font-bold text-slate-700 leading-snug pe-4">{item.text}</p>
                                  <span className="inline-block mt-2 text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-widest">Weight: {item.riskWeight}</span>
                               </div>
                               <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                                  <button onClick={() => setChecklist(p => p.map(c => c.id === item.id ? {...c, isCompliant: true} : c))} className={`flex-1 md:flex-none px-6 py-3 rounded-lg font-bold text-sm border-2 transition-all ${item.isCompliant === true ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'glass-panel border-slate-100 text-slate-400 hover:border-emerald-200'}`}>
                                      {tx('نعم', 'Pass')}
                                  </button>
                                  <button onClick={() => setChecklist(p => p.map(c => c.id === item.id ? {...c, isCompliant: false} : c))} className={`flex-1 md:flex-none px-6 py-3 rounded-lg font-bold text-sm border-2 transition-all ${item.isCompliant === false ? 'bg-red-50 border-red-500 text-red-700' : 'glass-panel border-slate-100 text-slate-400 hover:border-red-200'}`}>
                                      {tx('لا', 'Fail')}
                                  </button>
                               </div>
                           </div>
                       ))}
                    </div>

                    {passRate < 100 && checklist.some(c => c.isCompliant === false) && (
                       <div className="mt-8 p-6 bg-slate-900 rounded-2xl border border-slate-700 animate-slide-up">
                           <h4 className="text-white font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2"><ArrowRight className="text-indigo-500" size={16}/> {tx('الإجراءات التلقائية المستنتجة', 'Auto-Generated CAPA')}</h4>
                           <ul className="space-y-2">
                             {checklist.filter(c => c.isCompliant === false).map(c => (
                               <li key={c.id} className="text-slate-300 text-xs font-mono font-medium bg-slate-800 p-3 rounded-lg border border-slate-700 flex justify-between items-center">
                                 <span className="truncate pe-4">⚠️ Fix: {c.text}</span>
                                 <button onClick={() => setActiveView('capa')} className="text-[10px] bg-indigo-600 text-white px-2 py-1 rounded whitespace-nowrap">{tx('تتبع هنا', 'Track in CAPA')}</button>
                               </li>
                             ))}
                           </ul>
                       </div>
                    )}
                  </div>
               </div>
            )}

            {/* CAPA TRACKER */}
            {activeView === 'capa' && (
              <div className="space-y-6">
                <div className="glass-card p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200 overflow-x-auto">
                    <div className="mb-8">
                       <h2 className="text-2xl font-black text-slate-800 tracking-tight">{tx('تتبع الإجراءات (CAPA)', 'CAPA Board')}</h2>
                       <p className="text-xs text-slate-500 font-medium mt-1">{tx('إدارة وتتبع مسار العمليات الوقائية', 'Manage resolution workflows for audit findings')}</p>
                    </div>

                    <div className="flex gap-4 min-w-[700px]">
                       {['Open', 'In Progress', 'Verified', 'Closed'].map(col => (
                         <div key={col} className="flex-1 glass-panel rounded-2xl border-2 border-slate-100 p-4 shrink-0 flex flex-col h-[500px]">
                           <div className="flex items-center justify-between mb-4">
                             <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{tx(col === 'Open' ? 'مفتوح' : col === 'In Progress' ? 'قيد التنفيذ' : col === 'Verified' ? 'تم التحقق' : 'مغلق', col)}</h4>
                             <span className="glass-card border text-[10px] font-bold px-2 py-0.5 rounded text-slate-400 shadow-sm">{capas.filter(c => c.status === col).length}</span>
                           </div>
                           
                           <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pe-1">
                             {capas.filter(c => c.status === col).map(c => (
                               <div key={c.id} className="glass-card p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
                                  <div className="flex items-start justify-between mb-2">
                                     <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm ${c.type === 'Corrective' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>{tx(c.type === 'Corrective' ? 'تصحيحي' : 'وقائي', c.type)}</span>
                                     <span className="text-[9px] text-slate-400 font-mono">{c.id}</span>
                                  </div>
                                  <p className="text-xs font-bold text-slate-700 leading-snug mb-3">{c.title}</p>
                                  
                                  {/* Quick Actions (Simulation) */}
                                  <div className="flex gap-1 border-t border-slate-50 pt-2">
                                    {col !== 'Open' && <button onClick={() => setCapas(p => p.map(x => x.id === c.id ? {...x, status: 'Open'} : x))} className="flex-1 text-center py-1 text-[9px] font-bold text-slate-400 hover:glass-button rounded transition">{"<<"}</button>}
                                    {col !== 'Closed' && <button onClick={() => setCapas(p => p.map(x => x.id === c.id ? {...x, status: col === 'Open' ? 'In Progress' : col === 'In Progress' ? 'Verified' : 'Closed'} : x))} className="flex-1 text-center py-1 text-[9px] font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded transition">{">>"}</button>}
                                  </div>
                               </div>
                             ))}
                           </div>
                         </div>
                       ))}
                    </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Save to Account / Lead Capture Modal */}
      {showSignupModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="glass-card rounded-[2rem] max-w-sm w-full p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
              <button 
                onClick={() => setShowSignupModal(false)}
                className="absolute top-4 end-4 p-2 text-slate-400 hover:text-slate-800 glass-panel rounded-full transition-colors"
              ><X size={18} /></button>
              
              {captureStatus === 'success' ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <CheckCircle2 className="text-emerald-500 w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-2">{tx('تم الحفظ بنجاح!', 'Saved Successfully!')}</h3>
                  <p className="text-sm text-slate-500">{tx('سيتواصل فريقنا قريباً لإعداد حسابك المتقدم.', 'Our enterprise team will reach out shortly to setup your full account.')}</p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 border border-indigo-100">
                      <UserPlus className="text-indigo-600 w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-2">{tx('احفظ تقدمك', 'Save your progress')}</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{tx('أدخل بريدك الإلكتروني المؤسسي ليقوم خبراؤنا بحفظ بيانات التقييم وإعداد عرض مخصص.', 'Enter your work email. Our experts will secure your demo setup and provision a tailored enterprise sandbox.')}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <input 
                        type="email" 
                        placeholder="you@company.com"
                        value={leadEmail}
                        onChange={(e) => setLeadEmail(e.target.value)}
                        className="w-full glass-panel border-2 border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:glass-card transition-all font-bold text-slate-700" 
                      />
                    </div>
                    <button 
                      onClick={handleCapture}
                      disabled={!leadEmail.includes('@') || captureStatus === 'loading'}
                      className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {captureStatus === 'loading' ? <span className="animate-spin border-2 border-white/20 border-t-white rounded-full w-4 h-4"></span> : tx('استكمال التسجيل', 'Create My Sandbox')}
                    </button>
                    <div className="text-center pt-2">
                       <p className="text-[10px] text-slate-400 flex justify-center gap-2"><ShieldCheck size={12}/> {tx('بيانات آمنة ومحمية', 'Enterprise Grade Data Security')}</p>
                    </div>
                  </div>
                </>
              )}
           </div>
        </div>
      )}
    </div>
  );
};
