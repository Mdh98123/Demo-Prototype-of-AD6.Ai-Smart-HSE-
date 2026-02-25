
import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { RAMS, RAMSRevision } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { predictRiskScore } from '../services/geminiService';
import { 
  FileDigit, Plus, Shield, Search, Filter, 
  ChevronRight, Download, Users, CheckCircle2, 
  Activity, AlertTriangle, PenTool, Zap, History,
  LayoutGrid, List, AlertOctagon, Calculator,
  GitBranch, FileDiff, Save, X, Clock, Archive,
  RotateCcw, Info, AlertCircle, Loader2, BrainCircuit
} from 'lucide-react';

const INITIAL_RAMS: RAMS[] = [
    {
        id: 'RAMS-201',
        title: 'Working at Height - Tower Crane Assembly',
        activity: 'Structural Installation',
        version: '1.5',
        status: 'Approved',
        probability: 4,
        severity: 4,
        riskScore: 16,
        riskLevel: 'Critical',
        hazards: ['Falls from height', 'Dropped objects', 'Wind loading'],
        controls: ['Full body harness', 'Exclusion zone', 'Anemometer monitoring'],
        briefingLogs: [
            { workerName: 'Rahul Gupta', signedAt: '2024-05-20 07:00', signatureHash: 'ax89-p21' },
            { workerName: 'Ahmed Salem', signedAt: '2024-05-20 07:05', signatureHash: 'bz44-q90' }
        ],
        revisionHistory: [
            { 
                version: '1.4', 
                date: '2024-05-15T10:00:00Z', 
                changedBy: 'Sarah Jones', 
                changeDescription: 'Updated wind speed limits for crane operation.', 
                previousRiskScore: 16,
                snapshot: {
                    probability: 4, severity: 4, riskScore: 16, riskLevel: 'Critical',
                    hazards: ['Falls from height', 'Wind loading'],
                    controls: ['Full body harness', 'Wind limits updated to 10m/s']
                }
            }
        ]
    },
    {
        id: 'RAMS-202',
        title: 'Confined Space Entry - Tank C4',
        activity: 'Internal Coating',
        version: '2.0',
        status: 'Under Review',
        probability: 3,
        severity: 4,
        riskScore: 12,
        riskLevel: 'High',
        hazards: ['Oxygen deficiency', 'Toxic vapors', 'Engulfment'],
        controls: ['Gas testing', 'Forced ventilation', 'Standby man'],
        briefingLogs: [],
        revisionHistory: []
    }
];

