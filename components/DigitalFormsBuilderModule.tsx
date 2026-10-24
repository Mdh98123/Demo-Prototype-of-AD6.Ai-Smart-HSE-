import React, { useState } from 'react';
import { 
  Plus, GripVertical, Settings, Save, Layout, FileText, 
  CheckSquare, List, Calendar, ArrowRight, Upload, Trash2, CheckCircle2, Bookmark
} from 'lucide-react';

interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
}

interface FormTemplate {
  id: string;
  name: string;
  category: string;
  fields: FormField[];
}

const PREBUILT_TEMPLATES: FormTemplate[] = [
  {
    id: 'TPL-FRM-01',
    name: 'Daily Scaffolding Inspection Checklist',
    category: 'Work at Height',
    fields: [
      { id: 'f1', type: 'text', label: 'Certified Scaffolder Inspector Name', required: true },
      { id: 'f2', type: 'date', label: 'Inspection Date', required: true },
      { id: 'f3', type: 'dropdown', label: 'Structure Location / Sector', required: true },
      { id: 'f4', type: 'checkbox', label: 'Sole boards and base plates level and stable on sound ground', required: true },
      { id: 'f5', type: 'checkbox', label: 'Ledgers, transoms and bracing properly secured with standard couplers', required: true },
      { id: 'f6', type: 'checkbox', label: 'Double guardrails (950mm and 470mm) and toe-boards (150mm) fitted', required: true },
      { id: 'f7', type: 'dropdown', label: 'Scafftag Status Applied', required: true },
      { id: 'f8', type: 'textarea', label: 'Defects Noted & Corrective Instructions', required: false }
    ]
  },
  {
    id: 'TPL-FRM-02',
    name: 'Hot Work Pre-Ignition Safety Verification',
    category: 'Permit to Work',
    fields: [
      { id: 'f1', type: 'text', label: 'PTW Permit Reference Number', required: true },
      { id: 'f2', type: 'text', label: 'Welding Contractor / Crew Lead', required: true },
      { id: 'f3', type: 'date', label: 'Authorization Date', required: true },
      { id: 'f4', type: 'checkbox', label: 'Atmospheric gas testing confirmed 0% LEL and 0 ppm H2S', required: true },
      { id: 'f5', type: 'checkbox', label: '15m radius cleared of combustible materials and flammables', required: true },
      { id: 'f6', type: 'checkbox', label: 'Dedicated Fire Watch assigned with 2x 9kg dry powder extinguishers', required: true },
      { id: 'f7', type: 'textarea', label: 'Post-Work 60-Minute Fire Watch Log', required: false }
    ]
  },
  {
    id: 'TPL-FRM-03',
    name: 'Confined Space Atmosphere & Entry Sentry Log',
    category: 'Confined Space',
    fields: [
      { id: 'f1', type: 'text', label: 'Vessel / Sump Asset Tag ID', required: true },
      { id: 'f2', type: 'text', label: 'Designated Entry Sentry Name', required: true },
      { id: 'f3', type: 'text', label: 'Initial Oxygen % (19.5% - 23.5%)', required: true },
      { id: 'f4', type: 'text', label: 'Combustible Gas (% LEL)', required: true },
      { id: 'f5', type: 'text', label: 'Toxic H2S Level (ppm)', required: true },
      { id: 'f6', type: 'checkbox', label: 'Tripod rescue winch and full-body harness verified functional', required: true },
      { id: 'f7', type: 'textarea', label: 'Worker Entry & Exit Headcount Log', required: true }
    ]
  },
  {
    id: 'TPL-FRM-04',
    name: 'Critical Heavy Lifting Pre-Job Checklist',
    category: 'Lifting',
    fields: [
      { id: 'f1', type: 'text', label: 'Crane Unit Serial / Fleet ID', required: true },
      { id: 'f2', type: 'text', label: 'Appointed Person Name & LEEA Number', required: true },
      { id: 'f3', type: 'checkbox', label: 'Ground bearing compaction / steel spreader pads verified', required: true },
      { id: 'f4', type: 'checkbox', label: 'Wind speed checked (<25 knots) and anemometer calibrated', required: true },
      { id: 'f5', type: 'checkbox', label: 'Slings, shackles and taglines inspected with valid color code', required: true },
      { id: 'f6', type: 'textarea', label: 'Exclusion Zone Radius & Rigging Notes', required: false }
    ]
  },
  {
    id: 'TPL-FRM-05',
    name: 'Deep Trench Excavation Daily Soil Inspection',
    category: 'Excavation',
    fields: [
      { id: 'f1', type: 'text', label: 'Excavation Sector / Trench Trench Box ID', required: true },
      { id: 'f2', type: 'date', label: 'Inspection Date', required: true },
      { id: 'f3', type: 'checkbox', label: 'Underground utilities GPR scanning cleared prior to mechanical dig', required: true },
      { id: 'f4', type: 'checkbox', label: 'Hydraulic shoring / aluminum shields inspected for deflection', required: true },
      { id: 'f5', type: 'checkbox', label: 'Ladders placed every 7.5 meters extending 1m above trench lip', required: true },
      { id: 'f6', type: 'textarea', label: 'Soil moisture / water ingress condition notes', required: false }
    ]
  },
  {
    id: 'TPL-FRM-06',
    name: 'COSHH Chemical Storage & Bunding Audit',
    category: 'Chemical',
    fields: [
      { id: 'f1', type: 'text', label: 'Chemical Storage Yard / Bunker Name', required: true },
      { id: 'f2', type: 'checkbox', label: 'Secondary containment capacity meets 110% of largest container', required: true },
      { id: 'f3', type: 'checkbox', label: 'Acids and bases physically segregated in separate sumps', required: true },
      { id: 'f4', type: 'checkbox', label: 'Eyewash stations tested with continuous clean running water', required: true },
      { id: 'f5', type: 'checkbox', label: 'All drums labeled with GHS hazard pictograms and valid SDS', required: true }
    ]
  },
  {
    id: 'TPL-FRM-07',
    name: 'Emergency Eyewash & Deluge Shower Weekly Test',
    category: 'Occupational Health',
    fields: [
      { id: 'f1', type: 'text', label: 'Eyewash Station Unit ID', required: true },
      { id: 'f2', type: 'date', label: 'Weekly Test Date', required: true },
      { id: 'f3', type: 'checkbox', label: 'Flushed for 3 minutes to clear pipeline sediment', required: true },
      { id: 'f4', type: 'checkbox', label: 'Tepid water temperature between 16°C and 38°C verified', required: true },
      { id: 'f5', type: 'checkbox', label: 'Inspection tag signed and laminated', required: true }
    ]
  },
  {
    id: 'TPL-FRM-08',
    name: 'Electrical Lockout / Tagout (LOTO) Zero Energy Audit',
    category: 'Electrical',
    fields: [
      { id: 'f1', type: 'text', label: 'Equipment / Switchgear Cubicle Tag', required: true },
      { id: 'f2', type: 'text', label: 'Authorized Electrical Isolation Lead', required: true },
      { id: 'f3', type: 'checkbox', label: 'Main breaker racked out and multi-hasp padlock applied', required: true },
      { id: 'f4', type: 'checkbox', label: 'Zero potential verified using calibrated high-voltage multimeter', required: true },
      { id: 'f5', type: 'checkbox', label: 'Grounding discharge stick applied to busbar conductors', required: true }
    ]
  },
  {
    id: 'TPL-FRM-09',
    name: 'GCC Midday Heat Stress & Hydration Monitoring Log',
    category: 'Occupational Health',
    fields: [
      { id: 'f1', type: 'dropdown', label: 'Operational Site Facility', required: true },
      { id: 'f2', type: 'date', label: 'Observation Date', required: true },
      { id: 'f3', type: 'text', label: 'Measured WBGT Temperature (°C)', required: true },
      { id: 'f4', type: 'dropdown', label: 'Heat Stress Flag Color (Green/Amber/Red/Black)', required: true },
      { id: 'f5', type: 'checkbox', label: 'Electrolyte packets and chilled potable water supplied to all decks', required: true },
      { id: 'f6', type: 'checkbox', label: 'Mandatory midday break observed between 12:30 and 15:00', required: true }
    ]
  },
  {
    id: 'TPL-FRM-10',
    name: 'Environmental Oil Spill Kit & Marine Boom Inspection',
    category: 'Environmental',
    fields: [
      { id: 'f1', type: 'text', label: 'Spill Kit Station Number / Berth ID', required: true },
      { id: 'f2', type: 'date', label: 'Inspection Date', required: true },
      { id: 'f3', type: 'checkbox', label: 'Absorbent pads, containment socks, and drain seals fully stocked', required: true },
      { id: 'f4', type: 'checkbox', label: 'Hydrophobic floating oil boom verified intact without tears', required: true },
      { id: 'f5', type: 'checkbox', label: 'Non-sparking shovel and hazardous waste recovery bags present', required: true }
    ]
  }
];

