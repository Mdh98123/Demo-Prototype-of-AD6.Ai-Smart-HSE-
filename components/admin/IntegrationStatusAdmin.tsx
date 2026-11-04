import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CloudSun,
  Database,
  Mail,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Download,
  Users,
  Building2,
  ExternalLink
} from 'lucide-react';

interface IntegrationStatusData {
  identity: {
    provider: string;
    scimUsersProvisioned: number;
    status: string;
  };
  iotWeatherTwl: {
    specification: string;
    liveReadingsIngested: number;
    activeBreaches: number;
    status: string;
  };
  erpProcurement: {
    targetSystem: string;
    recentLogs: any[];
    status: string;
  };
  notifications: {
    channels: string[];
    totalOutboxMessages: number;
    status: string;
  };
}

export const IntegrationStatusAdmin: React.FC = () => {
  const [status, setStatus] = useState<IntegrationStatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'outbox' | 'erpLogs'>('overview');

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/integrations/status', {
        headers: {
          'x-tenant-id': '00000000-0000-0000-0000-000000000001',
          'x-user-role': 'tenant_admin'
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setStatus(json.data);
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const addLog = (msg: string) => {
    setActionLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 19)]);
  };

  const handleTestWeather = async () => {
    addLog('Executing live weather ingestion for Fahud Block 9...');
    try {
      const res = await fetch('/api/v1/integrations/weather/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': '00000000-0000-0000-0000-000000000001',
          'x-user-role': 'group_hse_director'
        },
        body: JSON.stringify({ location: 'Fahud Concession Block 9' })
      });
      const data = await res.json();
      if (data.success) {
        addLog(`Weather evaluated: TWL = ${data.data.twlValue} W/m² (${data.data.flagColor} Flag). Stop Work: ${data.data.stopWorkTriggered}`);
        fetchStatus();
      }
    } catch (e: any) {
      addLog(`Weather evaluation error: ${e.message}`);
    }
  };

  const handleSyncContractors = async () => {
    addLog('Synchronizing 10 Contractor Master records from ERP sandbox...');
    try {
      const res = await fetch('/api/v1/integrations/erp/sync-contractors', {
        method: 'POST',
        headers: {
          'x-tenant-id': '00000000-0000-0000-0000-000000000001',
          'x-user-role': 'group_hse_director'
        }
      });
      const data = await res.json();
      if (data.success) {
        addLog(`Successfully synced ${data.data.syncedCount} contractor records from SAP S/4HANA.`);
        fetchStatus();
      }
    } catch (e: any) {
      addLog(`Contractor sync error: ${e.message}`);
    }
  };

  const handleExportHseStats = async () => {
    addLog('Compiling official Operator Monthly HSE Return (PDO SP-1143 template)...');
    try {
      const res = await fetch('/api/v1/integrations/erp/export-hse-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': '00000000-0000-0000-0000-000000000001',
          'x-user-role': 'group_hse_director'
        },
        body: JSON.stringify({ reportingPeriod: '2026-10' })
      });
      const data = await res.json();
      if (data.success) {
        addLog(`Monthly HSE Return exported (${data.data.byteLength} bytes). SHA-256 Checksum: ${data.data.checksum.slice(0, 16)}...`);
        fetchStatus();
      }
    } catch (e: any) {
      addLog(`Export error: ${e.message}`);
    }
  };

  const handleSendTestNotification = async () => {
    addLog('Dispatching statutory Form G 24-hr escalation notice to notification outbox...');
    try {
      const res = await fetch('/api/v1/integrations/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': '00000000-0000-0000-0000-000000000001',
          'x-user-role': 'group_hse_director'
        },
        body: JSON.stringify({
          recipient: 'director.hse@concession.om',
          channel: 'email',
          templateId: 'statutory_clock_escalation',
          payload: {
            incidentNumber: 'INC-2026-088',
            hoursRemaining: 4,
            deadline: '2026-11-04T12:00:00Z'
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        addLog(`Dispatched email: Receipt ID ${data.data.receipt.receiptId}. Status: ${data.data.receipt.status}.`);
        fetchStatus();
      }
    } catch (e: any) {
      addLog(`Notification dispatch error: ${e.message}`);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Phase 7 Certified
            </span>
            <span className="text-xs text-slate-500">GCC Sovereign Integration Gateway</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Enterprise Integration & Ingress Matrix</h1>
          <p className="text-sm text-slate-600">
            Adapter management for Enterprise IdP (OIDC/SAML/SCIM), Desert Weather IoT (PDO SP-1170), ERP/Procurement, and Statutory Outbox.
          </p>
        </div>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Identity & SCIM */}
        <div className="bg-white border rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              {status?.identity.status || 'CONNECTED'}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Identity & SCIM 2.0</h3>
            <p className="text-xs text-slate-500 mt-0.5">Azure AD, Okta, Keycloak</p>
          </div>
          <div className="pt-2 border-t text-xs text-slate-600 flex justify-between">
            <span>SCIM Provisioned Users:</span>
            <span className="font-semibold text-slate-900">{status?.identity.scimUsersProvisioned ?? 0}</span>
          </div>
        </div>

        {/* IoT Weather & TWL */}
        <div className="bg-white border rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700">
              <CloudSun className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              {status?.iotWeatherTwl.status || 'OPERATIONAL'}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">IoT Weather & TWL</h3>
            <p className="text-xs text-slate-500 mt-0.5">PDO SP-1170 Heat Stress Protocol</p>
          </div>
          <div className="pt-2 border-t text-xs text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Readings Ingested:</span>
              <span className="font-semibold text-slate-900">{status?.iotWeatherTwl.liveReadingsIngested ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Stop Breaches:</span>
              <span className={`font-semibold ${status?.iotWeatherTwl.activeBreaches ? 'text-rose-600' : 'text-slate-900'}`}>
                {status?.iotWeatherTwl.activeBreaches ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* ERP & Procurement */}
        <div className="bg-white border rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-lg bg-purple-50 text-purple-700">
              <Database className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              {status?.erpProcurement.status || 'SANDBOX'}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">ERP & Procurement</h3>
            <p className="text-xs text-slate-500 mt-0.5">SAP S/4HANA & IBM Maximo</p>
          </div>
          <div className="pt-2 border-t text-xs text-slate-600 flex justify-between">
            <span>Contractors Master:</span>
            <span className="font-semibold text-slate-900">10 GCC Standard</span>
          </div>
        </div>

        {/* Notification Outbox */}
        <div className="bg-white border rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Mail className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              {status?.notifications.status || 'READY'}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Notification Outbox</h3>
            <p className="text-xs text-slate-500 mt-0.5">Email, SMS, WhatsApp Business</p>
          </div>
          <div className="pt-2 border-t text-xs text-slate-600 flex justify-between">
            <span>Dispatched Messages:</span>
            <span className="font-semibold text-slate-900">{status?.notifications.totalOutboxMessages ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Manual Actions & Test Panel */}
      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          Integration Triggers & Sandbox Verifications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={handleTestWeather}
            className="p-3 text-left border rounded-lg hover:border-slate-400 transition bg-slate-50/50 flex flex-col gap-1"
          >
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <CloudSun className="w-4 h-4 text-amber-600" /> Evaluate Live Weather
            </span>
            <span className="text-xs text-slate-500">Ingest reading & test PDO SP-1170 Stop-Work gate</span>
          </button>

          <button
            onClick={handleSyncContractors}
            className="p-3 text-left border rounded-lg hover:border-slate-400 transition bg-slate-50/50 flex flex-col gap-1"
          >
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-purple-600" /> Sync Contractors (10)
            </span>
            <span className="text-xs text-slate-500">Populate Galfar, STS, Arabian Industries</span>
          </button>

          <button
            onClick={handleExportHseStats}
            className="p-3 text-left border rounded-lg hover:border-slate-400 transition bg-slate-50/50 flex flex-col gap-1"
          >
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-blue-600" /> Export Monthly HSE Stats
            </span>
            <span className="text-xs text-slate-500">Compile official PDO SP-1143 operator return</span>
          </button>

          <button
            onClick={handleSendTestNotification}
            className="p-3 text-left border rounded-lg hover:border-slate-400 transition bg-slate-50/50 flex flex-col gap-1"
          >
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-emerald-600" /> Test Statutory Alert
            </span>
            <span className="text-xs text-slate-500">Send Form G 24-hr statutory clock warning</span>
          </button>
        </div>
      </div>

      {/* Live Action Activity Log */}
      <div className="bg-slate-900 text-slate-100 rounded-xl p-5 font-mono text-xs space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-slate-400 uppercase tracking-wider font-semibold">Integration Execution Terminal</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Ready
          </span>
        </div>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {actionLog.length === 0 ? (
            <p className="text-slate-500 italic">No integration events triggered in this session. Click any action above.</p>
          ) : (
            actionLog.map((log, i) => (
              <p key={i} className="text-slate-300">
                {log}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
