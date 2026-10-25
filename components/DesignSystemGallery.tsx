import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Modal } from './ui/modal';
import { AlertCircle, CheckCircle2, Info, Search, Upload } from 'lucide-react';

export default function DesignSystemGallery() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen glass-panel text-slate-900 font-sans p-8 md:p-12 space-y-16">
      <div className="max-w-7xl mx-auto space-y-16">
        
        <header className="space-y-4">
          <Badge variant="info">Enterprise Standard</Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-950">AD6 AI Smart HSE Design System</h1>
          <p className="text-lg font-medium text-slate-600 max-w-3xl">
            A comprehensive, fintech-style UI design system focused on clarity, operational safety, and executive visibility. Built on an 8px grid with a carefully crafted typographic scale and robust component library.
          </p>
        </header>

        {/* 1. Color System */}
        <section className="space-y-8 animate-slide-up">
          <div className="space-y-2 border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold tracking-tight">1. Color System</h2>
            <p className="text-slate-500 font-medium text-sm">Systemic application of color for hierarchy and state.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-4"><CardTitle>Brand / Primary</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="h-16 rounded-xl bg-brand-500 shadow-glow-blue flex items-end p-3"><span className="text-white font-bold text-xs uppercase tracking-wider">500 (Base)</span></div>
                <div className="flex gap-2">
                  <div className="h-10 w-full rounded-lg bg-brand-100 border border-brand-200" title="100"></div>
                  <div className="h-10 w-full rounded-lg bg-brand-600" title="600"></div>
                  <div className="h-10 w-full rounded-lg bg-brand-900" title="900"></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4"><CardTitle>Neutral / Slate</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="h-16 rounded-xl bg-slate-800 flex items-end p-3"><span className="text-slate-100 font-bold text-xs uppercase tracking-wider">800 (Text Base)</span></div>
                <div className="flex gap-2">
                  <div className="h-10 w-full rounded-lg glass-panel border border-slate-200" title="50"></div>
                  <div className="h-10 w-full rounded-lg bg-slate-200" title="200"></div>
                  <div className="h-10 w-full rounded-lg bg-slate-950" title="950"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-4"><CardTitle>Status & Semantic</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="h-12 rounded-xl bg-status-pass shadow-glow-emerald"></div>
                    <p className="text-xs font-bold text-center text-emerald-700">Pass / Safe</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-12 rounded-xl bg-status-warn"></div>
                    <p className="text-xs font-bold text-center text-amber-700">Warning</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-12 rounded-xl bg-status-fail"></div>
                    <p className="text-xs font-bold text-center text-red-700">Critical / Fail</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-12 rounded-xl bg-status-info"></div>
                    <p className="text-xs font-bold text-center text-blue-700">Information</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 2. Typography Scale */}
        <section className="space-y-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="space-y-2 border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold tracking-tight">2. Typography Scale</h2>
            <p className="text-slate-500 font-medium text-sm">Sohar & Inter. Optimized for numbers and dense data reading.</p>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Scale</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Example & Usage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-bold">Display (5xl)</TableCell>
                    <TableCell className="font-mono text-slate-500">49px / lg</TableCell>
                    <TableCell><span className="text-5xl font-extrabold tracking-tight">Dashboard KPIs</span></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold">H1 (4xl)</TableCell>
                    <TableCell className="font-mono text-slate-500">39px / lg</TableCell>
                    <TableCell><span className="text-4xl font-bold tracking-tight">Page Headers</span></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold">H2 (3xl)</TableCell>
                    <TableCell className="font-mono text-slate-500">31px / lg</TableCell>
                    <TableCell><span className="text-3xl font-bold">Section Headers</span></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold">H3 (xl)</TableCell>
                    <TableCell className="font-mono text-slate-500">21px / md</TableCell>
                    <TableCell><span className="text-xl font-bold">Card Titles</span></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold">Base (base)</TableCell>
                    <TableCell className="font-mono text-slate-500">17px / text</TableCell>
                    <TableCell><span className="text-base font-medium">Standard body text reading.</span></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold">Small (sm)</TableCell>
                    <TableCell className="font-mono text-slate-500">15px / loose</TableCell>
                    <TableCell><span className="text-sm font-medium text-slate-600">Secondary information, descriptions.</span></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold">Tiny (xs)</TableCell>
                    <TableCell className="font-mono text-slate-500">13px / tight</TableCell>
                    <TableCell><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Metadata, Badges, Labels</span></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        {/* 3. Spacing System */}
        <section className="space-y-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="space-y-2 border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold tracking-tight">3. Spacing System (8px Grid)</h2>
            <p className="text-slate-500 font-medium text-sm">Consistent cadence for all component margins and paddings.</p>
          </div>
          
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2 text-center">
              <div className="w-8 bg-brand-200 border-2 border-brand-500 h-2 mx-auto"></div>
              <p className="text-xs font-mono font-bold">1 (8px)</p>
            </div>
            <div className="space-y-2 text-center">
              <div className="w-8 bg-brand-200 border-2 border-brand-500 h-4 mx-auto"></div>
              <p className="text-xs font-mono font-bold">2 (16px)</p>
            </div>
            <div className="space-y-2 text-center">
              <div className="w-8 bg-brand-200 border-2 border-brand-500 h-6 mx-auto"></div>
              <p className="text-xs font-mono font-bold">3 (24px)</p>
            </div>
            <div className="space-y-2 text-center">
              <div className="w-8 bg-brand-200 border-2 border-brand-500 h-8 mx-auto"></div>
              <p className="text-xs font-mono font-bold">4 (32px)</p>
            </div>
            <div className="space-y-2 text-center">
              <div className="w-8 bg-brand-200 border-2 border-brand-500 h-10 mx-auto"></div>
              <p className="text-xs font-mono font-bold">5 (40px)</p>
            </div>
            <div className="space-y-2 text-center">
              <div className="w-8 bg-brand-200 border-2 border-brand-500 h-12 mx-auto"></div>
              <p className="text-xs font-mono font-bold">6 (48px)</p>
            </div>
            <div className="space-y-2 text-center">
              <div className="w-8 bg-brand-200 border-2 border-brand-500 h-16 mx-auto"></div>
              <p className="text-xs font-mono font-bold">8 (64px)</p>
            </div>
          </div>
        </section>

        {/* 4. Component Library */}
        <section className="space-y-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="space-y-2 border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold tracking-tight">4. Component Library</h2>
            <p className="text-slate-500 font-medium text-sm">Fintech-grade inputs, modals, and interactive elements.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Buttons & Badges */}
            <Card>
              <CardHeader>
                <CardTitle>Buttons & Interactions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-4">
                  <Button variant="default">Primary Action</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="success">Pass / Success</Button>
                  <Button variant="dark">Dark Variant</Button>
                </div>
                <div className="flex flex-wrap gap-4 items-center pt-4 border-t border-slate-100">
                  <Button size="lg">Large Size</Button>
                  <Button size="default">Default</Button>
                  <Button size="sm">Small</Button>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card>
              <CardHeader>
                <CardTitle>Badges & Status</CardTitle>
                <CardDescription>Small metabolic items for tables and lists.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-4">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="success">Completed</Badge>
                  <Badge variant="warning">Pending Review</Badge>
                  <Badge variant="destructive">High Risk</Badge>
                  <Badge variant="info">New Update</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Inputs & Forms */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Forms & Input Fields</CardTitle>
                <CardDescription>Robust, accessible inputs with clear focus states.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Project Name</label>
                    <Input placeholder="e.g. AD6 Site Alpha" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Location ID</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input placeholder="Search location..." className="pl-11" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">File Upload (Drag & Drop)</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:glass-button hover:border-brand-400 transition-colors cursor-pointer flex flex-col items-center gap-3">
                      <Upload className="h-8 w-8 text-brand-500" />
                      <div>
                        <p className="text-sm font-bold text-slate-700">Drop files here to upload</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">PDF, JPG, PNG up to 10MB</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Disabled Input</label>
                    <Input disabled value="Pre-filled Admin Value" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Table */}
            <Card className="lg:col-span-2 overflow-hidden">
              <CardHeader className="border-b border-slate-100 glass-card">
                <CardTitle>Data Tables</CardTitle>
                <CardDescription>Information dense but highly readable grid data.</CardDescription>
              </CardHeader>
              <div className="px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Audit ID</TableHead>
                      <TableHead>Site</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Risk Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-bold">AUD-2026-001</TableCell>
                      <TableCell>Mina Al Fahal Terminal</TableCell>
                      <TableCell><Badge variant="success">Compliant</Badge></TableCell>
                      <TableCell className="text-right font-mono font-bold text-emerald-600">92/100</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-bold">AUD-2026-002</TableCell>
                      <TableCell>Khazzan Gas Asset Plant 5</TableCell>
                      <TableCell><Badge variant="warning">Requires Action</Badge></TableCell>
                      <TableCell className="text-right font-mono font-bold text-amber-600">74/100</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-bold">AUD-2026-003</TableCell>
                      <TableCell>ZADCO Offshore</TableCell>
                      <TableCell><Badge variant="destructive">Critical Gap</Badge></TableCell>
                      <TableCell className="text-right font-mono font-bold text-red-600">45/100</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Modals & Dialogs */}
            <Card className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-slate-50 border-0 p-12 text-center shadow-float">
               <h3 className="text-2xl font-bold mb-4 text-white">Modal & App Overlay</h3>
               <p className="text-slate-300 font-medium mb-8 max-w-lg mx-auto">Dialogs capture focus perfectly, animating in smoothly without disrupting the page structure underneath.</p>
               <Button variant="success" size="lg" className="shadow-none border border-emerald-500" onClick={() => setModalOpen(true)}>Open Action Modal</Button>
            </Card>

          </div>
        </section>

        {/* 5. Layout Overview */}
        <section className="space-y-8 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="space-y-2 border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold tracking-tight">5. AI HSE Layout System</h2>
            <p className="text-slate-500 font-medium text-sm">Dashboard layout primitives mapping the AD6 interface.</p>
          </div>
          
          <div className="border-[12px] border-slate-800 rounded-3xl overflow-hidden shadow-2xl bg-slate-100 flex h-[600px] relative">
             {/* Sidebar Mock */}
             <div className="w-64 bg-slate-900 h-full border-r border-slate-800 flex flex-col hidden md:flex shrink-0">
               <div className="h-16 border-b border-slate-800 flex items-center px-6"><div className="h-6 w-32 bg-slate-800 rounded"></div></div>
               <div className="p-4 space-y-2">
                 <div className="h-10 bg-brand-600 rounded-lg"></div>
                 <div className="h-10 bg-slate-800 rounded-lg"></div>
                 <div className="h-10 bg-slate-800 rounded-lg"></div>
               </div>
             </div>
             {/* Main View Mock */}
             <div className="flex-1 flex flex-col h-full overflow-hidden relative">
               {/* Topbar Mock */}
               <div className="h-16 glass-card border-b border-slate-200 flex items-center px-6 justify-between shrink-0">
                 <div className="h-8 w-48 bg-slate-100 rounded-lg"></div>
                 <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
               </div>
               {/* Content Mock */}
               <div className="p-6 flex-1 overflow-auto">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="h-32 glass-card border border-slate-200 rounded-2xl"></div>
                    <div className="h-32 glass-card border border-slate-200 rounded-2xl"></div>
                    <div className="h-32 glass-card border border-slate-200 rounded-2xl"></div>
                 </div>
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-96 glass-card border border-slate-200 rounded-2xl"></div>
                    <div className="h-96 glass-card border border-slate-200 rounded-2xl"></div>
                 </div>
               </div>
             </div>
          </div>
        </section>

      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Approve Contractor Document" description="Acknowledge the safety documents before giving site clearance.">
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-sm font-medium">
              This contractor's insurance expires in 12 days. Provide short-term clearance only.
            </div>
          </div>
          
          <div className="space-y-4 text-sm font-medium text-slate-700">
             <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Contractor</span>
                <span className="font-bold">Apex Build Co.</span>
             </div>
             <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Document</span>
                <span className="font-bold text-brand-600">Risk_Assessment_v2.pdf</span>
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Clearance Notes</label>
            <Input placeholder="Optional clearance conditions..." />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="success" onClick={() => setModalOpen(false)}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve Clearance
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