const RAMSModule: React.FC = () => {
  const { currentUser } = useUser();
  
  // Risk Matrix State for Calculator - Persisted
  const [newProb, setNewProb] = useState<1|2|3|4|5>(() => parseInt(localStorage.getItem('rams_calc_prob') || '1') as any);
  const [newSev, setNewSev] = useState<1|2|3|4|5>(() => parseInt(localStorage.getItem('rams_calc_sev') || '1') as any);
  
  // Persist Calculator Inputs
  useEffect(() => {
      localStorage.setItem('rams_calc_prob', newProb.toString());
      localStorage.setItem('rams_calc_sev', newSev.toString());
  }, [newProb, newSev]);

  const [showCalculator, setShowCalculator] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);

  // Creation Modal State & Draft Persistence
  const [showCreateModal, setShowCreateModal] = useState(false);
  // Extended form for AI Prediction
  const [createForm, setCreateForm] = useState(() => {
      const saved = localStorage.getItem('hse_rams_draft');
      return saved ? JSON.parse(saved) : { 
          title: '', activity: '', hazards: '', controls: '', 
          // New Fields for AI
          weather: 'Clear', equipmentStatus: 'Operational', crewSize: 4, incidentHistory: 0 
      };
  });

  const [isPredicting, setIsPredicting] = useState(false);
  const [aiPrediction, setAiPrediction] = useState<{
      score: number;
      confidence: number;
      factors: {factor: string, impact: string}[];
      suggestions: string[];
  } | null>(null);

  // Validation State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Persist Draft Inputs
  useEffect(() => {
      localStorage.setItem('hse_rams_draft', JSON.stringify(createForm));
  }, [createForm]);

  // Version Control State
  const [selectedRams, setSelectedRams] = useState<RAMS | null>(null);
  const [changeDescription, setChangeDescription] = useState('');

  const calculateRisk = (prob: number, sev: number) => {
      const score = prob * sev;
      let level: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
      if (score >= 15) level = 'Critical';
      else if (score >= 10) level = 'High';
      else if (score >= 5) level = 'Medium';
      return { score, level };
  };

  const currentRisk = calculateRisk(newProb, newSev);

  // Main Data Registry - Persisted
  const [ramsList, setRamsList] = useState<RAMS[]>(() => {
      const saved = localStorage.getItem('hse_rams_registry');
      return saved ? JSON.parse(saved) : INITIAL_RAMS;
  });

  // Persist Main Registry
  useEffect(() => {
      localStorage.setItem('hse_rams_registry', JSON.stringify(ramsList));
  }, [ramsList]);

  const validate = (field: string, value: any) => {
      let error = "";
      if (field === 'title' && !value) error = "RAMS title is required.";
      if (field === 'activity' && !value) error = "Activity description is required.";
      if (field === 'crewSize' && (!value || value < 1)) error = "Crew size must be at least 1.";
      return error;
  };

  const handleBlur = (field: string, value: any) => {
      setTouched(prev => ({...prev, [field]: true}));
      setErrors(prev => ({...prev, [field]: validate(field, value)}));
  };

  const handlePredictRisk = async () => {
      const actErr = validate('activity', createForm.activity);
      if (actErr) {
          setErrors(prev => ({...prev, activity: actErr}));
          setTouched(prev => ({...prev, activity: true}));
          return;
      }

      setIsPredicting(true);
      try {
          const result = await predictRiskScore({
              activity_type: createForm.activity,
              weather_condition: createForm.weather,
              equipment_status: createForm.equipmentStatus,
              historical_incidents_30d: createForm.incidentHistory,
              crew_size: createForm.crewSize
          });
          
          setAiPrediction({
              score: result.risk_score,
              confidence: result.confidence,
              factors: result.key_factors,
              suggestions: result.mitigation_suggestions
          });
          
          // Optionally update suggestions into form
          if (result.mitigation_suggestions.length > 0 && !createForm.controls) {
              setCreateForm(prev => ({...prev, controls: result.mitigation_suggestions.join(', ')}));
          }

      } catch (e) {
          console.error(e);
      } finally {
          setIsPredicting(false);
      }
  };

  const handleCreateRAMS = () => {
      const titleErr = validate('title', createForm.title);
      const actErr = validate('activity', createForm.activity);
      
      setErrors({ title: titleErr, activity: actErr });
      setTouched({ title: true, activity: true });

      if (titleErr || actErr) return;

      // Prefer AI score if available, mapped roughly to 1-25 scale, otherwise manual
      let prob = newProb;
      let sev = newSev;
      
      // If AI predicted risk score (1-100), map to matrix roughly for demo consistency
      if (aiPrediction) {
          const scaled = Math.ceil(aiPrediction.score / 20); // 1-5
          sev = Math.min(5, Math.max(1, scaled)) as any;
          // Keep prob manual or set default
      }

      const { score, level } = calculateRisk(prob, sev);

      const newRams: RAMS = {
          id: `RAMS-${Date.now().toString().slice(-6)}`,
          title: createForm.title,
          activity: createForm.activity,
          version: '1.0',
          status: 'Draft',
          probability: prob,
          severity: sev,
          riskScore: score,
          riskLevel: level,
          hazards: createForm.hazards.split(',').map(s => s.trim()).filter(Boolean),
          controls: createForm.controls.split(',').map(s => s.trim()).filter(Boolean),
          briefingLogs: [],
          revisionHistory: []
      };

      setRamsList(prev => [newRams, ...prev]);
      
      // Clear Draft
      setCreateForm({ title: '', activity: '', hazards: '', controls: '', weather: 'Clear', equipmentStatus: 'Operational', crewSize: 4, incidentHistory: 0 });
      setAiPrediction(null);
      setErrors({});
      setTouched({});
      setShowCreateModal(false);
  };

  const handleCreateRevision = () => {
      if (!selectedRams || !changeDescription) return;

      const currentVer = parseFloat(selectedRams.version);
      const nextVer = (currentVer + 0.1).toFixed(1);

      // Create a snapshot of the current state (before this revision) to push to history
      const newRevision: RAMSRevision = {
          version: selectedRams.version,
          date: new Date().toISOString(),
          changedBy: currentUser.name,
          changeDescription: changeDescription,
          previousRiskScore: selectedRams.riskScore,
          snapshot: {
              probability: selectedRams.probability,
              severity: selectedRams.severity,
              riskScore: selectedRams.riskScore,
              riskLevel: selectedRams.riskLevel,
              hazards: selectedRams.hazards,
              controls: selectedRams.controls
          }
      };

      const updatedRams: RAMS = {
          ...selectedRams,
          version: nextVer,
          status: 'Under Review', // Reset status on change
          revisionHistory: [newRevision, ...selectedRams.revisionHistory]
      };

      setRamsList(prev => prev.map(r => r.id === updatedRams.id ? updatedRams : r));
      setSelectedRams(null); // Close modal
      setChangeDescription('');
  };

  const handleRestoreRevision = (rev: RAMSRevision) => {
      if (!selectedRams || !rev.snapshot) return;
      
      const confirmRestore = window.confirm(`Are you sure you want to revert contents to Version ${rev.version}? This will overwrite current draft data.`);
      if (!confirmRestore) return;

      const restoredState: RAMS = {
          ...selectedRams,
          probability: rev.snapshot.probability as any,
          severity: rev.snapshot.severity as any,
          riskScore: rev.snapshot.riskScore,
          riskLevel: rev.snapshot.riskLevel as any,
          hazards: rev.snapshot.hazards,
          controls: rev.snapshot.controls
      };

      setSelectedRams(restoredState);
      setChangeDescription(`Restored content from Version ${rev.version}. Reason: `);
  };

  const handleExportPDF = (rams: RAMS) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // --- Header ---
    doc.setFillColor(79, 70, 229); // Brand Indigo
    doc.rect(0, 0, pageWidth, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('AD6.Ai Smart HSE Suite', 14, 13);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('RAMS Document Export', pageWidth - 14, 13, { align: 'right' });

    // --- Title Section ---
    let currentY = 35;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(rams.title, 14, currentY);
    
    currentY += 10;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Reference ID: ${rams.id}`, 14, currentY);
    doc.text(`Status: ${rams.status}`, pageWidth - 14, currentY, { align: 'right' });

    currentY += 6;
    doc.text(`Activity: ${rams.activity}`, 14, currentY);
    doc.text(`Version: ${rams.version}`, pageWidth - 14, currentY, { align: 'right' });

    // --- Risk Assessment Section ---
    currentY += 15;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, currentY, pageWidth - 14, currentY);
    currentY += 10;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("Risk Assessment Matrix", 14, currentY);

    currentY += 5;
    
    // Determine Color for Risk Level
    let riskColor = [16, 185, 129]; // Emerald
    if (rams.riskLevel === 'Critical') riskColor = [239, 68, 68]; // Red
    else if (rams.riskLevel === 'High') riskColor = [249, 115, 22]; // Orange
    else if (rams.riskLevel === 'Medium') riskColor = [234, 179, 8]; // Yellow

    autoTable(doc, {
        startY: currentY,
        head: [['Probability (1-5)', 'Severity (1-5)', 'Risk Score', 'Risk Level']],
        body: [[
            rams.probability.toString(), 
            rams.severity.toString(), 
            rams.riskScore.toString(), 
            rams.riskLevel.toUpperCase()
        ]],
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
        bodyStyles: { textColor: 50 },
        columnStyles: {
            3: { fontStyle: 'bold', textColor: riskColor as any }
        }
    });

    // --- Hazards & Controls ---
    currentY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Hazards & Critical Controls", 14, currentY);

    const hazardRows = [];
    const maxRows = Math.max(rams.hazards.length, rams.controls.length);
    for(let i=0; i<maxRows; i++) {
        hazardRows.push([
            rams.hazards[i] ? `• ${rams.hazards[i]}` : '', 
            rams.controls[i] ? `✓ ${rams.controls[i]}` : ''
        ]);
    }

    autoTable(doc, {
        startY: currentY + 5,
        head: [['Identified Hazards', 'Control Measures']],
        body: hazardRows,
        theme: 'striped',
        headStyles: { fillColor: [71, 85, 105] }, // Slate 600
        columnStyles: {
            0: { cellWidth: (pageWidth - 28) / 2 },
            1: { cellWidth: (pageWidth - 28) / 2 }
        }
    });

    // --- Briefing Signatures ---
    if (rams.briefingLogs.length > 0) {
        currentY = (doc as any).lastAutoTable.finalY + 15;
        
        // Check for page break
        if (currentY > 250) {
            doc.addPage();
            currentY = 20;
        }

        doc.setFontSize(12);
        doc.text("Briefing Attendance Log", 14, currentY);

        const sigRows = rams.briefingLogs.map(log => [
            log.workerName,
            new Date(log.signedAt).toLocaleString(),
            log.signatureHash,
            'Verified'
        ]);

        autoTable(doc, {
            startY: currentY + 5,
            head: [['Worker Name', 'Timestamp', 'Digital Signature', 'Status']],
            body: sigRows,
            theme: 'plain',
            headStyles: { fillColor: [241, 245, 249], textColor: 0 },
            columnStyles: {
                2: { font: 'courier', fontSize: 8 },
                3: { textColor: [16, 185, 129], fontStyle: 'bold' }
            }
        });
    }

    // --- Footer ---
    const pageCount = doc.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Generated on ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 10);
        doc.text("AD6.Ai Enterprise System", pageWidth - 14, doc.internal.pageSize.height - 10, { align: 'right' });
    }

    doc.save(`${rams.id}_Risk_Assessment.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
          <div className="flex items-center space-x-5">
            <div className="bg-teal-600 p-5 rounded-[2rem] text-white shadow-2xl shadow-teal-500/20">
                <FileDigit size={32} />
            </div>
            <div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">RAMS Manager</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-l-2 border-teal-500 pl-4">Activity Risk Assessment & Method Statements</p>
            </div>
          </div>
          <div className="flex gap-4">
              <button onClick={() => setShowLibrary(!showLibrary)} className={`px-6 py-4 rounded-[2rem] flex items-center gap-3 font-black uppercase tracking-[0.2em] text-[10px] transition-all ${showLibrary ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white border-2 border-slate-100 text-slate-500 hover:text-indigo-600'}`}>
                  <Archive size={18}/> Best Practices
              </button>
              <button onClick={() => setShowCalculator(!showCalculator)} className="bg-white border-2 border-slate-100 text-slate-500 px-6 py-4 rounded-[2rem] flex items-center gap-3 font-black uppercase tracking-[0.2em] text-[10px] hover:text-indigo-600 transition-all">
                  <Calculator size={18}/> Risk Matrix
              </button>
              <button onClick={() => setShowCreateModal(true)} className="bg-slate-900 text-white px-8 py-4 rounded-[2rem] flex items-center gap-4 font-black uppercase tracking-[0.2em] text-[10px] shadow-3xl hover:bg-slate-800 transition-all active:scale-95">
                  <Plus size={20} /> Initiate RAMS
              </button>
          </div>
      </div>

      {showLibrary && (
          <div className="bg-indigo-50 p-8 rounded-[3rem] shadow-xl mb-8 animate-in slide-in-from-top-4 duration-300 border-2 border-indigo-100">
              <div className="flex justify-between items-center mb-8">
                  <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3 text-indigo-900"><Archive size={24} className="text-indigo-600"/> Best Practice RA Library</h3>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Verified Industry Templates</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                      { title: 'Brick Work Risk Assessment', activity: 'Masonry', hazards: 4, controls: 6 },
                      { title: 'Arc Welding Safety RA', activity: 'Hot Work', hazards: 5, controls: 8 },
                      { title: 'Excavation & Trenching', activity: 'Groundworks', hazards: 7, controls: 10 },
                      { title: 'Chemical Storage Protocol', activity: 'Logistics', hazards: 3, controls: 5 },
                      { title: 'Scaffolding Erection', activity: 'Work at Height', hazards: 6, controls: 9 },
                      { title: 'Confined Space Entry', activity: 'Maintenance', hazards: 8, controls: 12 },
                  ].map((item, i) => (
                      <div key={i} className="bg-white p-6 rounded-[2rem] border border-indigo-100 hover:shadow-lg transition-all group">
                          <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight mb-2 group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                          <div className="flex justify-between items-center mb-4">
                              <span className="text-[9px] font-black text-indigo-400 uppercase">{item.activity}</span>
                              <div className="flex gap-2">
                                  <span className="text-[8px] font-bold bg-slate-50 px-2 py-0.5 rounded text-slate-500">{item.hazards} Hazards</span>
                                  <span className="text-[8px] font-bold bg-slate-50 px-2 py-0.5 rounded text-slate-500">{item.controls} Controls</span>
                              </div>
                          </div>
                          <button 
                            onClick={() => {
                                setCreateForm({
                                    ...createForm,
                                    title: item.title,
                                    activity: item.activity,
                                    hazards: 'Standard hazards for ' + item.activity,
                                    controls: 'Standard controls for ' + item.activity
                                });
                                setShowCreateModal(true);
                                setShowLibrary(false);
                            }}
                            className="w-full py-2 bg-slate-50 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
                          >
                              <FileDigit size={14}/> Use Template
                          </button>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {showCalculator && (
          <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-3xl mb-8 animate-in slide-in-from-top-4 duration-300">
              {/* ... existing calculator UI ... */}
              <div className="flex justify-between items-start mb-8">
                  <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3"><AlertOctagon size={24} className="text-teal-400"/> Risk Calculator</h3>
                  <div className={`px-6 py-2 rounded-2xl border font-black uppercase text-xs tracking-widest ${
                      currentRisk.level === 'Critical' ? 'bg-red-500 border-red-400' :
                      currentRisk.level === 'High' ? 'bg-orange-500 border-orange-400' :
                      currentRisk.level === 'Medium' ? 'bg-yellow-500 border-yellow-400 text-slate-900' :
                      'bg-emerald-500 border-emerald-400'
                  }`}>
                      Score: {currentRisk.score} ({currentRisk.level})
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-12">
                  <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Probability (Likelihood)</label>
                      <div className="flex justify-between bg-white/10 p-2 rounded-2xl">
                          {[1,2,3,4,5].map(v => (
                              <button key={v} onClick={() => setNewProb(v as any)} className={`w-12 h-12 rounded-xl font-black transition-all ${newProb === v ? 'bg-teal-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>{v}</button>
                          ))}
                      </div>
                      <p className="text-[9px] text-slate-400 text-right uppercase font-bold">1 = Rare | 5 = Almost Certain</p>
                  </div>
                  <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Severity (Impact)</label>
                      <div className="flex justify-between bg-white/10 p-2 rounded-2xl">
                          {[1,2,3,4,5].map(v => (
                              <button key={v} onClick={() => setNewSev(v as any)} className={`w-12 h-12 rounded-xl font-black transition-all ${newSev === v ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>{v}</button>
                          ))}
                      </div>
                      <p className="text-[9px] text-slate-400 text-right uppercase font-bold">1 = Negligible | 5 = Catastrophic</p>
                  </div>
              </div>
          </div>
      )}

      {/* RAMS LIST ... existing UI ... */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                  {ramsList.map(rams => (
                      <div key={rams.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-slate-50 hover:border-teal-500/30 transition-all group relative overflow-hidden">
                          <div className={`absolute top-0 left-0 w-2 h-full transition-all group-hover:w-3 ${rams.riskLevel === 'Critical' ? 'bg-red-600' : rams.riskLevel === 'High' ? 'bg-orange-500' : 'bg-teal-500'}`} />
                          <div className="flex justify-between items-start mb-6">
                              <div>
                                  <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border-2 shadow-sm ${rams.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>{rams.status}</span>
                                  <h4 className="text-xl font-black text-slate-800 mt-3 tracking-tighter uppercase leading-tight">{rams.title}</h4>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Activity: {rams.activity}</p>
                              </div>
                              <div className="text-right">
                                  <div className="flex flex-col items-end">
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Score</p>
                                      <div className={`text-3xl font-black ${rams.riskScore >= 15 ? 'text-red-600' : rams.riskScore >= 10 ? 'text-orange-500' : 'text-emerald-600'}`}>{rams.riskScore}</div>
                                      <span className="text-[9px] font-bold uppercase text-slate-400">{rams.riskLevel}</span>
                                  </div>
                              </div>
                          </div>

                          <div className="space-y-4">
                              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Critical Controls</p>
                                  <div className="flex flex-wrap gap-2">
                                      {rams.controls.map((c, i) => (
                                          <span key={i} className="bg-white px-2.5 py-1 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 uppercase">{c}</span>
                                      ))}
                                  </div>
                              </div>
                              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                  <div className="flex items-center gap-4 text-slate-400">
                                      <div className="flex items-center gap-1.5"><Users size={14}/><span className="text-[10px] font-black">{rams.briefingLogs.length} Signatures</span></div>
                                      <div className="flex items-center gap-1.5 font-mono"><Zap size={14}/><span className="text-[9px]">V{rams.version}</span></div>
                                  </div>
                                  <div className="flex gap-2">
                                      <button 
                                        onClick={() => setSelectedRams(rams)}
                                        className="bg-slate-50 text-slate-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2"
                                      >
                                          <GitBranch size={14}/> Revise / History
                                      </button>
                                      <button 
                                        onClick={() => handleExportPDF(rams)}
                                        className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-slate-800 transition-all shadow-xl"
                                        title="Export PDF"
                                      >
                                          <Download size={18}/>
                                      </button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3"><PenTool size={18} className="text-teal-600"/> Briefing Terminal</h3>
                  <p className="text-xs text-slate-500 mb-8 font-medium leading-relaxed italic border-l-4 border-teal-500/20 pl-6">
                      Deploy a digital signature terminal to site workers for mandatory activity briefings.
                  </p>
                  <div className="space-y-4">
                      <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 flex items-center justify-between group cursor-pointer hover:border-teal-500 transition-all">
                          <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Active Activity</p>
                              <p className="text-xs font-black text-slate-800 uppercase tracking-tight leading-tight">Crane Lift Site A</p>
                          </div>
                          <div className="p-3 bg-white rounded-xl text-teal-600 shadow-sm"><CheckCircle2 size={20}/></div>
                      </div>
                  </div>
                  <button className="w-full mt-8 bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-3xl hover:bg-slate-800 transition-all active:scale-95">
                      Open Site Terminal
                  </button>
              </div>
          </div>
      </div>

      {/* CREATE NEW RAMS MODAL (Enhanced with FEAT-001) */}
      {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-3xl p-10 border-4 border-white animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
                  <div className="flex justify-between items-center mb-8">
                      <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Initiate RAMS</h3>
                      <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={24} className="text-slate-400"/></button>
                  </div>
                  
                  <div className="space-y-6">
                      <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">RAMS Title <span className="text-red-500">*</span></label>
                          <input 
                              type="text" 
                              className={`w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none font-bold text-sm text-slate-700 transition-all ${
                                  errors.title ? 'border-red-500 bg-red-50/10' : touched.title && createForm.title ? 'border-emerald-500 bg-emerald-50/5' : 'border-slate-50 focus:border-teal-500'
                              }`}
                              placeholder="e.g. Roof Waterproofing Zone 1"
                              value={createForm.title}
                              onChange={(e) => setCreateForm({...createForm, title: e.target.value})}
                              onBlur={() => handleBlur('title', createForm.title)}
                          />
                          {errors.title && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 flex items-center gap-1"><AlertCircle size={10}/> {errors.title}</p>}
                      </div>
                      
                      <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Activity Description <span className="text-red-500">*</span></label>
                          <input 
                              type="text" 
                              className={`w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none font-bold text-sm text-slate-700 transition-all ${
                                  errors.activity ? 'border-red-500 bg-red-50/10' : touched.activity && createForm.activity ? 'border-emerald-500 bg-emerald-50/5' : 'border-slate-50 focus:border-teal-500'
                              }`}
                              placeholder="e.g. Application of bitumen membrane"
                              value={createForm.activity}
                              onChange={(e) => setCreateForm({...createForm, activity: e.target.value})}
                              onBlur={() => handleBlur('activity', createForm.activity)}
                          />
                          {errors.activity && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 flex items-center gap-1"><AlertCircle size={10}/> {errors.activity}</p>}
                      </div>

                      {/* AI Predictive Risk Input Fields */}
                      <div className="p-6 bg-indigo-50 rounded-3xl border-2 border-indigo-100">
                          <h4 className="text-xs font-black text-indigo-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <BrainCircuit size={16}/> AI Predictive Risk Parameters
                          </h4>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                  <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Weather Condition</label>
                                  <select 
                                      className="w-full p-3 bg-white border border-indigo-100 rounded-xl text-xs font-bold text-slate-700 outline-none"
                                      value={createForm.weather}
                                      onChange={(e) => setCreateForm({...createForm, weather: e.target.value})}
                                  >
                                      <option>Clear</option>
                                      <option>Rain</option>
                                      <option>High Wind</option>
                                      <option>Fog</option>
                                      <option>Extreme Heat</option>
                                  </select>
                              </div>
                              <div>
                                  <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Equipment Status</label>
                                  <select 
                                      className="w-full p-3 bg-white border border-indigo-100 rounded-xl text-xs font-bold text-slate-700 outline-none"
                                      value={createForm.equipmentStatus}
                                      onChange={(e) => setCreateForm({...createForm, equipmentStatus: e.target.value})}
                                  >
                                      <option>Operational</option>
                                      <option>Maintenance Pending</option>
                                      <option>New/Untested</option>
                                  </select>
                              </div>
                              <div>
                                  <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Crew Size</label>
                                  <input 
                                      type="number" 
                                      className={`w-full p-3 bg-white border border-indigo-100 rounded-xl text-xs font-bold text-slate-700 outline-none ${errors.crewSize ? 'border-red-500' : ''}`}
                                      value={createForm.crewSize}
                                      onChange={(e) => setCreateForm({...createForm, crewSize: parseInt(e.target.value)})}
                                      onBlur={() => handleBlur('crewSize', createForm.crewSize)}
                                  />
                                  {errors.crewSize && <p className="text-red-500 text-[9px] font-bold mt-1 ml-1">{errors.crewSize}</p>}
                              </div>
                              <div>
                                  <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Recent Incidents (30d)</label>
                                  <input 
                                      type="number" 
                                      className="w-full p-3 bg-white border border-indigo-100 rounded-xl text-xs font-bold text-slate-700 outline-none"
                                      value={createForm.incidentHistory}
                                      onChange={(e) => setCreateForm({...createForm, incidentHistory: parseInt(e.target.value)})}
                                  />
                              </div>
                          </div>
                          
                          <button 
                              onClick={handlePredictRisk}
                              disabled={isPredicting || !createForm.activity}
                              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                              {isPredicting ? <Loader2 className="animate-spin" size={14}/> : <Zap size={14}/>} Calculate Predictive Risk Score
                          </button>

                          {/* AI Result Display */}
                          {aiPrediction && (
                              <div className="mt-4 pt-4 border-t border-indigo-200">
                                  <div className="flex justify-between items-center mb-3">
                                      <span className="text-[10px] font-black text-indigo-900 uppercase">AI Risk Assessment</span>
                                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black text-white ${
                                          aiPrediction.score > 60 ? 'bg-red-500' : aiPrediction.score > 30 ? 'bg-orange-500' : 'bg-emerald-500'
                                      }`}>Score: {aiPrediction.score}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-600 mb-2">
                                      <span className="font-bold">Confidence:</span> {aiPrediction.confidence * 100}%
                                      {aiPrediction.confidence < 0.7 && <span className="text-orange-500 ml-2">(Low confidence - verify manually)</span>}
                                  </div>
                                  <div className="space-y-1 mb-3">
                                      {aiPrediction.factors.map((f, i) => (
                                          <div key={i} className="flex justify-between text-[9px] font-bold text-slate-500">
                                              <span>{f.factor}</span>
                                              <span className="text-indigo-600">{f.impact}</span>
                                          </div>
                                      ))}
                                  </div>
                                  <div className="bg-white p-3 rounded-xl border border-indigo-100">
                                      <p className="text-[9px] font-black text-indigo-400 uppercase mb-1">AI Mitigation Suggestions</p>
                                      <ul className="list-disc list-inside text-[10px] text-slate-600">
                                          {aiPrediction.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                                      </ul>
                                  </div>
                              </div>
                          )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Identify Hazards</label>
                              <textarea 
                                  className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none font-bold text-sm text-slate-700 focus:border-teal-500 transition-all resize-none h-32"
                                  placeholder="Separate with commas..."
                                  value={createForm.hazards}
                                  onChange={(e) => setCreateForm({...createForm, hazards: e.target.value})}
                              />
                          </div>
                          <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Proposed Controls</label>
                              <textarea 
                                  className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none font-bold text-sm text-slate-700 focus:border-teal-500 transition-all resize-none h-32"
                                  placeholder="Separate with commas..."
                                  value={createForm.controls}
                                  onChange={(e) => setCreateForm({...createForm, controls: e.target.value})}
                              />
                          </div>
                      </div>

                      <button 
                          onClick={handleCreateRAMS}
                          disabled={!createForm.title || !createForm.activity}
                          className="w-full py-4 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-teal-700 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          Create Draft Document
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Revision Modal ... existing ... */}
      {selectedRams && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-6xl rounded-[2.5rem] shadow-3xl overflow-hidden flex flex-col md:flex-row h-[85vh] border-4 border-white animate-in zoom-in-95 duration-300">
                  {/* Left: Revision Actions */}
                  <div className="w-full md:w-5/12 p-10 bg-slate-50 flex flex-col border-r border-slate-100">
                      <div className="mb-8">
                          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none mb-2">Version Control</h3>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Managing: {selectedRams.id}</p>
                      </div>

                      <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
                          <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm">
                              <div className="flex justify-between items-center mb-6">
                                  <div>
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Current Version</p>
                                      <div className="flex items-center gap-2">
                                        <p className="text-3xl font-black text-slate-800">{selectedRams.version}</p>
                                        <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-[9px] font-black uppercase border border-emerald-100">Active Head</span>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target Version</p>
                                      <p className="text-3xl font-black text-indigo-600">{(parseFloat(selectedRams.version) + 0.1).toFixed(1)}</p>
                                  </div>
                              </div>
                              
                              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                      <Activity size={12}/> Current Profile (To be committed)
                                  </p>
                                  <div className="grid grid-cols-2 gap-4 mb-3">
                                      <div>
                                          <p className="text-[8px] font-bold text-slate-400 uppercase">Risk Level</p>
                                          <p className={`text-sm font-black ${selectedRams.riskLevel === 'Critical' ? 'text-red-600' : 'text-emerald-600'}`}>{selectedRams.riskLevel} ({selectedRams.riskScore})</p>
                                      </div>
                                      <div>
                                          <p className="text-[8px] font-bold text-slate-400 uppercase">Controls</p>
                                          <p className="text-sm font-black text-slate-700">{selectedRams.controls.length} Defined</p>
                                      </div>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                      {selectedRams.hazards.slice(0,3).map((h,i) => (
                                          <span key={i} className="text-[8px] font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-500">{h}</span>
                                      ))}
                                      {selectedRams.hazards.length > 3 && <span className="text-[8px] font-bold text-slate-400">+{selectedRams.hazards.length - 3} more</span>}
                                  </div>
                              </div>

                              <div className="h-px bg-slate-100 mb-6"></div>
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block flex items-center gap-2">
                                  <FileDiff size={14}/> Change Description
                              </label>
                              <textarea 
                                  className="w-full h-32 p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm text-slate-700 resize-none shadow-inner placeholder:text-slate-400 placeholder:font-medium"
                                  placeholder="Describe updates to controls, hazards, or scope to create a new revision..."
                                  value={changeDescription}
                                  onChange={(e) => setChangeDescription(e.target.value)}
                              />
                          </div>
                      </div>

                      <div className="mt-4 flex gap-4">
                          <button onClick={() => setSelectedRams(null)} className="px-8 py-4 rounded-2xl text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all">Cancel</button>
                          <button 
                            onClick={handleCreateRevision}
                            disabled={!changeDescription}
                            className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                          >
                              <Save size={16}/> Commit Revision
                          </button>
                      </div>
                  </div>

                  {/* Right: History Timeline */}
                  <div className="w-full md:w-7/12 p-10 bg-white overflow-y-auto custom-scrollbar relative">
                      <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-8 sticky top-0 bg-white py-4 z-10 flex items-center gap-3 border-b border-slate-50">
                          <History size={18} className="text-teal-600"/> Revision Timeline
                      </h4>
                      
                      <div className="relative space-y-8 pl-8">
                          <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-100"></div>
                          
                          {selectedRams.revisionHistory.length === 0 ? (
                              <div className="text-center py-20">
                                  <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No previous revisions recorded.</p>
                              </div>
                          ) : (
                              selectedRams.revisionHistory.map((rev, idx) => (
                                  <div key={idx} className="relative z-10">
                                      <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-slate-200 border-4 border-slate-300 shadow-sm"></div>
                                      <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-50 hover:border-teal-100 transition-all group opacity-85 hover:opacity-100 flex flex-col gap-4">
                                          <div className="flex justify-between items-start">
                                              <div className="flex items-center gap-3">
                                                  <span className="bg-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm text-slate-600">V{rev.version}</span>
                                                  <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[8px] font-black uppercase border border-red-100 flex items-center gap-1">
                                                      <Archive size={10}/> Archived
                                                  </span>
                                              </div>
                                              <div className="text-right">
                                                  <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center justify-end gap-1">
                                                      <Clock size={10}/> {new Date(rev.date).toLocaleDateString()}
                                                  </span>
                                                  <span className="text-[8px] font-black text-slate-300 uppercase block mt-0.5">By {rev.changedBy}</span>
                                              </div>
                                          </div>
                                          <p className="text-xs font-bold text-slate-600 leading-relaxed italic">"{rev.changeDescription}"</p>
                                          {rev.snapshot && (
                                              <div className="flex items-end justify-between pt-4 border-t border-slate-200 mt-2">
                                                  <div className="space-y-1">
                                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Snapshot Data</p>
                                                      <div className="flex gap-2">
                                                          <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${
                                                              rev.snapshot.riskLevel === 'Critical' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                                          }`}>Risk: {rev.snapshot.riskLevel} ({rev.snapshot.riskScore})</span>
                                                          <span className="text-[9px] font-black bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-500 uppercase">{rev.snapshot.hazards.length} Hazards</span>
                                                      </div>
                                                  </div>
                                                  
                                                  <button 
                                                    onClick={() => handleRestoreRevision(rev)}
                                                    className="flex items-center gap-2 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-500 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95"
                                                    title="Revert to this version"
                                                  >
                                                      <RotateCcw size={12}/> Restore
                                                  </button>
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default RAMSModule;
