import React, { useState } from "react";
import { useUser } from '../contexts/UserContext';
import { LeadCaptureService } from '../services/leadCaptureService';
import { 
  Mail, Loader2, Activity, Leaf, ShieldCheck, 
  AlertCircle, CheckCircle2, Hexagon, Lock 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LoginPage: React.FC = () => {
  const { login } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Removed strict validation to allow easier access for demo purposes
    if (!email.trim()) {
        setErrorMsg("Please enter an email address.");
        setStatus('error');
        return;
    }
    
    // Password check removed as per request

    setStatus('loading');
    setErrorMsg("");

    try {
        await LeadCaptureService.captureEmail(email);
        // The mock auth service in UserContext currently takes (username, rememberMe). 
        // We'll pass email as username.
        const success = await login(email, false);
        
        if (success) {
            setStatus('success');
        } else {
            // Fallback error, though mostly success with mock auth
            setErrorMsg("Login failed. Please try again.");
            setStatus('error');
        }
    } catch (err) {
        setErrorMsg("Connection error. Please try again.");
        setStatus('error');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 font-sans text-slate-900 overflow-hidden selection:bg-emerald-500/30">
       {/* Left Panel - The "Integrity Core" */}
       <div className="hidden lg:flex w-5/12 bg-slate-950 relative flex-col justify-between p-16 text-white overflow-hidden isolate">
          {/* Ambient Background Effects */}
          <div className="absolute inset-0 z-0 pointer-events-none">
              <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-emerald-500/10 rounded-full blur-[120px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[100px]" />
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
              {/* Grid Pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          </div>

          {/* Content Layer */}
          <div className="relative z-10 flex flex-col h-full justify-between">
             {/* Header Logo */}
             <div>
                 <div className="flex items-center gap-3 mb-12">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-white shadow-glow ring-1 ring-white/20">
                        <Hexagon size={20} strokeWidth={3} className="fill-white/20" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white leading-none">AD6.Ai</h2>
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-500 mt-1">Smart HSE Suite</p>
                    </div>
                 </div>
                 
                 <div className="space-y-6 max-w-lg">
                     <h1 className="text-5xl font-bold leading-[1.1] tracking-tight">
                        Predictive Safety.<br/>
                        <span className="text-emerald-400">Zero Compromise.</span>
                     </h1>
                     <p className="text-lg text-slate-400 leading-relaxed font-medium">
                        Deploy the next generation of UAE regulatory compliance. Our AI engine transforms reactive reporting into proactive risk elimination.
                     </p>
                 </div>
             </div>

             {/* Feature Cards */}
             <div className="grid gap-4">
                  <FeatureCard 
                    icon={<Activity size={18} />}
                    title="Core Engine"
                    desc="Real-time Risk Telemetry"
                    color="text-emerald-400"
                    bg="bg-emerald-400/10"
                    border="group-hover:border-emerald-500/50"
                  />
                  <FeatureCard 
                    icon={<Leaf size={18} />}
                    title="Sustainability"
                    desc="Environmental Impact Tracking"
                    color="text-teal-400"
                    bg="bg-teal-400/10"
                    border="group-hover:border-teal-500/50"
                  />
                  <FeatureCard 
                    icon={<ShieldCheck size={18} />}
                    title="Governance"
                    desc="Immutable Audit Defense"
                    color="text-indigo-400"
                    bg="bg-indigo-400/10"
                    border="group-hover:border-indigo-500/50"
                  />
             </div>
             
             {/* Footer Status */}
             <div className="pt-8 flex items-center gap-3 text-xs font-mono text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="uppercase tracking-wider">System Operational</span>
                  </div>
                  <span className="text-slate-700">•</span>
                  <span className="uppercase tracking-wider">Enterprise Version 2.4.0</span>
             </div>
          </div>
       </div>

       {/* Right Panel - Login Form */}
       <div className="w-full lg:w-7/12 flex items-center justify-center p-6 lg:p-20 bg-[#F8FAFC]">
          <div className="w-full max-w-[440px] space-y-8">
              
              {/* Mobile Header */}
              <div className="lg:hidden mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-emerald-400 shadow-md">
                        <Hexagon size={20} strokeWidth={3} className="fill-white/10" />
                    </div>
                    <span className="text-xl font-bold text-slate-900">AD6.Ai</span>
                  </div>
              </div>

              <div>
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
                  <p className="text-slate-500 mt-2 text-sm font-medium">Authenticate to access your operational dashboard.</p>
              </div>

              {/* Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div className="space-y-4">
                      {/* Email Field */}
                      <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Work Email</label>
                          <div className="relative group">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                                  <Mail size={18} />
                              </div>
                              <input 
                                  type="email" 
                                  value={email}
                                  onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
                                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 hover:border-slate-300"
                                  placeholder="name@company.com"
                                  disabled={status === 'loading' || status === 'success'}
                                  autoComplete="username"
                              />
                          </div>
                      </div>

                      {/* Password Field */}
                      <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                          <div className="relative group">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                                  <Lock size={18} />
                              </div>
                              <input 
                                  type="password" 
                                  value={password}
                                  onChange={(e) => { setPassword(e.target.value); if (status === 'error') setStatus('idle'); }}
                                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 hover:border-slate-300"
                                  placeholder="•••••••• (Optional)"
                                  disabled={status === 'loading' || status === 'success'}
                                  autoComplete="current-password"
                              />
                          </div>
                      </div>
                  </div>

                  <AnimatePresence>
                    {status === 'error' && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-2 text-red-600 text-xs font-semibold bg-red-50 p-3 rounded-lg border border-red-100"
                        >
                            <AlertCircle size={14} /> {errorMsg}
                        </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-xs font-medium text-slate-500">Remember me</span>
                      </label>
                      <button type="button" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline">Forgot Password?</button>
                  </div>

                  <button 
                      type="submit" 
                      disabled={status === 'loading' || status === 'success'}
                      className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] ${
                          status === 'success' 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      } disabled:opacity-80 disabled:cursor-not-allowed`}
                  >
                      {status === 'loading' ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            <span className="opacity-90">Authenticating...</span>
                          </>
                      ) : status === 'success' ? (
                          <>
                            <CheckCircle2 size={18} />
                            <span>Redirecting...</span>
                          </>
                      ) : (
                          <>
                            Sign In
                          </>
                      )}
                  </button>

                  <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                      <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#F8FAFC] px-2 text-slate-400 font-bold tracking-wider">Or continue with</span></div>
                  </div>

                  <button type="button" className="w-full bg-white border border-slate-200 text-slate-700 font-semibold py-3.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-3 active:scale-[0.98]">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" fill="#F25022"/><path d="M11.4 24H0V12.6h11.4V24z" fill="#00A4EF"/><path d="M24 24H12.6V12.6H24V24z" fill="#FFB900"/><path d="M11.4 11.4H0V0h11.4v11.4z" fill="#F25022"/><path d="M24 11.4H12.6V0H24v11.4z" fill="#7FBA00"/></svg>
                      Microsoft Entra ID
                  </button>
              </form>
              
              {/* Footer */}
              <div className="pt-6 space-y-6">
                  <div className="flex items-center justify-center gap-2 text-slate-400">
                      <Lock size={12} />
                      <span className="text-[10px] font-medium">Protected by 256-bit encryption. ISO 27001 Certified.</span>
                  </div>
                  
                  <div className="border-t border-slate-200 pt-6">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center mb-4">Trusted by Industry Leaders</p>
                      <div className="flex justify-center gap-6 opacity-40 grayscale">
                          <div className="h-6 w-20 bg-slate-300 rounded"></div>
                          <div className="h-6 w-20 bg-slate-300 rounded"></div>
                          <div className="h-6 w-20 bg-slate-300 rounded"></div>
                          <div className="h-6 w-20 bg-slate-300 rounded hidden sm:block"></div>
                      </div>
                  </div>
                  
                  <div className="text-center">
                      <button className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors">Contact Support</button>
                  </div>
              </div>
          </div>
       </div>
    </div>
  )
}

const FeatureCard = ({ icon, title, desc, color, bg, border }: { icon: React.ReactNode, title: string, desc: string, color: string, bg: string, border: string }) => (
    <div className={`group bg-white/5 backdrop-blur-sm border border-white/5 p-4 rounded-xl flex items-center gap-4 hover:bg-white/10 transition-all duration-300 cursor-default ${border}`}>
        <div className={`p-2.5 rounded-lg ${bg} ${color} ring-1 ring-inset ring-white/10 group-hover:scale-110 transition-transform duration-300`}>
            {icon}
        </div>
        <div>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-0.5 opacity-70 ${color}`}>{title}</p>
            <p className="font-semibold text-white text-sm tracking-tight">{desc}</p>
        </div>
    </div>
);

export default LoginPage;