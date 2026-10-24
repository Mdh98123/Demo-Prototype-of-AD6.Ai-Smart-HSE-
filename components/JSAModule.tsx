import { AITag } from './AITag';
import React, { useState } from 'react';
import { generateJSA } from '../services/geminiService';
import { JSA } from '../types';
import { FileText, Sparkles, Loader2, ShieldAlert, CheckCircle2, AlertTriangle, Download, Plus, Trash2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const JSAModule: React.FC = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedJSA, setGeneratedJSA] = useState<JSA | null>(null);

  const handleGenerateJSA = async () => {
    if (!jobDescription.trim()) return;
    setIsGenerating(true);
    try {
      const jsa = await generateJSA(jobDescription);
      setGeneratedJSA(jsa);
    } catch (error) {
      console.error("Failed to generate JSA:", error);
      alert("Failed to generate JSA. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = () => {
    if (!generatedJSA) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('AD6.Ai Smart HSE Suite', 14, 13);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Job Safety Analysis (JSA)', pageWidth - 14, 13, { align: 'right' });

    // Title
    let currentY = 35;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Job Safety Analysis', 14, currentY);
    
    currentY += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Activity: ${generatedJSA.activity}`, 14, currentY);
    
    currentY += 10;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated ID: ${generatedJSA.id}`, 14, currentY);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 14, currentY, { align: 'right' });

    // PPE
    currentY += 15;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Required Personal Protective Equipment (PPE)', 14, currentY);
    currentY += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const ppeText = generatedJSA.requiredPPE.join(', ');
    const splitPPE = doc.splitTextToSize(ppeText, pageWidth - 28);
    doc.text(splitPPE, 14, currentY);
    currentY += splitPPE.length * 5 + 5;

    // Regulatory References
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Regulatory References', 14, currentY);
    currentY += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const regText = generatedJSA.regulatoryReferences.join(', ');
    const splitReg = doc.splitTextToSize(regText, pageWidth - 28);
    doc.text(splitReg, 14, currentY);
    currentY += splitReg.length * 5 + 5;

    // Steps Table
    const tableData = generatedJSA.steps.map(step => [
      step.step,
      step.hazards.join('\n• '),
      step.controls.join('\n✓ '),
      step.riskLevel
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Job Step', 'Potential Hazards', 'Critical Controls', 'Risk']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold' },
      styles: { cellPadding: 4, fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 60 },
        2: { cellWidth: 60 },
        3: { cellWidth: 30, fontStyle: 'bold' }
      },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 3) {
          const risk = data.cell.raw as string;
          if (risk.toLowerCase().includes('high') || risk.toLowerCase().includes('critical')) {
            data.cell.styles.textColor = [220, 38, 38]; // red-600
          } else if (risk.toLowerCase().includes('medium')) {
            data.cell.styles.textColor = [217, 119, 6]; // amber-600
          } else {
            data.cell.styles.textColor = [5, 150, 105]; // emerald-600
          }
        }
      }
    });

    doc.save(`JSA_${generatedJSA.id}.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-x-5">
          <div className="bg-blue-600 p-5 rounded-[2rem] text-white shadow-2xl shadow-blue-500/20">
            <FileText size={32} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">JSA Generator</h2>
            <div className="flex items-center gap-2 mt-2"><p className="text-slate-400 text-xs font-bold uppercase tracking-widest border-s-2 border-blue-500 ps-4">AI-Powered Job Safety Analysis</p><AITag /></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-4 flex items-center gap-2">
              <Sparkles className="text-blue-500" size={20} /> Describe Activity
            </h3>
            <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">
              Enter a detailed description of the job or activity. The AI will analyze the task, identify potential hazards, and recommend critical controls and PPE.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Job Description</label>
                <textarea 
                  className="w-full p-4 glass-panel border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm text-slate-700 focus:border-blue-500 transition-all resize-none h-48"
                  placeholder="e.g., Welding structural steel beams at 15 meters height using a boom lift. Weather is clear but windy."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>
              
              <button 
                onClick={handleGenerateJSA}
                disabled={isGenerating || !jobDescription.trim()}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-blue-700 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                {isGenerating ? 'Analyzing Hazards...' : 'Generate JSA'}
              </button>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-2">
          {generatedJSA ? (
            <div className="glass-card p-8 rounded-[2.5rem] shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex justify-between items-start mb-8 border-b border-slate-100 pb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-tight">{generatedJSA.activity}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">JSA ID: {generatedJSA.id}</p>
                </div>
                <button 
                  onClick={handleExportPDF}
                  className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-slate-800 transition flex items-center gap-2"
                >
                  <Download size={16} /> Export PDF
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="glass-panel p-6 rounded-3xl border border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <ShieldAlert size={16} className="text-amber-500" /> Required PPE
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {generatedJSA.requiredPPE.map((ppe, i) => (
                      <span key={i} className="glass-card px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 shadow-sm">{ppe}</span>
                    ))}
                  </div>
                </div>
                <div className="glass-panel p-6 rounded-3xl border border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500" /> Regulatory References
                  </h4>
                  <ul className="space-y-2">
                    {generatedJSA.regulatoryReferences.map((ref, i) => (
                      <li key={i} className="text-xs font-bold text-slate-600 flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span> {ref}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-500" /> Job Steps & Hazard Analysis
                </h4>
                <div className="space-y-6">
                  {generatedJSA.steps.map((step, index) => (
                    <div key={index} className="glass-card border-2 border-slate-100 rounded-3xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all">
                      <div className={`absolute top-0 start-0 w-2 h-full ${
                        step.riskLevel.toLowerCase().includes('high') || step.riskLevel.toLowerCase().includes('critical') ? 'bg-red-500' :
                        step.riskLevel.toLowerCase().includes('medium') ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                      
                      <div className="flex justify-between items-start mb-4 ps-4">
                        <h5 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                          <span className="text-blue-500 me-2">{index + 1}.</span>{step.step}
                        </h5>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                          step.riskLevel.toLowerCase().includes('high') || step.riskLevel.toLowerCase().includes('critical') ? 'bg-red-50 text-red-600 border border-red-100' :
                          step.riskLevel.toLowerCase().includes('medium') ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                          {step.riskLevel} Risk
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ps-4">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Potential Hazards</p>
                          <ul className="space-y-2">
                            {step.hazards.map((hazard, i) => (
                              <li key={i} className="text-xs font-medium text-slate-600 flex items-start gap-2">
                                <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" /> {hazard}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Critical Controls</p>
                          <ul className="space-y-2">
                            {step.controls.map((control, i) => (
                              <li key={i} className="text-xs font-medium text-slate-600 flex items-start gap-2">
                                <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" /> {control}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel border-2 border-dashed border-slate-200 rounded-[2.5rem] h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8">
              <div className="glass-card p-6 rounded-full shadow-sm mb-6">
                <FileText size={48} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-black text-slate-400 uppercase tracking-tight mb-2">No JSA Generated</h3>
              <p className="text-sm text-slate-500 max-w-md">
                Describe the job activity in the input panel and click "Generate JSA" to let the AI analyze hazards and recommend controls.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JSAModule;
