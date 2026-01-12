
import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, ShieldAlert, FileText, GraduationCap, X, Loader2, RefreshCcw, Activity, CheckCircle, CalendarClock } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { analyzeComplianceRisks } from '../services/geminiService';
import { ComplianceAlert, Task } from '../types';

const NotificationCenter: React.FC = () => {
  const { currentUser, activeFramework, equipment } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [latestCriticalAlert, setLatestCriticalAlert] = useState<ComplianceAlert | null>(null);

  const fetchAndAnalyze = async () => {
    setLoading(true);
    
    // 1. Gather Data (Mocking Database Queries from LocalStorage/Context)
    const savedPermit = localStorage.getItem('current_ptw_application');
    const activePermits = savedPermit ? [JSON.parse(savedPermit)] : [];
    
    const savedHistory = localStorage.getItem('hse_inspection_history');
    const inspectionHistory = savedHistory ? JSON.parse(savedHistory) : [];
    const failedInspections = inspectionHistory.filter((r: any) => r.status === 'Flagged').slice(0, 5); // Last 5 failures
    
    const expiringCerts = currentUser.certifications.filter(c => {
       const days = Math.ceil((new Date(c.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
       return days <= 90;
    });

    // Fetch Tasks for Reminders
    const savedTasks = localStorage.getItem('hse_tasks');
    const tasks: Task[] = savedTasks ? JSON.parse(savedTasks) : [];
    const taskAlerts: ComplianceAlert[] = tasks
        .filter(t => t.reminderDate && new Date(t.reminderDate) <= new Date() && t.status !== 'Done')
        .map(t => {
            // Map Task Categories to Alert Categories
            let alertCat: ComplianceAlert['category'] = 'Other';
            if (t.category === 'Inspection' || t.category === 'Audit') alertCat = 'Inspection';
            if (t.category === 'Maintenance') alertCat = 'Maintenance';
            if (t.category === 'Training') alertCat = 'Training';

            return {
                title: `${t.category} Due: ${t.title}`,
                description: `Reminder for ${t.category} task. Due Date: ${t.dueDate}.`,
                severity: t.priority === 'High' ? 'High' : 'Medium',
                category: alertCat, 
                actionLink: '/tasks' 
            };
        });

    try {
        const generatedAlerts = await analyzeComplianceRisks(
            activePermits,
            failedInspections,
            expiringCerts,
            equipment,
            currentUser.role,
            activeFramework
        );
        
        // Combine Alerts
        const allAlerts = [...taskAlerts, ...generatedAlerts];
        
        setAlerts(allAlerts);
        setLastUpdated(new Date());

        // Check for new critical alerts to show Toast
        const critical = allAlerts.find(a => a.severity === 'Critical' || a.severity === 'High');
        if (critical) {
            setLatestCriticalAlert(critical);
            // Auto hide after 8 seconds
            setTimeout(() => setLatestCriticalAlert(null), 8000);
        }

    } catch (error) {
        console.error("Failed to generate alerts", error);
    } finally {
        setLoading(false);
    }
  };

  // Initial fetch on mount if no alerts
  useEffect(() => {
    if (alerts.length === 0) {
        fetchAndAnalyze();
    }
  }, [currentUser]); // Re-run if user changes

  const criticalCount = alerts.filter(a => a.severity === 'Critical' || a.severity === 'High').length;

  const getIcon = (category: string, title?: string) => {
      // If title specifically mentions Task Reminder/Due
      if (title?.includes('Due:')) return <CalendarClock size={16} />;

      switch(category) {
          case 'Permit': return <FileText size={16} />;
          case 'Inspection': return <ShieldAlert size={16} />;
          case 'Training': return <GraduationCap size={16} />;
          case 'Maintenance': return <Activity size={16} />;
          default: return <AlertTriangle size={16} />;
      }
  };

  const getSeverityStyle = (severity: string) => {
      switch(severity) {
          case 'Critical': return 'bg-red-50 text-red-700 border-red-200';
          case 'High': return 'bg-orange-50 text-orange-700 border-orange-200';
          case 'Medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
          default: return 'bg-blue-50 text-blue-700 border-blue-200';
      }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-slate-500 hover:text-slate-800 transition-colors p-2 rounded-full hover:bg-slate-100"
      >
        <Bell size={20} />
        {criticalCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      {/* Proactive Toast Notification */}
      {latestCriticalAlert && !isOpen && (
          <div className="fixed top-20 right-6 z-50 w-96 bg-white rounded-xl shadow-2xl border-l-4 border-red-500 animate-in slide-in-from-right duration-500 flex items-start p-4">
              <div className="bg-red-100 p-2 rounded-full text-red-600 mr-3 shrink-0">
                  <AlertTriangle size={20} />
              </div>
              <div className="flex-1">
                  <h4 className="font-bold text-slate-800 text-sm mb-1">{latestCriticalAlert.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">{latestCriticalAlert.description}</p>
                  <button 
                    onClick={() => { setIsOpen(true); setLatestCriticalAlert(null); }}
                    className="text-xs font-bold text-red-600 hover:underline"
                  >
                      View in Notification Center &rarr;
                  </button>
              </div>
              <button 
                onClick={() => setLatestCriticalAlert(null)}
                className="text-slate-400 hover:text-slate-600 ml-2"
              >
                  <X size={16} />
              </button>
          </div>
      )}

      {isOpen && (
        <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-slate-800">Compliance Alerts</h3>
                        <p className="text-xs text-slate-500">
                            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Syncing...'}
                        </p>
                    </div>
                    <button 
                        onClick={fetchAndAnalyze} 
                        disabled={loading}
                        className="text-slate-400 hover:text-blue-600 p-1 rounded-full hover:bg-slate-100 transition"
                    >
                        <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>

                <div className="max-h-[400px] overflow-y-auto p-2 space-y-2">
                    {loading && alerts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                            <Loader2 size={24} className="animate-spin mb-2" />
                            <p className="text-sm">Analyzing compliance risks...</p>
                        </div>
                    ) : alerts.length > 0 ? (
                        alerts.map((alert, idx) => (
                            <div key={idx} className={`p-3 rounded-lg border ${getSeverityStyle(alert.severity)} hover:shadow-md transition-shadow cursor-pointer`}>
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2 font-bold text-sm">
                                        {getIcon(alert.category, alert.title)}
                                        <span>{alert.title}</span>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">{alert.severity}</span>
                                </div>
                                <p className="text-xs opacity-90 leading-relaxed">{alert.description}</p>
                                <div className="mt-2 flex justify-between items-center text-[10px] opacity-70">
                                    <span>{new Date().toLocaleDateString()}</span>
                                    {alert.actionLink && <span className="underline font-semibold">View Details &rarr;</span>}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-8 text-center text-slate-400">
                            <CheckCircle size={32} className="mx-auto mb-2 text-emerald-400 opacity-50" />
                            <p className="text-sm">No critical compliance alerts.</p>
                        </div>
                    )}
                </div>
                
                <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                    >
                        Close Notification Center
                    </button>
                </div>
            </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
