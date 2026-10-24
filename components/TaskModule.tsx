
import { AITag } from './AITag';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../types';
import { useUser } from '../contexts/UserContext';
import { suggestTaskDetails } from '../services/geminiService';
import {
  CheckSquare, Plus, Calendar, User, Flag, ArrowRight,
  MoreVertical, Trash2, CheckCircle2, Clock, ListFilter,
  Layout, Search, Filter, LayoutGrid, List as ListIcon, Loader2,
  UserCheck, X, AlertCircle, Edit, Link, Lock, Share2,
  ChevronLeft, ChevronRight, GitMerge, Sparkles
} from 'lucide-react';

const TaskModule: React.FC = () => {
  const { currentUser, users } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewState, setViewState] = useState<'List' | 'Kanban' | 'Calendar' | 'Dependencies'>('Kanban');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

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
  const [newTaskAiContext, setNewTaskAiContext] = useState('');
  const [isAiPredicting, setIsAiPredicting] = useState(false);
  
  const [filterDue, setFilterDue] = useState<'All' | 'DueToday' | 'Overdue'>('All');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [inlineEditingTask, setInlineEditingTask] = useState<{ id: string, title: string, description: string } | null>(null);

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
                title: 'Task for Inspection - 1',
                description: 'Generated task description for Inspection. Action required.',
                assignee: 'u4',
                priority: 'Medium',
                category: 'Inspection',
                status: 'InProgress',
                dueDate: '2026-07-23',
                createdAt: '2026-05-29T18:27:00.615Z',
                createdBy: 'System',
                dependencies: []
            },
            {
                id: 'T-102',
                title: 'Task for Incident - 2',
                description: 'Generated task description for Incident. Action required.',
                assignee: 'u5',
                priority: 'High',
                category: 'General',
                status: 'Done',
                dueDate: '2026-07-26',
                createdAt: '2026-04-29T05:50:39.348Z',
                createdBy: 'System',
                dependencies: []
            },
            {
                id: 'T-103',
                title: 'Task for Incident - 3',
                description: 'Generated task description for Incident. Action required.',
                assignee: 'u6',
                priority: 'Low',
                category: 'General',
                status: 'InProgress',
                dueDate: '2026-07-21',
                createdAt: '2026-05-01T18:22:40.217Z',
                createdBy: 'System',
                dependencies: []
            },
            {
                id: 'T-104',
                title: 'Task for Inspection - 4',
                description: 'Generated task description for Inspection. Action required.',
                assignee: 'u7',
                priority: 'Medium',
                category: 'Inspection',
                status: 'InProgress',
                dueDate: '2026-07-17',
                createdAt: '2026-06-03T17:43:56.898Z',
                createdBy: 'System',
                dependencies: []
            },
            {
                id: 'T-105',
                title: 'Task for Incident - 5',
                description: 'Generated task description for Incident. Action required.',
                assignee: 'u3',
                priority: 'Low',
                category: 'General',
                status: 'InProgress',
                dueDate: '2026-07-19',
                createdAt: '2026-05-24T04:32:35.764Z',
                createdBy: 'System',
                dependencies: []
            },
            {
                id: 'T-106',
                title: 'Task for Audit - 6',
                description: 'Generated task description for Audit. Action required.',
                assignee: 'u4',
                priority: 'Low',
                category: 'Audit',
                status: 'InProgress',
                dueDate: '2026-07-22',
                createdAt: '2026-06-04T04:56:52.782Z',
                createdBy: 'System',
                dependencies: []
            },
            {
                id: 'T-107',
                title: 'Task for Inspection - 7',
                description: 'Generated task description for Inspection. Action required.',
                assignee: 'u5',
                priority: 'High',
                category: 'Inspection',
                status: 'Done',
                dueDate: '2026-07-27',
                createdAt: '2026-06-10T17:05:22.856Z',
                createdBy: 'System',
                dependencies: []
            },
            {
                id: 'T-108',
                title: 'Task for General - 8',
                description: 'Generated task description for General. Action required.',
                assignee: 'u6',
                priority: 'Medium',
                category: 'General',
                status: 'InProgress',
                dueDate: '2026-07-18',
                createdAt: '2026-06-08T22:23:03.970Z',
                createdBy: 'System',
                dependencies: []
            },
            {
                id: 'T-109',
                title: 'Task for General - 9',
                description: 'Generated task description for General. Action required.',
                assignee: 'u7',
                priority: 'Medium',
                category: 'General',
                status: 'Done',
                dueDate: '2026-07-22',
                createdAt: '2026-07-11T03:22:57.888Z',
                createdBy: 'System',
                dependencies: []
            },
            {
                id: 'T-110',
                title: 'Task for Inspection - 10',
                description: 'Generated task description for Inspection. Action required.',
                assignee: 'u3',
                priority: 'High',
                category: 'Inspection',
                status: 'InProgress',
                dueDate: '2026-07-23',
                createdAt: '2026-05-02T18:40:17.955Z',
                createdBy: 'System',
                dependencies: []
            },
            {
                id: 'T-111',
                title: 'Task for General - 11',
                description: 'Generated task description for General. Action required.',
                assignee: 'u4',
                priority: 'Medium',
                category: 'General',
                status: 'Done',
                dueDate: '2026-07-17',
                createdAt: '2026-06-27T15:02:35.853Z',
                createdBy: 'System',
                dependencies: []
            },
            {
                id: 'T-112',
                title: 'Task for Inspection - 12',
                description: 'Generated task description for Inspection. Action required.',
                assignee: 'u5',
                priority: 'High',
                category: 'Inspection',
                status: 'Done',
                dueDate: '2026-07-27',
                createdAt: '2026-05-29T06:27:57.727Z',
                createdBy: 'System',
                dependencies: []
            },
            {
                id: 'T-113',
                title: 'Task for General - 13',
                description: 'Generated task description for General. Action required.',
                assignee: 'u6',
                priority: 'Medium',
                category: 'General',
                status: 'InProgress',
                dueDate: '2026-07-25',
                createdAt: '2026-06-27T06:40:21.246Z',
                createdBy: 'System',
                dependencies: []
            },
            {
                id: 'T-114',
                title: 'Task for General - 14',
                description: 'Generated task description for General. Action required.',
                assignee: 'u7',
                priority: 'High',
                category: 'General',
                status: 'InProgress',
                dueDate: '2026-07-17',
                createdAt: '2026-06-08T16:51:51.742Z',
                createdBy: 'System',
                dependencies: []
            },
            {
                id: 'T-115',
                title: 'Task for Incident - 15',
                description: 'Generated task description for Incident. Action required.',
                assignee: 'u3',
                priority: 'High',
                category: 'General',
                status: 'ToDo',
                dueDate: '2026-07-15',
                createdAt: '2026-06-14T08:32:06.001Z',
                createdBy: 'System',
                dependencies: []
            },
            {
                id: 'T-116',
                title: 'Task for General - 16',
                description: 'Generated task description for General. Action required.',
                assignee: 'u4',
                priority: 'Low',
                category: 'General',
                status: 'Done',
                dueDate: '2026-07-26',
                createdAt: '2026-05-30T14:37:27.965Z',
                createdBy: 'System',
                dependencies: []
            },
            {
                id: 'T-117',
                title: 'Task for General - 17',
                description: 'Generated task description for General. Action required.',
                assignee: 'u5',
                priority: 'Low',
                category: 'General',
                status: 'InProgress',
                dueDate: '2026-07-16',
                createdAt: '2026-07-12T05:19:38.520Z',
                createdBy: 'System',
                dependencies: []
            },
            {
                id: 'T-118',
                title: 'Task for Incident - 18',
                description: 'Generated task description for Incident. Action required.',
                assignee: 'u6',
                priority: 'Medium',
                category: 'General',
                status: 'InProgress',
                dueDate: '2026-07-16',
                createdAt: '2026-07-12T02:55:36.106Z',
                createdBy: 'System',
                dependencies: []
            }
        ];
        setTasks(initialTasks);
        localStorage.setItem('hse_tasks', JSON.stringify(initialTasks));
    }
  }, [currentUser.id]);

  const saveTasks = (updatedTasks: Task[]) => {
    let tasksList = [...updatedTasks];
    
    const checkBlockers = (list: Task[]) => {
        let changed = false;
        const out = list.map(t => {
            if (!t.dependencies || t.dependencies.length === 0) {
               if(t.status === 'Blocked') { changed = true; return {...t, status: 'ToDo' as Task['status']}; }
               return t;
            }
            const hasBlockers = list.some(blocker => t.dependencies!.includes(blocker.id) && blocker.status !== 'Done');
            if (hasBlockers && t.status !== 'Blocked') {
                changed = true; return {...t, status: 'Blocked' as Task['status']};
            } else if (!hasBlockers && t.status === 'Blocked') {
                changed = true; return {...t, status: 'ToDo' as Task['status']};
            }
            return t;
        });
        return { out, changed };
    };

    let result = checkBlockers(tasksList);
    while (result.changed) {
        result = checkBlockers(result.out);
    }
    
    setTasks(result.out);
    localStorage.setItem('hse_tasks', JSON.stringify(result.out));
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

  const handleAiSuggest = async () => {
      if (!newTaskTitle.trim()) return;
      setIsAiPredicting(true);
      try {
          const availableAssignees = users.map(u => `${u.name} (${u.role})`);
          const suggestion = await suggestTaskDetails(newTaskTitle, newTaskAiContext, availableAssignees);
          
          if (suggestion.title) setNewTaskTitle(suggestion.title);
          if (suggestion.description) setNewTaskDescription(suggestion.description);
          if (suggestion.priority) setNewTaskPriority(suggestion.priority);
          // Only set valid category
          const validCategories = ['General', 'Audit', 'Inspection', 'General', 'Maintenance', 'Training'];
          if (suggestion.category && validCategories.includes(suggestion.category)) {
              setNewTaskCategory(suggestion.category as any);
          }
          
          if (suggestion.assignee) {
              const matchedUser = users.find(u => `${u.name} (${u.role})` === suggestion.assignee);
              if (matchedUser) setNewTaskAssignee(matchedUser.id);
          }
      } catch (e) {
          console.error("AI Suggestion failed", e);
      } finally {
          setIsAiPredicting(false);
      }
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
      setNewTaskAiContext('');
      setEditingTaskId(null);
      setErrors({});
      setTouched({});
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
      const task = tasks.find(t => t.id === taskId);
      if (task && isTaskBlocked(task) && status !== 'Blocked') {
          return; // Prevent updating a blocked task to anything other than blocked
      }
      const updated = tasks.map(t => t.id === taskId ? { ...t, status } : t);
      saveTasks(updated);
  };

  const deleteTask = (taskId: string) => {
      const updated = tasks.filter(t => t.id !== taskId);
      saveTasks(updated);
  };

  const handleSelectTask = (taskId: string) => {
      setSelectedTaskIds(prev => prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]);
  };

  const handleSelectAll = (allIds: string[]) => {
      if (selectedTaskIds.length === allIds.length) {
          setSelectedTaskIds([]);
      } else {
          setSelectedTaskIds(allIds);
      }
  };

  const handleBulkUpdateStatus = (status: Task['status']) => {
      let changed = false;
      let updated = tasks.map(task => {
          if (selectedTaskIds.includes(task.id)) {
              if (isTaskBlocked(task) && status !== 'Blocked') return task;
              changed = true;
              return { ...task, status };
          }
          return task;
      });
      if (changed) {
          saveTasks(updated);
          setSelectedTaskIds([]);
      }
  };

  const handleBulkDelete = () => {
      if (!window.confirm(`Delete ${selectedTaskIds.length} tasks?`)) return;
      const updated = tasks.filter(t => !selectedTaskIds.includes(t.id));
      saveTasks(updated);
      setSelectedTaskIds([]);
  };

  const startInlineEdit = (task: Task) => {
      setInlineEditingTask({ id: task.id, title: task.title, description: task.description });
  };

  const saveInlineEdit = () => {
      if (!inlineEditingTask) return;
      if (!inlineEditingTask.title.trim()) return;
      
      const updated = tasks.map(t => 
          t.id === inlineEditingTask.id 
          ? { ...t, title: inlineEditingTask.title, description: inlineEditingTask.description } 
          : t
      );
      saveTasks(updated);
      setInlineEditingTask(null);
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
          case 'Blocked': return 'bg-red-50 text-red-700 border-red-200';
          case 'ToDo': return 'bg-slate-100 text-slate-600 border-slate-200';
          default: return 'bg-neutral-50 text-neutral-600 border-neutral-200';
      }
  };

  // Kanban Specific Helpers
  const getKanbanColumnStyles = (status: string) => {
      switch(status) {
          case 'ToDo': return 'glass-panel/80 border-slate-200';
          case 'InProgress': return 'bg-brand-50/50 border-brand-200';
          case 'Blocked': return 'bg-red-50/50 border-red-200';
          case 'Done': return 'bg-emerald-50/50 border-emerald-200';
          default: return 'glass-panel';
      }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
      setDraggedTaskId(taskId);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: Task['status']) => {
      e.preventDefault();
      if (draggedTaskId) {
          updateTaskStatus(draggedTaskId, status);
          setDraggedTaskId(null);
      }
  };

  const getKanbanHeaderStyles = (status: string) => {
      switch(status) {
          case 'ToDo': return 'text-slate-600 border-b-slate-200 bg-slate-100/50';
          case 'InProgress': return 'text-brand-700 border-b-brand-200 bg-brand-100/40';
          case 'Blocked': return 'text-red-700 border-b-red-200 bg-red-100/40';
          case 'Done': return 'text-emerald-700 border-b-emerald-200 bg-emerald-100/40';
          default: return 'text-slate-600';
      }
  };

  const getCardStatusIndicator = (status: string, isBlocked: boolean) => {
      if (isBlocked) return 'border-s-4 border-s-red-500 bg-red-50/10';
      
      switch(status) {
          case 'ToDo': return 'border-s-4 border-s-slate-400';
          case 'InProgress': return 'border-s-4 border-s-brand-500';
          case 'Blocked': return 'border-s-4 border-s-red-500';
          case 'Done': return 'border-s-4 border-s-emerald-500';
          default: return 'border-s-4 border-s-slate-200';
      }
  };

  const filteredTasks = tasks.filter(t => {
      const matchPriority = filterPriority === 'All' ? true : t.priority === filterPriority;
      const matchAssignee = filterAssignee === 'All' ? true : t.assignee === filterAssignee;
      const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchDue = true;
      if (filterDue !== 'All') {
          if (!t.dueDate) {
              matchDue = false;
          } else {
              const todayStr = new Date().toISOString().split('T')[0];
              if (filterDue === 'DueToday') {
                  matchDue = t.dueDate === todayStr;
              } else if (filterDue === 'Overdue') {
                  matchDue = t.dueDate < todayStr && t.status !== 'Done';
              }
          }
      }
      
      return matchPriority && matchAssignee && matchSearch && matchDue;
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
          <div className="flex items-center gap-x-5">
            <div className="bg-brand-600 p-5 rounded-lg text-white shadow-xl shadow-brand-500/20">
                <CheckSquare size={32} />
            </div>
            <div>
                <h2 className="text-3xl font-bold text-neutral-800 tracking-tight leading-none">Task Command</h2>
                <p className="text-neutral-500 text-xs font-semibold uppercase tracking-widest mt-2 border-s-2 border-brand-500 ps-4">Operational Assignments & Follow-ups</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
              <div className="flex bg-neutral-100 p-1 rounded-lg border border-neutral-200">
                  <button 
                    onClick={() => setViewState('List')}
                    className={`p-2 rounded transition-all duration-200 ${viewState === 'List' ? 'glass-card text-brand-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                    title="List View"
                  >
                      <ListIcon size={18} />
                  </button>
                  <button 
                    onClick={() => setViewState('Kanban')}
                    className={`p-2 rounded transition-all duration-200 ${viewState === 'Kanban' ? 'glass-card text-brand-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                    title="Kanban Board"
                  >
                      <LayoutGrid size={18} />
                  </button>
                  <button 
                    onClick={() => setViewState('Calendar')}
                    className={`p-2 rounded transition-all duration-200 ${viewState === 'Calendar' ? 'glass-card text-brand-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                    title="Calendar View"
                  >
                      <Calendar size={18} />
                  </button>
                  <button 
                    onClick={() => setViewState('Dependencies')}
                    className={`p-2 rounded transition-all duration-200 ${viewState === 'Dependencies' ? 'glass-card text-brand-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                    title="Dependency Map"
                  >
                      <GitMerge size={18} />
                  </button>
              </div>

              {/* Text Search */}
              <div className="relative group w-40 md:w-48">
                  <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-brand-500 transition-colors">
                      <Search size={16} />
                  </div>
                  <input 
                      type="text" 
                      placeholder="Search tasks..."
                      className="w-full ps-9 pe-3 py-2.5 glass-card border border-neutral-200 rounded-lg text-xs font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 end-2 flex items-center text-neutral-400 hover:text-red-500"
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
                      : 'glass-card border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
              >
                  <UserCheck size={16} /> My Tasks
              </button>
              
              {/* Assignee Dropdown */}
              <div className="relative group">
                  <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-brand-500 transition-colors">
                      <User size={16} />
                  </div>
                  <select 
                      className={`ps-10 pe-8 py-2.5 glass-card border rounded-lg text-xs font-bold uppercase tracking-wide outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 appearance-none cursor-pointer hover:bg-neutral-50 transition-all shadow-sm ${
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
                  <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-brand-500 transition-colors">
                      <Filter size={16} />
                  </div>
                  <select 
                      className="ps-10 pe-8 py-2.5 glass-card border border-neutral-200 rounded-lg text-xs font-bold uppercase tracking-wide outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-neutral-600 appearance-none cursor-pointer hover:bg-neutral-50 transition-all shadow-sm"
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value as any)}
                  >
                      <option value="All">Priority</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                  </select>
              </div>

              <div className="relative group">
                  <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-brand-500 transition-colors">
                      <Clock size={16} />
                  </div>
                  <select 
                      className={`ps-10 pe-8 py-2.5 glass-card border rounded-lg text-xs font-bold uppercase tracking-wide outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 appearance-none cursor-pointer hover:bg-neutral-50 transition-all shadow-sm ${
                          filterDue !== 'All' ? 'border-brand-300 text-brand-700 bg-brand-50/30' : 'border-neutral-200 text-neutral-600'
                      }`}
                      value={filterDue}
                      onChange={(e) => setFilterDue(e.target.value as any)}
                  >
                      <option value="All">Any Time</option>
                      <option value="DueToday">Due Today</option>
                      <option value="Overdue">Overdue</option>
                  </select>
              </div>
              
              {canCreateTask && (
                  <button 
                    onClick={() => { resetForm(); setShowNewTaskModal(true); }}
                    className="bg-neutral-900 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold uppercase text-xs tracking-wider shadow-lg hover:bg-neutral-800 transition-all active:scale-95 hover:shadow-xl ms-2"
                  >
                      <Plus size={16} /> Assign
                  </button>
              )}
          </div>
      </div>

      {viewState === 'Kanban' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in">
              {(['ToDo', 'InProgress', 'Blocked', 'Done'] as Task['status'][]).map(status => (
                  <div 
                      key={status} 
                      className={`rounded-xl border flex flex-col h-[calc(100vh-300px)] ${getKanbanColumnStyles(status)}`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, status)}
                  >
                      <div className={`p-4 border-b flex justify-between items-center rounded-t-xl backdrop-blur-sm ${getKanbanHeaderStyles(status)}`}>
                          <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${status === 'ToDo' ? 'bg-slate-400' : status === 'InProgress' ? 'bg-brand-500' : status === 'Blocked' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                              <h3 className="text-xs font-black uppercase tracking-widest">{status.replace(/([A-Z])/g, ' $1').trim()}</h3>
                          </div>
                          <span className="glass-card/80 px-2.5 py-0.5 rounded-md text-[10px] font-bold shadow-sm border border-black/5">
                              {filteredTasks.filter(t => t.status === status).length}
                          </span>
                      </div>
                      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                          <AnimatePresence mode="popLayout">
                              {filteredTasks.filter(t => t.status === status).map(task => {
                                  const isBlocked = isTaskBlocked(task);
                                  
                                  return (
                                    <motion.div 
                                        key={task.id}
                                        layout
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                        draggable={!isBlocked}
                                        onDragStart={(e: any) => !isBlocked && handleDragStart(e, task.id)}
                                        className={`glass-card p-4 rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow duration-300 group ${isBlocked ? 'cursor-not-allowed opacity-80' : 'cursor-grab active:cursor-grabbing'} ${getCardStatusIndicator(task.status, isBlocked)} ${draggedTaskId === task.id ? 'opacity-50' : ''}`}
                                    >
                                        {isBlocked && (
                                            <div className="mb-3 p-2 bg-red-50 border border-red-100 rounded-lg shadow-sm">
                                                <div className="flex items-center gap-1.5 text-red-700 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                                                    <Lock size={12} /> Blocked By:
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    {task.dependencies?.map(depId => {
                                                        const depTask = tasks.find(t => t.id === depId);
                                                        if (!depTask || depTask.status === 'Done') return null;
                                                        return (
                                                            <div key={depId} className="text-[10px] font-medium text-red-600 truncate flex items-center gap-1.5 glass-card/50 px-1.5 py-0.5 rounded">
                                                                <div className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0"></div>
                                                                <span className="truncate">{depTask.title}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                        {task.dependencies && task.dependencies.length > 0 && !isBlocked && (
                                            <div className="mb-3 space-y-1">
                                                <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-neutral-500">
                                                    <Link size={10} /> Dependencies ({task.dependencies.length})
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {task.dependencies.map(depId => {
                                                        const depTask = tasks.find(t => t.id === depId);
                                                        if (!depTask) return null;
                                                        const isDepDone = depTask.status === 'Done';
                                                        return (
                                                            <span key={depId} className={`px-1.5 py-0.5 rounded text-[9px] font-bold border flex items-center gap-1 ${isDepDone ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`} title={depTask.title}>
                                                                {isDepDone ? <CheckCircle2 size={8} /> : <Lock size={8} />}
                                                                {depTask.id}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
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
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 rtl:group-hover:-translate-x-0 group-hover:translate-x-0">
                                                    <button onClick={() => handleEditClick(task)} className="p-1.5 bg-neutral-50 text-neutral-400 rounded hover:bg-brand-50 hover:text-brand-600 transition-colors shadow-sm" title="Edit"><Edit size={14}/></button>
                                                    {status === 'ToDo' && task.status !== 'Blocked' && !isBlocked && (
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
      ) : viewState === 'List' ? (
          <div className="glass-card rounded-xl shadow-card border border-neutral-200 overflow-hidden animate-fade-in">
              {/* Bulk Actions Header */}
              {selectedTaskIds.length > 0 && (
                  <div className="bg-brand-50 border-b border-brand-100 p-3 flex justify-between items-center px-6">
                      <span className="text-xs font-bold text-brand-700">{selectedTaskIds.length} tasks selected</span>
                      <div className="flex gap-2">
                          <button onClick={() => handleBulkUpdateStatus('ToDo')} className="text-[10px] px-3 py-1.5 glass-card border border-brand-200 text-brand-700 font-bold uppercase rounded shadow-sm hover:bg-brand-100">To Do</button>
                          <button onClick={() => handleBulkUpdateStatus('InProgress')} className="text-[10px] px-3 py-1.5 glass-card border border-brand-200 text-brand-700 font-bold uppercase rounded shadow-sm hover:bg-brand-100">In Progress</button>
                          <button onClick={() => handleBulkUpdateStatus('Done')} className="text-[10px] px-3 py-1.5 bg-brand-600 text-white font-bold uppercase rounded shadow-sm hover:bg-brand-700">Done</button>
                          <div className="w-px h-6 bg-brand-200 mx-1"></div>
                          <button onClick={handleBulkDelete} className="text-[10px] px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 font-bold uppercase rounded shadow-sm hover:bg-red-100 flex items-center gap-1"><Trash2 size={12}/> Delete</button>
                      </div>
                  </div>
              )}
              <div className="overflow-x-auto">
                  <table className="w-full text-start text-sm">
                      <thead className="bg-neutral-50 text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-b border-neutral-200">
                          <tr>
                              <th className="px-6 py-4 w-12 text-center">
                                  <input 
                                     type="checkbox" 
                                     checked={selectedTaskIds.length === filteredTasks.length && filteredTasks.length > 0} 
                                     onChange={() => handleSelectAll(filteredTasks.map(t => t.id))}
                                     className="rounded border-neutral-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                                  />
                              </th>
                              <th className="px-6 py-4">Task Details</th>
                              <th className="px-6 py-4">Category</th>
                              <th className="px-6 py-4">Priority</th>
                              <th className="px-6 py-4">Assignee</th>
                              <th className="px-6 py-4">Status</th>
                              <th className="px-6 py-4 text-end">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                          <AnimatePresence mode="popLayout">
                              {filteredTasks.length > 0 ? filteredTasks.map(task => {
                                  const isBlocked = isTaskBlocked(task);
                                  const isInlineEditing = inlineEditingTask?.id === task.id;

                                  return (
                                  <motion.tr 
                                      key={task.id} 
                                      layout
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      exit={{ opacity: 0 }}
                                      className={`${selectedTaskIds.includes(task.id) ? 'bg-brand-50/30' : 'hover:bg-neutral-50'} transition-colors group`}
                                  >
                                      <td className="px-6 py-4 text-center">
                                          <input 
                                              type="checkbox"
                                              checked={selectedTaskIds.includes(task.id)}
                                              onChange={() => handleSelectTask(task.id)}
                                              className="rounded border-neutral-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                                          />
                                      </td>
                                      <td className="px-6 py-4">
                                          {isInlineEditing ? (
                                              <div className="space-y-2">
                                                  <input 
                                                      type="text"
                                                      value={inlineEditingTask.title}
                                                      onChange={e => setInlineEditingTask({...inlineEditingTask, title: e.target.value})}
                                                      className="w-full text-sm font-semibold text-neutral-800 border-b border-brand-300 focus:border-brand-500 outline-none  "
                                                      autoFocus
                                                  />
                                                  <textarea 
                                                      value={inlineEditingTask.description}
                                                      onChange={e => setInlineEditingTask({...inlineEditingTask, description: e.target.value})}
                                                      className="w-full text-xs text-neutral-600 border border-brand-200 rounded p-1 outline-none focus:border-brand-500 custom-scrollbar resize-none h-16"
                                                  />
                                                  <div className="flex gap-2">
                                                      <button onClick={saveInlineEdit} className="text-[10px] uppercase font-bold text-white bg-brand-600 px-2 py-1 rounded">Save</button>
                                                      <button onClick={() => setInlineEditingTask(null)} className="text-[10px] uppercase font-bold text-neutral-500 hover:text-neutral-700 bg-neutral-100 px-2 py-1 rounded">Cancel</button>
                                                  </div>
                                              </div>
                                          ) : (
                                              <>
                                                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => startInlineEdit(task)}>
                                                      {isBlocked && <Lock size={14} className="text-red-500"/>}
                                                      <p className="font-semibold text-neutral-800 text-sm group-hover:text-brand-600 transition-colors border-b border-transparent hover:border-brand-200">{task.title}</p>
                                                  </div>
                                                  <p className="text-xs text-neutral-500 truncate max-w-xs mt-0.5 cursor-pointer hover:bg-neutral-100 rounded px-1 -ms-1 inline-block" onClick={() => startInlineEdit(task)}>{task.description}</p>
                                                  {new Date(task.dueDate) < new Date() && task.status !== 'Done' && (
                                                      <div className="text-[10px] font-bold text-red-500 flex items-center gap-1 mt-1"><Clock size={10}/> Overdue: {task.dueDate}</div>
                                                  )}
                                                  {task.dependencies && task.dependencies.length > 0 && (
                                                      <div className="flex flex-col gap-1 mt-2">
                                                          {isBlocked && (
                                                              <div className="flex flex-wrap items-center gap-1.5">
                                                                  <span className="text-[9px] font-bold uppercase text-red-500 flex items-center gap-1">
                                                                       <Lock size={10}/> Blocked By:
                                                                  </span>
                                                                  {task.dependencies.map(depId => {
                                                                      const depTask = tasks.find(t => t.id === depId);
                                                                      if (!depTask || depTask.status === 'Done') return null;
                                                                      return <span key={depId} className="text-[10px] text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded truncate max-w-[150px]">{depTask.title}</span>;
                                                                  })}
                                                              </div>
                                                          )}
                                                          {!isBlocked && (
                                                              <div className="flex flex-wrap gap-1">
                                                                  {task.dependencies.map(depId => {
                                                                      const depTask = tasks.find(t => t.id === depId);
                                                                      if (!depTask) return null;
                                                                      const isDepDone = depTask.status === 'Done';
                                                                      return (
                                                                          <span key={depId} className={`px-1.5 py-0.5 rounded text-[9px] font-bold border flex items-center gap-1 ${isDepDone ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`} title={depTask.title}>
                                                                              {isDepDone ? <CheckCircle2 size={8} /> : <Lock size={8} />}
                                                                              {depTask.id}
                                                                          </span>
                                                                      );
                                                                  })}
                                                              </div>
                                                          )}
                                                      </div>
                                                  )}
                                              </>
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
                                      <td className="px-6 py-4 text-end">
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
      ) : viewState === 'Calendar' ? (
          <CalendarView tasks={filteredTasks} onEditTask={handleEditClick} onUpdateStatus={updateTaskStatus} />
      ) : (
          <DependencyMapView tasks={filteredTasks} onEditTask={handleEditClick} />
      )}

      {showNewTaskModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm p-4 animate-fade-in">
              <div className="glass-card w-full max-w-2xl rounded-xl shadow-2xl p-8 border border-neutral-100 animate-zoom-in max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-neutral-800 uppercase tracking-tight">{editingTaskId ? 'Edit Assignment' : 'New Assignment'}</h3>
                      <button onClick={() => { setShowNewTaskModal(false); resetForm(); }} className="p-2 hover:bg-neutral-100 rounded-full transition-colors"><Trash2 className="text-neutral-400" size={20}/></button>
                  </div>
                  
                  <div className="space-y-5">
                      <div>
                          <div className="flex items-center justify-between mb-2">
                              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">Task Title <span className="text-red-500">*</span></label>
                              <button 
                                  type="button"
                                  onClick={handleAiSuggest}
                                  disabled={isAiPredicting || !newTaskTitle}
                                  className="flex items-center gap-1.5 text-[10px] bg-brand-50 text-brand-600 px-2.5 py-1 rounded border border-brand-100 font-bold uppercase tracking-wider hover:bg-brand-100 disabled:opacity-50 transition-colors shadow-sm"
                              >
                                  {isAiPredicting ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12}/>}
                                  Auto-Complete Details
                              </button>
                          </div>
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
                          {errors.title && <p className="text-red-500 text-xs font-bold mt-1 ms-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.title}</p>}
                      </div>

                      <div className="bg-brand-50/50 border border-brand-100 rounded-xl p-4">
                          <label className="text-[10px] font-bold text-brand-600 uppercase tracking-widest block mb-2 flex items-center gap-1.5">
                              <Sparkles size={12}/> AI Copilot Context <span className="lowercase text-brand-400 font-medium tracking-normal">(Optional)</span>
                          </label>
                          <textarea 
                            className="w-full p-3 glass-card border border-brand-200 rounded-lg outline-none transition-all font-medium text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 resize-none"
                            placeholder="Specify project context, team roles, or specific constraints to generate a more accurate task..."
                            value={newTaskAiContext}
                            onChange={(e) => setNewTaskAiContext(e.target.value)}
                            rows={2}
                          />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                          <div>
                              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Category</label>
                              <select 
                                className="w-full p-3 bg-neutral-50 border border-neutral-200 focus:glass-card focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-lg outline-none transition-all font-medium text-sm text-neutral-800"
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
                                className={`w-full p-3 border rounded-lg outline-none transition-all font-medium text-sm focus:ring-4 focus:ring-brand-500/10 ${newTaskPriority === 'High' ? 'bg-red-50 text-red-900 border-red-100' : 'bg-neutral-50 border-neutral-200 focus:glass-card focus:border-brand-500 text-neutral-800'}`}
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
                                className="w-full p-3 bg-neutral-50 border border-neutral-200 focus:glass-card focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-lg outline-none transition-all font-medium text-sm text-neutral-800"
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
                                className={`w-full p-3 bg-neutral-50 border rounded-lg outline-none transition-all font-medium text-sm text-neutral-800 ${errors.dueDate ? 'border-red-500 focus:ring-red-500 bg-red-50/10' : touched.dueDate && newTaskDueDate ? 'border-emerald-500 bg-emerald-50/5' : 'border-neutral-200 focus:glass-card focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10'}`}
                                value={newTaskDueDate}
                                onChange={(e) => {
                                    setNewTaskDueDate(e.target.value);
                                    if(touched.dueDate) setErrors(prev => ({...prev, dueDate: validate('dueDate', e.target.value)}));
                                }}
                                onBlur={() => handleBlur('dueDate', newTaskDueDate)}
                              />
                              {errors.dueDate && <p className="text-red-500 text-xs font-bold mt-1 ms-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.dueDate}</p>}
                          </div>
                      </div>

                      <div>
                          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Prerequisites (Dependencies)</label>
                          <div className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg max-h-40 overflow-y-auto custom-scrollbar">
                              {tasks.length > 0 ? tasks
                                  .filter(t => t.id !== editingTaskId && t.status !== 'Done') // Can't block on self or done items
                                  .map(task => (
                                  <label key={task.id} className="flex items-center gap-3 p-2 hover:glass-card rounded border border-transparent hover:border-brand-200 cursor-pointer transition-colors shadow-sm mb-1">
                                      <input 
                                          type="checkbox" 
                                          checked={newTaskDependencies.includes(task.id)}
                                          onChange={() => toggleDependency(task.id)}
                                          className="rounded border-neutral-300 text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                                      />
                                      <div className="flex-1 overflow-hidden flex flex-col gap-0.5">
                                          <p className="text-xs font-bold text-neutral-700 truncate">{task.title}</p>
                                          <div className="flex gap-2 items-center text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                                              <span>{task.id}</span>
                                              <span>•</span>
                                              <span className={`px-1 py-0.5 rounded border ${getStatusBadge(task.status)}`}>{task.status.replace(/([A-Z])/g, ' $1').trim()}</span>
                                              <span>•</span>
                                              <span>{users.find(u => u.id === task.assignee)?.name.split(' ')[0]}</span>
                                          </div>
                                      </div>
                                      <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border font-black ${getPriorityColor(task.priority)}`}>{task.priority}</span>
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
                              <Clock size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-neutral-400"/>
                              <input 
                                type="datetime-local"
                                className="w-full ps-10 p-3 bg-neutral-50 border border-neutral-200 focus:glass-card focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-lg outline-none transition-all font-medium text-sm text-neutral-800"
                                value={newTaskReminder}
                                onChange={(e) => setNewTaskReminder(e.target.value)}
                              />
                          </div>
                      </div>

                      <div>
                          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2">Description</label>
                          <textarea 
                            className="w-full p-3 bg-neutral-50 border border-neutral-200 focus:glass-card focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-lg outline-none transition-all font-medium text-sm text-neutral-800 h-24 resize-none placeholder:text-neutral-400"
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

interface CalendarViewProps {
    tasks: Task[];
    onEditTask: (task: Task) => void;
    onUpdateStatus: (taskId: string, status: Task['status']) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onEditTask, onUpdateStatus }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const days = [];
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    // Padding for start of month
    for (let i = 0; i < startDay; i++) {
        days.push(null);
    }

    for (let i = 1; i <= totalDays; i++) {
        days.push(i);
    }

    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const getTasksForDay = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return tasks.filter(t => t.dueDate === dateStr);
    };

    return (
        <div className="glass-card rounded-xl shadow-card border border-neutral-200 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
                    <Calendar className="text-brand-600" size={20} />
                    {monthName} {year}
                </h3>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 hover:glass-card rounded-lg border border-neutral-200 transition-all shadow-sm">
                        <ChevronLeft size={18} />
                    </button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-3 py-2 text-xs font-bold uppercase tracking-wider hover:glass-card rounded-lg border border-neutral-200 transition-all shadow-sm">
                        Today
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:glass-card rounded-lg border border-neutral-200 transition-all shadow-sm">
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 border-b border-neutral-100">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-3 text-center text-[10px] font-black uppercase tracking-widest text-neutral-400 border-e last:border-e-0 border-neutral-100 bg-neutral-50/30">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 auto-rows-[120px]">
                {days.map((day, idx) => {
                    const dayTasks = day ? getTasksForDay(day) : [];
                    const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

                    return (
                        <div key={idx} className={`border-e border-b border-neutral-100 p-2 group transition-colors ${day ? 'hover:bg-neutral-50/50' : 'bg-neutral-50/20'}`}>
                            {day && (
                                <>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-xs font-bold ${isToday ? 'bg-brand-600 text-white w-6 h-6 flex items-center justify-center rounded-full shadow-lg shadow-brand-500/20' : 'text-neutral-400'}`}>
                                            {day}
                                        </span>
                                        {dayTasks.length > 0 && (
                                            <span className="text-[9px] font-black text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-100">
                                                {dayTasks.length}
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar pe-1">
                                        {dayTasks.map(task => (
                                            <div 
                                                key={task.id} 
                                                onClick={() => onEditTask(task)}
                                                className={`text-[9px] p-1.5 rounded border truncate cursor-pointer transition-all hover:scale-[1.02] active:scale-95 shadow-sm ${
                                                    task.priority === 'High' ? 'bg-red-50 border-red-100 text-red-700' :
                                                    task.priority === 'Medium' ? 'bg-orange-50 border-orange-100 text-orange-700' :
                                                    'bg-emerald-50 border-emerald-100 text-emerald-700'
                                                } ${task.status === 'Done' ? 'opacity-50 line-through' : ''}`}
                                            >
                                                {task.title}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const DependencyMapView: React.FC<{ tasks: Task[]; onEditTask: (task: Task) => void }> = ({ tasks, onEditTask }) => {
    // Simple visualization of dependencies
    // Group tasks by those that have dependencies and those that are dependencies
    
    const tasksWithDeps = tasks.filter(t => t.dependencies && t.dependencies.length > 0);
    const independentTasks = tasks.filter(t => !t.dependencies || t.dependencies.length === 0);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="glass-card p-6 rounded-xl border border-neutral-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-brand-100 p-2 rounded-lg text-brand-600">
                        <GitMerge size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-neutral-800">Operational Dependency Map</h3>
                        <p className="text-xs text-neutral-500 font-medium">Visualizing critical path and task relationships</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Independent Tasks / Root Tasks */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 border-b pb-2">Independent / Root Tasks</h4>
                        <div className="space-y-3">
                            {independentTasks.map(task => (
                                <div 
                                    key={task.id} 
                                    onClick={() => onEditTask(task)}
                                    className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg hover:border-brand-300 hover:glass-card transition-all cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                            task.status === 'Done' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                            task.status === 'InProgress' ? 'bg-brand-50 text-brand-700 border-brand-200' : 
                                            'bg-slate-100 text-slate-600 border-slate-200'
                                        }`}>
                                            {task.status}
                                        </span>
                                        <span className="text-[9px] font-mono text-neutral-400">{task.id}</span>
                                    </div>
                                    <p className="text-sm font-bold text-neutral-800 group-hover:text-brand-600 transition-colors">{task.title}</p>
                                    
                                    {/* Show what this task blocks */}
                                    {tasks.filter(t => t.dependencies?.includes(task.id)).length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-neutral-100">
                                            <p className="text-[9px] font-bold text-neutral-400 uppercase mb-2 flex items-center gap-1">
                                                <ArrowRight size={10} /> Blocks:
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {tasks.filter(t => t.dependencies?.includes(task.id)).map(blocked => (
                                                    <span key={blocked.id} className="text-[9px] glass-card border border-neutral-200 px-2 py-1 rounded text-neutral-600 font-medium">
                                                        {blocked.title}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dependent Tasks */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 border-b pb-2">Dependent Tasks</h4>
                        <div className="space-y-3">
                            {tasksWithDeps.map(task => (
                                <div 
                                    key={task.id} 
                                    onClick={() => onEditTask(task)}
                                    className="p-4 glass-card border border-neutral-200 rounded-lg hover:border-brand-300 transition-all cursor-pointer group shadow-sm"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex gap-2">
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                                task.status === 'Done' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                                task.status === 'InProgress' ? 'bg-brand-50 text-brand-700 border-brand-200' : 
                                                'bg-slate-100 text-slate-600 border-slate-200'
                                            }`}>
                                                {task.status}
                                            </span>
                                            {task.status !== 'Done' && (
                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
                                                    <Lock size={8} /> Blocked
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[9px] font-mono text-neutral-400">{task.id}</span>
                                    </div>
                                    <p className="text-sm font-bold text-neutral-800 group-hover:text-brand-600 transition-colors">{task.title}</p>
                                    
                                    <div className="mt-3 pt-3 border-t border-neutral-100">
                                        <p className="text-[9px] font-bold text-neutral-400 uppercase mb-2 flex items-center gap-1">
                                            <Link size={10} /> Waiting on:
                                        </p>
                                        <div className="space-y-2">
                                            {task.dependencies?.map(depId => {
                                                const depTask = tasks.find(t => t.id === depId);
                                                return (
                                                    <div key={depId} className="flex items-center justify-between bg-neutral-50 p-2 rounded border border-neutral-100">
                                                        <span className="text-[10px] font-medium text-neutral-700 truncate max-w-[150px]">
                                                            {depTask?.title || 'Unknown Task'}
                                                        </span>
                                                        <span className={`text-[8px] font-bold px-1 py-0.5 rounded ${
                                                            depTask?.status === 'Done' ? 'text-emerald-600' : 'text-red-500 animate-pulse'
                                                        }`}>
                                                            {depTask?.status || 'Missing'}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {tasksWithDeps.length === 0 && (
                                <div className="text-center py-12 bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-200">
                                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest italic">No dependencies defined</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
