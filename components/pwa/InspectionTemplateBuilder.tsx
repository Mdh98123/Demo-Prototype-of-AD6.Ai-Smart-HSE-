import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ArrowLeft, Plus, Trash2, ArrowUp, ArrowDown, Save, Eye, Copy, 
  CheckCircle2, AlertTriangle, FileText, CheckSquare, Camera, PenTool,
  Search, SlidersHorizontal, Sparkles, Layers, ShieldCheck, Tag, Info,
  RotateCcw, ExternalLink, X, PlayCircle, Check
} from 'lucide-react';
import { 
  TemplateRecord, 
  DynamicChecklistItem, 
  ChecklistFieldType, 
  offlineStorage 
} from '../../services/offlineStorage';
import { SignatureCanvas } from './SignatureCanvas';
import { useUser } from '../../contexts/UserContext';

interface InspectionTemplateBuilderProps {
  onBack: () => void;
  onSelectTemplateToInspect?: (templateId: string) => void;
}

const TEMPLATE_CATEGORIES = [
  'Workplace Safety & Life Saving Rules',
  'Scaffolding & Work at Height',
  'Confined Space & Gas Testing',
  'Electrical & LOTO Isolations',
  'Plant & Machinery Integrity',
  'Environmental ESG & Waste',
  'Civil & Excavation Safety',
  'Logistics & Fleet Transport',
  'General Operational'
];

const REGULATORY_STANDARDS = [
  'Oman MoL MD 286/2008 & RD 53/2023',
  'PDO SP-1143 (Permit to Work)',
  'PDO SP-1232 (Scaffolding Safety)',
  'PDO SP-1170 (Thermal / Heat Stress)',
  'ISO 45001:2018 (Occupational Health & Safety)',
  'ISO 14001:2015 (Environmental Management)',
  'Enterprise Operational Standard'
];

