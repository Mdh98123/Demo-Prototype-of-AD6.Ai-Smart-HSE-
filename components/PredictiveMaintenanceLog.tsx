import React, { useState, useMemo } from 'react';
import { Equipment, Task } from '../types';
import { 
  AlertTriangle, Wrench, Thermometer, Activity, Gauge, 
  Calendar, CheckCircle2, Search, Filter, ArrowUpDown, 
  Download, Eye, Clock, ShieldAlert, Cpu, Sparkles, 
  RefreshCw, Check, ArrowRight, Layers, SlidersHorizontal,
  ChevronDown, ChevronUp, Bell, AlertOctagon, Zap
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';

export interface MaintenanceAlertItem {
  id: string;
  equipmentId: string;
  equipment: Equipment;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  triggerReason: string;
  sensorAnomalies: string[];
  failureRiskPercent: number;
  projectedDueDays: number;
  dueDate: string;
  recommendedAction: string;
  rootCause: string;
  status: 'Pending Work Order' | 'Scheduled' | 'Monitoring';
}

interface PredictiveMaintenanceLogProps {
  equipmentList?: Equipment[];
  onSelectEquipment?: (equipment: Equipment) => void;
  className?: string;
}

export const PredictiveMaintenanceLog: React.FC<PredictiveMaintenanceLogProps> = ({
  equipmentList: propEquipment,
  onSelectEquipment,
  className = ''
}) => {
  const { equipment: contextEquipment, currentUser } = useUser();
  const equipment = propEquipment || contextEquipment;

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');
  const [dueWindowFilter, setDueWindowFilter] = useState<'ALL' | 'URGENT' | 'WEEK' | 'MONTH'>('ALL');
  const [sortBy, setSortBy] = useState<'risk' | 'due' | 'temp' | 'vib'>('risk');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [scheduledAlertIds, setScheduledAlertIds] = useState<Record<string, boolean>>({});
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);

  // Derive alert items from equipment IoT sensor thresholds and AI predictions
  const maintenanceAlerts = useMemo<MaintenanceAlertItem[]>(() => {
    return equipment.map((eq, index) => {
      const anomalies: string[] = [];
      let calculatedRisk = 15;
      let triggerReason = 'Periodic Operational Assessment';
      let projectedDueDays = 30;

      // 1. Temperature Telemetry Analysis
      if (eq.sensors.temperature >= 90) {
        anomalies.push(`Critical Thermal Spike (${eq.sensors.temperature}°C > 85°C limit)`);
        calculatedRisk += 45;
        triggerReason = 'Thermal Bearing Overheat & Lube Degradation';
        projectedDueDays = Math.min(projectedDueDays, 2);
      } else if (eq.sensors.temperature >= 75) {
        anomalies.push(`Elevated Heat Signature (${eq.sensors.temperature}°C)`);
        calculatedRisk += 25;
        if (triggerReason === 'Periodic Operational Assessment') triggerReason = 'Thermal Load Warning';
        projectedDueDays = Math.min(projectedDueDays, 7);
      }

      // 2. Vibration Frequency Analysis
      if (eq.sensors.vibration >= 5.0) {
        anomalies.push(`Excessive Mechanical Vibration (${eq.sensors.vibration} mm/s > 4.5 mm/s ISO limit)`);
        calculatedRisk += 40;
        triggerReason = triggerReason.includes('Thermal') 
          ? 'Compound Bearing Friction & Misalignment' 
          : 'Severe Mechanical Vibration / Imbalance';
        projectedDueDays = Math.min(projectedDueDays, 3);
      } else if (eq.sensors.vibration >= 3.5) {
        anomalies.push(`Moderate Vibration Anomaly (${eq.sensors.vibration} mm/s)`);
        calculatedRisk += 20;
        if (triggerReason === 'Periodic Operational Assessment') triggerReason = 'Shaft Oscillation Harmonic Drift';
        projectedDueDays = Math.min(projectedDueDays, 14);
      }

      // 3. Pressure & Oil Telemetry Analysis
      if (eq.sensors.oilLevel !== undefined && eq.sensors.oilLevel < 50) {
        anomalies.push(`Low Lubricant Sump Level (${eq.sensors.oilLevel}%)`);
        calculatedRisk += 20;
        projectedDueDays = Math.min(projectedDueDays, 5);
      }
      if (eq.sensors.pressure !== undefined && (eq.sensors.pressure > 140 || eq.sensors.pressure < 30)) {
        anomalies.push(`Hydraulic/Pneumatic Pressure Anomaly (${eq.sensors.pressure} psi)`);
        calculatedRisk += 15;
      }

      // 4. Operational Hours Aging
      if (eq.operationalHours > 10000) {
        anomalies.push(`High Cycle Wear (${eq.operationalHours.toLocaleString()} hrs logged)`);
        calculatedRisk += 10;
      }

      // 5. Existing AI prediction integration
      if (eq.prediction) {
        calculatedRisk = Math.max(calculatedRisk, eq.prediction.failureProbability);
        triggerReason = eq.prediction.rootCauseSuspect || triggerReason;
      }

      // Equipment status weight
      if (eq.status === 'Critical') calculatedRisk = Math.max(calculatedRisk, 85);
      if (eq.status === 'Warning') calculatedRisk = Math.max(calculatedRisk, 55);

      calculatedRisk = Math.min(99, Math.max(10, calculatedRisk));

      // Calculate severity tier
      let severity: 'Critical' | 'High' | 'Medium' | 'Low' = 'Low';
      if (calculatedRisk >= 75) {
        severity = 'Critical';
      } else if (calculatedRisk >= 50) {
        severity = 'High';
      } else if (calculatedRisk >= 30) {
        severity = 'Medium';
      }

      // Projected due date calculation
      const dueDateObj = new Date(Date.now() + projectedDueDays * 86400000);
      const dueDate = dueDateObj.toISOString().split('T')[0];

      const recommendedAction = eq.prediction?.recommendedAction || (
        severity === 'Critical' 
          ? 'Immediate safety isolation (LOTO), shaft alignment audit & lube replacement.'
          : severity === 'High'
            ? 'Inspect bearing clearances, balance rotor, and top up ISO VG oil.'
            : 'Schedule preventive calibration and filter inspection on next shift.'
      );

      const rootCause = eq.prediction?.rootCauseSuspect || (
        anomalies.length > 0 ? anomalies[0] : 'Normal operational component degradation'
      );

      return {
        id: `ALT-${eq.id}`,
        equipmentId: eq.id,
        equipment: eq,
        severity,
        triggerReason,
        sensorAnomalies: anomalies.length > 0 ? anomalies : ['Telemetry parameters within nominal operating bounds'],
        failureRiskPercent: calculatedRisk,
        projectedDueDays,
        dueDate,
        recommendedAction,
        rootCause,
        status: scheduledAlertIds[`ALT-${eq.id}`] ? 'Scheduled' : (severity === 'Critical' || severity === 'High' ? 'Pending Work Order' : 'Monitoring')
      };
    });
  }, [equipment, scheduledAlertIds]);

  // Unique types and locations for filter dropdowns
  const availableTypes = useMemo(() => {
    return Array.from(new Set(equipment.map(e => e.type))).sort();
  }, [equipment]);

  const availableLocations = useMemo(() => {
    return Array.from(new Set(equipment.map(e => e.location))).sort();
  }, [equipment]);

  // Filter & Sort Logic
  const filteredAlerts = useMemo(() => {
    return maintenanceAlerts.filter(alert => {
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = alert.equipment.name.toLowerCase().includes(q);
        const matchesId = alert.equipment.id.toLowerCase().includes(q);
        const matchesReason = alert.triggerReason.toLowerCase().includes(q);
        const matchesLoc = alert.equipment.location.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesReason && !matchesLoc) {
          return false;
        }
      }

      // Severity filter
      if (selectedSeverity !== 'ALL' && alert.severity !== selectedSeverity) {
        return false;
      }

      // Type filter
      if (selectedType !== 'ALL' && alert.equipment.type !== selectedType) {
        return false;
      }

      // Location filter
      if (selectedLocation !== 'ALL' && alert.equipment.location !== selectedLocation) {
        return false;
      }

      // Due Window filter
      if (dueWindowFilter === 'URGENT' && alert.projectedDueDays > 3) {
        return false;
      }
      if (dueWindowFilter === 'WEEK' && alert.projectedDueDays > 7) {
        return false;
      }
      if (dueWindowFilter === 'MONTH' && alert.projectedDueDays > 30) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'risk') {
        comparison = a.failureRiskPercent - b.failureRiskPercent;
      } else if (sortBy === 'due') {
        comparison = a.projectedDueDays - b.projectedDueDays;
      } else if (sortBy === 'temp') {
        comparison = a.equipment.sensors.temperature - b.equipment.sensors.temperature;
      } else if (sortBy === 'vib') {
        comparison = a.equipment.sensors.vibration - b.equipment.sensors.vibration;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [maintenanceAlerts, searchQuery, selectedSeverity, selectedType, selectedLocation, dueWindowFilter, sortBy, sortOrder]);

  // Aggregate KPI stats
  const kpiStats = useMemo(() => {
    const total = maintenanceAlerts.length;
    const criticalCount = maintenanceAlerts.filter(a => a.severity === 'Critical').length;
    const highCount = maintenanceAlerts.filter(a => a.severity === 'High').length;
    const scheduledCount = Object.keys(scheduledAlertIds).length;
    const urgentCount = maintenanceAlerts.filter(a => a.projectedDueDays <= 3).length;

    return { total, criticalCount, highCount, scheduledCount, urgentCount };
  }, [maintenanceAlerts, scheduledAlertIds]);

  // Work order creation handler
  const handleCreateWorkOrder = (alert: MaintenanceAlertItem) => {
    const savedTasks = localStorage.getItem('hse_tasks');
    const currentTasks: Task[] = savedTasks ? JSON.parse(savedTasks) : [];

    const newTask: Task = {
      id: `T-PRED-${Date.now()}`,
      title: `IoT Alert: ${alert.equipment.name} (${alert.severity} Risk)`,
      description: `PREDICTIVE IOT TRIGGER: ${alert.triggerReason}\nSENSOR TELEMETRY: Temp ${alert.equipment.sensors.temperature}°C, Vib ${alert.equipment.sensors.vibration} mm/s\nRECOMMENDED INTERVENTION: ${alert.recommendedAction}`,
      assignee: currentUser.id,
      priority: alert.severity === 'Critical' ? 'High' : (alert.severity === 'High' ? 'Medium' : 'Low'),
      category: 'Maintenance',
      status: 'ToDo',
      dueDate: alert.dueDate,
      createdAt: new Date().toISOString(),
      createdBy: 'IoT Predictive Engine'
    };

    localStorage.setItem('hse_tasks', JSON.stringify([newTask, ...currentTasks]));
    setScheduledAlertIds(prev => ({ ...prev, [alert.id]: true }));
  };

  // Export CSV schedule report
  const handleExportCsv = () => {
    const headers = ['Alert ID', 'Equipment ID', 'Equipment Name', 'Type', 'Location', 'Severity', 'Failure Risk %', 'Temp (°C)', 'Vib (mm/s)', 'Projected Due Date', 'Trigger Reason', 'Recommended Action'];
    const rows = filteredAlerts.map(a => [
      a.id,
      a.equipmentId,
      `"${a.equipment.name}"`,
      `"${a.equipment.type}"`,
      `"${a.equipment.location}"`,
      a.severity,
      `${a.failureRiskPercent}%`,
      a.equipment.sensors.temperature,
      a.equipment.sensors.vibration,
      a.dueDate,
      `"${a.triggerReason.replace(/"/g, '""')}"`,
      `"${a.recommendedAction.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `predictive_maintenance_alerts_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Alerts</p>
            <p className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">{kpiStats.total}</p>
            <span className="text-[9px] font-bold text-slate-400">Total Monitored Nodes</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Cpu size={22} />
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-red-100 bg-red-50/30 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-black uppercase text-red-600 tracking-widest">Critical Spikes</p>
            <p className="text-2xl font-black text-red-600 tracking-tight mt-0.5">{kpiStats.criticalCount}</p>
            <span className="text-[9px] font-bold text-red-500">Requires Immediate SWA / LOTO</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
            <AlertOctagon size={22} />
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-amber-100 bg-amber-50/30 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest">Urgent (≤ 72h)</p>
            <p className="text-2xl font-black text-amber-700 tracking-tight mt-0.5">{kpiStats.urgentCount}</p>
            <span className="text-[9px] font-bold text-amber-600">Pending Preventive Service</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Clock size={22} />
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-emerald-100 bg-emerald-50/30 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Dispatched Orders</p>
            <p className="text-2xl font-black text-emerald-700 tracking-tight mt-0.5">{kpiStats.scheduledCount}</p>
            <span className="text-[9px] font-bold text-emerald-600">Work Orders in Pipeline</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="glass-card p-6 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search size={16} className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by equipment ID, asset name, location, or anomaly reason..."
              className="w-full ps-11 pe-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute end-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Action Export */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCsv}
              className="px-4 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition active:scale-95"
              title="Export maintenance alert schedule as CSV"
            >
              <Download size={14} className="text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Pills and Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Severity Filter */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5 flex items-center gap-1">
              <ShieldAlert size={11} className="text-indigo-500" /> Severity Filter
            </label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Severities</option>
              <option value="Critical">Critical (&gt; 75% Risk)</option>
              <option value="High">High (50% - 75% Risk)</option>
              <option value="Medium">Medium (30% - 50% Risk)</option>
              <option value="Low">Low (&lt; 30% Risk)</option>
            </select>
          </div>

          {/* Equipment Type Filter */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5 flex items-center gap-1">
              <Layers size={11} className="text-indigo-500" /> Equipment Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Equipment Types</option>
              {availableTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5 flex items-center gap-1">
              <SlidersHorizontal size={11} className="text-indigo-500" /> Facility Sector
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Locations / Plants</option>
              {availableLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Due Window & Sort */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5 flex items-center gap-1">
              <Calendar size={11} className="text-indigo-500" /> Due Window
            </label>
            <select
              value={dueWindowFilter}
              onChange={(e) => setDueWindowFilter(e.target.value as any)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Forecast Windows</option>
              <option value="URGENT">Next 72 Hours (Urgent)</option>
              <option value="WEEK">Next 7 Days</option>
              <option value="MONTH">Next 30 Days</option>
            </select>
          </div>
        </div>

        {/* Sort Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sort By:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (sortBy === 'risk') setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
                  else { setSortBy('risk'); setSortOrder('desc'); }
                }}
                className={`px-3 py-1 rounded-lg font-bold text-[10px] uppercase transition ${
                  sortBy === 'risk' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Failure Risk {sortBy === 'risk' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
              <button
                onClick={() => {
                  if (sortBy === 'due') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                  else { setSortBy('due'); setSortOrder('asc'); }
                }}
                className={`px-3 py-1 rounded-lg font-bold text-[10px] uppercase transition ${
                  sortBy === 'due' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Due Date {sortBy === 'due' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => {
                  if (sortBy === 'temp') setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
                  else { setSortBy('temp'); setSortOrder('desc'); }
                }}
                className={`px-3 py-1 rounded-lg font-bold text-[10px] uppercase transition ${
                  sortBy === 'temp' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Temperature {sortBy === 'temp' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
              <button
                onClick={() => {
                  if (sortBy === 'vib') setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
                  else { setSortBy('vib'); setSortOrder('desc'); }
                }}
                className={`px-3 py-1 rounded-lg font-bold text-[10px] uppercase transition ${
                  sortBy === 'vib' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Vibration {sortBy === 'vib' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
            </div>
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            Showing <strong className="text-slate-700">{filteredAlerts.length}</strong> of {maintenanceAlerts.length} Equipment Records
          </span>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="glass-card rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <th className="py-4 px-6 text-start">Asset / Identifier</th>
                <th className="py-4 px-6 text-start">Severity & Risk</th>
                <th className="py-4 px-6 text-start">IoT Sensor Telemetry</th>
                <th className="py-4 px-6 text-start">Trigger Reason / Anomaly</th>
                <th className="py-4 px-6 text-start">Recommended Intervention</th>
                <th className="py-4 px-6 text-start">Due Forecast</th>
                <th className="py-4 px-6 text-end">Operational Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <CheckCircle2 size={30} className="text-emerald-500" />
                      </div>
                      <h4 className="text-sm font-black text-slate-700 uppercase tracking-tight">No Alerts Match Criteria</h4>
                      <p className="text-xs text-slate-400 font-medium max-w-sm">All monitored machinery within the selected criteria operate inside normal safety thresholds.</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedSeverity('ALL');
                          setSelectedType('ALL');
                          setSelectedLocation('ALL');
                          setDueWindowFilter('ALL');
                        }}
                        className="text-xs text-indigo-600 font-bold uppercase tracking-wider hover:underline pt-2"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => {
                  const isExpanded = expandedAlertId === alert.id;
                  const isScheduled = scheduledAlertIds[alert.id];

                  return (
                    <React.Fragment key={alert.id}>
                      <tr 
                        className={`hover:bg-slate-50/70 transition-colors group ${
                          alert.severity === 'Critical' ? 'bg-red-50/15' : ''
                        }`}
                      >
                        {/* Asset Column */}
                        <td className="py-4 px-6">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-800 text-sm tracking-tight">{alert.equipment.name}</span>
                              {alert.equipment.prediction && (
                                <span className="bg-indigo-100 text-indigo-700 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                                  AI
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                              {alert.equipmentId} • {alert.equipment.type}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                              {alert.equipment.location}
                            </div>
                          </div>
                        </td>

                        {/* Severity & Risk Column */}
                        <td className="py-4 px-6">
                          <div className="space-y-1.5">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-xl border tracking-widest ${
                              alert.severity === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                              alert.severity === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                              alert.severity === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              <AlertTriangle size={11} />
                              {alert.severity}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    alert.failureRiskPercent >= 75 ? 'bg-red-500' :
                                    alert.failureRiskPercent >= 50 ? 'bg-orange-500' :
                                    alert.failureRiskPercent >= 30 ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${alert.failureRiskPercent}%` }}
                                ></div>
                              </div>
                              <span className="font-mono text-xs font-black text-slate-700">
                                {alert.failureRiskPercent}%
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* IoT Sensor Readings Column */}
                        <td className="py-4 px-6">
                          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                            <div className={`p-1.5 rounded-lg border ${
                              alert.equipment.sensors.temperature > 80 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}>
                              <span className="text-[9px] uppercase font-sans font-bold text-slate-400 block">Temp</span>
                              <span className="font-black">{alert.equipment.sensors.temperature}°C</span>
                            </div>
                            <div className={`p-1.5 rounded-lg border ${
                              alert.equipment.sensors.vibration > 4.5 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}>
                              <span className="text-[9px] uppercase font-sans font-bold text-slate-400 block">Vib</span>
                              <span className="font-black">{alert.equipment.sensors.vibration} mm/s</span>
                            </div>
                          </div>
                        </td>

                        {/* Trigger Reason */}
                        <td className="py-4 px-6 max-w-xs">
                          <p className="font-bold text-slate-800 text-xs leading-snug">
                            {alert.triggerReason}
                          </p>
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-1 font-medium">
                            {alert.sensorAnomalies[0]}
                          </p>
                        </td>

                        {/* Recommended Action */}
                        <td className="py-4 px-6 max-w-xs">
                          <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">
                            {alert.recommendedAction}
                          </p>
                        </td>

                        {/* Due Forecast Column */}
                        <td className="py-4 px-6">
                          <div>
                            <span className="font-mono font-bold text-xs text-slate-800 block">
                              {alert.dueDate}
                            </span>
                            <span className={`text-[10px] font-black uppercase tracking-wider block mt-0.5 ${
                              alert.projectedDueDays <= 2 ? 'text-red-600 font-extrabold' :
                              alert.projectedDueDays <= 7 ? 'text-amber-600' : 'text-slate-400'
                            }`}>
                              {alert.projectedDueDays <= 0 ? 'Overdue' : alert.projectedDueDays === 1 ? 'Within 24 Hours' : `In ~${alert.projectedDueDays} Days`}
                            </span>
                          </div>
                        </td>

                        {/* Operational Actions */}
                        <td className="py-4 px-6 text-end">
                          <div className="flex items-center justify-end gap-2">
                            {/* Inspect Asset in Telemetry View */}
                            {onSelectEquipment && (
                              <button
                                onClick={() => onSelectEquipment(alert.equipment)}
                                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all shadow-sm"
                                title="Inspect asset live telemetry & run AI diagnostics"
                              >
                                <Eye size={15} />
                              </button>
                            )}

                            {/* Schedule / Create Work Order */}
                            <button
                              onClick={() => handleCreateWorkOrder(alert)}
                              disabled={isScheduled}
                              className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 shrink-0 ${
                                isScheduled
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-default'
                                  : alert.severity === 'Critical'
                                    ? 'bg-red-600 hover:bg-red-700 text-white active:scale-95'
                                    : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-95'
                              }`}
                            >
                              {isScheduled ? (
                                <>
                                  <Check size={13} /> Dispatched
                                </>
                              ) : (
                                <>
                                  <Wrench size={13} /> Work Order
                                </>
                              )}
                            </button>

                            {/* Row Expand Toggle */}
                            <button
                              onClick={() => setExpandedAlertId(isExpanded ? null : alert.id)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 transition"
                              title="Toggle detailed sensor breakdown"
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Drawer Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 border-b border-slate-200">
                          <td colSpan={7} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                              <div className="glass-card p-4 rounded-2xl border border-slate-200 bg-white">
                                <h5 className="font-black uppercase text-[10px] text-slate-400 tracking-widest mb-2 flex items-center gap-1.5">
                                  <Activity size={14} className="text-indigo-600" /> Sensor Baseline vs Live
                                </h5>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500">Bearing Temperature:</span>
                                    <span className="font-mono font-bold text-slate-800">{alert.equipment.sensors.temperature}°C (Limit 80°C)</span>
                                  </div>
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500">Peak Vibration Velocity:</span>
                                    <span className="font-mono font-bold text-slate-800">{alert.equipment.sensors.vibration} mm/s (Limit 4.5 mm/s)</span>
                                  </div>
                                  {alert.equipment.sensors.pressure !== undefined && (
                                    <div className="flex justify-between items-center text-xs">
                                      <span className="text-slate-500">Hydraulic Pressure:</span>
                                      <span className="font-mono font-bold text-slate-800">{alert.equipment.sensors.pressure} psi</span>
                                    </div>
                                  )}
                                  {alert.equipment.sensors.oilLevel !== undefined && (
                                    <div className="flex justify-between items-center text-xs">
                                      <span className="text-slate-500">Lubricant Oil Sump:</span>
                                      <span className="font-mono font-bold text-slate-800">{alert.equipment.sensors.oilLevel}%</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="glass-card p-4 rounded-2xl border border-slate-200 bg-white">
                                <h5 className="font-black uppercase text-[10px] text-slate-400 tracking-widest mb-2 flex items-center gap-1.5">
                                  <AlertTriangle size={14} className="text-orange-600" /> Active Anomaly Flags
                                </h5>
                                <ul className="space-y-1.5">
                                  {alert.sensorAnomalies.map((ano, i) => (
                                    <li key={i} className="flex items-start gap-2 text-[11px] text-slate-700">
                                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0"></span>
                                      <span>{ano}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="glass-card p-4 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between">
                                <div>
                                  <h5 className="font-black uppercase text-[10px] text-slate-400 tracking-widest mb-2 flex items-center gap-1.5">
                                    <Sparkles size={14} className="text-indigo-600" /> Corrective Protocol
                                  </h5>
                                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                                    {alert.recommendedAction}
                                  </p>
                                </div>
                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500">
                                  <span>Total Machine Run: {alert.equipment.operationalHours.toLocaleString()} hrs</span>
                                  <span>Last Maint: {alert.equipment.lastMaintenanceDate}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
