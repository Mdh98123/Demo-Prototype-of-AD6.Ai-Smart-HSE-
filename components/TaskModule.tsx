
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../types';
import { useUser } from '../contexts/UserContext';
import {
  CheckSquare, Plus, Calendar, User, Flag, ArrowRight,
  MoreVertical, Trash2, CheckCircle2, Clock, ListFilter,
  Layout, Search, Filter, LayoutGrid, List as ListIcon, Loader2,
  UserCheck, X, AlertCircle, Edit, Link, Lock, Share2
} from 'lucide-react';

const TaskModule: React.FC = () => {
  const { currentUser, users } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewState, setViewState] = useState<'List' | 'Kanban'>('Kanban');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [filterPriority, setFilterPriority] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [filterAssignee, setFilterAssignee] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newTaskCategory, setNewTaskCategory] = useState<Task['category']>('General');
  const [newTaskAssignee, setNewTaskAssignee] = useState(currentUser.id);
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskReminder, setNewTaskReminder] = useState('');
  const [newTaskDependencies, setNewTaskDependencies] = useState<string[]>([]);
  
  // Validation State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // RBAC
  const canCreateTask = useMemo(() => {
      const allowedRoles = ['ADMIN', 'Head_Group_HSE', 'Regional_HSE_Director', 'Site_HSE_Manager', 'HSE_Officer', 'Site_Supervisor', 'Project_Manager'];
      return allowedRoles.includes(currentUser.role);
  }, [currentUser.role]);

  useEffect(() => {
    const savedTasks = localStorage.getItem('hse_tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
        // Mock initial tasks
        const initialTasks: Task[] = [
            {
                id: 'T-101',
                title: 'Review Audit Findings - Zone A',
                description: 'Verify corrective actions for fire extinguisher blockage.',
                assignee: currentUser.id,
                priority: 'High',
                category: 'Audit',
                status: 'ToDo',
                dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                createdAt: new Date().toISOString(),
                createdBy: 'System',
                dependencies: []
            },
            {
                id: 'T-102',
                title: 'Monthly Site Inspection',
                description: 'Conduct full site walk-through focusing on PPE compliance.',
                assignee: 'u5',
                priority: 'Medium',
                category: 'Inspection',
                status: 'InProgress',
                dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
                createdAt: new Date().toISOString(),
                createdBy: 'u4',
                dependencies: []
            },
            {
                id: 'T-103',
                title: 'Update Emergency Contacts',
                description: 'Refresh the emergency contact list at all muster points.',
                assignee: 'u10',
                priority: 'Low',
                category: 'General',
                status: 'Done',
                dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
                createdAt: new Date().toISOString(),
                createdBy: 'u2',
                dependencies: []
            },
            {
                id: 'T-104',
                title: 'Crane Certification Renewal',
                description: 'Ensure third-party certification for Tower Crane 04 is updated.',
                assignee: 'u7',
                priority: 'High',
                category: 'Maintenance',
                status: 'ToDo',
                dueDate: new Date(Date.now() + 432000000).toISOString().split('T')[0],
                createdAt: new Date().toISOString(),
                createdBy: 'u4',
                dependencies: []
            },
            {
                id: 'T-105',
                title: 'H2S Training Refresher',
                description: 'Schedule training session for Team B.',
                assignee: 'u5',
                priority: 'High',
                category: 'Training',
                status: 'ToDo',
                dueDate: new Date(Date.now() + 259200000).toISOString().split('T')[0],
                createdAt: new Date().toISOString(),
                createdBy: 'u3',
                dependencies: ['T-103'] // Depends on Emergency Contacts
            }
        ];
        setTasks(initialTasks);
        localStorage.setItem('hse_tasks', JSON.stringify(initialTasks));
    }
  }, [currentUser.id]);

  const saveTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    localStorage.setItem('hse_tasks', JSON.stringify(updatedTasks));
  };

  const validate = (name: string, value: string) => {
      if (name === "title" && !value.trim()) return "Task title is required.";
      if (name === "dueDate" && !value) return "Due date is required.";
      return "";
  };

  const handleBlur = (field: string, value: string) => {
      setTouched(prev => ({...prev, [field]: true}));
      setErrors(prev => ({...prev, [field]: validate(field, value)}));
  };

  const handleSaveTask = () => {
    const titleError = validate("title", newTaskTitle);
    const dateError = validate("dueDate", newTaskDueDate);
    setErrors({ title: titleError, dueDate: dateError });
    setTouched({ title: true, dueDate: true });

    if (titleError || dateError) return;
    
    setIsSubmitting(true);

    // Simulate network delay for UX
    setTimeout(() => {
        if (editingTaskId) {
            // Update existing task
            const updatedTasks = tasks.map(t => t.id === editingTaskId ? {
                ...t,
                title: newTaskTitle,
                description: newTaskDescription,
                assignee: newTaskAssignee,
                priority: newTaskPriority,
                category: newTaskCategory,
                dueDate: newTaskDueDate,
                reminderDate: newTaskReminder || undefined,
                dependencies: newTaskDependencies,
            } : t);
            saveTasks(updatedTasks);
        } else {
            // Create new task
            const newTask: Task = {
                id: `T-${Date.now()}`,
                title: newTaskTitle,
                description: newTaskDescription,
                assignee: newTaskAssignee,
                priority: newTaskPriority,
                category: newTaskCategory,
                status: 'ToDo',
                dueDate: newTaskDueDate,
                reminderDate: newTaskReminder || undefined,
                createdAt: new Date().toISOString(),
                createdBy: currentUser.id,
                dependencies: newTaskDependencies
            };
            saveTasks([newTask, ...tasks]);
        }

        setShowNewTaskModal(false);
        resetForm();
        setIsSubmitting(false);
    }, 800);
  };

  const handleEditClick = (task: Task) => {
      setNewTaskTitle(task.title);
      setNewTaskDescription(task.description);
      setNewTaskPriority(task.priority);
      setNewTaskCategory(task.category);
      setNewTaskAssignee(task.assignee);
      setNewTaskDueDate(task.dueDate);
      setNewTaskReminder(task.reminderDate || '');
      setNewTaskDependencies(task.dependencies || []);
      setEditingTaskId(task.id);
      setShowNewTaskModal(true);
  };

  const resetForm = () => {
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskPriority('Medium');
      setNewTaskCategory('General');
      setNewTaskAssignee(currentUser.id);
      setNewTaskDueDate('');
      setNewTaskReminder('');
      setNewTaskDependencies([]);
      setEditingTaskId(null);
      setErrors({});
      setTouched({});
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
      const updated = tasks.map(t => t.id === taskId ? { ...t, status } : t);
      saveTasks(updated);
  };

  const deleteTask = (taskId: string) => {
      const updated = tasks.filter(t => t.id !== taskId);
      saveTasks(updated);
  };

  const isTaskBlocked = (task: Task) => {
      if (!task.dependencies || task.dependencies.length === 0) return false;
      const blockers = tasks.filter(t => task.dependencies?.includes(t.id) && t.status !== 'Done');
      return blockers.length > 0;
  };

  const toggleDependency = (id: string) => {
      setNewTaskDependencies(prev => 
          prev.includes(id) ? prev.filter(depId => depId !== id) : [...prev, id]
      );
  };

  const getPriorityColor = (p: string) => {
      switch(p) {
          case 'High': return 'bg-red-50 text-red-700 border-red-200';
          case 'Medium': return 'bg-orange-50 text-orange-700 border-orange-200';
          default: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      }
  };

  const getStatusBadge = (s: string) => {
      switch(s) {
          case 'Done': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
          case 'InProgress': return 'bg-brand-50 text-brand-700 border-brand-200';
          case 'ToDo': return 'bg-slate-100 text-slate-600 border-slate-200';
          default: return 'bg-neutral-50 text-neutral-600 border-neutral-200';
      }
  };

  // Kanban Specific Helpers
  const getKanbanColumnStyles = (status: string) => {
      switch(status) {
          case 'ToDo': return 'bg-slate-50/80 border-slate-200';
          case 'InProgress': return 'bg-brand-50/50 border-brand-200';
          case 'Done': return 'bg-emerald-50/50 border-emerald-200';
          default: return 'bg-slate-50';
      }
  };

  const getKanbanHeaderStyles = (status: string) => {
      switch(status) {
          case 'ToDo': return 'text-slate-600 border-b-slate-200 bg-slate-100/50';
          case 'InProgress': return 'text-brand-700 border-b-brand-200 bg-brand-100/40';
          case 'Done': return 'text-emerald-700 border-b-emerald-200 bg-emerald-100/40';
          default: return 'text-slate-600';
      }
  };

  const getCardStatusIndicator = (status: string, isBlocked: boolean) => {
      if (isBlocked) return 'border-l-4 border-l-red-500 bg-red-50/10';
      
      switch(status) {
          case 'ToDo': return 'border-l-4 border-l-slate-400';
          case 'InProgress': return 'border-l-4 border-l-brand-500';
          case 'Done': return 'border-l-4 border-l-emerald-500';
          default: return 'border-l-4 border-l-slate-200';
      }
  };

  const filteredTasks = tasks.filter(t => {
      const matchPriority = filterPriority === 'All' ? true : t.priority === filterPriority;
      const matchAssignee = filterAssignee === 'All' ? true : t.assignee === filterAssignee;
      const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchPriority && matchAssignee && matchSearch;
  });

  const toggleMyTasks = () => {
      if (filterAssignee === currentUser.id) {
          setFilterAssignee('All');
      } else {
          setFilterAssignee(currentUser.id);
      }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-slide-up pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-200 pb-6">
          <div className="flex items-center space-x-5">
            <div className="bg-brand-600 p-5 rounded-lg text-white shadow-xl shadow-brand-500/20">
                <CheckSquare size={32} />
            </div>
            <div>
                <h2 className="text-3xl font-bold text-neutral-800 tracking-tight leading-none">Task Command</h2>
                <p className="text-neutral-500 text-xs font-semibold uppercase tracking-widest mt-2 border-l-2 border-brand-500 pl-4">Operational Assignments & Follow-ups</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
              <div className="flex bg-neutral-100 p-1 rounded-lg border border-neutral-200">
                  <button 
                    onClick={() => setViewState('List')}
                    className={`p-2 rounded transition-all duration-200 ${viewState === 'List' ? 'bg-white text-brand-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                    title="List View"
                  >
                      <ListIcon size={18} />
                  </button>
                  <button 
                    onClick={() => setViewState('Kanban')}
                    className={`p-2 rounded transition-all duration-200 ${viewState === 'Kanban' ? 'bg-white text-brand-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                    title="Kanban Board"
                  >
                      <LayoutGrid size={18} />
                  </button>
              </div>

              {/* Text Search */}
              <div className="relative group w-40 md:w-48">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-brand-500 transition-colors">
                      <Search size={16} />
                  </div>
                  <input 
                      type="text" 
                      placeholder="Search tasks..."
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-neutral-200 rounded-lg text-xs font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-2 flex items-center text-neutral-400 hover:text-red-500"
                      >
                          <X size={14}/>
                      </button>
                  )}
              </div>
              
              {/* Quick Filter: My Tasks */}
              <button
                  onClick={toggleMyTasks}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-bold uppercase tracking-wide transition-all shadow-sm ${
                      filterAssignee === currentUser.id
                      ? 'bg-brand-50 border-brand-200 text-brand-700'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
              >
                  <UserCheck size={16} /> My Tasks
              </button>
              
              {/* Assignee Dropdown */}
              <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-brand-500 transition-colors">
                      <User size={16} />
                  </div>
                  <select 
                      className={`pl-10 pr-8 py-2.5 bg-white border rounded-lg text-xs font-bold uppercase tracking-wide outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 appearance-none cursor-pointer hover:bg-neutral-50 transition-all shadow-sm ${
                          filterAssignee !== 'All' && filterAssignee !== currentUser.id ? 'border-brand-300 text-brand-700 bg-brand-50/30' : 'border-neutral-200 text-neutral-600'
                      }`}
                      value={filterAssignee}
                      onChange={(e) => setFilterAssignee(e.target.value)}
                  >
                      <option value="All">All Team</option>
                      {users.map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                  </select>
              </div>

              <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-brand-500 transition-colors">
                      <Filter size={16} />
                  </div>
                  <select 
                      className="pl-10 pr-8 py-2.5 bg-white border border-neutral-200 rounded-lg text-xs font-bold uppercase tracking-wide outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-neutral-600 appearance-none cursor-pointer hover:bg-neutral-50 transition-all shadow-sm"
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value as any)}
                  >
                      <option value="All">Priority</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                  </select>
              </div>
              
              {canCreateTask && (
                  <button 
                    onClick={() => { resetForm(); setShowNewTaskModal(true); }}
                    className="bg-neutral-900 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold uppercase text-xs tracking-wider shadow-lg hover:bg-neutral-800 transition-all active:scale-95 hover:shadow-xl ml-2"
                  >
                      <Plus size={16} /> Assign
                  </button>
              )}
          </div>
      </div>

      {viewState === 'Kanban' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              {['ToDo', 'InProgress', 'Done'].map(status => (
                  <div key={status} className={`rounded-xl border flex flex-col h-[calc(100vh-300px)] ${getKanbanColumnStyles(status)}`}>
                      <div className={`p-4 border-b flex justify-between items-center rounded-t-xl backdrop-blur-sm ${getKanbanHeaderStyles(status)}`}>
                          <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${status === 'ToDo' ? 'bg-slate-400' : status === 'InProgress' ? 'bg-brand-500' : 'bg-emerald-500'}`}></div>
                              <h3 className="text-xs font-black uppercase tracking-widest">{status.replace(/([A-Z])/g, ' $1').trim()}</h3>
                          </div>
                          <span className="bg-white/80 px-2.5 py-0.5 rounded-md text-[10px] font-bold shadow-sm border border-black/5">
                              {filteredTasks.filter(t => t.status === status).length}
                          </span>
                      </div>
                      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                          <AnimatePresence mode="popLayout">
                              {filteredTasks.filter(t => t.status === status).map(task => {
                                  const isBlocked = isTaskBlocked(task);
                                  const blockers = isBlocked ? tasks.filter(t => task.dependencies?.includes(t.id) && t.status !== 'Done') : [];
                                  
                                  return (
                                    <motion.div 
                                        key={task.id}
                                        layout
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                        className={`bg-white p-4 rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow duration-300 group cursor-default ${getCardStatusIndicator(task.status, isBlocked)}`}
                                    >
                                        {isBlocked && (
                                            <div className="mb-2 flex items-center gap-1.5 text-red-600 bg-red-50 px-2 py-1 rounded text-[10px] font-bold uppercase w-fit border border-red-100">
                                                <Lock size={10} /> Blocked
                                            </div>
                                        )}
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex flex-wrap gap-2">
                                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border ${getStatusBadge(task.status)}`}>{task.status.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                <span className="bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border border-neutral-200 tracking-wider">
                                                    {task.category}
                                                </span>
                                            </div>
                                            {status === 'Done' ? (
                                                <div className="text-emerald-500 bg-emerald-50 p-1 rounded-full"><CheckCircle2 size={14}/></div>
                                            ) : (
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                                                    <button onClick={() => handleEditClick(task)} className="p-1.5 bg-neutral-50 text-neutral-400 rounded hover:bg-brand-50 hover:text-brand-600 transition-colors shadow-sm" title="Edit"><Edit size={14}/></button>
                                                    {status === 'ToDo' && !isBlocked && (
                                                        <button onClick={() => updateTaskStatus(task.id, 'InProgress')} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 hover:text-blue-700 transition-colors shadow-sm" title="Start"><ArrowRight size={14}/></button>
                                                    )}
                                                    {status === 'InProgress' && (
                                                        <button onClick={() => updateTaskStatus(task.id, 'Done')} className="p-1.5 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 hover:text-emerald-700 transition-colors shadow-sm" title="Complete"><CheckCircle2 size={14}/></button>
                                                    )}
                                                    <button onClick={() => deleteTask(task.id)} className="p-1.5 bg-neutral-50 text-neutral-400 rounded hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm" title="Delete"><Trash2 size={14}/></button>
                                                </div>
                                            )}
                                        </div>
                                        <h4 className="font-bold text-neutral-800 text-sm leading-snug mb-1 group-hover:text-brand-600 transition-colors">{task.title}</h4>
                                        <p className="text-xs text-neutral-500 line-clamp-2 mb-3 leading-relaxed">{task.description}</p>
                                        
                                        {blockers.length > 0 && (
                                            <div className="mb-3 p-2 bg-slate-50 border border-slate-100 rounded-md">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase mb-1">
                                                    <Link size={10} /> Waiting on:
                                                </div>
                                                {blockers.map(b => (
                                                    <div key={b.id} className="text-[10px] text-red-500 font-medium truncate">• {b.title}</div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-3 border-t border-neutral-50">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-600 border border-neutral-200 ring-2 ring-white">
                                                    {users.find(u => u.id === task.assignee)?.name.charAt(0) || '?'}
                                                </div>
                                                <span className="text-[10px] font-bold text-neutral-400 uppercase truncate max-w-[80px]">
                                                    {users.find(u => u.id === task.assignee)?.name.split(' ')[0]}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <div className={`flex items-center gap-1 text-[10px] font-bold uppercase ${new Date(task.dueDate) < new Date() && status !== 'Done' ? 'text-red-500' : 'text-neutral-400'}`}>
                                                    <Calendar size={12}/> {new Date(task.dueDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                  );
                              })}
                          </AnimatePresence>
                          {filteredTasks.filter(t => t.status === status).length === 0 && (
                              <div className="h-full flex flex-col items-center justify-center text-neutral-400/50 italic text-[10px] font-bold uppercase tracking-widest border-2 border-dashed border-neutral-200/50 rounded-xl m-2 min-h-[100px]">
                                  No tasks
                              </div>
                          )}
                      </div>
                  </div>
              ))}
          </div>
      ) : (
          <div className="bg-white rounded-xl shadow-card border border-neutral-200 overflow-hidden animate-fade-in">
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-neutral-50 text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-b border-neutral-200">
                          <tr>
                              <th className="px-6 py-4">Task Details</th>
                              <th className="px-6 py-4">Category</th>
                              <th className="px-6 py-4">Priority</th>
                              <th className="px-6 py-4">Assignee</th>
                              <th className="px-6 py-4">Status</th>
                              <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                          <AnimatePresence mode="popLayout">
                              {filteredTasks.length > 0 ? filteredTasks.map(task => {
                                  const isBlocked = isTaskBlocked(task);
                                  return (
                                  <motion.tr 
                                      key={task.id} 
                                      layout
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      exit={{ opacity: 0 }}
                                      className="hover:bg-neutral-50 transition-colors group"
                                  >
                                      <td className="px-6 py-4">
                                          <div className="flex items-center gap-2">
                                              {isBlocked && <Lock size={14} className="text-red-500"/>}
                                              <p className="font-semibold text-neutral-800 text-sm group-hover:text-brand-600 transition-colors">{task.title}</p>
                                          </div>
                                          <p className="text-xs text-neutral-500 truncate max-w-xs">{task.description}</p>
                                          {new Date(task.dueDate) < new Date() && task.status !== 'Done' && (
                                              <span className="text-[10px] font-bold text-red-500 flex items-center gap-1 mt-1"><Clock size={10}/> Overdue: {task.dueDate}</span>
                                          )}
                                      </td>
                                      <td className="px-6 py-4">
                                          <span className="bg-neutral-100 text-neutral-600 px-2 py-1 rounded text-[10px] font-bold uppercase border border-neutral-200">
                                              {task.category}
                                          </span>
                                      </td>
                                      <td className="px-6 py-4">
                                          <span className={`px-2 py-1 rounded text-[9px] font-black uppercase border ${getPriorityColor(task.priority)}`}>
                                              {task.priority}
                                          </span>
                                      </td>
                                      <td className="px-6 py-4">
                                          <div className="flex items-center gap-2">
                                              <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-600">
                                                  {users.find(u => u.id === task.assignee)?.name.charAt(0) || '?'}
                                              </div>
                                              <span className="text-xs font-medium text-neutral-600">
                                                  {users.find(u => u.id === task.assignee)?.name}
                                              </span>
                                          </div>
                                      </td>
                                      <td className="px-6 py-4">
                                          <span className={`px-2 py-1 rounded text-[9px] font-black uppercase border ${getStatusBadge(task.status)}`}>
                                              {task.status.replace(/([A-Z])/g, ' $1').trim()}
                                          </span>
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                          <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                              <button 
                                                onClick={() => handleEditClick(task)}
                                                className="p-2 bg-neutral-100 text-neutral-500 rounded hover:bg-brand-50 hover:text-brand-600 transition-colors"
                                                title="Edit"
                                              >
                                                  <Edit size={16}/>
                                              </button>
                                              {task.status !== 'Done' && !isBlocked && (
                                                  <button 
                                                    onClick={() => updateTaskStatus(task.id, task.status === 'ToDo' ? 'InProgress' : 'Done')}
                                                    className="p-2 bg-brand-50 text-brand-600 rounded hover:bg-brand-100 transition-colors"
                                                    title={task.status === 'ToDo' ? "Start" : "Complete"}
                                                  >
                                                      {task.status === 'ToDo' ? <ArrowRight size={16}/> : <CheckCircle2 size={16}/>}
                                                  </button>
                                              )}
                                              <button 
                                                onClick={() => deleteTask(task.id)}
                                                className="p-2 bg-neutral-100 text-neutral-500 rounded hover:bg-red-50 hover:text-red-600 transition-colors"
                                                title="Delete"
                                              >
                                                  <Trash2 size={16}/>
                                              </button>
                                          </div>
                                      </td>
                                  </motion.tr>
                              )}) : (
                                  <tr><td colSpan={6} className="px-8 py-12 text-center text-neutral-400 italic text-xs font-bold uppercase tracking-widest">No tasks match filter</td></tr>
                              )}
                          </AnimatePresence>
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {showNewTaskModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl p-8 border border-neutral-100 animate-zoom-in max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-neutral-800 uppercase tracking-tight">{editingTaskId ? 'Edit Assignment' : 'New Assignment'}</h3>
                      <button onClick={() => { setShowNewTaskModal(false); resetForm(); }} className="p-2 hover:bg-neutral-100 rounded-full transition-colors"><Trash2 className="text-neutral-400" size={20}/></button>
                  </div>
                  
                  <div className="space-y-5">
                      <div>
                          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Task Title <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            className={`w-full p-3 bg-neutral-50 border rounded-lg outline-none transition-all font-medium text-sm text-neutral-800 placeholder:text-neutral-400 ${errors.title ? 'border-red-500 focus:ring-red-500 bg-red-50/10' : touched.title && newTaskTitle ? 'border-emerald-500 focus:border-emerald-500 bg-emerald-50/5' : 'border-neutral-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10'}`}
                            placeholder="e.g. Inspect Generator B"
                            value={newTaskTitle}
                            onChange={(e) => {
                                setNewTaskTitle(e.target.value);
                                if(touched.title) setErrors(prev => ({...prev, title: validate('title', e.target.value)}));
                            }}
                            onBlur={() => handleBlur('title', newTaskTitle)}
                            autoFocus
                          />
                          {errors.title && <p className="text-red-500 text-xs font-bold mt-1 ml-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.title}</p>}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                          <div>
                              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Category</label>
                              <select 
                                className="w-full p-3 bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-lg outline-none transition-all font-medium text-sm text-neutral-800"
                                value={newTaskCategory}
                                onChange={(e) => setNewTaskCategory(e.target.value as any)}
                              >
                                  <option value="General">General</option>
                                  <option value="Inspection">Inspection</option>
                                  <option value="Maintenance">Maintenance</option>
                                  <option value="Audit">Audit</option>
                                  <option value="Training">Training</option>
                              </select>
                          </div>
                          <div>
                              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Priority</label>
                              <select 
                                className={`w-full p-3 border rounded-lg outline-none transition-all font-medium text-sm focus:ring-4 focus:ring-brand-500/10 ${newTaskPriority === 'High' ? 'bg-red-50 text-red-900 border-red-100' : 'bg-neutral-50 border-neutral-200 focus:bg-white focus:border-brand-500 text-neutral-800'}`}
                                value={newTaskPriority}
                                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                              >
                                  <option value="Low">Low</option>
                                  <option value="Medium">Medium</option>
                                  <option value="High">High</option>
                              </select>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                          <div>
                              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Assignee</label>
                              <select 
                                className="w-full p-3 bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-lg outline-none transition-all font-medium text-sm text-neutral-800"
                                value={newTaskAssignee}
                                onChange={(e) => setNewTaskAssignee(e.target.value)}
                              >
                                  {users.map(u => (
                                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                  ))}
                              </select>
                          </div>
                          <div>
                              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Due Date <span className="text-red-500">*</span></label>
                              <input 
                                type="date"
                                className={`w-full p-3 bg-neutral-50 border rounded-lg outline-none transition-all font-medium text-sm text-neutral-800 ${errors.dueDate ? 'border-red-500 focus:ring-red-500 bg-red-50/10' : touched.dueDate && newTaskDueDate ? 'border-emerald-500 bg-emerald-50/5' : 'border-neutral-200 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10'}`}
                                value={newTaskDueDate}
                                onChange={(e) => {
                                    setNewTaskDueDate(e.target.value);
                                    if(touched.dueDate) setErrors(prev => ({...prev, dueDate: validate('dueDate', e.target.value)}));
                                }}
                                onBlur={() => handleBlur('dueDate', newTaskDueDate)}
                              />
                              {errors.dueDate && <p className="text-red-500 text-xs font-bold mt-1 ml-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.dueDate}</p>}
                          </div>
                      </div>

                      <div>
                          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Prerequisites (Dependencies)</label>
                          <div className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg max-h-40 overflow-y-auto custom-scrollbar">
                              {tasks.length > 0 ? tasks
                                  .filter(t => t.id !== editingTaskId && t.status !== 'Done') // Can't block on self or done items
                                  .map(task => (
                                  <label key={task.id} className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer transition-colors">
                                      <input 
                                          type="checkbox" 
                                          checked={newTaskDependencies.includes(task.id)}
                                          onChange={() => toggleDependency(task.id)}
                                          className="rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
                                      />
                                      <div className="flex-1 overflow-hidden">
                                          <p className="text-xs font-bold text-neutral-700 truncate">{task.title}</p>
                                          <p className="text-[10px] text-neutral-400 font-mono">{task.id}</p>
                                      </div>
                                      <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                                  </label>
                              )) : (
                                  <p className="text-xs text-neutral-400 italic text-center py-4">No available active tasks to link.</p>
                              )}
                          </div>
                          <p className="text-[10px] text-neutral-400 mt-1">Select tasks that must be completed before this one can start.</p>
                      </div>

                      <div>
                          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Set Reminder (Optional)</label>
                          <div className="relative">
                              <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"/>
                              <input 
                                type="datetime-local"
                                className="w-full pl-10 p-3 bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-lg outline-none transition-all font-medium text-sm text-neutral-800"
                                value={newTaskReminder}
                                onChange={(e) => setNewTaskReminder(e.target.value)}
                              />
                          </div>
                      </div>

                      <div>
                          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Description</label>
                          <textarea 
                            className="w-full p-3 bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-lg outline-none transition-all font-medium text-sm text-neutral-800 h-24 resize-none placeholder:text-neutral-400"
                            placeholder="Add specific instructions..."
                            value={newTaskDescription}
                            onChange={(e) => setNewTaskDescription(e.target.value)}
                          />
                      </div>

                      <div className="flex gap-4 pt-4 border-t border-neutral-100">
                          <button onClick={() => { setShowNewTaskModal(false); resetForm(); }} className="px-6 py-3 rounded-lg text-neutral-500 font-bold uppercase tracking-widest text-xs hover:bg-neutral-50 transition-colors">Cancel</button>
                          <button 
                            onClick={handleSaveTask} 
                            disabled={isSubmitting} 
                            className="flex-1 bg-brand-600 text-white py-3 rounded-lg font-bold uppercase tracking-widest text-xs shadow-lg hover:bg-brand-700 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : (editingTaskId ? 'Save Changes' : 'Create Assignment')}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default TaskModule;
