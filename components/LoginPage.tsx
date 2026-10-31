
import React, { useState } from "react";
import { useUser } from '../contexts/UserContext';
import { LeadCaptureService } from '../services/leadCaptureService';
import { Mail, Loader2, ArrowRight, ShieldCheck, Activity, AlertCircle, CheckCircle2, Hexagon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface LoginPageProps {
    onSignUpClick: () => void;
    onDemoClick: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSignUpClick, onDemoClick }) => {
  const { login, loginDemo } = useUser();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isDemoLaunching, setIsDemoLaunching] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean }>({});

  const handleLaunchDemoSandbox = async (personaId: string = 'u6') => {
    setIsDemoLaunching(true);
    setFormError("");
    try {
      const ok = await loginDemo(personaId);
      if (!ok) {
        setFormError("Failed to initialize demo sandbox. Please try again.");
      }
    } catch (err) {
      console.error("Demo launch error:", err);
      setFormError("Unable to enter demo sandbox.");
    } finally {
      setIsDemoLaunching(false);
    }
  };

  const validate = (fieldName: string, value: string) => {
      let error = "";
      if (fieldName === "email") {
          if (!value.trim()) {
              error = "Email address is required.";
          } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
              error = "Please enter a valid email address.";
          }
      }
      return error;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setTouched(prev => ({ ...prev, [name]: true }));
      setFieldErrors(prev => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      if (name === 'email') setEmail(value);
      
      if (status === 'error') setStatus('idle');
      setFormError("");
      
      if (touched[name as keyof typeof touched]) {
          setFieldErrors(prev => ({ ...prev, [name]: validate(name, value) }));
      }
  };

  const handleSSOLogin = async () => {
    setStatus('loading');
    setFormError("");
    try {
        const success = await login("SSO_LOGIN", false);
        if (success) {
            setStatus('success');
        } else {
            setFormError("SSO Authentication failed.");
            setStatus('error');
        }
    } catch (err) {
        console.error("SSO Login error:", err);
        setFormError("Connection error during SSO. Please try again.");
        setStatus('error');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    
    const emailError = validate("email", email);
    
    setFieldErrors({ email: emailError });
    setTouched({ email: true });

    if (emailError) {
        setStatus('idle');
        return;
    }

    setStatus('loading');

    try {
        // Capture lead for analytics (Emails collected to Google Sheet/Excel)
        LeadCaptureService.captureEmail(email).catch(err => console.warn("Analytics capture failed:", err));
        
        // Authenticate without password
        const success = await login(email, false);
        
        if (success) {
            setStatus('success');
        } else {
            setFormError("Authentication failed. Please check your email.");
            setStatus('error');
        }
    } catch (err: any) {
        console.error("Login error:", err);
        setFormError("Connection error. Please try again.");
        setStatus('error');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 font-sans text-slate-900 overflow-hidden">
       {/* Left Panel - Branding & Visuals */}
       <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-16 text-slate-900 overflow-hidden isolate">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop" 
                alt="Industrial Safety Context" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-slate-50/95 to-brand-50/90 backdrop-blur-[2px]" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-200/50 via-transparent to-transparent opacity-60" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full justify-between">
             <motion.div 
               initial={{ opacity: 0, y: 20 }} 
               animate={{ opacity: 1, y: 0 }} 
               transition={{ duration: 0.6 }}
             >
                 <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-white shadow-md border border-slate-200 rounded-2xl flex items-center justify-center shadow-lg">
                        <Hexagon className="text-emerald-400 fill-emerald-400/20" size={28} strokeWidth={2} />
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-brand-900">AD6.Ai</span>
                 </div>
                 
                 <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight mb-6 text-slate-900">
                    Smart HSE Suite<br/>
                    <span className="text-brand-600">
                        Safety Intelligence.
                    </span>
                 </h1>
                 <p className="text-slate-600 text-lg max-w-lg leading-relaxed font-medium">
                    The enterprise standard for Sultanate of Oman regulatory compliance. Predict operational risks, automate Ministry of Labour MD 286/2008 & PDO reporting, and protect your workforce with Generative AI.
                 </p>
             </motion.div>

             <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.4, duration: 0.6 }}
                className="grid gap-4 w-full max-w-md"
             >
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
                      <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-600 shadow-inner">
                        <ShieldCheck size={24}/>
                      </div>
                      <div>
                          <h3 className="font-bold text-slate-900 text-base">Regulatory Integrity</h3>
                          <p className="text-xs text-slate-500 mt-1 font-medium">Oman MoL-aligned workflows & PDO compliance.</p>
                      </div>
                  </div>
                  
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
                      <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-600 shadow-inner">
                        <Activity size={24}/>
                      </div>
                      <div>
                          <h3 className="font-bold text-slate-900 text-base">Leading-Indicator Analytics</h3>
                          <p className="text-xs text-slate-500 mt-1 font-medium">Proactively monitor leading safety indicators.</p>
                      </div>
                  </div>
             </motion.div>
             
             <div className="flex justify-between items-center text-xs font-medium text-slate-500">
                  <p>© 2025 AD6.Ai Enterprise Solutions</p>
                  <div className="flex gap-6">
                      <span className="hover:text-brand-900 cursor-pointer transition-colors">Privacy Policy</span>
                      <span className="hover:text-brand-900 cursor-pointer transition-colors">Terms of Service</span>
                  </div>
             </div>
          </div>
       </div>

       {/* Right Panel - Login Form */}
       <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white lg:rounded-l-3xl shadow-2xl z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[420px] space-y-10"
          >
              <div className="text-center lg:text-start">
                  <div className="inline-flex lg:hidden items-center justify-center w-14 h-14 bg-slate-900 rounded-2xl text-emerald-400 mb-6 shadow-lg">
                      <Hexagon size={32} strokeWidth={2} />
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Sign In</h2>
                  <p className="text-slate-600 mt-3 font-medium text-base">Enter your work email to access the command center.</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <div className="space-y-2">
                      <div className="flex items-center justify-between">
                          <Label className="ms-1 text-slate-700">Work Email <span className="text-red-500">*</span></Label>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                              DEMO ONLY (Simulated Auth)
                          </span>
                      </div>
                      <div className="relative group">
                          <div className={`absolute inset-y-0 start-0 ps-5 flex items-center pointer-events-none transition-colors ${fieldErrors.email ? 'text-red-400' : 'text-slate-400 group-focus-within:text-brand-600'}`}>
                              <Mail size={20} />
                          </div>
                          <Input 
                              type="email" 
                              name="email" 
                              value={email}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className={`bg-slate-50 border-slate-200 text-slate-900 ps-14 ${fieldErrors.email ? 'border-red-500 focus-visible:ring-red-500 bg-red-50' : touched.email && !fieldErrors.email ? 'border-emerald-500 focus-visible:ring-emerald-500 bg-emerald-50' : ''}`}
                              placeholder="name@company.com"
                              disabled={status === 'loading' || status === 'success'}
                          />
                          <div className="absolute inset-y-0 end-4 flex items-center pointer-events-none">
                              {fieldErrors.email && <AlertCircle size={18} className="text-red-500" />}
                              {touched.email && !fieldErrors.email && !status.includes('loading') && <CheckCircle2 size={18} className="text-emerald-500" />}
                          </div>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium ms-1">
                          Simulated authentication for evaluation. Enter any organization email (e.g. admin@ad6.ai) to test.
                      </p>
                      <AnimatePresence>
                        {fieldErrors.email && (
                            <motion.p 
                                initial={{ opacity: 0, height: 0 }} 
                                animate={{ opacity: 1, height: 'auto' }} 
                                exit={{ opacity: 0, height: 0 }}
                                className="text-red-500 text-xs font-bold mt-1 ms-1 flex items-center gap-1"
                            >
                                {fieldErrors.email}
                            </motion.p>
                        )}
                      </AnimatePresence>
                  </div>

                  <AnimatePresence>
                    {status === 'error' && formError && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0, y: -10 }} 
                            animate={{ opacity: 1, height: 'auto', y: 0 }} 
                            exit={{ opacity: 0, height: 0, y: -10 }}
                            className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3"
                        >
                            <AlertCircle size={18} className="text-red-600 mt-0.5 shrink-0" /> 
                            <p className="text-red-700 text-sm font-bold leading-snug">{formError}</p>
                        </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="pt-2 flex flex-col gap-3">
                      <Button 
                          type="submit" 
                          disabled={status === 'loading' || status === 'success'}
                          className="w-full gap-3 py-6 text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-lg cursor-pointer"
                          size="lg"
                          variant={status === 'success' ? 'success' : 'default'}
                      >
                          {status === 'loading' ? (
                              <>
                                <Loader2 size={18} className="animate-spin" />
                                Authenticating...
                              </>
                          ) : status === 'success' ? (
                              <>
                                <CheckCircle2 size={18} />
                                Access Granted
                              </>
                          ) : (
                              <>
                                Secure Sign In (DEMO ONLY) <ArrowRight size={18} />
                              </>
                          )}
                      </Button>

                      <div className="relative flex items-center py-4">
                          <div className="flex-grow border-t border-slate-200"></div>
                          <span className="flex-shrink-0 mx-4 text-slate-500 text-xs font-bold uppercase tracking-wider">Or continue with</span>
                          <div className="flex-grow border-t border-slate-200"></div>
                      </div>

                      <Button 
                          type="button" 
                          onClick={handleSSOLogin}
                          disabled={status === 'loading' || status === 'success'}
                          className="w-full gap-3 py-6 text-sm bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm rounded-xl cursor-pointer"
                          size="lg"
                      >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                          </svg>
                          Sign in with Google SSO
                      </Button>
                  </div>
              </form>
              
              <div className="pt-6 border-t border-slate-100 text-center">
                  <p className="text-sm font-semibold text-slate-500">
                      New to the platform? {' '}
                      <button onClick={onSignUpClick} className="text-brand-700 font-bold hover:text-brand-900 hover:underline transition-colors cursor-pointer">
                          Create Workspace
                      </button>
                  </p>
              </div>

              {/* Explicit Demonstration Mode Section */}
              <div className="mt-6 pt-5 border-t-2 border-dashed border-amber-300 bg-amber-50/80 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-6 sm:p-8 rounded-b-3xl">
                  <div className="flex items-center gap-2 mb-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                      <h3 className="text-xs font-black uppercase tracking-wider text-amber-900">
                          Synthetic Demonstration Data · DEMO MODE
                      </h3>
                  </div>
                  <p className="text-xs text-amber-800/90 mb-4 leading-relaxed font-medium">
                      Explore the platform with fictional, synthetic GCC concession demonstration data. Choose an authorized persona below to enter demonstration mode:
                  </p>

                  <div className="space-y-2.5">
                      {/* Primary Explicit Action: Enter Demonstration Mode as System Admin */}
                      <Button 
                          type="button"
                          onClick={() => handleLaunchDemoSandbox('admin')}
                          disabled={isDemoLaunching || status === 'loading'}
                          className="w-full gap-2.5 py-5 text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 rounded-xl cursor-pointer"
                          size="lg"
                      >
                          {isDemoLaunching ? (
                              <>
                                <Loader2 size={18} className="animate-spin" />
                                Initializing Demonstration Mode...
                              </>
                          ) : (
                              <>
                                <ShieldCheck size={18} />
                                <span>Enter Demonstration Mode (System Admin)</span>
                                <ArrowRight size={16} className="ms-auto" />
                              </>
                          )}
                      </Button>

                      {/* Explicit Demo Entry Alternatives */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                              type="button"
                              onClick={() => handleLaunchDemoSandbox('u6')}
                              disabled={isDemoLaunching || status === 'loading'}
                              className="py-2.5 px-3 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-xs text-center truncate cursor-pointer"
                              title="Enter as Frontline Worker persona (Rahul Gupta)"
                          >
                              Enter as Worker (Rahul)
                          </button>
                          <button
                              type="button"
                              onClick={() => handleLaunchDemoSandbox('u7')}
                              disabled={isDemoLaunching || status === 'loading'}
                              className="py-2.5 px-3 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-xs text-center truncate cursor-pointer"
                              title="Enter as Site Supervisor / PTW Issuer (Marcus Chen)"
                          >
                              Enter as Supervisor (Marcus)
                          </button>
                      </div>

                      <button 
                          type="button"
                          onClick={onDemoClick}
                          disabled={isDemoLaunching || status === 'loading'}
                          className="w-full py-2.5 text-xs font-bold text-amber-900/80 hover:text-amber-950 bg-amber-100/70 hover:bg-amber-100 border border-amber-300/70 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                          Take a Quick Test Drive (Guest Walkthrough)
                      </button>

                      {/* Feature Flag / Environment Indicator */}
                      <div className="pt-3 border-t border-amber-200/80 flex items-center justify-between text-[10px] text-amber-800 font-semibold">
                          <span>AUTH_MODE: <code className="bg-white/80 px-1.5 py-0.5 rounded border border-amber-200 text-amber-900 font-mono uppercase">demo</code></span>
                          <span>DEMO_MODE: <span className="text-emerald-700 font-bold">ENABLED</span></span>
                      </div>
                  </div>
              </div>
          </motion.div>
       </div>
    </div>
  )
}

export default LoginPage;
