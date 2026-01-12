
import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { Task } from '../types';
import { 
  Plus, Calendar, User, MoreVertical, Trash2, Edit2, 
  CheckCircle2, Circle, Clock, ArrowRight, Layout, List,
  Filter, Search, X, Bell, ClipboardCheck, Wrench, GraduationCap, FileText,
  Link as LinkIcon, Lock, ArrowUpDown, ChevronDown
} from 'lucide-react';

const TaskModule: React.FC = () => {
  const { currentUser } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'All' | 'My Tasks'>('All');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState(currentUser.name);
  const [newTaskPriority, setNewTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newTaskCategory, setNewTaskCategory] = useState<Task['category']>('General');
  const [newTaskStatus, setNewTaskStatus] = useState<Task['status']>('ToDo');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskReminder, setNewTaskReminder] = useState('');
  const [newTaskDependencies, setNewTaskDependencies] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('hse_tasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    } else {
      // Initial mock data
      const initialTasks: Task[] = [
        {
          id: 'TSK-101',
          title: 'Review Hazard Analysis for Zone B',
          description: 'Update the risk assessment based on recent soil samples.',
          assignee: 'Sarah Jones',
          priority: 'High',
          category: 'General',
          status: 'ToDo',
          dueDate: '2024-06-25',
          reminderDate: '2024-06-24T09:00',
          createdAt: new Date().toISOString(),
          createdBy: 'System'
        },
        {
          id: 'TSK-102',
          title: 'Safety Equipment Audit',
          description: 'Check inventory of PPE in central storage.',
          assignee: 'Fatima Al-Kaabi',
          priority: 'Medium',
          category: 'Inspection',
          status: 'InProgress',
          dueDate: '2024-06-28',
          createdAt: new Date().toISOString(),
          createdBy: 'System'
        },
        {
          id: 'TSK-103',
          title: 'Monthly Report Submission',
          description: 'Compile incident stats for board review.',
          assignee: 'Dr. Layla Hassan',
          priority: 'High',
          category: 'General',
          status: 'Done',
          dueDate: '2024-06-01',
          createdAt: new Date().toISOString(),
          createdBy: 'System'
        },
        {
          id: 'TSK-104',
          title: 'Site Clearance for Zone B',
          description: 'Requires Hazard Analysis (TSK-101) to be complete.',
          assignee: 'Marcus Chen',
          priority: 'High',
          category: 'Maintenance',
          status: 'ToDo',
          dueDate: '2024-06-30',
          dependencies: ['TSK-101'],
          createdAt: new Date().toISOString(),
          createdBy: 'System'
        }
      ];
      setTasks(initialTasks);
      localStorage.setItem('hse_tasks', JSON.stringify(initialTasks));
    }
  }, []);

  const saveTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    localStorage.setItem('hse_tasks', JSON.stringify(updatedTasks));
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
        // Update existing task
        const updatedTasks = tasks.map(t => t.id === editingId ? {
            ...t,
            title: newTaskTitle,
            description: newTaskDesc,
            assignee: newTaskAssignee,
            priority: newTaskPriority,
            category: newTaskCategory,
            status: newTaskStatus,
            dueDate: newTaskDueDate,
            reminderDate: newTaskReminder || undefined,
            dependencies: newTaskDependencies
        } : t);
        saveTasks(updatedTasks);
    } else {
        // Create new task
        const task: Task = {
            id: `TSK-${Date.now().toString().slice(-4)}`,
            title: newTaskTitle,
            description: newTaskDesc,
            assignee: newTaskAssignee,
            priority: newTaskPriority,
            category: newTaskCategory,
            status: newTaskStatus,
            dueDate: newTaskDueDate || new Date().toISOString().split('T')[0],
            reminderDate: newTaskReminder || undefined,
            dependencies: newTaskDependencies,
            createdAt: new Date().toISOString(),
            createdBy: currentUser.name
        };
        saveTasks([...tasks, task]);
    }
    
    setIsModalOpen(false);
    resetForm();
  };

  const openEditModal = (task: Task) => {
      setEditingId(task.id);
      setNewTaskTitle(task.title);
      setNewTaskDesc(task.description);
      setNewTaskAssignee(task.assignee);
      setNewTaskPriority(task.priority);
      setNewTaskCategory(task.category);
      setNewTaskStatus(task.status);
      setNewTaskDueDate(task.dueDate);
      setNewTaskReminder(task.reminderDate || '');
      setNewTaskDependencies(task.dependencies || []);
      setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskAssignee(currentUser.name);
    setNewTaskPriority('Medium');
    setNewTaskCategory('General');
    setNewTaskStatus('ToDo');
    setNewTaskDueDate('');
    setNewTaskReminder('');
    setNewTaskDependencies([]);
  };

  const isTaskBlocked = (task: Task): boolean => {
      if (!task.dependencies || task.dependencies.length === 0) return false;
      // Check if any dependency is NOT done
      const blockers = task.dependencies.filter(depId => {
          const dependency = tasks.find(t => t.id === depId);
          return dependency && dependency.status !== 'Done';
      });
      return blockers.length > 0;
  };

  const updateStatus = (taskId: string, newStatus: Task['status']) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Check blocked status before allowing progress
    if (newStatus !== 'ToDo' && isTaskBlocked(task)) {
        alert("Cannot proceed: This task is blocked by incomplete dependencies.");
        return;
    }

    const updated = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    saveTasks(updated);
  };

  const deleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      const updated = tasks.filter(t => t.id !== taskId);
      saveTasks(updated);
    }
  };

  const toggleDependency = (id: string) => {
      setNewTaskDependencies(prev => 
          prev.includes(id) ? prev.filter(dep => dep !== id) : [...prev, id]
      );
  };

  const filteredTasks = tasks
    .filter(t => filter === 'All' || t.assignee === currentUser.name)
    .sort((a, b) => {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        // Fallback for invalid dates
        if (isNaN(dateA)) return 1;
        if (isNaN(dateB)) return -1;
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'High': return 'text-red-600 bg-red-50 border-red-100';
      case 'Medium': return 'text-orange-600 bg-orange-50 border-orange-100';
      default: return 'text-blue-600 bg-blue-50 border-blue-100';
    }
  };

  const getCategoryStyle = (category: string) => {
      switch(category) {
          case 'Inspection': return 'text-purple-600 bg-purple-50 border-purple-100';
          case 'Maintenance': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
          case 'Training': return 'text-teal-600 bg-teal-50 border-teal-100';
          case 'Audit': return 'text-orange-600 bg-orange-50 border-orange-100';
          default: return 'text-slate-500 bg-slate-50 border-slate-100';
      }
  };

  const getCategoryIcon = (category: string) => {
      switch(category) {
          case 'Inspection': return <ClipboardCheck size={12} />;
          case 'Maintenance': return <Wrench size={12} />;
          case 'Training': return <GraduationCap size={12} />;
          case 'Audit': return <FileText size={12} />;
          default: return <Layout size={12} />;
      }
  };

  const KanbanColumn = ({ status, title, icon }: { status: Task['status'], title: string, icon: React.ReactNode }) => (
    <div className="flex flex-col h-full bg-slate-50/50 rounded-[2rem] border border-slate-100/50 p-4">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          {icon} {title}
        </h3>
        <span className="bg-white text-slate-500 px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-sm border border-slate-100">
          {filteredTasks.filter(t => t.status === status).length}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
        {filteredTasks.filter(t => t.status === status).map(task => {
          const blocked = isTaskBlocked(task);
          
          return (
            <div key={task.id} className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group relative ${blocked ? 'opacity-75 bg-slate-50' : ''}`}>
              {blocked && (
                  <div className="absolute top-2 right-2 bg-red-100 text-red-600 p-1.5 rounded-full z-10" title="Blocked by dependencies">
                      <Lock size={12}/>
                  </div>
              )}
              
              <div className="flex justify-between items-start mb-2">
                <div className="flex gap-2 flex-wrap items-center">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black uppercase border ${getCategoryStyle(task.category)}`}>
                        {getCategoryIcon(task.category)} {task.category}
                    </span>
                </div>
                
                {/* Status Dropdown */}
                <div className="relative">
                    <select
                        value={task.status}
                        onChange={(e) => updateStatus(task.id, e.target.value as Task['status'])}
                        disabled={blocked}
                        className={`appearance-none pl-2 pr-5 py-0.5 rounded text-[8px] font-black uppercase border cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                            task.status === 'Done' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            task.status === 'InProgress' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                            'bg-slate-50 text-slate-500 border-slate-100'
                        }`}
                    >
                        <option value="ToDo">To Do</option>
                        <option value="InProgress">In Progress</option>
                        <option value="Done">Done</option>
                    </select>
                    <ChevronDown size={8} className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                </div>
              </div>
              
              <h4 className="font-bold text-slate-800 text-sm mb-1 leading-snug pr-6">{task.title}</h4>
              <p className="text-[10px] text-slate-500 line-clamp-2 mb-3 leading-relaxed">{task.description}</p>
              
              {task.dependencies && task.dependencies.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1">
                      {task.dependencies.map(depId => {
                          const depTask = tasks.find(t => t.id === depId);
                          const isDepDone = depTask?.status === 'Done';
                          return (
                              <span key={depId} className={`text-[8px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 ${isDepDone ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                  <LinkIcon size={8}/> {depId}
                              </span>
                          );
                      })}
                  </div>
              )}

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[8px] font-black">
                    {task.assignee.charAt(0)}
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase truncate max-w-[80px]">{task.assignee}</span>
                </div>
                
                <div className="flex items-center gap-1">
                    {task.reminderDate && (
                        <div className="text-amber-500 bg-amber-50 p-1.5 rounded-lg" title={`Reminder: ${new Date(task.reminderDate).toLocaleString()}`}>
                            <Bell size={10} className="fill-amber-500"/>
                        </div>
                    )}
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                        <Calendar size={10}/> {task.dueDate}
                    </div>
                    
                    {/* Action Buttons */}
                    <button onClick={() => openEditModal(task)} className="p-1.5 hover:bg-slate-100 text-slate-300 hover:text-indigo-500 rounded transition-colors ml-1">
                        <Edit2 size={12}/>
                    </button>
                    <button onClick={() => deleteTask(task.id)} className="p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded transition-colors">
                        <Trash2 size={12}/>
                    </button>
                </div>
              </div>
            </div>
          );
        })}
        {filteredTasks.filter(t => t.status === status).length === 0 && (
          <div className="py-8 text-center text-slate-300 text-xs font-bold uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-xl">
            Empty
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 shrink-0">
        <div className="flex items-center space-x-5">
          <div className="bg-violet-600 p-5 rounded-[2rem] text-white shadow-2xl shadow-violet-500/20">
            <Layout size={32} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Task Manager</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 border-l-2 border-violet-500 pl-4">Operational Workflow & Assignments</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-xl border border-slate-200 flex shadow-sm">
            <button 
              onClick={() => setFilter('All')} 
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'All' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
            >
              All Tasks
            </button>
            <button 
              onClick={() => setFilter('My Tasks')} 
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'My Tasks' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
            >
              My Tasks
            </button>
          </div>
          <button 
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="bg-white p-3 rounded-2xl border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm flex items-center gap-2"
            title={`Sort by Due Date (${sortOrder === 'asc' ? 'Ascending' : 'Descending'})`}
          >
            <ArrowUpDown size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Date</span>
          </button>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-slate-800 transition-all active:scale-95"
          >
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden pb-4">
        <KanbanColumn status="ToDo" title="To Do" icon={<Circle size={14}/>} />
        <KanbanColumn status="InProgress" title="In Progress" icon={<Clock size={14}/>} />
        <KanbanColumn status="Done" title="Completed" icon={<CheckCircle2 size={14}/>} />
      </div>

      {/* Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-3xl p-8 border-4 border-white animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{editingId ? 'Edit Task' : 'Create New Task'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all">
                <X size={20}/>
              </button>
            </div>
            
            <form onSubmit={handleSaveTask} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Title <span className="text-red-500">*</span></label>
                <input 
                  required
                  type="text" 
                  className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-violet-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm text-slate-700"
                  placeholder="Task summary..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Description</label>
                <textarea 
                  className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-violet-500 focus:bg-white rounded-2xl outline-none transition-all font-medium text-sm text-slate-700 resize-none h-24"
                  placeholder="Details..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Category</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-violet-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm text-slate-700"
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as any)}
                  >
                    <option value="General">General</option>
                    <option value="Inspection">Inspection</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Training">Training</option>
                    <option value="Audit">Audit</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Priority</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-violet-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm text-slate-700"
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Calendar size={12} className={newTaskDueDate ? "text-indigo-500" : ""} />
                    {newTaskCategory === 'Inspection' ? 'Inspection Date' : 'Due Date'}
                  </label>
                  <input 
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full p-4 bg-slate-50 border-2 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm text-slate-700 ${newTaskDueDate ? 'border-indigo-100' : 'border-transparent focus:border-violet-500'}`}
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                  />
                </div>
                <div className="relative">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Bell size={12} className={newTaskReminder ? "text-amber-500" : ""} /> Set Reminder
                    </label>
                    <div className="relative">
                        <input 
                          type="datetime-local"
                          min={new Date().toISOString().slice(0, 16)}
                          className={`w-full p-4 bg-slate-50 border-2 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm text-slate-700 ${newTaskReminder ? 'border-amber-200 bg-amber-50/30' : 'border-transparent focus:border-violet-500'}`}
                          value={newTaskReminder}
                          onChange={(e) => setNewTaskReminder(e.target.value)}
                        />
                        {newTaskReminder && (
                            <button 
                                type="button"
                                onClick={() => setNewTaskReminder('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                                title="Clear Reminder"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>
              </div>

              {/* Status Field - Added for Update functionality */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Status</label>
                <select 
                  className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-violet-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm text-slate-700"
                  value={newTaskStatus}
                  onChange={(e) => setNewTaskStatus(e.target.value as any)}
                >
                  <option value="ToDo">To Do</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Assignee</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-violet-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm text-slate-700"
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                />
              </div>

              <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Dependencies</label>
                  <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 max-h-40 overflow-y-auto space-y-2">
                      {tasks.length > 0 ? tasks.filter(t => t.id !== editingId).map(t => (
                          <div key={t.id} className="flex items-center gap-3">
                              <button 
                                type="button"
                                onClick={() => toggleDependency(t.id)}
                                className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all ${
                                    newTaskDependencies.includes(t.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                                }`}
                              >
                                  {newTaskDependencies.includes(t.id) && <CheckCircle2 size={12}/>}
                              </button>
                              <div>
                                  <p className="text-xs font-bold text-slate-700">{t.title}</p>
                                  <p className="text-[9px] text-slate-400">{t.id} • {t.status}</p>
                              </div>
                          </div>
                      )) : (
                          <p className="text-xs text-slate-400 italic">No other tasks available.</p>
                      )}
                  </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-4 rounded-2xl text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="flex-1 bg-violet-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-violet-700 transition active:scale-95">{editingId ? 'Update Task' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskModule;
