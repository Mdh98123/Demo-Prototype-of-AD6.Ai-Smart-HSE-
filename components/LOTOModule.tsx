import React from 'react';
import { Lock, Plus, Filter, Search, AlertTriangle, ShieldCheck, CheckCircle2, FileText } from 'lucide-react';

export const LOTOModule: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Lock className="text-red-600" />
            Lockout / Tagout (LOTO)
          </h2>
          <p className="text-slate-500">Manage energy isolation, lockouts, and return to service procedures.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50">
            <Filter size={18} />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            <Plus size={18} />
            New Isolation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-semibold">Active Isolations</h3>
            <Lock className="text-red-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-slate-800">12</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-semibold">Pending Approval</h3>
            <AlertTriangle className="text-amber-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-slate-800">3</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-semibold">Authorized Personnel</h3>
            <ShieldCheck className="text-indigo-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-slate-800">45</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-semibold">Restored Today</h3>
            <CheckCircle2 className="text-emerald-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-slate-800">8</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search equipment or isolation..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-semibold">Isolation ID</th>
                <th className="px-6 py-3 font-semibold">Equipment / Asset</th>
                <th className="px-6 py-3 font-semibold">Energy Source</th>
                <th className="px-6 py-3 font-semibold">Authorized By</th>
                <th className="px-6 py-3 font-semibold">Related PTW</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-red-600">LOTO-2026-042</td>
                <td className="px-6 py-4 font-semibold">Main Compressor Unit A</td>
                <td className="px-6 py-4">Electrical (480V) & Pneumatic</td>
                <td className="px-6 py-4">John Smith</td>
                <td className="px-6 py-4 text-indigo-600 hover:underline cursor-pointer">PTW-8892</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Isolated</span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-slate-400 hover:text-indigo-600">
                    <FileText size={18} />
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-red-600">LOTO-2026-043</td>
                <td className="px-6 py-4 font-semibold">HVAC Chiller #2</td>
                <td className="px-6 py-4">Electrical (3-Phase)</td>
                <td className="px-6 py-4">Sarah Connor</td>
                <td className="px-6 py-4 text-slate-400">-</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">Pending Review</span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-slate-400 hover:text-indigo-600">
                    <FileText size={18} />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LOTOModule;
