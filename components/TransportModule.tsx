
import React, { useState } from 'react';
import { JourneyPlan, VehicleCheck, TrafficViolation } from '../types';
import { useUser } from '../contexts/UserContext';
import { 
  Truck, MapPin, AlertTriangle, FileText, Plus, CheckCircle, 
  Clock, User, Navigation, Shield, AlertOctagon, Car, Activity
} from 'lucide-react';

const TransportModule: React.FC = () => {
  const { currentUser } = useUser();
  const [activeTab, setActiveTab] = useState<'JMP' | 'Violations' | 'Checks'>('JMP');
  const [journeys, setJourneys] = useState<JourneyPlan[]>([
    { id: 'JMP-101', vehicleId: 'B-2910', driverId: 'u6', driverName: 'Rahul Gupta', routeFrom: 'Camp A', routeTo: 'Ruwais Refinery', departureTime: '06:00', arrivalTime: '07:30', passengers: ['Team Alpha'], restStops: [], status: 'Completed', nightDrivingApproval: false },
    { id: 'JMP-102', vehicleId: 'T-4421', driverId: 'u7', driverName: 'Marcus Chen', routeFrom: 'Habshan', routeTo: 'Fujairah Port', departureTime: '08:00', arrivalTime: '12:00', passengers: [], restStops: ['Al Ain Stop'], status: 'Active', nightDrivingApproval: false },
    { id: 'JMP-103', vehicleId: 'B-5501', driverId: 'u6', driverName: 'Rahul Gupta', routeFrom: 'Ruwais', routeTo: 'Camp A', departureTime: '18:00', arrivalTime: '19:30', passengers: ['Team Alpha'], restStops: [], status: 'Active', nightDrivingApproval: true },
    { id: 'JMP-104', vehicleId: 'V-9922', driverId: 'u11', driverName: 'John Doe', routeFrom: 'HQ', routeTo: 'Site C', departureTime: '09:00', arrivalTime: '10:00', passengers: ['Inspectors'], restStops: [], status: 'Completed', nightDrivingApproval: false },
    { id: 'JMP-105', vehicleId: 'T-3310', driverId: 'u5', driverName: 'Ahmed Salem', routeFrom: 'Mussafah', routeTo: 'Ruwais', departureTime: '05:00', arrivalTime: '08:00', passengers: [], restStops: ['Mafraq'], status: 'Completed', nightDrivingApproval: true },
    { id: 'JMP-106', vehicleId: 'C-1102', driverId: 'u10', driverName: 'Khalid Al-Dhaheri', routeFrom: 'Zone A', routeTo: 'Zone B', departureTime: '11:00', arrivalTime: '11:15', passengers: ['Materials'], restStops: [], status: 'Completed', nightDrivingApproval: false },
    { id: 'JMP-107', vehicleId: 'B-2910', driverId: 'u6', driverName: 'Rahul Gupta', routeFrom: 'Camp A', routeTo: 'City Mall', departureTime: '20:00', arrivalTime: '21:00', passengers: ['Recreation'], restStops: [], status: 'Delayed', nightDrivingApproval: true },
    { id: 'JMP-108', vehicleId: 'T-4421', driverId: 'u7', driverName: 'Marcus Chen', routeFrom: 'Fujairah', routeTo: 'Habshan', departureTime: '14:00', arrivalTime: 'Pending', passengers: [], restStops: ['Al Ain'], status: 'Active', nightDrivingApproval: false },
    { id: 'JMP-109', vehicleId: 'V-1001', driverId: 'u4', driverName: 'Sarah Jones', routeFrom: 'HQ', routeTo: 'Ruwais Admin', departureTime: '07:00', arrivalTime: '09:30', passengers: [], restStops: [], status: 'Completed', nightDrivingApproval: false },
    { id: 'JMP-110', vehicleId: 'C-5521', driverId: 'u11', driverName: 'John Doe', routeFrom: 'Site C', routeTo: 'Warehouse', departureTime: '15:30', arrivalTime: '16:00', passengers: [], restStops: [], status: 'Completed', nightDrivingApproval: false }
  ]);
  
  const [violations, setViolations] = useState<TrafficViolation[]>([
      { id: 'TV-001', vehicleId: 'T-4421', type: 'Speeding > 120km/h', date: '2024-05-10', points: 4 },
      { id: 'TV-002', vehicleId: 'B-2910', type: 'Harsh Braking', date: '2024-05-12', points: 2 },
      { id: 'TV-003', vehicleId: 'V-9922', type: 'Seatbelt Violation', date: '2024-05-15', points: 4 },
      { id: 'TV-004', vehicleId: 'T-3310', type: 'Unauthorized Route', date: '2024-05-18', points: 3 },
      { id: 'TV-005', vehicleId: 'C-1102', type: 'Parking in Fire Lane', date: '2024-05-19', points: 6 },
      { id: 'TV-006', vehicleId: 'T-4421', type: 'Idling > 10mins', date: '2024-05-20', points: 1 },
      { id: 'TV-007', vehicleId: 'B-5501', type: 'Speeding > 100km/h (Site)', date: '2024-05-21', points: 6 },
      { id: 'TV-008', vehicleId: 'V-1001', type: 'Mobile Phone Use', date: '2024-05-22', points: 4 },
      { id: 'TV-009', vehicleId: 'C-5521', type: 'Reverse without Spotter', date: '2024-05-22', points: 6 },
      { id: 'TV-010', vehicleId: 'B-2910', type: 'Failure to Stop', date: '2024-05-23', points: 4 }
  ]);

  const handleCreateJMP = () => {
      // Simplified creation logic
      const newJMP: JourneyPlan = {
          id: `JMP-${Date.now()}`,
          vehicleId: 'T-4402',
          driverId: currentUser.id,
          driverName: currentUser.name,
          routeFrom: 'HQ',
          routeTo: 'Site B',
          departureTime: new Date().toLocaleTimeString(),
          arrivalTime: 'Pending',
          passengers: [],
          restStops: [],
          status: 'Active'
      };
      setJourneys([newJMP, ...journeys]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
            <div className="bg-orange-600 p-4 rounded-2xl text-white shadow-xl shadow-orange-500/20">
                <Truck size={28} />
            </div>
            <div>
                <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Transport Command</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Journey Management & Fleet Safety</p>
            </div>
        </div>
        <div className="flex bg-slate-200 p-1 rounded-2xl">
            {['JMP', 'Violations', 'Checks'].map(tab => (
                <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    {tab === 'JMP' ? 'Journey Plans' : tab}
                </button>
            ))}
        </div>
      </div>

      {activeTab === 'JMP' && (
          <div className="space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <div className="flex justify-between items-center mb-8">
                      <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2"><Navigation size={20} className="text-indigo-600"/> Active Journeys</h3>
                      <button onClick={handleCreateJMP} className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition flex items-center gap-2">
                          <Plus size={16}/> New Journey Plan
                      </button>
                  </div>
                  <div className="grid gap-4">
                      {journeys.map(j => (
                          <div key={j.id} className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 hover:border-indigo-200 transition-all group">
                              <div className="flex justify-between items-start mb-4">
                                  <div className="flex items-center gap-4">
                                      <div className="p-3 bg-white rounded-2xl shadow-sm"><Car size={20} className="text-slate-500"/></div>
                                      <div>
                                          <h4 className="font-black text-slate-800 text-sm">{j.routeFrom} <span className="text-slate-400 mx-2">➔</span> {j.routeTo}</h4>
                                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Vehicle: {j.vehicleId} • Driver: {j.driverName}</p>
                                      </div>
                                  </div>
                                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${j.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200 animate-pulse' : 'bg-slate-200 text-slate-600 border-slate-300'}`}>{j.status}</span>
                              </div>
                              <div className="flex items-center gap-6 text-xs font-bold text-slate-500 pl-16">
                                  <span className="flex items-center gap-1"><Clock size={12}/> Dep: {j.departureTime}</span>
                                  {j.nightDrivingApproval && <span className="flex items-center gap-1 text-indigo-600"><Shield size={12}/> Night Approved</span>}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'Violations' && (
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
             <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2"><AlertOctagon size={20} className="text-red-600"/> Violation Log</h3>
                 <div className="bg-red-50 text-red-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase">Points System Active</div>
             </div>
             {violations.length === 0 ? (
                 <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                     <CheckCircle size={48} className="mx-auto text-emerald-400 mb-4"/>
                     <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No traffic violations recorded this month.</p>
                 </div>
             ) : (
                 <div className="grid gap-4">
                     {violations.map(v => (
                         <div key={v.id} className="p-4 border border-red-100 bg-red-50 rounded-2xl flex justify-between items-center">
                             <div>
                                 <p className="font-bold text-red-900">{v.type}</p>
                                 <p className="text-xs text-red-700">{v.vehicleId} • {v.date}</p>
                             </div>
                             <span className="text-xl font-black text-red-600">-{v.points} Pts</span>
                         </div>
                     ))}
                 </div>
             )}
          </div>
      )}
      
      {activeTab === 'Checks' && (
          <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-10"><Activity size={180}/></div>
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Fleet Health</h3>
              <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8">Daily Inspections & Maintenance Status</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                  <div className="bg-white/10 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Inspections Today</p>
                      <p className="text-4xl font-black">142</p>
                  </div>
                  <div className="bg-white/10 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Defects Reported</p>
                      <p className="text-4xl font-black text-orange-400">3</p>
                  </div>
                  <div className="bg-white/10 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Compliance Rate</p>
                      <p className="text-4xl font-black text-emerald-400">98%</p>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default TransportModule;