export const DigitalFormsBuilderModule: React.FC = () => {
  const [formName, setFormName] = useState('Daily Scaffolding Inspection Checklist');
  const [fields, setFields] = useState<FormField[]>(PREBUILT_TEMPLATES[0].fields);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [notification, setNotification] = useState<string | null>(null);

  const addField = (type: string, label: string) => {
    setFields([...fields, { id: 'f' + Date.now(), type, label, required: false }]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const toggleRequired = (id: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, required: !f.required } : f));
  };

  const updateLabel = (id: string, newLabel: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, label: newLabel } : f));
  };

  const handleSaveForm = () => {
    const saved = localStorage.getItem('hse_saved_forms');
    let forms = saved ? JSON.parse(saved) : [];
    const newForm = {
      id: `FORM-${Date.now()}`,
      name: formName,
      fields,
      updatedAt: new Date().toISOString()
    };
    forms = [newForm, ...forms];
    localStorage.setItem('hse_saved_forms', JSON.stringify(forms));
    setNotification(`Form "${formName}" successfully saved to digital forms repository!`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleLoadTemplate = (tpl: FormTemplate) => {
    setFormName(tpl.name);
    setFields(tpl.fields);
    setNotification(`Loaded pre-built template: ${tpl.name}`);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleSubmitPreview = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification('Inspection form submission simulated successfully! Response logged to audit trail.');
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Notification Banner */}
      {notification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            {notification}
          </span>
          <button onClick={() => setNotification(null)} className="text-emerald-600 hover:text-emerald-800 font-bold">×</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-x-5">
          <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-xl shadow-indigo-500/20">
            <Layout size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Digital Forms & Inspection Builder</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              No-Code Dynamic HSE Checklist Configurator (10 Industrial Templates)
            </p>
          </div>
        </div>
        <div className="flex gap-2.5">
          <button 
            onClick={() => setActiveTab('editor')} 
            className={`px-4 py-2 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer ${activeTab === 'editor' ? 'bg-slate-900 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Form Editor
          </button>
          <button 
            onClick={() => setActiveTab('preview')} 
            className={`px-4 py-2 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer ${activeTab === 'preview' ? 'bg-slate-900 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Live Preview
          </button>
          <button 
            onClick={handleSaveForm}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-indigo-700 transition-all shadow-md cursor-pointer"
          >
            <Save size={16} /> Save Form
          </button>
        </div>
      </div>

      {activeTab === 'editor' ? (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Tool Palette & Pre-built Templates */}
          <div className="w-full lg:w-72 shrink-0 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Add Form Fields</h3>
              <div className="space-y-1.5">
                <button onClick={() => addField('text', 'Short Text')} className="w-full flex items-center gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition text-xs font-semibold text-slate-700 cursor-pointer">
                  <FileText size={15} /> Short Text Input
                </button>
                <button onClick={() => addField('textarea', 'Observations & Notes')} className="w-full flex items-center gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition text-xs font-semibold text-slate-700 cursor-pointer">
                  <Layout size={15} /> Long Text / Notes
                </button>
                <button onClick={() => addField('dropdown', 'Dropdown Select')} className="w-full flex items-center gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition text-xs font-semibold text-slate-700 cursor-pointer">
                  <List size={15} /> Dropdown Selection
                </button>
                <button onClick={() => addField('checkbox', 'Compliance Verification Checkbox')} className="w-full flex items-center gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition text-xs font-semibold text-slate-700 cursor-pointer">
                  <CheckSquare size={15} /> Pass / Fail Checkbox
                </button>
                <button onClick={() => addField('date', 'Date & Time')} className="w-full flex items-center gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition text-xs font-semibold text-slate-700 cursor-pointer">
                  <Calendar size={15} /> Date Picker
                </button>
                <button onClick={() => addField('file', 'Evidence Photo Upload')} className="w-full flex items-center gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition text-xs font-semibold text-slate-700 cursor-pointer">
                  <Upload size={15} /> Photo Evidence Upload
                </button>
              </div>
            </div>

            {/* Template Selector */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Bookmark size={14} className="text-indigo-600" />
                10 Pre-Built Templates
              </h3>
              <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                {PREBUILT_TEMPLATES.map(tpl => (
                  <button
                    key={tpl.id}
                    onClick={() => handleLoadTemplate(tpl)}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition cursor-pointer"
                  >
                    <div className="font-bold text-xs text-slate-800 leading-snug">{tpl.name}</div>
                    <div className="text-[10px] text-indigo-600 font-medium mt-0.5">{tpl.category} • {tpl.fields.length} checks</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Canvas */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50/70">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Form Title</label>
              <input 
                type="text" 
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="text-xl font-black text-slate-800 bg-transparent border-b border-slate-300 w-full pb-1 focus:outline-none focus:border-indigo-600"
              />
              <p className="text-xs text-slate-500 mt-2">Active fields configured: {fields.length}</p>
            </div>

            <div className="p-6 space-y-3 flex-1 overflow-y-auto">
              {fields.map((f, index) => (
                <div key={f.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4 group hover:border-indigo-200 transition">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-xs font-mono font-bold text-slate-400">#{index + 1}</span>
                    <input 
                      type="text" 
                      value={f.label}
                      onChange={(e) => updateLabel(f.id, e.target.value)}
                      className="text-xs font-bold text-slate-800 bg-white px-3 py-1.5 border border-slate-200 rounded-lg flex-1 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-600 font-bold">
                      {f.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleRequired(f.id)}
                      className={`text-[10px] font-bold px-2 py-1 rounded cursor-pointer transition ${f.required ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-200 text-slate-500'}`}
                    >
                      {f.required ? 'Required *' : 'Optional'}
                    </button>
                    <button 
                      onClick={() => removeField(f.id)}
                      className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                      title="Remove Field"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmitPreview} className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-900 text-white">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">Active Inspection Preview</span>
            <h2 className="text-2xl font-black mt-1">{formName}</h2>
            <p className="text-slate-400 text-xs mt-1">Fill out the fields to test live input handling and validation rules.</p>
          </div>
          
          <div className="p-8 space-y-5">
            {fields.map(f => (
              <div key={f.id}>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {f.label} {f.required && <span className="text-red-500">*</span>}
                </label>
                {f.type === 'text' && (
                  <input type="text" required={f.required} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium" placeholder="Enter value..." />
                )}
                {f.type === 'textarea' && (
                  <textarea rows={3} required={f.required} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium" placeholder="Enter observations..."></textarea>
                )}
                {f.type === 'date' && (
                  <input type="date" required={f.required} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium" defaultValue={new Date().toISOString().split('T')[0]} />
                )}
                {f.type === 'dropdown' && (
                  <select required={f.required} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white font-medium">
                    <option value="">-- Select Choice --</option>
                    <option value="Passed">Compliant / Satisfactory</option>
                    <option value="Remediation">Remediation Needed</option>
                    <option value="NotApplicable">N/A</option>
                  </select>
                )}
                {f.type === 'checkbox' && (
                  <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                    <input type="checkbox" required={f.required} className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-4 h-4" />
                    <span className="text-xs font-medium text-slate-700">Verified and compliant with site procedure</span>
                  </label>
                )}
                {f.type === 'file' && (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center hover:bg-slate-50 transition cursor-pointer">
                    <Upload size={22} className="mx-auto text-slate-400 mb-1.5" />
                    <p className="text-xs font-bold text-slate-600">Click or drag photo evidence here</p>
                    <p className="text-[10px] text-slate-400">JPG, PNG, PDF up to 10MB</p>
                  </div>
                )}
              </div>
            ))}
            
            <div className="pt-6 border-t border-slate-100">
              <button 
                type="submit"
                className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20 text-xs uppercase tracking-wider cursor-pointer"
              >
                Submit Inspection Checklist <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default DigitalFormsBuilderModule;
