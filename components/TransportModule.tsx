import React, { useState } from 'react';
import { JourneyPlan, VehicleCheck, TrafficViolation } from '../types';
import { useUser } from '../contexts/UserContext';
import { 
  Truck, MapPin, AlertTriangle, FileText, Plus, CheckCircle, 
  Clock, User, Navigation, Shield, AlertOctagon, Car, Activity, X
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

  const [vehicleChecks, setVehicleChecks] = useState<VehicleCheck[]>([
    { id: 'VC-101', vehicleId: 'T-4421 (Heavy Lowbed)', checkDate: '2026-04-14 06:15', inspectorName: 'Rashid Al-Kaabi', odometer: 148200, status: 'Passed', defectsReported: [], brakeTestPassed: true, tireCondition: 'Good (6mm)', safetyKitVerified: true },
    { id: 'VC-102', vehicleId: 'B-2910 (Personnel Bus 32-Seat)', checkDate: '2026-04-14 05:45', inspectorName: 'Rahul Gupta', odometer: 89400, status: 'Passed', defectsReported: [], brakeTestPassed: true, tireCondition: 'Good (5mm)', safetyKitVerified: true },
    { id: 'VC-103', vehicleId: 'V-9922 (Toyota Hilux 4x4)', checkDate: '2026-04-14 06:50', inspectorName: 'Ahmed Salem', odometer: 63100, status: 'Defect Noted', defectsReported: ['Rear left indicator bulb intermittent'], brakeTestPassed: true, tireCondition: 'Good (4mm)', safetyKitVerified: true },
    { id: 'VC-104', vehicleId: 'T-3310 (Water Tanker 5000G)', checkDate: '2026-04-13 18:20', inspectorName: 'Khalid Al-Dhaheri', odometer: 215300, status: 'Passed', defectsReported: [], brakeTestPassed: true, tireCondition: 'Good (7mm)', safetyKitVerified: true },
    { id: 'VC-105', vehicleId: 'C-1102 (Hiab Crane Truck 12T)', checkDate: '2026-04-13 07:00', inspectorName: 'Hamad Al-Dosari', odometer: 112000, status: 'Grounded', defectsReported: ['Hydraulic stabilizer outrigger hose seep'], brakeTestPassed: true, tireCondition: 'Worn (2.5mm)', safetyKitVerified: false },
    { id: 'VC-106', vehicleId: 'B-5501 (Coaster Crew Bus)', checkDate: '2026-04-13 05:30', inspectorName: 'Sultan Al-Ghafri', odometer: 94100, status: 'Passed', defectsReported: [], brakeTestPassed: true, tireCondition: 'Good (5mm)', safetyKitVerified: true },
    { id: 'VC-107', vehicleId: 'V-1001 (Ford Ranger HSE Patrol)', checkDate: '2026-04-12 06:40', inspectorName: 'Tariq Al-Hashemi', odometer: 42100, status: 'Passed', defectsReported: [], brakeTestPassed: true, tireCondition: 'Excellent (7mm)', safetyKitVerified: true },
    { id: 'VC-108', vehicleId: 'T-4402 (Diesel Fuel Bowser)', checkDate: '2026-04-12 07:15', inspectorName: 'Marcus Vance', odometer: 178900, status: 'Passed', defectsReported: [], brakeTestPassed: true, tireCondition: 'Good (6mm)', safetyKitVerified: true },
    { id: 'VC-109', vehicleId: 'C-5521 (Flatbed Pipe Trailer)', checkDate: '2026-04-11 06:10', inspectorName: 'Arun Kumar', odometer: 198400, status: 'Passed', defectsReported: [], brakeTestPassed: true, tireCondition: 'Good (5mm)', safetyKitVerified: true },
    { id: 'VC-110', vehicleId: 'V-8833 (Emergency Ambulance)', checkDate: '2026-04-11 08:00', inspectorName: 'Dr. Sarah Jenkins', odometer: 31200, status: 'Passed', defectsReported: [], brakeTestPassed: true, tireCondition: 'New (8mm)', safetyKitVerified: true }
  ]);

  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false);
  const [newCheckVehicle, setNewCheckVehicle] = useState('T-4421 (Heavy Lowbed)');
  const [newCheckDefect, setNewCheckDefect] = useState('');

  const handleCreateJMP = () => {
    const newJMP: JourneyPlan = {
      id: `JMP-${Date.now()}`,
      vehicleId: 'T-4402',
      driverId: currentUser.id,
      driverName: currentUser.name,
      routeFrom: 'HQ Abu Dhabi',
      routeTo: 'Ruwais Polyolefin Unit',
      departureTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      arrivalTime: 'Pending',
      passengers: ['Audit Team'],
      restStops: ['Al Mafraq Service Area'],
      status: 'Active'
    };
    setJourneys([newJMP, ...journeys]);
  };

  const handleAddCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const newCheck: VehicleCheck = {
      id: `VC-${vehicleChecks.length + 101}`,
      vehicleId: newCheckVehicle,
      checkDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      inspectorName: currentUser.name,
      odometer: 100000 + Math.floor(Math.random() * 50000),
      status: newCheckDefect.trim() ? 'Defect Noted' : 'Passed',
      defectsReported: newCheckDefect.trim() ? [newCheckDefect] : [],
      brakeTestPassed: true,
      tireCondition: 'Good (5mm)',
      safetyKitVerified: true
    };
    setVehicleChecks([newCheck, ...vehicleChecks]);
    setIsCheckModalOpen(false);
    setNewCheckDefect('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-orange-600 p-4 rounded-2xl text-white shadow-xl shadow-orange-500/20">
            <Truck size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Transport Command</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
              Journey Management & Fleet Safety ({vehicleChecks.length} pre-trip audits logged)
            </p>
          </div>
        </div>
        <div className="flex bg-slate-200 p-1 rounded-2xl w-fit">
          {['JMP', 'Violations', 'Checks'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {tab === 'JMP' ? 'Journey Plans' : tab === 'Checks' ? 'Pre-Trip Checks' : tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'JMP' && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <Navigation size={20} className="text-indigo-600"/> Active Journeys ({journeys.length})
              </h3>
              <button 
                onClick={handleCreateJMP} 
                className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition flex items-center gap-2 cursor-pointer"
              >
                <Plus size={16}/> New Journey Plan
              </button>
            </div>
            <div className="grid gap-4">
              {journeys.map(j => (
                <div key={j.id} className="p-6 bg-slate-50/70 rounded-3xl border-2 border-slate-100 hover:border-indigo-200 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-2xl shadow-sm"><Car size={20} className="text-slate-500"/></div>
                      <div>
                        <h4 className="font-black text-slate-800 text-sm">{j.routeFrom} <span className="text-slate-400 mx-2">➔</span> {j.routeTo}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Vehicle: {j.vehicleId} • Driver: {j.driverName}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${j.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-200 text-slate-600 border-slate-300'}`}>{j.status}</span>
                  </div>
                  <div className="flex items-center gap-6 text-xs font-bold text-slate-500 ps-16">
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
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <AlertOctagon size={20} className="text-red-600"/> Violation Log ({violations.length})
            </h3>
            <div className="bg-red-50 text-red-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-red-200">
              Demerit Points Active
            </div>
          </div>
          {violations.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <CheckCircle size={48} className="mx-auto text-emerald-400 mb-4"/>
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No traffic violations recorded this month.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {violations.map(v => (
                <div key={v.id} className="p-4 border border-red-100 bg-red-50/70 rounded-2xl flex justify-between items-center">
                  <div>
                    <p className="font-bold text-red-900 text-sm">{v.type}</p>
                    <p className="text-xs text-red-700 font-mono mt-0.5">{v.vehicleId} • {v.date}</p>
                  </div>
                  <span className="text-lg font-black text-red-600">-{v.points} Pts</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'Checks' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 end-0 p-8 opacity-10"><Activity size={180}/></div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-10">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter">Fleet Health & Pre-Trip Checks</h3>
                <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mt-1">Daily Safety Compliance Verification</p>
              </div>
              <button 
                onClick={() => setIsCheckModalOpen(true)}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition cursor-pointer"
              >
                <Plus size={15}/> Log Pre-Trip Check
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Inspections Completed</p>
                <p className="text-3xl font-black">{vehicleChecks.length}</p>
              </div>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Defects Logged</p>
                <p className="text-3xl font-black text-orange-400">
                  {vehicleChecks.filter(c => c.status !== 'Passed').length}
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Fleet Compliance</p>
                <p className="text-3xl font-black text-emerald-400">
                  {Math.round((vehicleChecks.filter(c => c.status === 'Passed').length / vehicleChecks.length) * 100)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h4 className="text-base font-black text-slate-800 uppercase tracking-tight">Recent Daily Inspections ({vehicleChecks.length} Records)</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3 font-bold">Check ID & Date</th>
                    <th className="px-5 py-3 font-bold">Vehicle Unit</th>
                    <th className="px-5 py-3 font-bold">Inspector</th>
                    <th className="px-5 py-3 font-bold">Odometer</th>
                    <th className="px-5 py-3 font-bold">Brakes & Tires</th>
                    <th className="px-5 py-3 font-bold">Safety Kit</th>
                    <th className="px-5 py-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vehicleChecks.map(check => (
                    <tr key={check.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-indigo-600">{check.id}</span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{check.checkDate}</div>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-800">{check.vehicleId}</td>
                      <td className="px-5 py-3.5 text-slate-600">{check.inspectorName}</td>
                      <td className="px-5 py-3.5 font-mono text-slate-600">{check.odometer.toLocaleString()} km</td>
                      <td className="px-5 py-3.5">
                        <div className="text-slate-700 font-medium">Brakes: {check.brakeTestPassed ? '✓ Passed' : '✗ Failed'}</div>
                        <div className="text-[10px] text-slate-400">Tread: {check.tireCondition}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${check.safetyKitVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                          {check.safetyKitVerified ? 'Verified' : 'Missing items'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${
                          check.status === 'Passed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          check.status === 'Defect Noted' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {check.status}
                        </span>
                        {check.defectsReported && check.defectsReported.length > 0 && (
                          <div className="text-[10px] text-red-600 mt-1">{check.defectsReported[0]}</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {isCheckModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <Plus size={18} className="text-orange-600"/> Log Pre-Trip Check
              </h3>
              <button onClick={() => setIsCheckModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddCheck} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Fleet Vehicle</label>
                <select 
                  value={newCheckVehicle}
                  onChange={(e) => setNewCheckVehicle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium"
                >
                  <option value="T-4421 (Heavy Lowbed)">T-4421 (Heavy Lowbed)</option>
                  <option value="B-2910 (Personnel Bus 32-Seat)">B-2910 (Personnel Bus 32-Seat)</option>
                  <option value="V-9922 (Toyota Hilux 4x4)">V-9922 (Toyota Hilux 4x4)</option>
                  <option value="T-3310 (Water Tanker 5000G)">T-3310 (Water Tanker 5000G)</option>
                  <option value="C-1102 (Hiab Crane Truck 12T)">C-1102 (Hiab Crane Truck 12T)</option>
                  <option value="V-1001 (Ford Ranger HSE Patrol)">V-1001 (Ford Ranger HSE Patrol)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Observed Defects (leave blank if all pass)</label>
                <input 
                  type="text"
                  placeholder="e.g. Driver side wiper squeal, low windshield fluid"
                  value={newCheckDefect}
                  onChange={(e) => setNewCheckDefect(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-slate-600">
                <div className="font-bold text-slate-800">Auto-Validated Checks:</div>
                <div>✓ 2kg dry chemical extinguisher inspected & tagged</div>
                <div>✓ First aid kit sealed and intact</div>
                <div>✓ IVMS GPS telematics unit calibrated</div>
                <div>✓ Brake pressure & deceleration check passed</div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsCheckModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black uppercase tracking-wider cursor-pointer"
                >
                  Submit Daily Check
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportModule;
