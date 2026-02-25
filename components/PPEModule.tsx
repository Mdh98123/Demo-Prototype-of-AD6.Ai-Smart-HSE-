
import React, { useState } from 'react';
import { PPEItem, PPEIssuance } from '../types';
import { useUser } from '../contexts/UserContext';
import { 
  HardHat, Shirt, Glasses, Package, RefreshCw, 
  UserCheck, AlertCircle, ShoppingCart, ShieldCheck,
  Search
} from 'lucide-react';

const PPEModule: React.FC = () => {
  const { currentUser } = useUser();
  const [activeTab, setActiveTab] = useState<'Inventory' | 'Issuance'>('Inventory');
  const [inventory, setInventory] = useState<PPEItem[]>([
      { id: 'PPE-01', name: 'Safety Helmet (White)', type: 'Head', standard: 'ANSI Z89.1', stock: 45, reorderLevel: 20, lastIssued: '2024-05-18' },
      { id: 'PPE-02', name: 'Impact Gloves (L)', type: 'Hand', standard: 'EN 388', stock: 12, reorderLevel: 50, lastIssued: '2024-05-20' },
      { id: 'PPE-03', name: 'Safety Glasses (Clear)', type: 'Eye', standard: 'ANSI Z87.1', stock: 120, reorderLevel: 30, lastIssued: '2024-05-19' },
      { id: 'PPE-04', name: 'High-Vis Vest (Orange)', type: 'Body', standard: 'EN ISO 20471', stock: 200, reorderLevel: 50, lastIssued: '2024-05-21' },
      { id: 'PPE-05', name: 'Safety Boots S3', type: 'Foot', standard: 'EN ISO 20345', stock: 25, reorderLevel: 15, lastIssued: '2024-05-15' },
      { id: 'PPE-06', name: 'Full Body Harness', type: 'Body', standard: 'EN 361', stock: 8, reorderLevel: 10, lastIssued: '2024-05-10' },
      { id: 'PPE-07', name: 'Ear Defenders', type: 'Head', standard: 'EN 352-1', stock: 60, reorderLevel: 20, lastIssued: '2024-05-18' },
      { id: 'PPE-08', name: 'N95 Dust Mask', type: 'Respiratory', standard: 'NIOSH N95', stock: 500, reorderLevel: 100, lastIssued: '2024-05-22' },
      { id: 'PPE-09', name: 'Chemical Resistant Gloves', type: 'Hand', standard: 'EN 374', stock: 40, reorderLevel: 25, lastIssued: '2024-05-12' },
      { id: 'PPE-10', name: 'Welding Shield', type: 'Eye', standard: 'ANSI Z87.1', stock: 15, reorderLevel: 5, lastIssued: '2024-05-05' }
  ]);
  const [issuanceLog, setIssuanceLog] = useState<PPEIssuance[]>([
      { id: 'ISS-1001', userId: 'u6', userName: 'Rahul Gupta', items: [{ itemId: 'PPE-01', name: 'Safety Helmet', qty: 1 }], date: '2024-05-22T08:00:00', signatureHash: 'sig-88a' },
      { id: 'ISS-1002', userId: 'u7', userName: 'Marcus Chen', items: [{ itemId: 'PPE-02', name: 'Impact Gloves', qty: 2 }], date: '2024-05-22T08:15:00', signatureHash: 'sig-88b' },
      { id: 'ISS-1003', userId: 'u5', userName: 'Fatima Al-Kaabi', items: [{ itemId: 'PPE-04', name: 'High-Vis Vest', qty: 1 }], date: '2024-05-21T07:30:00', signatureHash: 'sig-88c' },
      { id: 'ISS-1004', userId: 'u10', userName: 'Khalid Al-Dhaheri', items: [{ itemId: 'PPE-08', name: 'N95 Dust Mask', qty: 10 }], date: '2024-05-21T09:00:00', signatureHash: 'sig-88d' },
      { id: 'ISS-1005', userId: 'u6', userName: 'Rahul Gupta', items: [{ itemId: 'PPE-05', name: 'Safety Boots S3', qty: 1 }], date: '2024-05-20T14:00:00', signatureHash: 'sig-88e' },
      { id: 'ISS-1006', userId: 'u11', userName: 'John Doe', items: [{ itemId: 'PPE-03', name: 'Safety Glasses', qty: 1 }], date: '2024-05-19T08:00:00', signatureHash: 'sig-88f' },
      { id: 'ISS-1007', userId: 'u4', userName: 'Sarah Jones', items: [{ itemId: 'PPE-06', name: 'Full Body Harness', qty: 1 }], date: '2024-05-18T10:30:00', signatureHash: 'sig-88g' },
      { id: 'ISS-1008', userId: 'u7', userName: 'Marcus Chen', items: [{ itemId: 'PPE-09', name: 'Chemical Gloves', qty: 2 }], date: '2024-05-18T11:00:00', signatureHash: 'sig-88h' },
      { id: 'ISS-1009', userId: 'u6', userName: 'Rahul Gupta', items: [{ itemId: 'PPE-07', name: 'Ear Defenders', qty: 1 }], date: '2024-05-17T07:45:00', signatureHash: 'sig-88i' },
      { id: 'ISS-1010', userId: 'u5', userName: 'Fatima Al-Kaabi', items: [{ itemId: 'PPE-10', name: 'Welding Shield', qty: 1 }], date: '2024-05-16T13:00:00', signatureHash: 'sig-88j' }
  ]);

  const handleIssue = (item: PPEItem) => {
      if (item.stock < 1) return;
      
      const updatedInv = inventory.map(i => i.id === item.id ? { ...i, stock: i.stock - 1, lastIssued: new Date().toISOString().split('T')[0] } : i);
      setInventory(updatedInv);
      
      const log: PPEIssuance = {
          id: `ISS-${Date.now()}`,
          userId: currentUser.id,
          userName: currentUser.name,
          items: [{ itemId: item.id, name: item.name, qty: 1 }],
          date: new Date().toISOString(),
          signatureHash: 'digital-sig-xyz'
      };
      setIssuanceLog([log, ...issuanceLog]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-xl shadow-blue-500/20">
                <HardHat size={28} />
            </div>
            <div>
                <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">PPE Central</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Inventory & Issuance Control</p>
            </div>
        </div>
        <div className="flex bg-slate-200 p-1 rounded-2xl">
            <button onClick={() => setActiveTab('Inventory')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'Inventory' ? 'bg-white text-slate-900 shadow' : 'text-slate-500'}`}>Inventory</button>
            <button onClick={() => setActiveTab('Issuance')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'Issuance' ? 'bg-white text-slate-900 shadow' : 'text-slate-500'}`}>Issuance Log</button>
        </div>
      </div>

      {activeTab === 'Inventory' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2"><Package size={20}/> Stock Levels</h3>
                          <div className="relative">
                              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                              <input type="text" placeholder="Search item..." className="pl-9 pr-4 py-2 bg-slate-50 rounded-xl text-xs font-bold w-48 border-none focus:ring-2 focus:ring-blue-500"/>
                          </div>
                      </div>
                      <div className="space-y-4">
                          {inventory.map(item => (
                              <div key={item.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 hover:border-blue-200 transition-all group">
                                  <div className="flex items-center gap-4">
                                      <div className="p-3 bg-white rounded-xl text-slate-400 shadow-sm">
                                          {item.type === 'Head' ? <HardHat size={20}/> : item.type === 'Eye' ? <Glasses size={20}/> : <Shirt size={20}/>}
                                      </div>
                                      <div>
                                          <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                                          <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase">{item.standard} • ID: {item.id}</p>
                                      </div>
                                  </div>
                                  <div className="text-right flex items-center gap-6">
                                      <div>
                                          <p className={`text-xl font-black ${item.stock <= item.reorderLevel ? 'text-red-500' : 'text-slate-800'}`}>{item.stock}</p>
                                          <p className="text-[9px] text-slate-400 font-bold uppercase">Available</p>
                                      </div>
                                      <button 
                                        onClick={() => handleIssue(item)}
                                        className="bg-slate-900 text-white p-3 rounded-xl hover:bg-blue-600 transition shadow-lg active:scale-95" 
                                        title="Issue Item"
                                      >
                                          <UserCheck size={18}/>
                                      </button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
              <div className="space-y-6">
                  <div className="bg-red-50 p-8 rounded-[2.5rem] border-2 border-red-100 shadow-xl">
                      <h3 className="text-xs font-black text-red-400 uppercase tracking-widest mb-6 flex items-center gap-2"><AlertCircle size={16}/> Low Stock Alerts</h3>
                      {inventory.filter(i => i.stock <= i.reorderLevel).map(i => (
                          <div key={i.id} className="bg-white p-4 rounded-2xl shadow-sm border border-red-100 mb-3 flex items-center justify-between">
                              <div>
                                  <p className="text-xs font-bold text-slate-700">{i.name}</p>
                                  <p className="text-[10px] text-red-500 font-bold uppercase mt-1">Below Level ({i.reorderLevel})</p>
                              </div>
                              <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition">
                                  <ShoppingCart size={16}/>
                              </button>
                          </div>
                      ))}
                      {inventory.filter(i => i.stock <= i.reorderLevel).length === 0 && (
                          <p className="text-xs text-slate-400 italic text-center">No inventory alerts.</p>
                      )}
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'Issuance' && (
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2"><ShieldCheck size={20} className="text-emerald-500"/> Distribution Log</h3>
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead>
                          <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              <th className="px-6 py-4">Transaction ID</th>
                              <th className="px-6 py-4">Recipient</th>
                              <th className="px-6 py-4">Items</th>
                              <th className="px-6 py-4">Date</th>
                              <th className="px-6 py-4 text-right">Verification</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {issuanceLog.map(log => (
                              <tr key={log.id} className="hover:bg-slate-50/50">
                                  <td className="px-6 py-4 font-mono text-xs font-bold text-slate-600">{log.id}</td>
                                  <td className="px-6 py-4 font-bold text-slate-800 text-sm">{log.userName}</td>
                                  <td className="px-6 py-4 text-xs text-slate-600">
                                      {log.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                                  </td>
                                  <td className="px-6 py-4 text-xs font-mono text-slate-500">{new Date(log.date).toLocaleDateString()}</td>
                                  <td className="px-6 py-4 text-right">
                                      <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-emerald-100">Signed</span>
                                  </td>
                              </tr>
                          ))}
                          {issuanceLog.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic text-xs uppercase font-bold">No issuance records found.</td></tr>}
                      </tbody>
                  </table>
              </div>
          </div>
      )}
    </div>
  );
};

export default PPEModule;
