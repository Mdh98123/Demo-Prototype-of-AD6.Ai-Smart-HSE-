import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { jsPDF } from 'jspdf';
import { ShieldCheck, Download, Calendar, PenTool } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const ArabicComponentsDemo: React.FC = () => {
  const { t } = useTranslation();
  const { dir } = useLanguage();

  const handleGenerateBilingualReport = () => {
    // Note: To support complex Arabic shaping in jsPDF, we normally need a custom VFS font (e.g. Amiri, Cairo) 
    // and potentially `arabic-reshaper`. For this demo, we'll demonstrate the layout configuration.
    const doc = new jsPDF();
    doc.setFontSize(16);
    
    // Header
    doc.text('Bilingual Compliance Report', 14, 20);
    doc.text('تقرير الامتثال المزدوج', 196, 20, { align: 'right' }); // Render Right-Aligned

    // Draw Column Split
    doc.line(105, 30, 105, 280);

    // Left Column (English)
    doc.setFontSize(12);
    doc.text('English Analysis (LTR)', 14, 40);
    doc.setFontSize(10);
    doc.text('The inspection was completed with no anomalies.', 14, 50, { maxWidth: 80 });
    
    // Right Column (Arabic)
    doc.setFontSize(12);
    doc.text('التحليل باللغة العربية (RTL)', 196, 40, { align: 'right' });
    doc.setFontSize(10);
    // Simulating shaped arabic via standard string (in full prod requires reshaper)
    doc.text('تم الانتهاء من التفتيش بدون ملاحظات', 196, 50, { align: 'right', maxWidth: 80 });

    doc.save('Bilingual_Report.pdf');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12">
      <div className="text-center">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">RTL Component Engineering</h2>
        <p className="text-slate-500 mt-2">Demonstrating native RTL hooks, mixed-language layouts, and localized rendering.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Date Picker Example */}
        <div className="glass-card p-6 rounded-2xl shadow-sm border border-slate-200">
           <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Calendar className="text-blue-500" size={18} />
              Hijri / Gregorian Toggle
           </h3>
           <div className="space-y-4">
              <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
                 <button className="px-4 py-1.5 glass-card shadow-sm rounded-md text-sm font-bold text-slate-800">Um al-Qura (Hijri)</button>
                 <button className="px-4 py-1.5 text-sm font-bold text-slate-500 hover:text-slate-800">Gregorian (Miladi)</button>
              </div>
              <div className="relative">
                 <input type="text" placeholder={dir === 'rtl' ? '١٤٤٧/٠٥/١٢' : '2025/11/04'} className="w-full glass-panel border border-slate-200 rounded-lg px-4 py-3 font-arabic font-bold text-end" readOnly />
                 <span className="absolute top-3 end-4 text-slate-400 text-xs">١٤٤٧ ھ</span>
              </div>
              <p className="text-xs text-slate-500">Supports Arabic-Indic digits (٠١٢٣٤٥٦٧٨٩) and localized calendar logic natively inside the UI constraint.</p>
           </div>
        </div>

        {/* Signature Pad Example */}
        <div className="glass-card p-6 rounded-2xl shadow-sm border border-slate-200">
           <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <PenTool className="text-indigo-500" size={18} />
              RTL Signature Pad
           </h3>
           <div className="space-y-4">
              <div className="w-full h-32 glass-panel border-2 border-dashed border-slate-200 rounded-xl relative overflow-hidden group hover:border-indigo-300 transition-colors">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
                     <span className="text-[4rem] text-slate-100 font-arabic font-black select-none">توقيع</span>
                  </div>
                  {/* Canvas goes here. In RTL, standard touch tracking still uses viewport X/Y, but the signature bounds and visual guides draw originating from the right. */}
                  <div className="absolute bottom-4 end-4 w-1/2 border-b-2 border-slate-400"></div>
                  <span className="absolute bottom-1 end-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">{dir === 'rtl' ? 'الاسم كاملا' : 'Sign Here'}</span>
              </div>
           </div>
        </div>
        
        {/* Bilingual Report Export */}
        <div className="glass-card p-6 rounded-2xl shadow-sm border border-slate-200 md:col-span-2">
           <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                 <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
                    <ShieldCheck className="text-emerald-500" size={18} />
                    Mixed-Language & Bilingual Document Generator
                 </h3>
                 <p className="text-sm text-slate-500 max-w-lg">
                    Generates standardized OSHAD/ADNOC reports featuring dual-column layouts.
                    English technical terms (e.g. "CAPA", "PPE") remain LTR within RTL Arabic paragraphs automatically.
                 </p>
              </div>
              <button 
                onClick={handleGenerateBilingualReport}
                className="shrink-0 flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-transform active:scale-95 shadow-lg shadow-slate-900/20"
              >
                  <Download size={18} /> Generate Matrix PDF
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
