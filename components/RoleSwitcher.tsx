
import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Users, ChevronRight, Check, X, Shield, Briefcase, HardHat, Activity } from 'lucide-react';

const RoleSwitcher: React.FC = () => {
  const { users, currentUser, switchUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  // Group users by category for better UI
  const strategic = users.filter(u => ['Board_Director', 'CEO', 'ADMIN'].includes(u.role));
  const management = users.filter(u => ['Head_Group_HSE', 'Regional_HSE_Director', 'Site_HSE_Manager'].includes(u.role));
  const operational = users.filter(u => ['HSE_Officer', 'Site_Supervisor', 'Project_Manager'].includes(u.role));
  const specialized = users.filter(u => ['Environmental_Officer', 'Internal_Auditor'].includes(u.role));
  const field = users.filter(u => ['Worker'].includes(u.role));

  const renderGroup = (title: string, groupUsers: typeof users, icon: React.ReactNode) => (
    <div className="mb-6 last:mb-0">
      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 px-2 flex items-center gap-2">
        {icon} {title}
      </h4>
      <div className="space-y-2">
        {groupUsers.map(user => (
          <button
            key={user.id}
            onClick={() => { switchUser(user.id); setIsOpen(false); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left transition-all border-2 ${
              currentUser.id === user.id 
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl scale-[1.02]' 
                : 'bg-slate-50 border-slate-50 hover:border-indigo-200 text-slate-700 hover:bg-white'
            }`}
          >
            <div className="flex flex-col">
              <span className="text-xs font-bold">{user.name}</span>
              <span className={`text-[9px] uppercase tracking-wide font-medium mt-0.5 ${currentUser.id === user.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                {user.role.replace(/_/g, ' ')}
              </span>
            </div>
            {currentUser.id === user.id && <Check size={16} className="text-white" />}
          </button>
        ))}
      </div>
    </div>
  );

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 left-8 bg-slate-900 text-white p-3 pr-6 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:bg-slate-800 transition-all hover:scale-105 z-[100] flex items-center gap-4 border-4 border-white/10 animate-in slide-in-from-bottom-20 duration-700"
      >
        <div className="bg-indigo-500 p-2.5 rounded-full shadow-inner animate-pulse">
            <Users size={20} />
        </div>
        <div className="text-left">
            <span className="block text-[9px] font-black uppercase text-indigo-400 tracking-widest leading-none mb-1">Demo Access</span>
            <span className="block text-sm font-bold leading-none">Explore Personas</span>
        </div>
      </button>
    );
  }

  return (
    <>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90]" onClick={() => setIsOpen(false)} />
        
        <div className="fixed bottom-8 left-8 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-300 origin-bottom-left">
            <div className="w-80 md:w-96 bg-white rounded-[2.5rem] shadow-3xl border-4 border-white overflow-hidden flex flex-col max-h-[80vh]">
                <div className="bg-slate-900 text-white p-6 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-600/20"><Users size={20}/></div>
                        <div>
                            <h3 className="font-black text-base tracking-tight">Persona Explorer</h3>
                            <p className="text-[10px] text-indigo-300 uppercase tracking-widest font-bold">Switch User Context</p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
                </div>
                
                <div className="overflow-y-auto p-6 custom-scrollbar bg-white">
                    {renderGroup('Strategic & Admin', strategic, <Shield size={12}/>)}
                    {renderGroup('HSE Management', management, <Briefcase size={12}/>)}
                    {renderGroup('Operational Command', operational, <Activity size={12}/>)}
                    {renderGroup('Specialized Units', specialized, <HardHat size={12}/>)}
                    {renderGroup('Field Execution', field, <Users size={12}/>)}
                </div>
                
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                        AD6.Ai Prototype Environment
                    </p>
                </div>
            </div>
        </div>
    </>
  );
};

export default RoleSwitcher;