export const InspectionTemplateBuilder: React.FC<InspectionTemplateBuilderProps> = ({
  onBack,
  onSelectTemplateToInspect
}) => {
  const { currentUser } = useUser();
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // View state: 'LIST' | 'EDIT' | 'PREVIEW'
  const [viewMode, setViewMode] = useState<'LIST' | 'EDIT' | 'PREVIEW'>('LIST');

  // Currently editing template
  const [currentTemplate, setCurrentTemplate] = useState<TemplateRecord | null>(null);

  // Preview state for testing the form
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, any>>({});
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await offlineStorage.getTemplates();
      setTemplates(list);
    } catch (err) {
      console.error('[TemplateBuilder] Error loading templates:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();

    const handleUpdate = () => loadTemplates();
    window.addEventListener('ad6-templates-updated', handleUpdate);
    return () => window.removeEventListener('ad6-templates-updated', handleUpdate);
  }, [loadTemplates]);

  // Filtered templates list
  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const title = (t.title || t.name || '').toLowerCase();
      const desc = (t.description || '').toLowerCase();
      const cat = (t.category || '').toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchesQuery = !searchQuery || title.includes(query) || desc.includes(query) || cat.includes(query);
      const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;

      return matchesQuery && matchesCategory;
    });
  }, [templates, searchQuery, selectedCategory]);

  // Start creating a fresh template
  const handleCreateNew = () => {
    const newTmpl: TemplateRecord = {
      id: `tmpl-custom-${Date.now()}`,
      name: '',
      title: '',
      category: 'Workplace Safety & Life Saving Rules',
      regulatoryStandard: 'Oman MoL MD 286/2008 & RD 53/2023',
      version: '1.0.0',
      description: '',
      status: 'ACTIVE',
      createdBy: currentUser?.name || 'Administrator',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [
        {
          id: `item-${Date.now()}-1`,
          label: 'Location / Equipment ID',
          type: 'text',
          required: true,
          category: 'General',
          helpText: 'Record the specific plant tag, unit, or zone inspected.'
        },
        {
          id: `item-${Date.now()}-2`,
          label: 'Are all required safety controls verified and in place?',
          type: 'boolean',
          required: true,
          category: 'Compliance Checks',
          booleanTrueLabel: 'Compliant (Pass)',
          booleanFalseLabel: 'Deficient (Fail)',
          allowNA: false,
          requirePhotoOnFail: true,
          helpText: 'Verify physical barriers, gas monitors, and valid permit authorization.'
        },
        {
          id: `item-${Date.now()}-3`,
          label: 'Photographic Evidence of Working Conditions',
          type: 'photo',
          required: true,
          category: 'Evidence',
          helpText: 'Capture high-resolution photo with device camera showing inspected area.'
        },
        {
          id: `item-${Date.now()}-4`,
          label: 'Field Inspector Authorization Signature',
          type: 'signature',
          required: true,
          category: 'Sign-off',
          signerRole: 'Lead Field Inspector',
          helpText: 'Inspector signature verifying on-site physical walk-through.'
        }
      ]
    };
    setCurrentTemplate(newTmpl);
    setViewMode('EDIT');
  };

  // Edit existing template
  const handleEdit = (tmpl: TemplateRecord) => {
    // Deep clone to prevent direct state mutation
    setCurrentTemplate(JSON.parse(JSON.stringify(tmpl)));
    setViewMode('EDIT');
  };

  // Duplicate existing template
  const handleDuplicate = async (tmpl: TemplateRecord) => {
    const clone: TemplateRecord = {
      ...JSON.parse(JSON.stringify(tmpl)),
      id: `tmpl-custom-${Date.now()}`,
      name: `${tmpl.title || tmpl.name} (Copy)`,
      title: `${tmpl.title || tmpl.name} (Copy)`,
      version: '1.0.0',
      isSystemDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'Administrator'
    };
    await offlineStorage.saveTemplate(clone);
    await loadTemplates();
    setSaveSuccessMsg(`Cloned template "${clone.title}".`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Delete custom template
  const handleDelete = async (id: string, title?: string) => {
    if (window.confirm(`Are you sure you want to delete template "${title || id}"?`)) {
      await offlineStorage.deleteTemplate(id);
      await loadTemplates();
      setSaveSuccessMsg('Template removed.');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    }
  };

  // Open Live Preview
  const handlePreview = (tmpl: TemplateRecord) => {
    setCurrentTemplate(JSON.parse(JSON.stringify(tmpl)));
    setPreviewAnswers({});
    setViewMode('PREVIEW');
  };

  // Item manipulation functions
  const handleAddItem = (type: ChecklistFieldType) => {
    if (!currentTemplate) return;

    let defaultLabel = 'New Checklist Question';
    let defaultTrue = 'Pass';
    let defaultFalse = 'Fail';
    let defaultSigner = 'Inspector';

    if (type === 'text') defaultLabel = 'Observation / Parameter Notes';
    if (type === 'boolean') defaultLabel = 'Condition verification check';
    if (type === 'photo') defaultLabel = 'Mandatory Site Photo Evidence';
    if (type === 'signature') defaultLabel = 'Field Authority Sign-off';

    const newItem: DynamicChecklistItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      label: defaultLabel,
      type,
      required: true,
      category: currentTemplate.items?.[currentTemplate.items.length - 1]?.category || 'General',
      booleanTrueLabel: defaultTrue,
      booleanFalseLabel: defaultFalse,
      allowNA: true,
      requirePhotoOnFail: type === 'boolean',
      signerRole: defaultSigner,
      helpText: ''
    };

    setCurrentTemplate({
      ...currentTemplate,
      items: [...(currentTemplate.items || []), newItem]
    });
  };

  const handleUpdateItem = (itemId: string, patch: Partial<DynamicChecklistItem>) => {
    if (!currentTemplate || !currentTemplate.items) return;
    const updated = currentTemplate.items.map(item => {
      if (item.id === itemId) {
        return { ...item, ...patch };
      }
      return item;
    });
    setCurrentTemplate({ ...currentTemplate, items: updated });
  };

  const handleRemoveItem = (itemId: string) => {
    if (!currentTemplate || !currentTemplate.items) return;
    setCurrentTemplate({
      ...currentTemplate,
      items: currentTemplate.items.filter(item => item.id !== itemId)
    });
  };

  const handleMoveItem = (index: number, direction: 'UP' | 'DOWN') => {
    if (!currentTemplate || !currentTemplate.items) return;
    const newItems = [...currentTemplate.items];
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;

    setCurrentTemplate({ ...currentTemplate, items: newItems });
  };

  // Save current template
  const handleSaveCurrentTemplate = async () => {
    if (!currentTemplate) return;

    const title = (currentTemplate.title || currentTemplate.name || '').trim();
    if (!title) {
      alert('Please enter a Template Title.');
      return;
    }

    if (!currentTemplate.items || currentTemplate.items.length === 0) {
      alert('A dynamic checklist must have at least one question or field.');
      return;
    }

    const payload: TemplateRecord = {
      ...currentTemplate,
      name: title,
      title: title,
      updatedAt: new Date().toISOString()
    };

    await offlineStorage.saveTemplate(payload);
    await loadTemplates();
    setSaveSuccessMsg(`Template "${title}" saved successfully to offline registry.`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
    setViewMode('LIST');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans">
      {/* Toast notification */}
      {saveSuccessMsg && (
        <div className="fixed top-4 inset-x-4 sm:inset-x-auto sm:end-6 z-50 p-4 bg-emerald-600 text-white rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in text-xs font-bold">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. LIST VIEW OF INSPECTION TEMPLATES                                       */}
      {/* ========================================================================= */}
      {viewMode === 'LIST' && (
        <div className="flex flex-col h-full overflow-y-auto p-4 sm:p-6 pb-24 space-y-6">
          {/* Top Bar Navigation & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBack}
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
                title="Return to Field Inspections"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Inspection Template Builder
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-700">
                    Administrator
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Configure dynamic field checklists (text, boolean pass/fail, photo evidence, digital signatures)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreateNew}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Plus size={16} />
              <span>Create New Template</span>
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates by title, regulatory standard, or category..."
                className="w-full ps-10 pe-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:border-indigo-500 shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute end-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-bold focus:outline-none focus:border-indigo-500 shadow-xs"
              >
                <option value="ALL">All Categories ({templates.length})</option>
                {TEMPLATE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Templates Grid */}
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 font-bold">
              Loading dynamic templates...
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="p-12 text-center bg-white border border-dashed border-slate-200 rounded-2xl space-y-3">
              <Layers size={40} className="mx-auto text-slate-300" />
              <h3 className="text-sm font-bold text-slate-700">No matching templates found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No templates match your search criteria. Create a new custom checklist or clear filters.
              </p>
              <button
                type="button"
                onClick={handleCreateNew}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-2"
              >
                <Plus size={14} />
                <span>Build New Template</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map(tmpl => {
                const items = tmpl.items || [];
                const hasText = items.some(i => i.type === 'text');
                const hasBool = items.some(i => i.type === 'boolean');
                const hasPhoto = items.some(i => i.type === 'photo');
                const hasSig = items.some(i => i.type === 'signature');

                return (
                  <div
                    key={tmpl.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-700">
                          {tmpl.category || 'General HSE'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            v{tmpl.version || '1.0'}
                          </span>
                          {tmpl.isSystemDefault && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200">
                              System
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {tmpl.title || tmpl.name}
                        </h3>
                        {tmpl.regulatoryStandard && (
                          <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mt-1">
                            <ShieldCheck size={12} className="text-emerald-600" />
                            <span>{tmpl.regulatoryStandard}</span>
                          </div>
                        )}
                        {tmpl.description && (
                          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                            {tmpl.description}
                          </p>
                        )}
                      </div>

                      {/* Field Type Pills */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                        <span className="text-slate-400 me-1">{items.length} Field{items.length !== 1 ? 's' : ''}:</span>
                        {hasText && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 flex items-center gap-1">
                            <FileText size={10} /> Text
                          </span>
                        )}
                        {hasBool && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 flex items-center gap-1">
                            <CheckSquare size={10} /> Pass/Fail
                          </span>
                        )}
                        {hasPhoto && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 flex items-center gap-1">
                            <Camera size={10} /> Photo
                          </span>
                        )}
                        {hasSig && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 flex items-center gap-1">
                            <PenTool size={10} /> Signature
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Template Card Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handlePreview(tmpl)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1"
                          title="Preview Form"
                        >
                          <Eye size={13} />
                          <span>Preview</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicate(tmpl)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Duplicate Template"
                        >
                          <Copy size={13} />
                        </button>
                        {!tmpl.isSystemDefault && (
                          <button
                            type="button"
                            onClick={() => handleDelete(tmpl.id, tmpl.title || tmpl.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Template"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(tmpl)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          Edit
                        </button>
                        {onSelectTemplateToInspect && (
                          <button
                            type="button"
                            onClick={() => onSelectTemplateToInspect(tmpl.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors flex items-center gap-1"
                            title="Start new inspection using this template"
                          >
                            <PlayCircle size={13} />
                            <span>Inspect</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TEMPLATE BUILDER / EDITOR                                               */}
      {/* ========================================================================= */}
      {viewMode === 'EDIT' && currentTemplate && (
        <div className="flex flex-col h-full overflow-y-auto p-4 sm:p-6 pb-28 space-y-6">
          {/* Top Bar Navigation */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewMode('LIST')}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  {currentTemplate.title ? `Edit: ${currentTemplate.title}` : 'Build New Inspection Template'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Configure checklist sections, question logic, and field requirements
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePreview(currentTemplate)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
              >
                <Eye size={14} className="text-indigo-600" />
                <span>Test & Preview</span>
              </button>
              <button
                type="button"
                onClick={handleSaveCurrentTemplate}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Save size={14} />
                <span>Save Template</span>
              </button>
            </div>
          </div>

          {/* Section A: Template Metadata */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Tag size={14} className="text-indigo-600" />
              <span>Template Specifications & Metadata</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Template Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={currentTemplate.title || currentTemplate.name || ''}
                  onChange={(e) => setCurrentTemplate({ ...currentTemplate, title: e.target.value, name: e.target.value })}
                  placeholder="e.g. Flare Header High-Pressure Tie-In Safety Checklist"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Operational Domain / Category
                </label>
                <select
                  value={currentTemplate.category || TEMPLATE_CATEGORIES[0]}
                  onChange={(e) => setCurrentTemplate({ ...currentTemplate, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  {TEMPLATE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Statutory Regulatory Framework
                </label>
                <select
                  value={currentTemplate.regulatoryStandard || REGULATORY_STANDARDS[0]}
                  onChange={(e) => setCurrentTemplate({ ...currentTemplate, regulatoryStandard: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  {REGULATORY_STANDARDS.map(std => (
                    <option key={std} value={std}>{std}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Version Number
                </label>
                <input
                  type="text"
                  value={currentTemplate.version || '1.0.0'}
                  onChange={(e) => setCurrentTemplate({ ...currentTemplate, version: e.target.value })}
                  placeholder="1.0.0"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Template Status
                </label>
                <div className="flex items-center gap-3 h-10">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="radio"
                      name="templateStatus"
                      checked={currentTemplate.status === 'ACTIVE'}
                      onChange={() => setCurrentTemplate({ ...currentTemplate, status: 'ACTIVE' })}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Active (Available in Field)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="radio"
                      name="templateStatus"
                      checked={currentTemplate.status === 'DRAFT'}
                      onChange={() => setCurrentTemplate({ ...currentTemplate, status: 'DRAFT' })}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Draft (Under Review)</span>
                  </label>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Operational Scope & Inspector Instructions
                </label>
                <textarea
                  rows={2}
                  value={currentTemplate.description || ''}
                  onChange={(e) => setCurrentTemplate({ ...currentTemplate, description: e.target.value })}
                  placeholder="Provide guidance to inspectors regarding required tools, permit verifications, and frequency..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section B: Dynamic Checklist Items Builder */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <Layers size={16} className="text-indigo-600" />
                  <span>Checklist Questions & Inspection Controls ({currentTemplate.items?.length || 0})</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Add dynamic questions with text inputs, pass/fail checks, photo evidence, and digital signatures.
                </p>
              </div>

              {/* Add Item Quick Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddItem('text')}
                  className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1 transition-all"
                  title="Add text or narrative question"
                >
                  <Plus size={13} />
                  <FileText size={13} />
                  <span>Text</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddItem('boolean')}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1 transition-all"
                  title="Add pass/fail compliance check"
                >
                  <Plus size={13} />
                  <CheckSquare size={13} />
                  <span>Pass/Fail</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddItem('photo')}
                  className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1 transition-all"
                  title="Add photographic evidence requirement"
                >
                  <Plus size={13} />
                  <Camera size={13} />
                  <span>Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddItem('signature')}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold flex items-center gap-1 transition-all"
                  title="Add digital signature pad"
                >
                  <Plus size={13} />
                  <PenTool size={13} />
                  <span>Signature</span>
                </button>
              </div>
            </div>

            {/* Checklist Items List */}
            {(!currentTemplate.items || currentTemplate.items.length === 0) ? (
              <div className="p-8 text-center bg-white border-2 border-dashed border-slate-200 rounded-2xl">
                <p className="text-xs text-slate-400 font-bold">No questions added yet. Use the buttons above to add fields.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentTemplate.items.map((item, index) => {
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 transition-all hover:border-slate-300"
                    >
                      {/* Item Header */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 text-xs font-black flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1 ${
                            item.type === 'text' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            item.type === 'boolean' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            item.type === 'photo' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {item.type === 'text' && <FileText size={11} />}
                            {item.type === 'boolean' && <CheckSquare size={11} />}
                            {item.type === 'photo' && <Camera size={11} />}
                            {item.type === 'signature' && <PenTool size={11} />}
                            <span>{item.type.toUpperCase()} FIELD</span>
                          </span>
                        </div>

                        {/* Item Order & Delete Controls */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveItem(index, 'UP')}
                            disabled={index === 0}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-20"
                            title="Move Up"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveItem(index, 'DOWN')}
                            disabled={index === currentTemplate.items!.length - 1}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-20"
                            title="Move Down"
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-red-600 transition-colors ms-1"
                            title="Remove Question"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Item Main Config */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                        <div className="md:col-span-8 space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 block">
                            Question / Field Label <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => handleUpdateItem(item.id, { label: e.target.value })}
                            placeholder="Enter the prompt for the field inspector..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                          />
                        </div>

                        <div className="md:col-span-4 space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 block">
                            Category / Section
                          </label>
                          <input
                            type="text"
                            value={item.category || ''}
                            onChange={(e) => handleUpdateItem(item.id, { category: e.target.value })}
                            placeholder="e.g. Life Saving Rules"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                          />
                        </div>

                        <div className="md:col-span-12 space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 block">
                            Help Guidance / Standard Reference (Optional)
                          </label>
                          <input
                            type="text"
                            value={item.helpText || ''}
                            onChange={(e) => handleUpdateItem(item.id, { helpText: e.target.value })}
                            placeholder="e.g. Ensure minimum anchor point rating of 22kN per PDO SP-1232..."
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                          />
                        </div>
                      </div>

                      {/* Type-Specific Options */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-700">
                        {/* Required Toggle */}
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.required}
                            onChange={(e) => handleUpdateItem(item.id, { required: e.target.checked })}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>Mandatory Field</span>
                        </label>

                        {/* Boolean specific options */}
                        {item.type === 'boolean' && (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-500 font-medium">Pass:</span>
                              <input
                                type="text"
                                value={item.booleanTrueLabel || 'Pass'}
                                onChange={(e) => handleUpdateItem(item.id, { booleanTrueLabel: e.target.value })}
                                className="w-24 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-emerald-700"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-500 font-medium">Fail:</span>
                              <input
                                type="text"
                                value={item.booleanFalseLabel || 'Fail'}
                                onChange={(e) => handleUpdateItem(item.id, { booleanFalseLabel: e.target.value })}
                                className="w-24 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-red-700"
                              />
                            </div>
                            <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 font-medium">
                              <input
                                type="checkbox"
                                checked={item.allowNA !== false}
                                onChange={(e) => handleUpdateItem(item.id, { allowNA: e.target.checked })}
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                              />
                              <span>Allow N/A</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer text-amber-700 font-medium">
                              <input
                                type="checkbox"
                                checked={Boolean(item.requirePhotoOnFail)}
                                onChange={(e) => handleUpdateItem(item.id, { requirePhotoOnFail: e.target.checked })}
                                className="rounded text-amber-600 focus:ring-amber-500"
                              />
                              <span>Require Photo on Defect</span>
                            </label>
                          </>
                        )}

                        {/* Signature specific options */}
                        {item.type === 'signature' && (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-500 font-medium">Signatory Title:</span>
                            <input
                              type="text"
                              value={item.signerRole || 'Inspector'}
                              onChange={(e) => handleUpdateItem(item.id, { signerRole: e.target.value })}
                              placeholder="e.g. Lead HSE Inspector"
                              className="w-48 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. LIVE FIELD INSPECTOR PREVIEW MODAL / TAB                                */}
      {/* ========================================================================= */}
      {viewMode === 'PREVIEW' && currentTemplate && (
        <div className="flex flex-col h-full overflow-y-auto p-4 sm:p-6 pb-28 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewMode('EDIT')}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    Live Field Preview: {currentTemplate.title || currentTemplate.name}
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                    Interactive Simulator
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Test filling this dynamic checklist as an inspector in the field
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setViewMode('EDIT')}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              Back to Builder
            </button>
          </div>

          {/* Simulated Mobile Form Frame */}
          <div className="max-w-2xl mx-auto w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-300">
                  {currentTemplate.regulatoryStandard || 'Oman Regulatory Framework'}
                </span>
                <span className="px-2 py-0.5 rounded bg-white/20 text-[10px] font-mono">
                  v{currentTemplate.version || '1.0'}
                </span>
              </div>
              <h3 className="text-lg font-black tracking-tight">{currentTemplate.title || currentTemplate.name}</h3>
              {currentTemplate.description && (
                <p className="text-xs text-slate-300 leading-relaxed">{currentTemplate.description}</p>
              )}
            </div>

            {/* Simulated Checklist Items */}
            <div className="p-6 space-y-6">
              {currentTemplate.items?.map((item, idx) => {
                const answer = previewAnswers[item.id];

                return (
                  <div key={item.id} className="space-y-2 pb-5 border-b border-slate-100 last:border-b-0">
                    <div className="flex items-start justify-between gap-2">
                      <label className="text-xs font-black text-slate-800 block">
                        <span className="text-slate-400 me-1.5">{idx + 1}.</span>
                        {item.label}
                        {item.required && <span className="text-red-500 ms-1">*</span>}
                      </label>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        {item.type}
                      </span>
                    </div>

                    {item.helpText && (
                      <p className="text-[11px] text-slate-500 leading-relaxed">{item.helpText}</p>
                    )}

                    {/* Render Type 1: Text */}
                    {item.type === 'text' && (
                      <textarea
                        rows={2}
                        value={answer || ''}
                        onChange={(e) => setPreviewAnswers({ ...previewAnswers, [item.id]: e.target.value })}
                        placeholder="Type observation notes or parameter..."
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    )}

                    {/* Render Type 2: Boolean (Pass/Fail) */}
                    {item.type === 'boolean' && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setPreviewAnswers({ ...previewAnswers, [item.id]: 'PASS' })}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                            answer === 'PASS'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-800'
                          }`}
                        >
                          ✓ {item.booleanTrueLabel || 'Pass'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewAnswers({ ...previewAnswers, [item.id]: 'FAIL' })}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                            answer === 'FAIL'
                              ? 'bg-red-600 text-white border-red-600 shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-red-50 hover:text-red-800'
                          }`}
                        >
                          ✕ {item.booleanFalseLabel || 'Fail'}
                        </button>
                        {item.allowNA !== false && (
                          <button
                            type="button"
                            onClick={() => setPreviewAnswers({ ...previewAnswers, [item.id]: 'NA' })}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                              answer === 'NA'
                                ? 'bg-slate-600 text-white border-slate-600'
                                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            N/A
                          </button>
                        )}
                        {answer === 'FAIL' && item.requirePhotoOnFail && (
                          <div className="w-full p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-800 flex items-center gap-2 mt-1">
                            <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                            <span>Defect flagged: Mandatory photo evidence required upon inspection submission.</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Render Type 3: Photo Upload */}
                    {item.type === 'photo' && (
                      <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/70 text-center space-y-2">
                        <Camera size={24} className="mx-auto text-slate-400" />
                        <div className="text-xs font-bold text-slate-700">Photographic Evidence Trigger</div>
                        <p className="text-[10px] text-slate-400">
                          Field inspector can open device camera with live client-side compression or gallery picker.
                        </p>
                      </div>
                    )}

                    {/* Render Type 4: Signature */}
                    {item.type === 'signature' && (
                      <SignatureCanvas
                        label={item.label}
                        required={item.required}
                        signerRole={item.signerRole || 'Lead Inspector'}
                        onChange={(sig) => setPreviewAnswers({ ...previewAnswers, [item.id]: sig })}
                      />
                    )}
                  </div>
                );
              })}

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    alert('Preview simulation successful! All checklist inputs are validated.');
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:from-indigo-500 hover:to-indigo-600 transition-all text-center"
                >
                  Simulate Inspection Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionTemplateBuilder;
