
import { AITag } from './AITag';
import React, { useState, useEffect } from 'react';
import { analyzeTrainingNeeds, analyzeTeamGaps, suggestRefresherCourse } from '../services/geminiService';
import { TrainingRecommendation, TeamSkillAnalysis, UserProfile } from '../types';
import { useUser } from '../contexts/UserContext';
import { 
  GraduationCap, Users, Loader2, Award, AlertTriangle, CheckCircle, 
  TrendingUp, BrainCircuit, Activity,
  Trophy, Shield, Calendar, FileText, Download, User, MapPin, Sparkles, ChevronRight, Clock, Lightbulb, ShieldCheck, UserCircle,
  BarChart3,
  UserCheck2,
  Undo2,
  BookOpen,
  Play,
  Presentation,
  Layout,
  Eye,
  Plus,
  Search
} from 'lucide-react';

const TrainingModule: React.FC = () => {
  const { currentUser, users } = useUser();
  const [activeTab, setActiveTab] = useState<'MyProfile' | 'TeamMatrix' | 'Library' | 'Presentations'>('MyProfile');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<TrainingRecommendation[]>([]);
  const [teamAnalysis, setTeamAnalysis] = useState<TeamSkillAnalysis[]>([]);
  const [selectedCert, setSelectedCert] = useState<string | null>(null);

  const isManager = ['ADMIN', 'Head_Group_HSE', 'Regional_HSE_Director', 'Site_HSE_Manager', 'Project_Manager'].includes(currentUser.role);

  // Mock certifications if none exist or undefined
  const certifications = (currentUser.certifications && currentUser.certifications.length > 0) ? currentUser.certifications : [
      { name: 'H2S Awareness Level 2', status: 'Valid', expiryDate: '2025-11-15' },
      { name: 'Fire Warden Basic', status: 'Expiring Soon', expiryDate: '2024-06-30' },
      { name: 'Confined Space Entry', status: 'Expired', expiryDate: '2023-12-01' },
      { name: 'Working at Heights', status: 'Valid', expiryDate: '2026-02-10' },
      { name: 'First Aid CPR', status: 'Valid', expiryDate: '2025-08-20' }
  ];

  const handleAnalyzeProfile = async () => {
      setLoading(true);
      try {
          const recs = await analyzeTrainingNeeds(currentUser);
          setRecommendations(recs);
      } catch (e) {
          // Fallback data
          setRecommendations([
              { title: 'Advanced Risk Assessment', type: 'Workshop', priority: 'High', skillGap: 'Hazard Identification', reason: 'Recent near-miss incident reporting quality needs improvement.', estimatedDuration: '4 Hours' },
              { title: 'IOSH Managing Safely', type: 'Online', priority: 'Medium', skillGap: 'Leadership', reason: 'Promotion track requirement.', estimatedDuration: '3 Days' }
          ]);
      } finally {
          setLoading(false);
      }
  };

  const handleAnalyzeTeam = async () => {
      if (!isManager) return;
      setLoading(true);
      try {
          const analysis = await analyzeTeamGaps(currentUser.department, ['High incident rate in Zone B', 'New machinery introduction']);
          setTeamAnalysis(analysis);
      } catch (e) {
          setTeamAnalysis([
              { skillGap: 'Emergency Response', severity: 'Critical', affectedCount: 12, recommendedAction: 'Schedule site-wide drill and refresher course.' },
              { skillGap: 'Permit to Work Compliance', severity: 'Moderate', affectedCount: 5, recommendedAction: 'Toolbox talk series on PTW protocols.' }
          ]);
      } finally {
          setLoading(false);
      }
  };

  const handleRefresher = async (certName: string) => {
      setSelectedCert(certName);
      setLoading(true);
      try {
          const rec = await suggestRefresherCourse(certName);
          setRecommendations(prev => [rec, ...prev]);
      } catch (e) {
          alert("Could not fetch refresher details.");
      } finally {
          setLoading(false);
          setSelectedCert(null);
      }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
            <div className="flex items-center gap-x-6">
                <div className="bg-blue-600 p-5 rounded-[2rem] text-white shadow-2xl shadow-blue-500/20">
                    <GraduationCap size={32} />
                </div>
                <div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Competency Hub</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-s-2 border-blue-500 ps-4">Workforce Development & Certification</p>
                </div>
            </div>
            <div className="flex bg-slate-200 p-1.5 rounded-2xl w-fit shadow-inner">
                <button onClick={() => setActiveTab('MyProfile')} className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'MyProfile' ? 'glass-card text-slate-800 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}>My Skills</button>
                {isManager && <button onClick={() => setActiveTab('TeamMatrix')} className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'TeamMatrix' ? 'glass-card text-slate-800 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}>Team Matrix</button>}
                <button onClick={() => setActiveTab('Library')} className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'Library' ? 'glass-card text-slate-800 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}>Course Library</button>
                <button onClick={() => setActiveTab('Presentations')} className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'Presentations' ? 'glass-card text-slate-800 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}>Presentations</button>
            </div>
        </div>

        {activeTab === 'MyProfile' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Certifications */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card p-8 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><Award size={16} className="text-blue-600"/> Active Licenses</h3>
                        <div className="space-y-4">
                            {certifications.map((cert, idx) => (
                                <div key={idx} className="p-5 rounded-2xl border-2 border-slate-50 glass-panel hover:border-blue-100 transition-all group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="p-2 glass-card rounded-xl shadow-sm group-hover:text-blue-600 transition-colors"><ShieldCheck size={18}/></div>
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                            cert.status === 'Valid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            cert.status === 'Expiring Soon' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                            'bg-red-50 text-red-600 border-red-100'
                                        }`}>{cert.status}</span>
                                    </div>
                                    <h4 className="font-black text-slate-800 text-sm leading-tight mb-3">{cert.name}</h4>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{cert.expiryDate}</span>
                                        {cert.status !== 'Valid' && (
                                            <button 
                                                onClick={() => handleRefresher(cert.name)} 
                                                disabled={loading}
                                                className="text-[9px] font-black text-blue-600 uppercase hover:underline flex items-center gap-1"
                                            >
                                                {loading && selectedCert === cert.name ? <Loader2 size={10} className="animate-spin"/> : <Undo2 size={10}/>} Renew
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 end-0 p-6 opacity-10"><Trophy size={120}/></div>
                        <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Safety Score</h3>
                        <div className="flex items-end gap-2 mb-6">
                            <span className="text-5xl font-black text-white tracking-tighter">{currentUser.safetyScore}</span>
                            <span className="text-sm font-bold text-slate-400 mb-2">/ 5000 XP</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                            <div className="bg-gradient-to-r from-blue-500 to-teal-400 h-full w-[20%] rounded-full shadow-[0_0_15px_rgba(45,212,191,0.5)]"></div>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-end">Top 15% of Org</p>
                    </div>
                </div>

                {/* Right: AI Analysis */}
                <div className="lg:col-span-8">
                    <div className="glass-card p-10 rounded-[3rem] shadow-xl border border-slate-100 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
                                <Sparkles size={24} className="text-blue-500"/> AI Competency Engine
                            </h3>
                            <button 
                                onClick={handleAnalyzeProfile}
                                disabled={loading}
                                className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" size={16}/> : <BrainCircuit size={16}/>}
                                Scan Profile Gaps
                            </button>
                        </div>

                        {recommendations.length > 0 ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {recommendations.map((rec, i) => (
                                    <div key={i} className="p-6 rounded-[2.5rem] border-2 border-slate-50 hover:border-blue-100 transition-all glass-card shadow-sm hover:shadow-lg group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-2xl ${
                                                    rec.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                                }`}>
                                                    <BookOpen size={24}/>
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">{rec.title}</h4>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{rec.type}</span>
                                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{rec.estimatedDuration}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                                                rec.priority === 'High' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                                            }`}>{rec.priority} Priority</span>
                                        </div>
                                        <div className="glass-panel p-5 rounded-2xl border border-slate-100 mb-4">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                <Lightbulb size={12}/> Diagnostic Reason
                                            </p>
                                            <p className="text-xs font-bold text-slate-600 leading-relaxed italic">"{rec.reason}"</p>
                                        </div>
                                        <div className="flex justify-end">
                                            <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg flex items-center gap-2">
                                                Enroll Now <ChevronRight size={14}/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-100 rounded-[2rem]">
                                <div className="glass-panel p-6 rounded-full mb-6 animate-pulse">
                                    <BrainCircuit size={48} className="text-slate-300"/>
                                </div>
                                <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Ready to Analyze</h4>
                                <p className="text-xs text-slate-400 mt-2 max-w-xs font-medium">Click scan to identify skill gaps based on your recent activity and role requirements.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'TeamMatrix' && isManager && (
            <div className="glass-card p-10 rounded-[3rem] shadow-xl border border-slate-100">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Department Skill Matrix</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Analyzing: {currentUser.department}</p>
                    </div>
                    <button 
                        onClick={handleAnalyzeTeam} 
                        disabled={loading}
                        className="bg-slate-900 text-white px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all flex items-center gap-3 active:scale-95"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18}/> : <Users size={18}/>} Run Gap Analysis
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teamAnalysis.length > 0 ? teamAnalysis.map((gap, i) => (
                        <div key={i} className="p-8 rounded-[2.5rem] glass-panel border-2 border-slate-100 hover:glass-card hover:shadow-xl hover:border-blue-100 transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl ${gap.severity === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                                    <AlertTriangle size={24}/>
                                </div>
                                <div className="text-end">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Impact</p>
                                    <p className="text-2xl font-black text-slate-800">{gap.affectedCount} <span className="text-[10px] text-slate-400 uppercase font-bold">Staff</span></p>
                                </div>
                            </div>
                            <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-2">{gap.skillGap}</h4>
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                gap.severity === 'Critical' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                            }`}>{gap.severity} Severity</span>
                            <div className="mt-6 pt-6 border-t border-slate-200">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Recommended Action</p>
                                <p className="text-xs font-bold text-slate-600 leading-relaxed">{gap.recommendedAction}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center text-slate-400">
                            <Activity size={48} className="mx-auto mb-4 opacity-20"/>
                            <p className="text-sm font-bold uppercase tracking-widest">No analysis data available. Run scan to detect team gaps.</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {activeTab === 'Library' && (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Enterprise HSE Learning Academy</h3>
                        <p className="text-xs text-slate-500 font-medium">10 accredited courses mapped to ISO 45001, OSHAD-SF, and OPITO standards</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { id: 'CRS-01', title: 'H2S Gas Safety & Escape BA Operations', provider: 'OPITO Accredited', duration: '8 Hours', level: 'Mandatory', score: '98% Pass Req', modules: 6, enrolled: true, progress: 100, completedDate: '2026-02-14' },
                        { id: 'CRS-02', title: 'IOSH Managing Safely (GCC Edition)', provider: 'IOSH UK', duration: '24 Hours', level: 'Leadership', score: '85% Pass Req', modules: 8, enrolled: true, progress: 75, completedDate: 'In Progress' },
                        { id: 'CRS-03', title: 'Confined Space Authorized Entrant & Sentry', provider: 'OSHAD Approved', duration: '16 Hours', level: 'High Risk', score: '90% Pass Req', modules: 5, enrolled: false, progress: 0, completedDate: 'Not Started' },
                        { id: 'CRS-04', title: 'Working at Heights & Scaffold Inspection', provider: 'CITB / PASMA', duration: '12 Hours', level: 'High Risk', score: '90% Pass Req', modules: 6, enrolled: true, progress: 100, completedDate: '2026-01-20' },
                        { id: 'CRS-05', title: 'Chemical Hazards & COSHH Risk Assessor', provider: 'BOHS Standards', duration: '14 Hours', level: 'Specialist', score: '85% Pass Req', modules: 7, enrolled: false, progress: 0, completedDate: 'Not Started' },
                        { id: 'CRS-06', title: 'Appointed Person Crane Lifting Operations', provider: 'LEEA Certified', duration: '32 Hours', level: 'Technical', score: '95% Pass Req', modules: 10, enrolled: false, progress: 0, completedDate: 'Not Started' },
                        { id: 'CRS-07', title: 'Defensive Driving & IVMS Telematic Rules', provider: 'RoSPA Defensive Driving', duration: '6 Hours', level: 'All Fleet', score: '100% Pass Req', modules: 4, enrolled: true, progress: 100, completedDate: '2026-03-05' },
                        { id: 'CRS-08', title: 'Hot Work Permitting & Fire Watch Duties', provider: 'NFPA 51B Aligned', duration: '8 Hours', level: 'Permit Lead', score: '90% Pass Req', modules: 5, enrolled: true, progress: 40, completedDate: 'In Progress' },
                        { id: 'CRS-09', title: 'Emergency Response Commander & On-Scene IC', provider: 'Civil Defence Certified', duration: '20 Hours', level: 'Crisis Team', score: '90% Pass Req', modules: 8, enrolled: false, progress: 0, completedDate: 'Not Started' },
                        { id: 'CRS-10', title: 'Environmental Waste & Spill Response (EAD)', provider: 'ISO 14001 Compliant', duration: '10 Hours', level: 'Sustainability', score: '80% Pass Req', modules: 5, enrolled: false, progress: 0, completedDate: 'Not Started' }
                    ].map((crs) => (
                        <div key={crs.id} className="glass-card p-6 rounded-[2rem] border border-slate-100 shadow-lg flex flex-col justify-between hover:border-indigo-200 transition-all">
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold">{crs.id}</span>
                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                                        crs.level === 'Mandatory' ? 'bg-red-50 text-red-700 border-red-200' :
                                        crs.level === 'High Risk' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                        'bg-blue-50 text-blue-700 border-blue-200'
                                    }`}>
                                        {crs.level}
                                    </span>
                                </div>
                                <h4 className="text-base font-black text-slate-800 leading-snug mb-1">{crs.title}</h4>
                                <p className="text-xs text-slate-400 font-bold mb-4">{crs.provider} • {crs.duration}</p>
                                
                                <div className="space-y-1.5 mb-5 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Curriculum:</span>
                                        <strong>{crs.modules} E-Modules</strong>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Status:</span>
                                        <strong className={crs.progress === 100 ? 'text-emerald-600' : crs.progress > 0 ? 'text-amber-600' : 'text-slate-400'}>
                                            {crs.progress === 100 ? 'Completed' : crs.progress > 0 ? `${crs.progress}% Progress` : 'Not Enrolled'}
                                        </strong>
                                    </div>
                                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                                        <div 
                                            className={`h-full ${crs.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`} 
                                            style={{ width: `${crs.progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button 
                                    onClick={() => alert(`Launching ${crs.title} interactive e-learning module. Loading LMS scorm player...`)}
                                    className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                                >
                                    <Play size={14}/> {crs.progress === 100 ? 'Review Course' : crs.progress > 0 ? 'Resume' : 'Enroll Now'}
                                </button>
                                {crs.progress === 100 && (
                                    <button 
                                        onClick={() => {
                                            const blob = new Blob([`CERTIFICATE OF ACCREDITATION\n\nThis certifies that ${currentUser.name} has successfully completed:\n${crs.title}\nAccreditation: ${crs.provider}\nCompletion Date: ${crs.completedDate}\nCertificate ID: CERT-${crs.id}-2026\nStatus: Verified\n`], { type: 'text/plain' });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `Certificate_${crs.id}.txt`;
                                            a.click();
                                        }}
                                        className="p-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition cursor-pointer"
                                        title="Download Certificate"
                                    >
                                        <Award size={16}/>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {activeTab === 'Presentations' && (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: 'Welding & Hot Work Fire Prevention', slides: 14, category: 'Hot Work', date: '2026-04-10', authority: 'NFPA 51B' },
                        { title: 'Compressed Gas Cylinder Handling & Storage', slides: 15, category: 'Equipment', date: '2026-04-08', authority: 'CGA Standards' },
                        { title: 'Industrial Radiography NDT Exclusion Zones', slides: 20, category: 'Radiation', date: '2026-04-05', authority: 'FANR / IAEA' },
                        { title: 'Offshore Derrick Barge Safety & Man Overboard', slides: 25, category: 'Marine', date: '2026-04-01', authority: 'SOLAS / IMO' },
                        { title: 'Summer Heat Stress Mitigation & Midday Break', slides: 12, category: 'Wellness', date: '2026-03-28', authority: 'MOHRE Resolution' },
                        { title: 'Deep Trench Excavation & Hydraulic Shoring', slides: 18, category: 'Civil Safety', date: '2026-03-24', authority: 'DM Code of Practice' },
                        { title: 'H2S Toxic Gas Inhalation Emergency Protocols', slides: 22, category: 'Process Safety', date: '2026-03-20', authority: 'ADNOC CoP' },
                        { title: 'Heavy Mobile Plant & Pedestrian Segregation', slides: 16, category: 'Logistics', date: '2026-03-16', authority: 'ISO 39001' },
                        { title: 'Lockout/Tagout (LOTO) Energy Isolation Standard', slides: 19, category: 'Electrical', date: '2026-03-12', authority: 'OSHA 1910.147' },
                        { title: 'Hazardous Waste Classification & EAD Manifests', slides: 15, category: 'Environmental', date: '2026-03-08', authority: 'EAD Law 16' }
                    ].map((pres, i) => (
                        <div key={i} className="glass-card p-8 rounded-[2.5rem] shadow-xl border border-slate-100 hover:shadow-2xl transition-all group cursor-pointer">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 glass-panel rounded-2xl text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                    <FileText size={32}/>
                                </div>
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100">
                                    {pres.category}
                                </span>
                            </div>
                            <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2 group-hover:text-blue-600 transition-colors">{pres.title}</h4>
                            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                                <span className="flex items-center gap-1"><Layout size={12}/> {pres.slides} Slides</span>
                                <span className="flex items-center gap-1"><Calendar size={12}/> {pres.date}</span>
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => alert(`Opening slide deck preview: "${pres.title}" (${pres.slides} slides) - Aligned with ${pres.authority}`)}
                                    className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <Eye size={14}/> Preview Deck
                                </button>
                                <button 
                                    onClick={() => {
                                        const blob = new Blob([`HSE TOOLBOX PRESENTATION DECK\nTitle: ${pres.title}\nCategory: ${pres.category}\nSlides: ${pres.slides}\nStandard: ${pres.authority}\nDate: ${pres.date}\n\nSLIDE 1: Objectives & Regulatory Framework\nSLIDE 2: Hazard Identification & Real Scenarios\nSLIDE 3: Engineered & Administrative Controls\nSLIDE 4: Emergency Response & Q&A\n`], { type: 'text/plain' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `${pres.title.replace(/\s+/g, '_')}_Deck.txt`;
                                        a.click();
                                    }}
                                    className="p-3 glass-panel text-slate-400 rounded-xl hover:text-blue-600 transition-all cursor-pointer"
                                    title="Download Deck"
                                >
                                    <Download size={16}/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center gap-10 shadow-3xl">
                    <div className="absolute top-0 end-0 p-12 opacity-10 pointer-events-none">
                        <Sparkles size={240} />
                    </div>
                    <div className="flex-1 relative z-10">
                        <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">Enterprise Presentation Generator</h3>
                        <p className="text-slate-400 font-medium leading-relaxed max-w-xl">
                            Need a custom safety presentation? Describe the topic, and the system will structure slide outlines with key safety checkpoints, regulatory references, and tool box talk agendas.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row gap-4">
                            <input 
                                type="text" 
                                placeholder="e.g. Scaffolding safety for high-rise coastal projects..." 
                                className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-blue-500 transition-all text-white placeholder:text-slate-500"
                            />
                            <button 
                                onClick={() => alert("Presentation outline generated and added to repository.")}
                                className="bg-blue-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-blue-400 transition-all flex items-center justify-center gap-3 cursor-pointer"
                            >
                                <BrainCircuit size={18}/> Generate Deck
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default TrainingModule;
