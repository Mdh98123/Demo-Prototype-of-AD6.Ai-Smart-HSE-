
import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '../contexts/UserContext';
import { 
  Briefcase, Plus, Calendar, User, MapPin, 
  Search, Filter, MoreVertical, Layout, List as ListIcon,
  CheckCircle2, Clock, AlertTriangle, ArrowRight,
  TrendingUp, DollarSign, FolderGit2, AlertCircle, Loader2,
  ClipboardCheck, FileCheck, ShieldAlert, Activity, PieChart,
  ArrowDown, ArrowUp, ArrowUpDown, Flame
} from 'lucide-react';
import { Project } from '../types';
import { ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Tooltip } from 'recharts';

interface ProjectsModuleProps {
  initialView?: 'List' | 'Create';
}

const ProjectsModule: React.FC<ProjectsModuleProps> = ({ initialView = 'List' }) => {
  const { currentUser, users } = useUser();
  const [viewState, setViewState] = useState<'List' | 'Create' | 'Detail'>(initialView);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Sorting State
  const [hseSortOrder, setHseSortOrder] = useState<'asc' | 'desc' | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    location: '',
    manager: '',
    startDate: '',
    endDate: '',
    budget: '',
    status: 'Planning'
  });

  // Validation State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    setViewState(initialView);
  }, [initialView]);

  useEffect(() => {
    // Initialize with mock data (Sultanate of Oman Industrial Operations)
    const mockProjects: Project[] = [
      {
        id: 'PRJ-2024-001',
        name: 'Mina Al Fahal Refinery Clean Fuels Revamp',
        client: 'OQ / PDO',
        location: 'Mina Al Fahal Terminal, Muscat',
        startDate: '2024-01-15',
        endDate: '2026-11-30',
        status: 'Active',
        manager: 'Rashid Al-Kharusi',
        budget: 145000000,
        progress: 68,
        hseScore: 96,
        openIncidents: 1
      },
      {
        id: 'PRJ-2024-002',
        name: 'Khazzan Tight Gas Central Processing Expansion',
        client: 'BP Oman / OQ Gas',
        location: 'Khazzan Field Block 61',
        startDate: '2024-03-01',
        endDate: '2025-12-15',
        status: 'Active',
        manager: 'Salim Al-Busaidi',
        budget: 280000000,
        progress: 54,
        hseScore: 92,
        openIncidents: 0
      },
      {
        id: 'PRJ-2024-003',
        name: 'Duqm Crude Oil Storage Terminal (Ras Markaz)',
        client: 'OTTCO / SEZAD',
        location: 'Ras Markaz / Duqm',
        startDate: '2023-09-01',
        endDate: '2025-08-30',
        status: 'Active',
        manager: 'Nasser Al-Harthy',
        budget: 390000000,
        progress: 82,
        hseScore: 94,
        openIncidents: 0
      },
      {
        id: 'PRJ-2024-004',
        name: 'Fahud Heavy Oil Steam Injection Facility',
        client: 'Petroleum Development Oman (PDO)',
        location: 'Fahud Field Operation Block 6',
        startDate: '2024-02-10',
        endDate: '2026-06-30',
        status: 'Active',
        manager: 'Sultan Al-Ghafri',
        budget: 180000000,
        progress: 41,
        hseScore: 89,
        openIncidents: 1
      },
      {
        id: 'PRJ-2024-005',
        name: 'Sohar Industrial Port Green Hydrogen Bunker Facility',
        client: 'Sohar Port & Freezone',
        location: 'Sohar Industrial Port Terminal',
        startDate: '2023-11-01',
        endDate: '2025-09-30',
        status: 'Active',
        manager: 'Tariq Al-Mamari',
        budget: 95000000,
        progress: 74,
        hseScore: 91,
        openIncidents: 2
      },
      {
        id: 'PRJ-2024-006',
        name: 'Nimr Reed Beds Industrial Produced Water Treatment',
        client: 'Petroleum Development Oman (PDO)',
        location: 'Nimr Production Station',
        startDate: '2024-04-01',
        endDate: '2026-03-31',
        status: 'Active',
        manager: 'Hamad Al-Amri',
        budget: 65000000,
        progress: 35,
        hseScore: 95,
        openIncidents: 0
      },
      {
        id: 'PRJ-2024-007',
        name: 'Salalah Ammonia & Methanol Export Jetty Upgrade',
        client: 'OQ Chemicals',
        location: 'Port of Salalah Free Zone',
        startDate: '2024-01-20',
        endDate: '2025-10-31',
        status: 'Active',
        manager: 'Ahmed Al-Shanfari',
        budget: 45000000,
        progress: 60,
        hseScore: 97,
        openIncidents: 0
      },
      {
        id: 'PRJ-2024-008',
        name: 'Ibri 500MW Solar IPP Transformer Yard Hardening',
        client: 'Nama Holding',
        location: 'Ibri Solar Station',
        startDate: '2023-06-15',
        endDate: '2025-05-30',
        status: 'Completed',
        manager: 'Mazen Al-Ghafri',
        budget: 32000000,
        progress: 100,
        hseScore: 98,
        openIncidents: 0
      },
      {
        id: 'PRJ-2024-009',
        name: 'Qalhat LNG Train 4 Debottlenecking & Flare Recovery',
        client: 'Oman LNG LLC',
        location: 'Sur Complex, Qalhat',
        startDate: '2024-05-01',
        endDate: '2026-04-30',
        status: 'Planning',
        manager: 'Khalid Al-Alawi',
        budget: 110000000,
        progress: 12,
        hseScore: 93,
        openIncidents: 0
      },
      {
        id: 'PRJ-2024-010',
        name: 'Yibal Khuff Sour Gas & Crude Mega-Facility',
        client: 'Petroleum Development Oman (PDO)',
        location: 'Yibal Khuff Concession',
        startDate: '2023-12-01',
        endDate: '2025-12-31',
        status: 'Active',
        manager: 'Abdullah Al-Riyami',
        budget: 220000000,
        progress: 48,
        hseScore: 88,
        openIncidents: 1
      }
    ];
    
    // In a real app, verify local storage first
    const saved = localStorage.getItem('hse_projects');
    if (saved) {
      setProjects(JSON.parse(saved));
    } else {
      setProjects(mockProjects);
      localStorage.setItem('hse_projects', JSON.stringify(mockProjects));
    }
  }, []);

  // Derived Metrics for Detail View
  const detailMetrics = useMemo(() => {
    if (!selectedProject) return { inspectionRate: 0, permitRate: 0, activePermits: 0 };
    
    // Mock derived data based on HSE Score
    const inspectionRate = Math.min(100, Math.max(70, selectedProject.hseScore + (selectedProject.openIncidents > 0 ? -5 : 3)));
    const permitRate = Math.min(100, Math.max(88, selectedProject.hseScore + 2));
    const activePermits = selectedProject.status === 'Active' ? Math.floor(Math.random() * 15) + 5 : 0;

    return { inspectionRate, permitRate, activePermits };
  }, [selectedProject]);

  const validate = (field: string, value: string) => {
    let error = "";
    if (field === 'name' && !value.trim()) error = "Project name is required.";
    if (field === 'client' && !value.trim()) error = "Client name is required.";
    if (field === 'location' && !value.trim()) error = "Location is required.";
    if (field === 'manager' && !value) error = "Project manager is required.";
    if (field === 'startDate' && !value) error = "Start date is required.";
    if (field === 'endDate' && !value) error = "End date is required.";
    if (field === 'endDate' && value && formData.startDate && value < formData.startDate) error = "End date cannot be before start date.";
    
    return error;
  };

  const handleBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: validate(field, value) }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all
    const newErrors: { [key: string]: string } = {};
    Object.keys(formData).forEach(key => {
      const error = validate(key, (formData as any)[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      return;
    }

    setIsSubmitting(true);

    // Simulate API
    setTimeout(() => {
      const newProject: Project = {
        id: `PRJ-${new Date().getFullYear()}-${String(projects.length + 1).padStart(3, '0')}`,
        name: formData.name,
        client: formData.client,
        location: formData.location,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status as any,
        manager: users.find(u => u.id === formData.manager)?.name || 'Unknown',
        budget: parseFloat(formData.budget) || 0,
        progress: 0,
        hseScore: 100,
        openIncidents: 0
      };

      const updatedProjects = [newProject, ...projects];
      setProjects(updatedProjects);
      localStorage.setItem('hse_projects', JSON.stringify(updatedProjects));
      
      setIsSubmitting(false);
      setViewState('List');
      // Reset form
      setFormData({
        name: '', client: '', location: '', manager: '', 
        startDate: '', endDate: '', budget: '', status: 'Planning'
      });
      setErrors({});
      setTouched({});
    }, 1000);
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setViewState('Detail');
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Planning': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'OnHold': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Completed': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'glass-panel text-slate-500 border-slate-200';
    }
  };

  const toggleHseSort = () => {
    setHseSortOrder(prev => {
      if (prev === null) return 'desc'; // First click sorts descending (highest first)
      if (prev === 'desc') return 'asc';
      return null;
    });
  };

  const sortedProjects = useMemo(() => {
    const filtered = projects.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (hseSortOrder) {
      return [...filtered].sort((a, b) => {
        return hseSortOrder === 'asc' ? a.hseScore - b.hseScore : b.hseScore - a.hseScore;
      });
    }
    return filtered;
  }, [projects, searchQuery, hseSortOrder]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-x-5">
          <div className="bg-indigo-600 p-5 rounded-[2rem] text-white shadow-2xl shadow-indigo-500/20">
            <Briefcase size={32} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Projects</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-s-2 border-indigo-500 ps-4">Portfolio Management & HSE Oversight</p>
          </div>
        </div>
        
        {viewState !== 'Detail' && (
          <div className="flex bg-slate-200 p-1.5 rounded-2xl w-fit shadow-inner">
            <button 
              onClick={() => setViewState('List')}
              className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${viewState === 'List' ? 'glass-card text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Project List
            </button>
            <button 
              onClick={() => setViewState('Create')}
              className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${viewState === 'Create' ? 'glass-card text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Add New Project
            </button>
          </div>
        )}
      </div>

      {viewState === 'Detail' && selectedProject ? (
        <div className="space-y-8 animate-in slide-in-from-end-8 duration-500">
          <button 
            onClick={() => { setViewState('List'); setSelectedProject(null); }} 
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-colors mb-4 group"
          >
            <ArrowRight className="rotate-180 rtl:group-hover:translate-x-1 group-hover:-translate-x-1 transition-transform" size={16}/> Back to Portfolio
          </button>

          {/* Project Header Card */}
          <div className="glass-card p-10 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">{selectedProject.name}</h2>
                <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusColor(selectedProject.status)}`}>
                  {selectedProject.status}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-500 flex items-center gap-2">
                <MapPin size={16} className="text-slate-400"/> {selectedProject.location} 
                <span className="text-slate-300">•</span> 
                {selectedProject.client}
              </p>
            </div>
            <div className="text-end">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Project Manager</p>
              <div className="flex items-center justify-end gap-3">
                <div className="text-end">
                  <p className="text-sm font-bold text-slate-800">{selectedProject.manager}</p>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase">Lead</p>
                </div>
                <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black shadow-sm">
                  {selectedProject.manager.charAt(0)}
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Grid - Interactive Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Open Incidents Card */}
            <div className={`p-8 rounded-[2.5rem] shadow-xl border-2 transition-all hover:-translate-y-1 duration-300 group cursor-pointer relative overflow-hidden ${
              selectedProject.openIncidents > 0 ? 'bg-gradient-to-br from-white to-red-50/50 border-red-100 hover:border-red-200' : 'glass-card border-emerald-100 hover:border-emerald-200'
            }`}>
              <div className={`absolute top-0 end-0 p-8 opacity-5 group-hover:scale-110 transition-transform ${selectedProject.openIncidents > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                <ShieldAlert size={120} />
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl ${selectedProject.openIncidents > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    <ShieldAlert size={28} />
                  </div>
                  {selectedProject.openIncidents > 0 && (
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest animate-pulse flex items-center gap-1">
                      <Flame size={10} /> Action Req.
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Open Incidents</p>
                <h3 className={`text-5xl font-black tracking-tighter ${selectedProject.openIncidents > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {selectedProject.openIncidents}
                </h3>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>Last 30 Days</span>
                  <div className={`flex items-center gap-1 ${selectedProject.openIncidents > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    <Activity size={14} /> {selectedProject.openIncidents > 0 ? '+2 New' : 'Stable'}
                  </div>
                </div>
              </div>
            </div>

            {/* Inspection Status Card */}
            <div className="p-8 rounded-[2.5rem] glass-card shadow-xl border-2 border-slate-100 hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 end-0 p-8 opacity-5 text-indigo-600 group-hover:scale-110 transition-transform">
                <ClipboardCheck size={120} />
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600">
                    <ClipboardCheck size={28} />
                  </div>
                  <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                    Audit Status
                  </span>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Inspection Rate</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-5xl font-black text-slate-800 tracking-tighter">{detailMetrics.inspectionRate}%</h3>
                  <span className={`text-sm font-bold mb-2 ${detailMetrics.inspectionRate >= 90 ? 'text-emerald-500' : 'text-orange-500'}`}>
                    {detailMetrics.inspectionRate >= 90 ? 'Pass' : 'Review'}
                  </span>
                </div>
                
                <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${detailMetrics.inspectionRate >= 90 ? 'bg-emerald-500' : 'bg-orange-500'}`} 
                    style={{width: `${detailMetrics.inspectionRate}%`}}
                  ></div>
                </div>
                <div className="mt-2 flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                  <span>Weekly Target</span>
                  <span>{detailMetrics.inspectionRate >= 90 ? 'Met' : 'Pending'}</span>
                </div>
              </div>
            </div>

            {/* Permit Compliance Card */}
            <div className="p-8 rounded-[2.5rem] glass-card shadow-xl border-2 border-slate-100 hover:border-teal-100 hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 end-0 p-8 opacity-5 text-teal-600 group-hover:scale-110 transition-transform">
                <FileCheck size={120} />
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-4 rounded-2xl bg-teal-50 text-teal-600">
                    <FileCheck size={28} />
                  </div>
                  <span className="bg-teal-50 text-teal-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-teal-100">
                    Live Data
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Permits</p>
                    <h3 className="text-5xl font-black text-slate-800 tracking-tighter">{detailMetrics.activePermits}</h3>
                  </div>
                  <div className="h-20 w-20 relative">
                     <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={[{ value: detailMetrics.permitRate }, { value: 100 - detailMetrics.permitRate }]}
                            cx="50%"
                            cy="50%"
                            innerRadius={25}
                            outerRadius={35}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                            stroke="none"
                          >
                            <Cell fill="#14b8a6" />
                            <Cell fill="#f1f5f9" />
                          </Pie>
                        </RePieChart>
                     </ResponsiveContainer>
                     <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-teal-600">{detailMetrics.permitRate}%</div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-100">
                   <p className="text-xs font-bold text-slate-500">
                     <span className="text-teal-600">{detailMetrics.permitRate}%</span> Compliance Rate
                   </p>
                </div>
              </div>
            </div>

          </div>

          {/* Progress Section */}
          <div className="glass-card p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                 <Activity size={20} className="text-indigo-600"/> Project Completion
               </h3>
               <span className="text-2xl font-black text-indigo-600">{selectedProject.progress}%</span>
             </div>
             
             <div className="relative w-full h-6 bg-slate-100 rounded-full overflow-hidden cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percentage = Math.round((x / rect.width) * 100);
                    const newProgress = Math.max(0, Math.min(100, percentage));
                    
                    const updatedProject = { ...selectedProject, progress: newProgress };
                    setSelectedProject(updatedProject);
                    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
                  }}>
               <div 
                 className="absolute top-0 start-0 h-full bg-indigo-500 transition-all duration-300"
                 style={{ width: `${selectedProject.progress}%` }}
               />
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3 text-center">
               Click on the bar to update progress
             </p>
          </div>

          {/* Additional Info Section */}
          <div className="glass-card p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
             <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
               <Activity size={20} className="text-indigo-600"/> Project Health Breakdown
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-4 glass-panel rounded-2xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Budget Utilized</p>
                   <p className="text-xl font-black text-slate-800">{selectedProject.progress}%</p>
                </div>
                <div className="p-4 glass-panel rounded-2xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Days Remaining</p>
                   <p className="text-xl font-black text-slate-800">142</p>
                </div>
                <div className="p-4 glass-panel rounded-2xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Man-Hours (Safe)</p>
                   <p className="text-xl font-black text-emerald-600">45,200</p>
                </div>
                <div className="p-4 glass-panel rounded-2xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">HSE Score</p>
                   <p className={`text-xl font-black ${selectedProject.hseScore >= 90 ? 'text-emerald-600' : 'text-orange-500'}`}>{selectedProject.hseScore}</p>
                </div>
             </div>
          </div>

        </div>
      ) : viewState === 'List' ? (
        <div className="space-y-6">
          {/* Filters & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-card p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Active</p>
                <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-slate-800">{projects.filter(p => p.status === 'Active').length}</span>
                    <span className="text-xs font-bold text-emerald-500 mb-1 flex items-center"><TrendingUp size={12} className="me-1"/> Projects</span>
                </div>
            </div>
            
            {/* Search Bar */}
            <div className="md:col-span-3 glass-card p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center">
                <Search size={20} className="text-slate-400 me-4" />
                <input 
                    type="text" 
                    placeholder="Search projects by name, client, or location..."
                    className="flex-1   outline-none font-bold text-sm text-slate-700 placeholder:text-slate-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
          </div>

          {/* Projects Table */}
          <div className="glass-card rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-start">
                <thead>
                  <tr className="glass-panel text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                    <th className="px-8 py-6">Project Details</th>
                    <th className="px-8 py-6">Timeline</th>
                    <th className="px-8 py-6">Manager</th>
                    <th className="px-8 py-6 text-center">Status</th>
                    <th 
                      className="px-8 py-6 text-center cursor-pointer hover:bg-slate-100 transition-colors select-none"
                      onClick={toggleHseSort}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        HSE Score
                        {hseSortOrder === 'asc' && <ArrowUp size={14} className="text-brand-600"/>}
                        {hseSortOrder === 'desc' && <ArrowDown size={14} className="text-brand-600"/>}
                        {!hseSortOrder && <ArrowUpDown size={14} className="text-slate-300"/>}
                      </div>
                    </th>
                    <th className="px-8 py-6 text-end">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedProjects.map((project) => (
                    <tr 
                      key={project.id} 
                      className="hover:glass-button/50 transition group cursor-pointer"
                      onClick={() => handleViewProject(project)}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <FolderGit2 size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">{project.name}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 flex items-center gap-2">
                              {project.id} • {project.client}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-xs font-medium text-slate-600 space-y-1">
                          <p className="flex items-center gap-2"><Calendar size={12} className="text-slate-400"/> Start: {project.startDate}</p>
                          <p className="flex items-center gap-2"><ArrowRight size={12} className="text-slate-400"/> End: {project.endDate}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                            {project.manager.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-slate-700">{project.manager}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`text-lg font-black ${project.hseScore >= 90 ? 'text-emerald-500' : project.hseScore >= 75 ? 'text-orange-500' : 'text-red-500'}`}>
                            {project.hseScore}%
                          </span>
                          {project.openIncidents > 0 && (
                            <span className="text-[9px] font-bold text-red-500 flex items-center gap-1 mt-1">
                              <AlertTriangle size={10} /> {project.openIncidents} Incidents
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-end">
                        <button className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                          <MoreVertical size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {sortedProjects.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-8 py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                        No projects found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto animate-in slide-in-from-end-8 duration-500">
          <div className="glass-card rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-10 border-b border-slate-50 glass-panel">
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Initialize Project</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Define Scope & HSE Parameters</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ms-1 mb-2 block">Project Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={() => handleBlur('name', formData.name)}
                    className={`w-full p-4 glass-panel border-2 rounded-2xl outline-none font-bold text-sm text-slate-700 transition-all ${
                      errors.name 
                        ? 'border-red-500 focus:border-red-500 bg-red-50/10' 
                        : touched.name && formData.name
                          ? 'border-emerald-500 focus:border-emerald-500 bg-emerald-50/5'
                          : 'border-slate-100 focus:border-indigo-500 focus:glass-card'
                    }`}
                    placeholder="e.g. Turnaround Maintenance Zone 4"
                  />
                  {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 ms-1 flex items-center gap-1"><AlertCircle size={10}/> {errors.name}</p>}
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ms-1 mb-2 block">Client / Owner <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="client"
                    value={formData.client}
                    onChange={handleChange}
                    onBlur={() => handleBlur('client', formData.client)}
                    className={`w-full p-4 glass-panel border-2 rounded-2xl outline-none font-bold text-sm text-slate-700 transition-all ${
                      errors.client 
                        ? 'border-red-500 bg-red-50/10' 
                        : touched.client && formData.client
                          ? 'border-emerald-500 focus:border-emerald-500 bg-emerald-50/5'
                          : 'border-slate-100 focus:border-indigo-500 focus:glass-card'
                    }`}
                    placeholder="e.g. PDO / OQ"
                  />
                  {errors.client && <p className="text-red-500 text-[10px] font-bold mt-1 ms-1 flex items-center gap-1"><AlertCircle size={10}/> {errors.client}</p>}
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ms-1 mb-2 block">Location <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <MapPin size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      onBlur={() => handleBlur('location', formData.location)}
                      className={`w-full ps-12 pe-4 py-4 glass-panel border-2 rounded-2xl outline-none font-bold text-sm text-slate-700 transition-all ${
                        errors.location 
                          ? 'border-red-500 bg-red-50/10' 
                          : touched.location && formData.location
                            ? 'border-emerald-500 focus:border-emerald-500 bg-emerald-50/5'
                            : 'border-slate-100 focus:border-indigo-500 focus:glass-card'
                      }`}
                      placeholder="Site Location"
                    />
                  </div>
                  {errors.location && <p className="text-red-500 text-[10px] font-bold mt-1 ms-1 flex items-center gap-1"><AlertCircle size={10}/> {errors.location}</p>}
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ms-1 mb-2 block">Project Manager <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <User size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select 
                      name="manager"
                      value={formData.manager}
                      onChange={handleChange}
                      onBlur={(e) => handleBlur('manager', e.target.value)}
                      className={`w-full ps-12 pe-4 py-4 glass-panel border-2 rounded-2xl outline-none font-bold text-sm text-slate-700 transition-all appearance-none cursor-pointer ${
                        errors.manager 
                          ? 'border-red-500 bg-red-50/10' 
                          : touched.manager && formData.manager
                            ? 'border-emerald-500 focus:border-emerald-500 bg-emerald-50/5'
                            : 'border-slate-100 focus:border-indigo-500 focus:glass-card'
                      }`}
                    >
                      <option value="">Select Manager...</option>
                      {users.filter(u => ['Project_Manager', 'Site_HSE_Manager', 'ADMIN'].includes(u.role)).map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                  {errors.manager && <p className="text-red-500 text-[10px] font-bold mt-1 ms-1 flex items-center gap-1"><AlertCircle size={10}/> {errors.manager}</p>}
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ms-1 mb-2 block">Initial Status</label>
                  <select 
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full p-4 glass-panel border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm text-slate-700 transition-all focus:border-indigo-500 focus:glass-card appearance-none cursor-pointer"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="OnHold">On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ms-1 mb-2 block">Start Date <span className="text-red-500">*</span></label>
                  <input 
                    type="date" 
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    onBlur={() => handleBlur('startDate', formData.startDate)}
                    className={`w-full p-4 glass-panel border-2 rounded-2xl outline-none font-bold text-sm text-slate-700 transition-all ${
                      errors.startDate 
                        ? 'border-red-500 bg-red-50/10' 
                        : touched.startDate && formData.startDate
                          ? 'border-emerald-500 focus:border-emerald-500 bg-emerald-50/5'
                          : 'border-slate-100 focus:border-indigo-500 focus:glass-card'
                    }`}
                  />
                  {errors.startDate && <p className="text-red-500 text-[10px] font-bold mt-1 ms-1 flex items-center gap-1"><AlertCircle size={10}/> {errors.startDate}</p>}
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ms-1 mb-2 block">End Date <span className="text-red-500">*</span></label>
                  <input 
                    type="date" 
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    onBlur={() => handleBlur('endDate', formData.endDate)}
                    className={`w-full p-4 glass-panel border-2 rounded-2xl outline-none font-bold text-sm text-slate-700 transition-all ${
                      errors.endDate 
                        ? 'border-red-500 bg-red-50/10' 
                        : touched.endDate && formData.endDate
                          ? 'border-emerald-500 focus:border-emerald-500 bg-emerald-50/5'
                          : 'border-slate-100 focus:border-indigo-500 focus:glass-card'
                    }`}
                  />
                  {errors.endDate && <p className="text-red-500 text-[10px] font-bold mt-1 ms-1 flex items-center gap-1"><AlertCircle size={10}/> {errors.endDate}</p>}
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ms-1 mb-2 block">Budget (OMR)</label>
                  <div className="relative">
                    <DollarSign size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="number" 
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full ps-12 pe-4 py-4 glass-panel border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm text-slate-700 transition-all focus:border-indigo-500 focus:glass-card"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setViewState('List')}
                  className="px-10 py-4 rounded-2xl text-slate-400 font-black uppercase tracking-widest text-[10px] hover:glass-button transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin"/> : <CheckCircle2 size={18}/>}
                  Create Project Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsModule;
