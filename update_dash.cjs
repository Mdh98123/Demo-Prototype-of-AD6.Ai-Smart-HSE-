const fs = require('fs');

const code = `import React, { useState, useMemo } from 'react';
import { View, HSEPerformanceMetrics } from '../types';
import { useUser } from '../contexts/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, ComposedChart, Line } from 'recharts';
import { ArrowUpRight, Activity, AlertOctagon, FileSignature, ShieldCheck, Clock, Download, HardHat, TrendingUp, AlertCircle, Eye, Search, CheckCircle2, Zap } from 'lucide-react';
import { HijriDatePicker } from './HijriDatePicker';

// --- MOCK DATA ---
const monthlyTrendData = [
  { month: 'Jan', manHours: 45000, incidents: 2 },
  { month: 'Feb', manHours: 48000, incidents: 0 },
  { month: 'Mar', manHours: 52000, incidents: 3 },
  { month: 'Apr', manHours: 50000, incidents: 1 },
  { month: 'May', manHours: 55000, incidents: 4 },
  { month: 'Jun', manHours: 60000, incidents: 1 },
];

const incidentBreakdown = [
  { name: 'Unsafe Acts', value: 45, color: '#f59e0b' },
  { name: 'Unsafe Conditions', value: 30, color: '#3b82f6' },
  { name: 'Near Miss', value: 25, color: '#10b981' },
];

const RECENT_AUDITS = [
    { id: 'AUD-001', site: 'Al Mina Al Fahal Terminal', score: 92, status: 'Compliant' },
    { id: 'AUD-002', site: 'Habshan Plant 5', score: 74, status: 'Warning' },
    { id: 'AUD-003', site: 'ZADCO Offshore', score: 88, status: 'Compliant' },
    { id: 'AUD-004', site: 'Fujairah Storage', score: 45, status: 'Critical' },
];

interface DashboardProps {
    onNavigate: (view: View) => void;
}

const ExecutiveDashboard = ({ onNavigate }: { onNavigate: (v: View) => void }) => (
    <div className="space-y-6 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Activity size={80}/></div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-slate-300 font-bold uppercase tracking-widest text-xs">Total Man Hours</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-extrabold tracking-tighter mb-2">1.25M</div>
                    <div className="text-xs font-medium text-emerald-400 flex items-center gap-1"><ArrowUpRight size={14}/> +12% from last month</div>
                </CardContent>
            </Card>

            <Card className="hover:-translate-y-1 transition-all duration-300">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-slate-500 font-bold uppercase tracking-widest text-xs">TRIR</CardTitle>
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><ShieldCheck size={18}/></div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">0.8</div>
                    <div className="text-xs font-medium text-emerald-600">Well below industry avg (1.2)</div>
                </CardContent>
            </Card>

            <Card className="hover:-translate-y-1 transition-all duration-300">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-slate-500 font-bold uppercase tracking-widest text-xs">Open High Risks</CardTitle>
                    <div className="p-2 bg-red-50 text-red-600 rounded-lg"><AlertOctagon size={18}/></div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-extrabold tracking-tight text-red-600 mb-2">12</div>
                    <div className="text-xs font-medium text-slate-500">Requires executive attention</div>
                </CardContent>
            </Card>

            <Card className="hover:-translate-y-1 transition-all duration-300">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-slate-500 font-bold uppercase tracking-widest text-xs">Active Permits</CardTitle>
                    <div className="p-2 bg-brand-50 text-brand-600 rounded-lg"><FileSignature size={18}/></div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">143</div>
                    <div className="text-xs font-medium text-slate-500">Across 12 project sites</div>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 shadow-sm">
                <CardHeader>
                    <CardTitle>Exposure vs Incidents</CardTitle>
                    <CardDescription>Monthly correlation between man-hours worked and recordable incidents.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={monthlyTrendData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                            <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#EF4444', fontSize: 12}} />
                            <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}} />
                            <Bar yAxisId="left" dataKey="manHours" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
                            <Line yAxisId="right" type="monotone" dataKey="incidents" stroke="#EF4444" strokeWidth={3} dot={{r: 4, fill: '#EF4444'}} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Audit & Compliance Readout</CardTitle>
                    <CardDescription>Recent cross-site audit scores</CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Site</TableHead>
                                <TableHead className="text-right">Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {RECENT_AUDITS.map(audit => (
                                <TableRow key={audit.id} className="cursor-pointer hover:bg-slate-50" onClick={() => onNavigate(View.AUDIT_INSPECTIONS)}>
                                    <TableCell>
                                        <div className="font-bold text-slate-800">{audit.site}</div>
                                        <Badge variant={audit.score > 85 ? 'success' : audit.score > 60 ? 'warning' : 'destructive'} className="mt-1">
                                            {audit.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-black text-lg text-slate-700">
                                        {audit.score}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => onNavigate(View.AUDIT_INSPECTIONS)}>View Full Audit Report</Button>
                </CardFooter>
            </Card>
        </div>
    </div>
);

const ManagerDashboard = ({ onNavigate }: { onNavigate: (v: View) => void }) => (
    <div className="space-y-6 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-r from-brand-600 to-indigo-700 text-white shadow-lg overflow-hidden relative">
                <div className="absolute right-0 top-0 opacity-10"><Zap size={160} className="translate-x-1/4 -translate-y-1/4"/></div>
                <CardHeader>
                    <CardTitle className="text-white/80 font-bold uppercase tracking-widest text-xs">AI Operations Command</CardTitle>
                    <div className="text-3xl font-black mt-2 tracking-tight">Active Shift</div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-6 mt-4">
                        <div className="space-y-1">
                            <span className="text-brand-200 text-xs font-bold uppercase">Workers on site</span>
                            <div className="text-2xl font-bold">1,248</div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-brand-200 text-xs font-bold uppercase">Active Permits</span>
                            <div className="text-2xl font-bold">42</div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-black/10 pt-4 flex gap-3">
                    <Button variant="success" className="bg-emerald-500 hover:bg-emerald-600 text-white border-0" onClick={() => onNavigate(View.PERMITS)}>
                        Review Permits
                    </Button>
                    <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => onNavigate(View.OBSERVATIONS)}>
                        Field Observations
                    </Button>
                </CardFooter>
            </Card>

            <div className="grid grid-cols-2 gap-4">
                <Card className="bg-slate-50 border-slate-200 shadow-none hover:border-brand-500/50 cursor-pointer transition-all" onClick={() => onNavigate(View.INCIDENTS)}>
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                        <div className="p-4 bg-red-100 text-red-600 rounded-full mb-4">
                            <AlertCircle size={32}/>
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg">Report Incident</h3>
                        <p className="text-xs font-medium text-slate-500 mt-1">Log a new safety event instantly</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-50 border-slate-200 shadow-none hover:border-brand-500/50 cursor-pointer transition-all" onClick={() => onNavigate(View.COMPLIANCE_ASSISTANT)}>
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                        <div className="p-4 bg-brand-100 text-brand-600 rounded-full mb-4">
                            <ShieldCheck size={32}/>
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg">AI Assistant</h3>
                        <p className="text-xs font-medium text-slate-500 mt-1">Review policies & regulations</p>
                    </CardContent>
                </Card>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Action Items Queue</CardTitle>
                    <CardDescription>Pending tasks requiring your immediate attention.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[
                        { title: 'Authorize Crane Lift Plan - Zone C', type: 'Approval', due: 'Today', urgent: true },
                        { title: 'Sign-off Incident Report #INC-772', type: 'Review', due: 'Overdue', urgent: true },
                        { title: 'Approve MOC for Pump Bypass', type: 'Technical', due: 'Tomorrow', urgent: false }
                    ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                            <div className="flex gap-4 items-center">
                                <div className={\`w-2 h-10 rounded-full \${item.urgent ? 'bg-red-500' : 'bg-brand-500'}\`}></div>
                                <div>
                                    <h4 className="font-bold text-sm text-slate-800">{item.title}</h4>
                                    <p className="text-xs text-slate-500 font-medium">{item.type}</p>
                                </div>
                            </div>
                            <Badge variant={item.urgent ? 'destructive' : 'secondary'}>{item.due}</Badge>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Safety Observations</CardTitle>
                    <CardDescription>Breakdown of field reports submitted this week.</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={incidentBreakdown}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {incidentBreakdown.map((entry, index) => (
                                    <Cell key={\`cell-\${index}\`} fill={entry.color} className="hover:opacity-80 transition-opacity" />
                                ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} formatter={(value) => <span className="text-xs font-bold text-slate-600 ml-1">{value}</span>}/>
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    </div>
);

const WorkerDashboard = ({ onNavigate, user }: { onNavigate: (v: View) => void, user: any }) => (
    <div className="space-y-6 animate-in fade-in duration-500">
        <Card className="bg-slate-900 border-0 shadow-2xl text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10"><HardHat size={180}/></div>
             <CardContent className="p-8 md:p-12">
                 <div className="max-w-2xl relative z-10">
                     <Badge variant="info" className="mb-4 bg-brand-500/20 text-brand-300 border-brand-500/30">Active Shift: {user?.department || 'Field Operations'}</Badge>
                     <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Stay Safe, {user?.name?.split(' ')[0] || 'Worker'}!</h1>
                     <p className="text-slate-400 text-lg mb-8 max-w-lg">Remember to complete your daily safety checklist before beginning hot work operations.</p>
                     <div className="flex flex-wrap gap-4">
                         <Button size="lg" variant="success" className="shadow-lg shadow-emerald-900/50" onClick={() => onNavigate(View.OBSERVATIONS)}>
                             <CheckCircle2 className="mr-2 h-5 w-5"/> Start Checklist
                         </Button>
                         <Button size="lg" variant="outline" className="text-white border-slate-700 hover:bg-slate-800" onClick={() => onNavigate(View.PERMITS)}>
                             My Permits
                         </Button>
                     </div>
                 </div>
             </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>My Daily Tasks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                     <div className="p-4 rounded-xl border border-slate-200 flex items-center gap-4 hover:border-brand-400 transition-colors bg-white">
                         <div className="w-6 h-6 rounded-md border-2 border-slate-300"></div>
                         <div>
                             <h4 className="font-bold text-slate-800">Inspect Harness Kits (Zone A)</h4>
                             <p className="text-xs text-slate-500 font-medium mt-0.5">Required before scaffolding work</p>
                         </div>
                         <Badge variant="destructive" className="ml-auto">High Priority</Badge>
                     </div>
                     <div className="p-4 rounded-xl border border-slate-200 flex items-center gap-4 hover:border-brand-400 transition-colors bg-white">
                         <div className="w-6 h-6 rounded-md border-2 border-slate-300"></div>
                         <div>
                             <h4 className="font-bold text-slate-800">Complete H2S Refresher Training</h4>
                             <p className="text-xs text-slate-500 font-medium mt-0.5">Module expires in 3 days</p>
                         </div>
                         <Badge variant="warning" className="ml-auto">Pending</Badge>
                     </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>My Certification</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center py-6">
                     <div className="w-32 h-32 rounded-full border-8 border-emerald-100 flex items-center justify-center mb-6">
                         <div className="w-24 h-24 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl font-black">
                             92%
                         </div>
                     </div>
                     <h3 className="font-bold text-slate-800 text-lg">Fully Compliant</h3>
                     <p className="text-slate-500 text-sm mt-1 mb-6">All mandatory training is up to date.</p>
                     <Button variant="outline" className="w-full" onClick={() => onNavigate(View.TRAINING)}>View Certificates</Button>
                </CardContent>
            </Card>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useUser();
  const role = currentUser?.role || 'ADMIN';

  const dashboardType = useMemo(() => {
    if (['Board_Director', 'CEO', 'ADMIN', 'Head_Group_HSE'].includes(role)) return 'EXECUTIVE';
    if (['Regional_HSE_Director', 'Site_HSE_Manager', 'HSE_Officer', 'Project_Manager', 'Internal_Auditor'].includes(role)) return 'MANAGER';
    return 'WORKER';
  }, [role]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
            <div className="mb-3">
                <HijriDatePicker />
            </div>
            {dashboardType === 'EXECUTIVE' && (
                <>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Executive Overview</h1>
                    <p className="text-slate-500 text-md font-medium mt-1">Strategic HSE Performance & Real-time Metrics.</p>
                </>
            )}
            {dashboardType === 'MANAGER' && (
                <>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Operational Command</h1>
                    <p className="text-slate-500 text-md font-medium mt-1">Site Activity, Approvals & Compliance Control.</p>
                </>
            )}
            {dashboardType === 'WORKER' && (
                <>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Workspace</h1>
                    <p className="text-slate-500 text-md font-medium mt-1">Tasks, Permits & Personal Safety Console.</p>
                </>
            )}
        </div>
        
        <div className="flex items-center gap-3">
            {dashboardType === 'EXECUTIVE' && (
                <Button className="font-bold shadow-md">
                    <Download className="mr-2 h-4 w-4" /> Export Report
                </Button>
            )}
        </div>
      </div>

      {dashboardType === 'EXECUTIVE' && <ExecutiveDashboard onNavigate={onNavigate} />}
      {dashboardType === 'MANAGER' && <ManagerDashboard onNavigate={onNavigate} />}
      {dashboardType === 'WORKER' && <WorkerDashboard onNavigate={onNavigate} user={currentUser} />}
    </div>
  );
};

export default Dashboard;
`;

fs.writeFileSync('components/Dashboard.tsx', code);
console.log('Dashboard rewritten to be ultra-premium');
