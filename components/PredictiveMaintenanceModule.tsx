import { AITag } from './AITag';
import React, { useState, useMemo, useEffect } from 'react';
import { Equipment, MaintenancePrediction, Task } from '../types';
import { predictEquipmentFailure } from '../services/geminiService';
import { 
  Activity, Thermometer, Gauge, Zap, AlertTriangle, CheckCircle, 
  Settings, Wrench, Calendar, BrainCircuit, Loader2, RefreshCcw, FileText,
  CheckCircle2, ArrowRight, Bell, ListFilter, Plus, Shield, ShieldAlert, ShieldCheck,
  Lock, Scale, Info, X, SlidersHorizontal, AlertOctagon, FileSignature,
  Check, User, Clock, Building2, ChevronRight, HelpCircle
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { useUser } from '../contexts/UserContext';
import { PredictiveMaintenanceLog } from './PredictiveMaintenanceLog';
import { 
  PredictiveMaintenanceValidationService, 
  EquipmentFormValues, 
  WorkOrderFormValues, 
  FormValidationReport 
} from '../services/predictiveMaintenanceValidation';

// Mock Data Generator for chart visualization
const generateMockHistory = (baseTemp: number, baseVib: number) => {
  return Array.from({ length: 15 }, (_, i) => ({
    time: `${8 + i}:00`,
    temp: Number((baseTemp + Math.sin(i / 2) * 3 + (Math.random() * 2 - 1)).toFixed(1)),
    vib: Number(Math.max(0.1, baseVib + Math.cos(i / 2) * 0.4 + (Math.random() * 0.2 - 0.1)).toFixed(2)),
  }));
};

const DEFAULT_EQUIPMENT_TYPES = [
  'Compressor',
  'Pump',
  'Generator',
  'Turbine',
  'Centrifuge',
  'Boiler',
  'Crane',
  'Excavator',
  'Conveyor',
  'Heat Exchanger',
  'Motor',
  'Transformer',
  'Fan / Blower',
  'Extruder',
  'Valve Skid'
];

export const PredictiveMaintenanceModule: React.FC = () => {
  const { currentUser, equipment, updateEquipment } = useUser();
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [mockChartData, setMockChartData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'alerts_log'>('diagnostics');

  // Modals state
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [assetModalMode, setAssetModalMode] = useState<'create' | 'edit'>('create');
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [isServerValidating, setIsServerValidating] = useState(false);
  const [serverValidationFeedback, setServerValidationFeedback] = useState<{
    success: boolean;
    message: string;
    warnings?: string[];
    errors?: Record<string, string>;
    hseCompliance?: any;
  } | null>(null);

  // Notification toast state
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  // Form State for Equipment Registration & Telemetry Calibration
  const [equipmentForm, setEquipmentForm] = useState<EquipmentFormValues>({
    id: '',
    name: '',
    type: 'Compressor',
    location: '',
    operationalHours: '12450',
    lastMaintenanceDate: new Date().toISOString().split('T')[0],
    temperature: '65.5',
    vibration: '2.10',
    pressure: '125',
    oilLevel: '85',
    status: 'Operational',
    calibrationTechnicianCert: 'ISO-18436-VA-9912',
    hseRiskCategory: 'Category B - Process Containment'
  });

  // Real-time client-side validation report for Equipment Form
  const equipmentValidation = useMemo<FormValidationReport>(() => {
    return PredictiveMaintenanceValidationService.validateEquipmentForm(equipmentForm);
  }, [equipmentForm]);

  // Form State for Work Order Scheduling
  const [workOrderForm, setWorkOrderForm] = useState<WorkOrderFormValues>({
    equipmentId: '',
    equipmentName: '',
    title: '',
    priority: 'P2 - High',
    category: 'Preventive',
    assignee: currentUser?.name || 'Marcus Chen',
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    lotoRequired: false,
    permitRequired: false,
    ramsReference: 'RAMS-201',
    safetyPrecautions: 'Perform mechanical zero-energy isolation and verify gas testing at flange.'
  });

  // Real-time client-side validation report for Work Order Form
  const workOrderValidation = useMemo(() => {
    return PredictiveMaintenanceValidationService.validateWorkOrderForm(workOrderForm, selectedEquipment);
  }, [workOrderForm, selectedEquipment]);

  // Auto-select first equipment on mount if none selected
  useEffect(() => {
    if (!selectedEquipment && equipment.length > 0) {
      setSelectedEquipment(equipment[0]);
      setMockChartData(generateMockHistory(equipment[0].sensors.temperature, equipment[0].sensors.vibration));
    }
  }, [equipment, selectedEquipment]);

  // Permissions check
  const canAccess = ['ADMIN', 'Site_HSE_Manager', 'Regional_HSE_Director', 'Head_Group_HSE', 'Site_Supervisor', 'Maintenance_Lead'].includes(currentUser.role);

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center p-12 animate-in fade-in">
        <div className="glass-panel p-8 rounded-full mb-6">
          <AlertTriangle size={48} className="text-orange-400" />
        </div>
        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Restricted Access</h3>
        <p className="text-slate-500 font-medium max-w-xs mt-2">This module requires Maintenance or HSE Management clearance.</p>
      </div>
    );
  }

  const showToast = (type: 'success' | 'error' | 'warning', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleSelectEquipment = (eq: Equipment) => {
    setSelectedEquipment(eq);
    setMockChartData(generateMockHistory(eq.sensors.temperature, eq.sensors.vibration));
  };

  const handleRunAnalysis = async () => {
    if (!selectedEquipment) return;
    setLoading(true);
    try {
      const prediction = await predictEquipmentFailure(selectedEquipment);
      const updatedEquipment = { ...selectedEquipment, prediction };
      
      updateEquipment(updatedEquipment);
      setSelectedEquipment(updatedEquipment);
      showToast('success', `AI Reliability diagnostics updated for ${selectedEquipment.name}`);
    } catch (err) {
      showToast('error', 'Failed to generate predictive analysis.');
    } finally {
      setLoading(false);
    }
  };

  // Open modal to register a completely new equipment
  const handleOpenCreateModal = () => {
    setAssetModalMode('create');
    setEquipmentForm({
      id: `EQ-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      type: 'Compressor',
      location: 'Mina Al Fahal Polyolefin Unit · Sector 4',
      operationalHours: '4500',
      lastMaintenanceDate: new Date().toISOString().split('T')[0],
      temperature: '62.0',
      vibration: '1.80',
      pressure: '120',
      oilLevel: '80',
      status: 'Operational',
      calibrationTechnicianCert: 'ISO-18436-VA-9912',
      hseRiskCategory: 'Category B - Process Containment'
    });
    setServerValidationFeedback(null);
    setIsAssetModalOpen(true);
  };

  // Open modal to calibrate / update telemetry of currently selected equipment
  const handleOpenEditModal = () => {
    if (!selectedEquipment) return;
    setAssetModalMode('edit');
    setEquipmentForm({
      id: selectedEquipment.id,
      name: selectedEquipment.name,
      type: selectedEquipment.type,
      location: selectedEquipment.location,
      operationalHours: String(selectedEquipment.operationalHours),
      lastMaintenanceDate: selectedEquipment.lastMaintenanceDate || new Date().toISOString().split('T')[0],
      temperature: String(selectedEquipment.sensors.temperature),
      vibration: String(selectedEquipment.sensors.vibration),
      pressure: selectedEquipment.sensors.pressure !== undefined ? String(selectedEquipment.sensors.pressure) : '120',
      oilLevel: selectedEquipment.sensors.oilLevel !== undefined ? String(selectedEquipment.sensors.oilLevel) : '75',
      status: selectedEquipment.status,
      calibrationTechnicianCert: 'ISO-18436-VA-9912',
      hseRiskCategory: 'Category B - Process Containment'
    });
    setServerValidationFeedback(null);
    setIsAssetModalOpen(true);
  };

  // Handle Equipment Form Submission (Comprehensive Client + Server Validation)
  const handleSaveEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Mandatory Client-side Validation Check
    if (!equipmentValidation.isValid) {
      const firstError = Object.values(equipmentValidation.errors)[0];
      showToast('error', `Client validation error: ${firstError}`);
      return;
    }

    setIsServerValidating(true);
    setServerValidationFeedback(null);

    const payload = {
      id: equipmentForm.id.trim().toUpperCase(),
      name: equipmentForm.name.trim(),
      type: equipmentForm.type,
      location: equipmentForm.location.trim(),
      operationalHours: Number(equipmentForm.operationalHours),
      lastMaintenanceDate: equipmentForm.lastMaintenanceDate,
      sensors: {
        temperature: Number(Number(equipmentForm.temperature).toFixed(1)),
        vibration: Number(Number(equipmentForm.vibration).toFixed(2)),
        pressure: equipmentForm.pressure ? Number(equipmentForm.pressure) : undefined,
        oilLevel: equipmentForm.oilLevel ? Number(equipmentForm.oilLevel) : undefined,
      },
      status: equipmentForm.status,
      calibrationTechnicianCert: equipmentForm.calibrationTechnicianCert,
      hseRiskCategory: equipmentForm.hseRiskCategory
    };

    // 2. Authoritative Server-side Validation Check
    const serverResult = await PredictiveMaintenanceValidationService.submitEquipmentToServer(payload);
    setIsServerValidating(false);

    if (!serverResult.success) {
      setServerValidationFeedback({
        success: false,
        message: serverResult.message || 'Server rejected equipment telemetry validation.',
        errors: serverResult.errors,
        warnings: serverResult.warnings,
        hseCompliance: serverResult.hseCompliance
      });
      showToast('error', serverResult.message || 'Validation failed on server rules.');
      return;
    }

    // Success: update global state
    const savedEq: Equipment = {
      id: payload.id,
      name: payload.name,
      type: payload.type,
      location: payload.location,
      operationalHours: payload.operationalHours,
      lastMaintenanceDate: payload.lastMaintenanceDate,
      sensors: payload.sensors,
      status: payload.status,
      relatedIncidents: selectedEquipment?.id === payload.id ? selectedEquipment.relatedIncidents : [],
      prediction: selectedEquipment?.id === payload.id ? selectedEquipment.prediction : undefined
    };

    updateEquipment(savedEq);
    setSelectedEquipment(savedEq);
    setMockChartData(generateMockHistory(savedEq.sensors.temperature, savedEq.sensors.vibration));

    setIsAssetModalOpen(false);
    showToast('success', `Asset ${savedEq.id} telemetry certified and synchronized with ISO 10816 & API 670 standards.`);
  };

  // Open modal to schedule a work order
  const handleOpenWorkOrderModal = () => {
    if (!selectedEquipment) return;
    const isCritical = selectedEquipment.status === 'Critical' || selectedEquipment.sensors.temperature > 80 || selectedEquipment.sensors.vibration > 4.5;
    
    setWorkOrderForm({
      equipmentId: selectedEquipment.id,
      equipmentName: selectedEquipment.name,
      title: selectedEquipment.prediction 
        ? `Prev. Maint: ${selectedEquipment.prediction.rootCauseSuspect}` 
        : `Scheduled Inspection: ${selectedEquipment.name}`,
      priority: isCritical ? 'P1 - Critical' : 'P2 - High',
      category: isCritical ? 'Emergency LOTO Breakdown' : 'Preventive',
      assignee: currentUser?.name || 'Marcus Chen',
      dueDate: new Date(Date.now() + (isCritical ? 1 : 3) * 86400000).toISOString().split('T')[0],
      lotoRequired: isCritical,
      permitRequired: isCritical,
      ramsReference: 'RAMS-201',
      safetyPrecautions: selectedEquipment.prediction?.recommendedAction || 'Enforce zero-energy verification and gas testing prior to unbolting.'
    });
    setIsWorkOrderModalOpen(true);
  };

  // Handle Work Order Submission (Client + Server Validation)
  const handleSaveWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workOrderValidation.isValid) {
      const firstError = Object.values(workOrderValidation.errors)[0];
      showToast('error', `Validation error: ${firstError}`);
      return;
    }

    setIsServerValidating(true);
    const serverResult = await PredictiveMaintenanceValidationService.submitWorkOrderToServer({
      equipmentId: workOrderForm.equipmentId,
      title: workOrderForm.title,
      priority: workOrderForm.priority,
      category: workOrderForm.category,
      assignee: workOrderForm.assignee,
      dueDate: workOrderForm.dueDate,
      lotoRequired: workOrderForm.lotoRequired,
      permitRequired: workOrderForm.permitRequired,
      ramsReference: workOrderForm.ramsReference,
      safetyPrecautions: workOrderForm.safetyPrecautions,
      requiresLotoCheck: selectedEquipment?.status === 'Critical' || (selectedEquipment?.sensors.temperature || 0) > 85
    });
    setIsServerValidating(false);

    if (!serverResult.success) {
      showToast('error', serverResult.message || 'Work Order failed server validation.');
      return;
    }

    // Persist Task
    const savedTasks = localStorage.getItem('hse_tasks');
    const currentTasks: Task[] = savedTasks ? JSON.parse(savedTasks) : [];

    const newTask: Task = {
      id: serverResult.taskId || `T-MAINT-${Date.now()}`,
      title: workOrderForm.title,
      description: `ASSET: ${selectedEquipment?.name} (${workOrderForm.equipmentId})\nCATEGORY: ${workOrderForm.category}\nPRECAUTIONS: ${workOrderForm.safetyPrecautions}\nRAMS: ${workOrderForm.ramsReference}\nLOTO REQUIRED: ${workOrderForm.lotoRequired ? 'YES (OSHA 1910.147)' : 'NO'}\nPERMIT REQUIRED: ${workOrderForm.permitRequired ? 'YES' : 'NO'}`,
      assignee: workOrderForm.assignee,
      priority: workOrderForm.priority.startsWith('P1') ? 'High' : 'Medium',
      category: 'Maintenance',
      status: 'ToDo',
      dueDate: workOrderForm.dueDate,
      createdAt: new Date().toISOString(),
      createdBy: `${currentUser.name} (${currentUser.role})`
    };

    localStorage.setItem('hse_tasks', JSON.stringify([newTask, ...currentTasks]));
    setIsWorkOrderModalOpen(false);
    showToast('success', `Work Order ${newTask.id} successfully validated and registered.`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-20 end-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold text-white border transition-all animate-bounce ${
          toastMessage.type === 'success' ? 'bg-slate-900 border-emerald-500/50' :
          toastMessage.type === 'error' ? 'bg-red-950 border-red-500/50' :
          'bg-amber-950 border-amber-500/50'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0" /> :
           toastMessage.type === 'error' ? <AlertOctagon size={16} className="text-red-400 shrink-0" /> :
           <AlertTriangle size={16} className="text-amber-400 shrink-0" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-x-5">
          <div className="bg-indigo-600 p-5 rounded-[2rem] text-white shadow-2xl shadow-indigo-500/20">
            <Activity size={32} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Predictive Maint.</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-s-2 border-indigo-500 ps-4">
              AI Asset Reliability & Statutory HSE Sensor Validation (ISO 10816 / API 670)
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Tab Switcher */}
          <div className="flex items-center gap-1.5 p-1.5 glass-panel rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab('diagnostics')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
                activeTab === 'diagnostics'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Activity size={14} />
              <span>Telemetry & Diagnostics</span>
            </button>
            <button
              onClick={() => setActiveTab('alerts_log')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
                activeTab === 'alerts_log'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bell size={14} />
              <span>IoT Alerts Log</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'alerts_log' ? 'bg-indigo-700 text-white' : 'bg-red-500 text-white'
              }`}>
                {equipment.filter(e => e.status === 'Critical' || e.status === 'Warning' || e.sensors.temperature > 80 || e.sensors.vibration > 4.5).length}
              </span>
            </button>
          </div>

          {/* Action Button: Register New Asset */}
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-xs uppercase tracking-wider flex items-center gap-2 border border-indigo-200 transition-all shadow-sm active:scale-95"
            title="Register new equipment asset with certified sensor limits"
          >
            <Plus size={16} />
            <span>Register Asset</span>
          </button>

          <div className="glass-card border border-slate-200 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xs">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">ISO 10816:</span>
            <span className="text-emerald-600 font-black text-xs flex items-center gap-1 uppercase tracking-wider">
              <Shield size={12}/> Active
            </span>
          </div>
        </div>
      </div>

      {activeTab === 'alerts_log' ? (
        <div className="animate-in fade-in duration-300">
          <PredictiveMaintenanceLog 
            equipmentList={equipment}
            onSelectEquipment={(eq) => {
              handleSelectEquipment(eq);
              setActiveTab('diagnostics');
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-240px)] min-h-[600px]">
          
          {/* Left: Equipment List */}
          <div className="lg:col-span-4 flex flex-col glass-card rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 glass-panel flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Monitored Assets</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                  {equipment.length} Units Telemetry Synchronized
                </p>
              </div>
              <button
                onClick={handleOpenCreateModal}
                className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-all shadow-md active:scale-95"
                title="Register New Asset with Validation"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {equipment.map(eq => (
                <div 
                  key={eq.id}
                  onClick={() => handleSelectEquipment(eq)}
                  className={`p-5 rounded-[2rem] border-2 transition-all cursor-pointer hover:shadow-lg group relative overflow-hidden ${
                    selectedEquipment?.id === eq.id 
                      ? 'border-indigo-600 bg-indigo-50/15' 
                      : 'border-slate-50 glass-card hover:border-slate-200'
                  }`}
                >
                  <div className={`absolute top-0 start-0 w-1.5 h-full transition-colors ${
                    eq.status === 'Critical' ? 'bg-red-500' :
                    eq.status === 'Warning' ? 'bg-orange-500' :
                    eq.status === 'Maintenance' ? 'bg-blue-500' :
                    'bg-emerald-500'
                  }`}></div>
                  
                  <div className="ps-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className={`font-black text-sm uppercase tracking-tight ${selectedEquipment?.id === eq.id ? 'text-indigo-900' : 'text-slate-800'}`}>
                          {eq.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                          {eq.type} • {eq.location}
                        </p>
                      </div>
                      {eq.prediction && (
                        <div className="bg-indigo-600 text-white p-1.5 rounded-full shadow-lg shadow-indigo-500/30">
                          <BrainCircuit size={12} />
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div className="glass-panel p-2 rounded-xl border border-slate-100">
                        <p className="text-[9px] text-slate-400 font-black uppercase flex items-center gap-1">
                          <Thermometer size={10}/> Temp
                        </p>
                        <p className={`text-xs font-bold ${eq.sensors.temperature > 80 ? 'text-red-600' : 'text-slate-700'}`}>
                          {eq.sensors.temperature}°C
                        </p>
                      </div>
                      <div className="glass-panel p-2 rounded-xl border border-slate-100">
                        <p className="text-[9px] text-slate-400 font-black uppercase flex items-center gap-1">
                          <Activity size={10}/> Vib
                        </p>
                        <p className={`text-xs font-bold ${eq.sensors.vibration > 4.5 ? 'text-red-600' : 'text-slate-700'}`}>
                          {eq.sensors.vibration} mm/s
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Detailed View & Telemetry Controls */}
          <div className="lg:col-span-8 h-full">
            {selectedEquipment ? (
              <div className="glass-card rounded-[2.5rem] shadow-xl border border-slate-100 h-full flex flex-col overflow-hidden relative">
                
                {/* Detail Header */}
                <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center glass-panel/30 gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
                        {selectedEquipment.name}
                      </h3>
                      <span className={`text-[9px] font-black px-3 py-1 rounded-lg border uppercase tracking-widest ${
                        selectedEquipment.status === 'Operational' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        selectedEquipment.status === 'Critical' ? 'bg-red-50 text-red-700 border-red-100' :
                        'bg-orange-50 text-orange-700 border-orange-100'
                      }`}>
                        {selectedEquipment.status}
                      </span>
                      {selectedEquipment.sensors.vibration >= 7.1 && (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-red-600 text-white uppercase tracking-wider flex items-center gap-1">
                          <AlertTriangle size={10} /> ISO Zone D
                        </span>
                      )}
                      {selectedEquipment.sensors.temperature >= 95 && (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-rose-600 text-white uppercase tracking-wider flex items-center gap-1">
                          <Thermometer size={10} /> API 670 Trip
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 flex-wrap">
                      <span>ID: <strong>{selectedEquipment.id}</strong></span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span>Last Service: {selectedEquipment.lastMaintenanceDate}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span>{selectedEquipment.operationalHours.toLocaleString()} hrs</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Calibrate / Update Telemetry Button */}
                    <button
                      onClick={handleOpenEditModal}
                      className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border border-slate-300/80 transition-all active:scale-95"
                      title="Update and calibrate sensor telemetry with ISO 10816 verification"
                    >
                      <SlidersHorizontal size={14} className="text-indigo-600" />
                      <span>Calibrate & Validate</span>
                    </button>

                    {/* Run AI Diagnostics */}
                    <button 
                      onClick={handleRunAnalysis}
                      disabled={loading}
                      className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="animate-spin" size={14} /> : <BrainCircuit size={14} />}
                      Run Diagnostics
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                  
                  {/* Live Telemetry Standards Card */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="glass-card p-4 rounded-2xl border border-slate-100 shadow-xs">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400 mb-1">
                        <span className="flex items-center gap-1"><Thermometer size={12} className="text-orange-500" /> Temperature</span>
                        <span className="text-[9px] text-slate-500">API 670</span>
                      </div>
                      <p className={`text-xl font-black ${selectedEquipment.sensors.temperature >= 80 ? 'text-red-600' : 'text-slate-800'}`}>
                        {selectedEquipment.sensors.temperature}°C
                      </p>
                      <p className="text-[9px] text-slate-500 mt-1 font-semibold">
                        {selectedEquipment.sensors.temperature >= 95 ? 'Critical Trip Ceiling (>95°C)' :
                         selectedEquipment.sensors.temperature >= 80 ? 'Thermal Warning Band' :
                         'Nominal Operating Range'}
                      </p>
                    </div>

                    <div className="glass-card p-4 rounded-2xl border border-slate-100 shadow-xs">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400 mb-1">
                        <span className="flex items-center gap-1"><Activity size={12} className="text-blue-500" /> Vibration</span>
                        <span className="text-[9px] text-slate-500">ISO 10816</span>
                      </div>
                      <p className={`text-xl font-black ${selectedEquipment.sensors.vibration >= 4.5 ? 'text-red-600' : 'text-slate-800'}`}>
                        {selectedEquipment.sensors.vibration} <span className="text-xs font-semibold text-slate-500">mm/s</span>
                      </p>
                      <p className="text-[9px] text-slate-500 mt-1 font-semibold">
                        {selectedEquipment.sensors.vibration >= 7.1 ? 'Zone D: Danger / Structural Alarm' :
                         selectedEquipment.sensors.vibration >= 4.5 ? 'Zone C: Restricted Warning' :
                         'Zone A/B: Good / Acceptable'}
                      </p>
                    </div>

                    <div className="glass-card p-4 rounded-2xl border border-slate-100 shadow-xs">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400 mb-1">
                        <span className="flex items-center gap-1"><Gauge size={12} className="text-emerald-500" /> Pressure</span>
                        <span className="text-[9px] text-slate-500">Hydraulic</span>
                      </div>
                      <p className="text-xl font-black text-slate-800">
                        {selectedEquipment.sensors.pressure !== undefined ? selectedEquipment.sensors.pressure : 120} <span className="text-xs font-semibold text-slate-500">psi</span>
                      </p>
                      <p className="text-[9px] text-slate-500 mt-1 font-semibold">
                        Normal loop pressure
                      </p>
                    </div>

                    <div className="glass-card p-4 rounded-2xl border border-slate-100 shadow-xs">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400 mb-1">
                        <span className="flex items-center gap-1"><Zap size={12} className="text-amber-500" /> Oil Sump</span>
                        <span className="text-[9px] text-slate-500">Lube Level</span>
                      </div>
                      <p className={`text-xl font-black ${(selectedEquipment.sensors.oilLevel || 75) < 30 ? 'text-red-600' : 'text-slate-800'}`}>
                        {selectedEquipment.sensors.oilLevel !== undefined ? selectedEquipment.sensors.oilLevel : 75}%
                      </p>
                      <p className="text-[9px] text-slate-500 mt-1 font-semibold">
                        {(selectedEquipment.sensors.oilLevel || 75) < 30 ? 'Critical Low (<30%)' : 'Adequate film lubrication'}
                      </p>
                    </div>
                  </div>

                  {/* Live Telemetry Charts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="glass-card border border-slate-100 rounded-[2rem] p-6 shadow-lg">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Thermometer size={16} className="text-orange-500" /> Temperature Trend (°C)
                        </span>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-orange-50 text-orange-700 font-bold border border-orange-200">
                          Limit: 80°C
                        </span>
                      </h4>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={mockChartData}>
                            <defs>
                              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                            <XAxis dataKey="time" hide />
                            <YAxis domain={['auto', 'auto']} width={35} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                            <Area type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="glass-card border border-slate-100 rounded-[2rem] p-6 shadow-lg">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Activity size={16} className="text-blue-500" /> Vibration Velocity (mm/s)
                        </span>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                          ISO Limit: 4.5 mm/s
                        </span>
                      </h4>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={mockChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                            <XAxis dataKey="time" hide />
                            <YAxis domain={['auto', 'auto']} width={35} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                            <Line type="monotone" dataKey="vib" stroke="#3b82f6" strokeWidth={3} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* AI Prediction Results */}
                  {selectedEquipment.prediction ? (
                    <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 shadow-2xl">
                      <div className="absolute top-0 end-0 p-8 opacity-10">
                        <BrainCircuit size={180} />
                      </div>
                      
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-6 flex-wrap gap-4">
                          <div>
                            <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">AI Predictive Model</p>
                            <h3 className="text-3xl font-black uppercase tracking-tighter">Maintenance Analysis</h3>
                          </div>
                          <div className="text-end">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Failure Probability</p>
                            <p className={`text-5xl font-black tracking-tighter ${
                              selectedEquipment.prediction.failureProbability > 70 ? 'text-red-400' : 
                              selectedEquipment.prediction.failureProbability > 40 ? 'text-orange-400' : 'text-emerald-400'
                            }`}>
                              {selectedEquipment.prediction.failureProbability}%
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                          <div className="glass-card/5 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
                            <div className="flex items-center gap-2 mb-3 text-indigo-300">
                              <Calendar size={18} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Predicted Failure</span>
                            </div>
                            <p className="font-bold text-lg leading-tight">{selectedEquipment.prediction.predictedFailureDate}</p>
                          </div>
                          <div className="glass-card/5 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
                            <div className="flex items-center gap-2 mb-3 text-orange-300">
                              <AlertTriangle size={18} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Root Cause Suspect</span>
                            </div>
                            <p className="font-bold text-lg leading-tight">{selectedEquipment.prediction.rootCauseSuspect}</p>
                          </div>
                          <div className="glass-card/5 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
                            <div className="flex items-center gap-2 mb-3 text-emerald-300">
                              <Wrench size={18} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Recommendation</span>
                            </div>
                            <p className="font-bold text-lg leading-tight">{selectedEquipment.prediction.recommendedAction}</p>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-4 bg-indigo-600/20 p-5 rounded-[2rem] border border-indigo-500/30">
                          <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-300">
                            <Calendar size={24} />
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] text-indigo-300 font-black uppercase tracking-widest">Suggested Schedule</p>
                            <p className="font-medium text-sm text-indigo-100">
                              Schedule preventive maintenance by <span className="text-white font-bold border-b border-indigo-400">{selectedEquipment.prediction.maintenanceSchedule}</span>
                            </p>
                          </div>
                          <button 
                            onClick={handleOpenWorkOrderModal}
                            className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95 cursor-pointer"
                          >
                            <FileSignature size={16} />
                            <span>Create Validated Work Order</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="glass-panel border-2 border-slate-100 border-dashed rounded-[3rem] p-12 text-center h-[320px] flex flex-col items-center justify-center">
                      <div className="glass-card p-5 rounded-full mb-4 shadow-sm">
                        <Activity size={40} className="text-slate-300" />
                      </div>
                      <h3 className="text-xl font-black text-slate-700 uppercase tracking-tight">Ready for Telemetry Diagnosis</h3>
                      <p className="text-slate-400 text-xs mt-1 max-w-sm font-medium mx-auto">
                        Initiate AI analysis to detect potential failures based on sensor anomalies and historical wear patterns.
                      </p>
                      <div className="flex items-center gap-3 mt-5">
                        <button 
                          onClick={handleRunAnalysis} 
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-md active:scale-95"
                        >
                          Start AI Analysis
                        </button>
                        <button
                          onClick={handleOpenWorkOrderModal}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl border border-slate-200"
                        >
                          Manual Work Order
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ) : (
              <div className="glass-card border-2 border-slate-100 rounded-[2.5rem] h-full flex flex-col items-center justify-center text-slate-400 p-12 text-center shadow-inner">
                <div className="glass-panel p-8 rounded-full mb-6 animate-pulse">
                  <Settings size={64} className="opacity-20" />
                </div>
                <h3 className="text-2xl font-black text-slate-300 uppercase tracking-tighter">Asset Selection Required</h3>
                <p className="max-w-sm mx-auto mt-4 text-sm font-bold uppercase tracking-widest opacity-60">Choose an asset from the fleet list to view real-time telemetry and predictive insights.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 1: Equipment Registration & Telemetry Calibration Form     */}
      {/* Fully validated client-side and server-side                       */}
      {/* ================================================================= */}
      {isAssetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in zoom-in-95 my-8">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <SlidersHorizontal size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                    {assetModalMode === 'create' ? 'Register New Industrial Asset' : `Calibrate Telemetry: ${equipmentForm.name || equipmentForm.id}`}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    ISO 10816 Mechanical Vibration & API 670 Machinery Protection Standards
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAssetModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Server-Side Validation Banner if returned */}
            {serverValidationFeedback && (
              <div className={`p-4 border-b ${
                serverValidationFeedback.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'
              }`}>
                <div className="flex items-start gap-3">
                  {serverValidationFeedback.success ? (
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertOctagon size={18} className="text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs">
                    <p className="font-bold">{serverValidationFeedback.message}</p>
                    {serverValidationFeedback.warnings && serverValidationFeedback.warnings.length > 0 && (
                      <ul className="mt-1 list-disc list-inside text-[11px] text-amber-800 space-y-0.5">
                        {serverValidationFeedback.warnings.map((w, idx) => <li key={idx}>{w}</li>)}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Compliance Preview Badges */}
            <div className="bg-slate-900 px-6 py-3 flex flex-wrap items-center justify-between text-white text-xs gap-3">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">ISO 10816:</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                    equipmentValidation.compliance.iso10816Zone === 'Zone D (Critical Danger)' ? 'bg-red-600 text-white' :
                    equipmentValidation.compliance.iso10816Zone === 'Zone C (Warning)' ? 'bg-amber-500 text-white' :
                    equipmentValidation.compliance.iso10816Zone === 'Zone B (Acceptable)' ? 'bg-blue-600 text-white' :
                    'bg-emerald-600 text-white'
                  }`}>
                    {equipmentValidation.compliance.iso10816Zone}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Thermal:</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                    equipmentValidation.compliance.thermalZone === 'Critical Trip' ? 'bg-red-600 text-white' :
                    equipmentValidation.compliance.thermalZone === 'Warning' ? 'bg-amber-500 text-white' :
                    'bg-emerald-600 text-white'
                  }`}>
                    {equipmentValidation.compliance.thermalZone}
                  </span>
                </div>
              </div>

              {equipmentValidation.compliance.lotoMandatory && (
                <div className="flex items-center gap-1 text-[11px] text-red-300 font-bold bg-red-950/60 px-2.5 py-0.5 rounded-md border border-red-500/30">
                  <Lock size={12} className="text-red-400" />
                  <span>Mandatory LOTO Triggered</span>
                </div>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEquipment} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              
              {/* Section 1: Asset Core Attributes */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                  <Building2 size={14} className="text-indigo-600" />
                  <span>Asset Identification & Location</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Equipment ID */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Equipment Asset ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={assetModalMode === 'edit'}
                      value={equipmentForm.id}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, id: e.target.value.toUpperCase() })}
                      placeholder="e.g. EQ-COMP-101"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                        equipmentValidation.fieldStates.id?.isValid === false
                          ? 'border-red-400 bg-red-50/50 focus:ring-2 focus:ring-red-400'
                          : 'border-slate-300 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500'
                      }`}
                    />
                    {equipmentValidation.fieldStates.id?.message && (
                      <p className={`text-[10px] mt-1 font-semibold ${
                        equipmentValidation.fieldStates.id.type === 'error' ? 'text-red-600' : 'text-slate-500'
                      }`}>
                        {equipmentValidation.fieldStates.id.message}
                      </p>
                    )}
                  </div>

                  {/* Asset Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Asset Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={equipmentForm.name}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, name: e.target.value })}
                      placeholder="e.g. Primary Wet Gas Compressor K-101"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        equipmentValidation.fieldStates.name?.isValid === false
                          ? 'border-red-400 bg-red-50/50 focus:ring-2 focus:ring-red-400'
                          : 'border-slate-300 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500'
                      }`}
                    />
                    {equipmentValidation.fieldStates.name?.message && (
                      <p className={`text-[10px] mt-1 font-semibold ${
                        equipmentValidation.fieldStates.name.type === 'error' ? 'text-red-600' : 'text-slate-500'
                      }`}>
                        {equipmentValidation.fieldStates.name.message}
                      </p>
                    )}
                  </div>

                  {/* Asset Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Equipment Class / Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={equipmentForm.type}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, type: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500"
                    >
                      {DEFAULT_EQUIPMENT_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Facility & Operational Zone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={equipmentForm.location}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, location: e.target.value })}
                      placeholder="e.g. Mina Al Fahal Polyolefin Asset · Area 4"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        equipmentValidation.fieldStates.location?.isValid === false
                          ? 'border-red-400 bg-red-50/50 focus:ring-2 focus:ring-red-400'
                          : 'border-slate-300 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500'
                      }`}
                    />
                    {equipmentValidation.fieldStates.location?.message && (
                      <p className="text-[10px] mt-1 font-semibold text-red-600">
                        {equipmentValidation.fieldStates.location.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Sensor Telemetry & HSE Thresholds */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Activity size={14} className="text-blue-600" />
                    <span>IoT Sensor Telemetry Calibration (ISO 10816 / API 670)</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">All readings verified RMS</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Temperature */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Thermometer size={12} className="text-orange-500" /> Temp (°C) *
                      </label>
                      <span className="text-[9px] text-slate-400 font-bold">Max 300°C</span>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      value={equipmentForm.temperature}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, temperature: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-all ${
                        equipmentValidation.fieldStates.temperature?.isValid === false
                          ? 'border-red-400 bg-red-50/50'
                          : equipmentValidation.fieldStates.temperature?.type === 'warning'
                            ? 'border-amber-400 bg-amber-50/30'
                            : 'border-slate-300 bg-slate-50/50 focus:bg-white'
                      }`}
                    />
                    {equipmentValidation.fieldStates.temperature?.message && (
                      <p className={`text-[9px] mt-1 font-bold ${
                        equipmentValidation.fieldStates.temperature.type === 'error' ? 'text-red-600' :
                        equipmentValidation.fieldStates.temperature.type === 'warning' ? 'text-amber-700' :
                        'text-slate-500'
                      }`}>
                        {equipmentValidation.fieldStates.temperature.message}
                      </p>
                    )}
                  </div>

                  {/* Vibration */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Activity size={12} className="text-blue-500" /> Vib (mm/s) *
                      </label>
                      <span className="text-[9px] text-slate-400 font-bold">ISO 10816</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={equipmentForm.vibration}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, vibration: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-all ${
                        equipmentValidation.fieldStates.vibration?.isValid === false
                          ? 'border-red-400 bg-red-50/50'
                          : equipmentValidation.fieldStates.vibration?.type === 'warning'
                            ? 'border-amber-400 bg-amber-50/30'
                            : 'border-slate-300 bg-slate-50/50 focus:bg-white'
                      }`}
                    />
                    {equipmentValidation.fieldStates.vibration?.message && (
                      <p className={`text-[9px] mt-1 font-bold ${
                        equipmentValidation.fieldStates.vibration.type === 'error' ? 'text-red-600' :
                        equipmentValidation.fieldStates.vibration.type === 'warning' ? 'text-amber-700' :
                        'text-slate-500'
                      }`}>
                        {equipmentValidation.fieldStates.vibration.message}
                      </p>
                    )}
                  </div>

                  {/* Pressure */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Gauge size={12} className="text-emerald-500" /> Pressure (psi)
                      </label>
                      <span className="text-[9px] text-slate-400 font-bold">0-5000</span>
                    </div>
                    <input
                      type="number"
                      step="1"
                      value={equipmentForm.pressure}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, pressure: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50/50 text-xs font-mono font-bold focus:bg-white"
                    />
                    {equipmentValidation.fieldStates.pressure?.message && (
                      <p className="text-[9px] mt-1 font-semibold text-red-600">
                        {equipmentValidation.fieldStates.pressure.message}
                      </p>
                    )}
                  </div>

                  {/* Oil Sump Level */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Zap size={12} className="text-amber-500" /> Oil Sump (%)
                      </label>
                      <span className="text-[9px] text-slate-400 font-bold">0-100%</span>
                    </div>
                    <input
                      type="number"
                      step="1"
                      value={equipmentForm.oilLevel}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, oilLevel: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50/50 text-xs font-mono font-bold focus:bg-white"
                    />
                    {equipmentValidation.fieldStates.oilLevel?.message && (
                      <p className={`text-[9px] mt-1 font-bold ${
                        equipmentValidation.fieldStates.oilLevel.type === 'error' ? 'text-red-600' :
                        equipmentValidation.fieldStates.oilLevel.type === 'warning' ? 'text-amber-700' :
                        'text-slate-500'
                      }`}>
                        {equipmentValidation.fieldStates.oilLevel.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Operational Status & HSE Clearance */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Statutory Maintenance & Calibration Governance</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Status */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Operational Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={equipmentForm.status}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, status: e.target.value as any })}
                      className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold ${
                        equipmentValidation.fieldStates.status?.isValid === false
                          ? 'border-red-400 bg-red-50 text-red-900'
                          : 'border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <option value="Operational">Operational (Safe to Run)</option>
                      <option value="Warning">Warning (Restricted Running)</option>
                      <option value="Critical">Critical (Immediate Standdown)</option>
                      <option value="Maintenance">Maintenance (Active LOTO)</option>
                    </select>
                    {equipmentValidation.fieldStates.status?.message && (
                      <p className="text-[10px] mt-1 font-bold text-red-600">
                        {equipmentValidation.fieldStates.status.message}
                      </p>
                    )}
                  </div>

                  {/* Operational Runtime Hours */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Operational Hours <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={equipmentForm.operationalHours}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, operationalHours: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-xs font-mono font-bold"
                    />
                    {equipmentValidation.fieldStates.operationalHours?.message && (
                      <p className={`text-[10px] mt-1 font-semibold ${
                        equipmentValidation.fieldStates.operationalHours.type === 'error' ? 'text-red-600' : 'text-slate-500'
                      }`}>
                        {equipmentValidation.fieldStates.operationalHours.message}
                      </p>
                    )}
                  </div>

                  {/* Last Maintenance Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Last Maintenance Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={equipmentForm.lastMaintenanceDate}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, lastMaintenanceDate: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-xs font-semibold"
                    />
                    {equipmentValidation.fieldStates.lastMaintenanceDate?.message && (
                      <p className="text-[10px] mt-1 font-semibold text-red-600">
                        {equipmentValidation.fieldStates.lastMaintenanceDate.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Calibration Certificate ID */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Technician Vibration/NDT Cert #
                    </label>
                    <input
                      type="text"
                      value={equipmentForm.calibrationTechnicianCert}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, calibrationTechnicianCert: e.target.value })}
                      placeholder="e.g. ISO-18436-VA-9912"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50/50 text-xs font-mono"
                    />
                    {equipmentValidation.fieldStates.calibrationTechnicianCert?.message && (
                      <p className={`text-[10px] mt-1 font-semibold ${
                        equipmentValidation.fieldStates.calibrationTechnicianCert.type === 'error' ? 'text-red-600' : 'text-slate-500'
                      }`}>
                        {equipmentValidation.fieldStates.calibrationTechnicianCert.message}
                      </p>
                    )}
                  </div>

                  {/* HSE Risk Category */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      HSE Criticality Category
                    </label>
                    <select
                      value={equipmentForm.hseRiskCategory}
                      onChange={(e) => setEquipmentForm({ ...equipmentForm, hseRiskCategory: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50/50 text-xs font-semibold"
                    >
                      <option value="Category A - Life Safety Critical">Category A - Life Safety / High Pressure H2S</option>
                      <option value="Category B - Process Containment">Category B - Process Containment Asset</option>
                      <option value="Category C - Standard Auxiliary">Category C - Standard Auxiliary Service</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Form Action Controls */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Shield size={14} className="text-indigo-600" />
                  <span>Complies with ISO 10816-3 & API 670 Machinery Standards</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAssetModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!equipmentValidation.isValid || isServerValidating}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isServerValidating ? (
                      <>
                        <Loader2 className="animate-spin" size={14} />
                        <span>Validating on Server...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={14} />
                        <span>Validate & Certify Asset</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 2: Create Work Order with Statutory SLA & LOTO Validation  */}
      {/* ================================================================= */}
      {isWorkOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 my-8">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <FileSignature size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                    Create Validated Work Order
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    Asset: {selectedEquipment?.name} ({selectedEquipment?.id})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsWorkOrderModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveWorkOrder} className="p-6 space-y-5">
              
              {/* Work Order Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Work Order Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={workOrderForm.title}
                  onChange={(e) => setWorkOrderForm({ ...workOrderForm, title: e.target.value })}
                  placeholder="e.g. Bearing Re-lubrication & Vibration Shaft Balance"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    workOrderValidation.fieldStates.title?.isValid === false
                      ? 'border-red-400 bg-red-50/50'
                      : 'border-slate-300 bg-slate-50/50 focus:bg-white'
                  }`}
                />
                {workOrderValidation.fieldStates.title?.message && (
                  <p className="text-[10px] mt-1 font-semibold text-red-600">
                    {workOrderValidation.fieldStates.title.message}
                  </p>
                )}
              </div>

              {/* Priority & Due Date (SLA Rules) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Priority / SLA Tier <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={workOrderForm.priority}
                    onChange={(e) => setWorkOrderForm({ ...workOrderForm, priority: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-xs font-bold"
                  >
                    <option value="P1 - Critical">P1 - Critical (24-48h Emergency SLA)</option>
                    <option value="P2 - High">P2 - High (72h Safety SLA)</option>
                    <option value="P3 - Medium">P3 - Medium (7-Day Preventive Window)</option>
                    <option value="P4 - Routine">P4 - Routine (30-Day Cycle)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Completion Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={workOrderForm.dueDate}
                    onChange={(e) => setWorkOrderForm({ ...workOrderForm, dueDate: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                      workOrderValidation.fieldStates.dueDate?.isValid === false
                        ? 'border-red-400 bg-red-50/50'
                        : 'border-slate-300 bg-slate-50/50'
                    }`}
                  />
                  {workOrderValidation.fieldStates.dueDate?.message && (
                    <p className={`text-[10px] mt-1 font-semibold ${
                      workOrderValidation.fieldStates.dueDate.type === 'error' ? 'text-red-600' : 'text-slate-500'
                    }`}>
                      {workOrderValidation.fieldStates.dueDate.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Assignee & RAMS Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Authorized Assignee <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={workOrderForm.assignee}
                    onChange={(e) => setWorkOrderForm({ ...workOrderForm, assignee: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Approved RAMS Method Statement #
                  </label>
                  <input
                    type="text"
                    value={workOrderForm.ramsReference}
                    onChange={(e) => setWorkOrderForm({ ...workOrderForm, ramsReference: e.target.value })}
                    placeholder="e.g. RAMS-201"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-xs font-mono font-semibold"
                  />
                </div>
              </div>

              {/* Safety Precautions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  HSE Controls & Safety Instructions
                </label>
                <textarea
                  rows={2}
                  value={workOrderForm.safetyPrecautions}
                  onChange={(e) => setWorkOrderForm({ ...workOrderForm, safetyPrecautions: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50/50 text-xs font-medium"
                />
              </div>

              {/* Mandatory LOTO Check per PDO SP-1231.0 */}
              <div className={`p-4 rounded-2xl border transition-all ${
                workOrderValidation.fieldStates.lotoRequired?.isValid === false
                  ? 'border-red-300 bg-red-50/60'
                  : 'border-slate-200 bg-slate-50'
              }`}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={workOrderForm.lotoRequired}
                    onChange={(e) => setWorkOrderForm({ ...workOrderForm, lotoRequired: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Lock size={12} className="text-amber-600" />
                      Lockout / Tagout (LOTO) Energy Isolation Required (OSHA 1910.147 / PDO SP-1231.0)
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Mandatory if equipment has status 'Critical', temperature &gt;85°C, or hazardous rotating components.
                    </p>
                    {workOrderValidation.fieldStates.lotoRequired?.message && (
                      <p className="text-[10px] mt-1 font-bold text-red-600">
                        {workOrderValidation.fieldStates.lotoRequired.message}
                      </p>
                    )}
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsWorkOrderModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!workOrderValidation.isValid || isServerValidating}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isServerValidating ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      <span>Validating on Server...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} />
                      <span>Submit Validated Work Order</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PredictiveMaintenanceModule;
