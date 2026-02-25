
import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { LogOut, User, Settings, ChevronDown, Shield } from 'lucide-react';

const UserProfileDropdown: React.FC = () => {
  const { currentUser, logout } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!currentUser) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 pl-2 pr-1 py-1.5 rounded-xl hover:bg-neutral-50 transition-all border border-transparent hover:border-neutral-200 outline-none focus:ring-2 focus:ring-brand-500/20 group"
      >
        <div className="hidden md:block text-right">
            <p className="text-xs font-bold text-neutral-700 leading-tight group-hover:text-neutral-900 transition-colors">{currentUser.name}</p>
            <p className="text-[10px] text-neutral-400 font-bold uppercase leading-tight tracking-wide">{currentUser.role.replace(/_/g, ' ')}</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-brand-100 overflow-hidden border-2 border-white shadow-sm ring-1 ring-neutral-100 group-hover:ring-neutral-200 transition-all">
           <img 
             src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} 
             alt={currentUser.name}
             className="w-full h-full object-cover"
           />
        </div>
        <ChevronDown size={14} className={`text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} group-hover:text-neutral-600`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-neutral-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
            <div className="px-5 py-4 border-b border-neutral-50">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Signed in as</p>
                <p className="text-sm font-bold text-neutral-800 truncate">{currentUser.email || currentUser.name}</p>
            </div>
            
            <div className="p-2 space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 rounded-xl transition-all duration-200 text-left group">
                    <User size={16} className="text-neutral-400 group-hover:text-neutral-700 transition-colors" /> My Profile
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 rounded-xl transition-all duration-200 text-left group">
                    <Settings size={16} className="text-neutral-400 group-hover:text-neutral-700 transition-colors" /> Account Settings
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 rounded-xl transition-all duration-200 text-left group">
                    <Shield size={16} className="text-neutral-400 group-hover:text-neutral-700 transition-colors" /> System Governance
                </button>
            </div>

            <div className="p-2 border-t border-neutral-50 mt-1">
                <button 
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 text-left group"
                >
                    <LogOut size={16} className="text-neutral-400 group-hover:text-red-600 transition-colors" /> Sign Out
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
