
import React, { useState, useEffect } from 'react';
import { AuditLogger } from '../services/auditLogger';
import { GlobalAuditLog } from '../types';
import { 
  Search, Filter, Download, ShieldCheck, AlertTriangle, 
  User, Clock, Activity, FileJson, Hash, RefreshCw, Eye, FileSpreadsheet,
  ArrowDown, ArrowUp, Calendar, CheckCircle2, XCircle, AlertOctagon, Server
} from 'lucide-react';

const SystemLogsModule: React.FC = () => {
  const [logs, setLogs] = useState<GlobalAuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<GlobalAuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [isLoading, setIsLoading] = useState(false);

  const generateMockData = async () => {
      // Seed mock data for the prototype if empty
      const mockLogs: GlobalAuditLog[] = [
          {
              id: 'AUD-999-INIT',
              timestamp: new Date(Date.now() - 10000000).toISOString(),
              actorId: 'system',
              actorName: 'System Kernel',
              actorRole: 'ADMIN',
              action: 'System Initialization',
              resourceType: 'System',
              resourceId: 'SYS-CORE-01',
              details: 'Deployed v2.4.0 to production environment. Integrity check passed.',
              status: 'Success',
              riskLevel: 'Low',
              ipHash: 'init-hash-000'
          },
          {
              id: 'AUD-102-SEC',
              timestamp: new Date(Date.now() - 5000000).toISOString(),
              actorId: 'u4',
              actorName: 'Sarah Jones',
              actorRole: 'Site_HSE_Manager',
              action: 'Policy Override',
              resourceType: 'Permit',
              resourceId: 'PTW-2024-001',
              details: 'Emergency authorization of hot work permit during night shift.',
              status: 'Success',
              riskLevel: 'High',
              ipHash: 'auth-hash-123'
          },
          {
              id: 'AUD-205-FAIL',
              timestamp: new Date(Date.now() - 200000).toISOString(),
              actorId: 'unknown',
              actorName: 'Unknown User',
              actorRole: 'Worker',
              action: 'Login Attempt',
              resourceType: 'User',
              details: 'Failed login attempt from unrecognized IP address (192.168.x.x).',
              status: 'Failure',
              riskLevel: 'Medium',
              ipHash: 'ip-hash-999'
          },
          {
              id: 'AUD-301-DOC',
              timestamp: new Date(Date.now() - 150000).toISOString(),
              actorId: 'u2',
              actorName: 'Dr. Layla Hassan',
              actorRole: 'Head_Group_HSE',
              action: 'Document Classification',
              resourceType: 'Document',
              resourceId: 'DOC-CONF-99',
              details: 'Reclassified "Project Alpha Blueprint" as Confidential.',
              status: 'Success',
              riskLevel: 'Low',
              ipHash: 'doc-hash-444'
          },
          {
              id: 'AUD-404-AUTO',
              timestamp: new Date(Date.now() - 50000).toISOString(),
              actorId: 'ai-agent',
              actorName: 'AD6.Ai Sentinel',
              actorRole: 'ADMIN',
              action: 'Auto-Remediation',
              resourceType: 'System',
              resourceId: 'FW-RULE-22',
              details: 'Blocked suspicious traffic pattern from ext-subnet-4.',
              status: 'Success',
              riskLevel: 'High',
              ipHash: 'ai-hash-777'
          },
          {
              id: 'AUD-501-PERM',
              timestamp: new Date(Date.now() - 40000).toISOString(),
              actorId: 'u4',
              actorName: 'Sarah Jones',
              actorRole: 'Site_HSE_Manager',
              action: 'Permit Issued',
              resourceType: 'Permit',
              resourceId: 'PTW-2024-005',
              details: 'Issued Excavation Permit for Zone C.',
              status: 'Success',
              riskLevel: 'Medium',
              ipHash: 'perm-hash-888'
          },
          {
              id: 'AUD-602-USR',
              timestamp: new Date(Date.now() - 30000).toISOString(),
              actorId: 'admin',
              actorName: 'System Admin',
              actorRole: 'ADMIN',
              action: 'User Role Update',
              resourceType: 'User',
              resourceId: 'u6',
              details: 'Promoted Rahul Gupta to Safety Lead.',
              status: 'Success',
              riskLevel: 'High',
              ipHash: 'usr-hash-111'
          },
          {
              id: 'AUD-703-INC',
              timestamp: new Date(Date.now() - 20000).toISOString(),
              actorId: 'u5',
              actorName: 'Fatima Al-Kaabi',
              actorRole: 'HSE_Officer',
              action: 'Incident Logged',
              resourceType: 'Incident',
              resourceId: 'INC-781',
              details: 'Logged Near Miss incident in Zone A.',
              status: 'Success',
              riskLevel: 'Medium',
              ipHash: 'inc-hash-222'
          },
          {
              id: 'AUD-804-SYS',
              timestamp: new Date(Date.now() - 10000).toISOString(),
              actorId: 'system',
              actorName: 'System Kernel',
              actorRole: 'ADMIN',
              action: 'Backup Completed',
              resourceType: 'System',
              resourceId: 'DB-BACKUP-01',
              details: 'Automated daily database backup completed successfully.',
              status: 'Success',
              riskLevel: 'Low',
              ipHash: 'sys-hash-333'
          },
          {
              id: 'AUD-905-FAIL',
              timestamp: new Date(Date.now() - 5000).toISOString(),
              actorId: 'u7',
              actorName: 'Marcus Chen',
              actorRole: 'Site_Supervisor',
              action: 'Unauthorized Access',
              resourceType: 'Document',
              resourceId: 'DOC-SEC-01',
              details: 'Attempted to access restricted HR document.',
              status: 'Unauthorized',
              riskLevel: 'High',
              ipHash: 'fail-hash-444'
          }
      ];
      
      setLogs(mockLogs);
      return mockLogs;
  };

  const fetchLogs = async () => {
    setIsLoading(true);
    let data = await AuditLogger.getLogs();
    
    if (data.length === 0) {
        data = await generateMockData();
    }
    
    // Initial Filter
    applyFilters(data, searchTerm, typeFilter, statusFilter, sortOrder);
    setLogs(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const applyFilters = (data: GlobalAuditLog[], search: string, type: string, status: string, order: 'asc' | 'desc') => {
    let result = [...data];
    
    // Search
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(log => 
        log.action.toLowerCase().includes(lowerSearch) ||
        log.actorName.toLowerCase().includes(lowerSearch) ||
        log.details.toLowerCase().includes(lowerSearch) ||
        log.id.toLowerCase().includes(lowerSearch)
      );
    }

    // Type Filter
    if (type !== 'All') {
      result = result.filter(log => log.resourceType === type);
    }

    // Status Filter
    if (status !== 'All') {
      result = result.filter(log => log.status === status);
    }

    // Sort Chronologically
    result.sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return order === 'desc' ? dateB - dateA : dateA - dateB;
    });

    setFilteredLogs(result);
  };

  useEffect(() => {
    applyFilters(logs, searchTerm, typeFilter, statusFilter, sortOrder);
  }, [searchTerm, typeFilter, statusFilter, sortOrder, logs]);

  const handleExport = () => {
      const headers = ['Timestamp', 'ID', 'Actor', 'Role', 'Action', 'Resource', 'Details', 'Status', 'Risk Level'];
      const rows = filteredLogs.map(log => [
          new Date(log.timestamp).toLocaleString(),
          log.id,
          log.actorName,
          log.actorRole,
          log.action,
          `${log.resourceType}:${log.resourceId || ''}`,
          `"${log.details.replace(/"/g, '""')}"`,
          log.status,
          log.riskLevel
      ]);
      
      const csvContent = "data:text/csv;charset=utf-8," 
          + headers.join(",") + "\n" 
          + rows.map(e => e.join(",")).join("\n");
          
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `audit_logs_${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Success': return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'Failure': return <XCircle size={16} className="text-red-500" />;
      case 'Unauthorized': return <AlertOctagon size={16} className="text-orange-500" />;
      default: return <Activity size={16} className="text-slate-400" />;
    }
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-red-50 text-red-700 border-red-100';
      case 'Medium': return 'bg-orange-50 text-orange-700 border-orange-100';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
        <div className="flex items-center space-x-6">
          <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-2xl shadow-slate-900/20">
            <Hash size={36} />
          </div>
          <div className="text-start">
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Audit Logs</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-l-4 border-indigo-600 pl-4">Chronological Event Ledger</p>
          </div>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="bg-white border-2 border-slate-100 text-slate-500 px-4 py-3 rounded-2xl flex items-center gap-2 font-black uppercase text-[10px] tracking-widest hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm active:scale-95"
            >
                {sortOrder === 'desc' ? <ArrowDown size={14}/> : <ArrowUp size={14}/>} Time
            </button>
            <button 
            onClick={fetchLogs} 
            className="bg-white border-2 border-slate-100 text-slate-500 px-4 py-3 rounded-2xl flex items-center gap-2 font-black uppercase text-[10px] tracking-widest hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm active:scale-95"
            >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''}/> Sync
            </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search events, actors, or outcome details..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold text-sm text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <Filter size={18} className="text-slate-400 shrink-0" />
          <select 
            className="px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl outline-none focus:border-indigo-500 font-bold text-xs text-slate-600 uppercase tracking-wide cursor-pointer min-w-[140px]"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Resources</option>
            <option value="User">Identity</option>
            <option value="System">System</option>
            <option value="Permit">Permits</option>
            <option value="Incident">Incidents</option>
            <option value="Document">Documents</option>
          </select>
          <select 
            className="px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl outline-none focus:border-indigo-500 font-bold text-xs text-slate-600 uppercase tracking-wide cursor-pointer min-w-[140px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Outcomes</option>
            <option value="Success">Success</option>
            <option value="Failure">Failure</option>
            <option value="Unauthorized">Unauthorized</option>
          </select>
        </div>
        <button 
            onClick={handleExport}
            className="p-3 bg-slate-50 text-slate-400 rounded-xl border-2 border-slate-50 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Export CSV"
        >
          <FileSpreadsheet size={20} />
        </button>
      </div>

      {/* Chronological Feed */}
      <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden min-h-[500px]">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-slate-300">
            <Activity size={64} className="mb-4 opacity-20" />
            <p className="text-sm font-black uppercase tracking-widest">No audit records found matching criteria</p>
          </div>
        ) : (
          <div className="relative p-8">
            <div className="absolute left-[88px] md:left-[140px] top-8 bottom-8 w-0.5 bg-slate-100 z-0"></div>
            <div className="space-y-8">
              {filteredLogs.map((log) => (
                <div key={log.id} className="relative z-10 flex gap-6 md:gap-10 group">
                  
                  {/* Timestamp Column */}
                  <div className="w-16 md:w-28 text-right shrink-0 pt-2">
                      <p className="text-xs font-black text-slate-700 font-mono">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(log.timestamp).toLocaleDateString([], {month:'short', day:'numeric'})}</p>
                  </div>

                  {/* Timeline Node */}
                  <div className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full border-4 border-white shadow-md z-10 transition-colors duration-300 ${
                      log.status === 'Success' ? 'bg-indigo-500 group-hover:bg-indigo-600' : 
                      log.status === 'Failure' ? 'bg-red-500 group-hover:bg-red-600' : 'bg-orange-500 group-hover:bg-orange-600'
                    }`}></div>
                  </div>

                  {/* Content Card */}
                  <div className="flex-1 bg-slate-50 hover:bg-white rounded-[2rem] border-2 border-slate-50 hover:border-indigo-100 p-6 transition-all hover:shadow-lg">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${log.actorId === 'system' || log.actorId.includes('ai') ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-slate-500 border border-slate-200'}`}>
                            {log.actorId === 'system' || log.actorId.includes('ai') ? <Server size={16}/> : <User size={16}/>}
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{log.action}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{log.actorName} • {log.actorRole.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${
                              log.status === 'Success' ? 'bg-white text-emerald-600 border-emerald-100' : 
                              log.status === 'Failure' ? 'bg-white text-red-600 border-red-100' : 
                              'bg-white text-orange-600 border-orange-100'
                          }`}>
                              {getStatusIcon(log.status)} {log.status}
                          </span>
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getRiskBadgeColor(log.riskLevel)}`}>
                              {log.riskLevel} Risk
                          </span>
                      </div>
                    </div>

                    <div className="bg-white/50 rounded-xl p-4 border border-slate-100 mb-3">
                        <p className="text-xs font-medium text-slate-600 leading-relaxed font-mono">
                            {log.details}
                        </p>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Hash size={10}/> ID: {log.id}</span>
                        <span className="flex items-center gap-1"><FileJson size={10}/> {log.resourceType}: {log.resourceId || 'N/A'}</span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemLogsModule;
