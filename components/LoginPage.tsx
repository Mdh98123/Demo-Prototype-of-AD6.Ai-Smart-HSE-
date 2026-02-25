
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
}

const LoginPage: React.FC<LoginPageProps> = ({ onSignUpClick }) => {
  const { login } = useUser();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean }>({});

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
       <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-16 text-white overflow-hidden isolate">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop" 
                alt="Industrial Safety Context" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-indigo-900/40 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full justify-between">
             <motion.div 
               initial={{ opacity: 0, y: 20 }} 
               animate={{ opacity: 1, y: 0 }} 
               transition={{ duration: 0.6 }}
             >
                 <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shadow-lg">
                        <Hexagon className="text-emerald-400 fill-emerald-400/20" size={28} strokeWidth={2} />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-white">AD6.Ai</span>
                 </div>
                 
                 <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight mb-6 drop-shadow-lg">
                    Smart HSE Suite<br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                        Safety Intelligence.
                    </span>
                 </h1>
                 <p className="text-slate-200 text-lg max-w-lg leading-relaxed font-medium drop-shadow-md">
                    The enterprise standard for UAE regulatory compliance. Predict operational risks, automate OSHAD reporting, and protect your workforce with Generative AI.
                 </p>
             </motion.div>

             <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.4, duration: 0.6 }}
                className="grid gap-4 w-full max-w-md"
             >
                  <div className="p-5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md flex items-center gap-5 transition-all hover:bg-white/15">
                      <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-300 shadow-inner">
                        <ShieldCheck size={24}/>
                      </div>
                      <div>
                          <h3 className="font-bold text-white text-base">Regulatory Integrity</h3>
                          <p className="text-xs text-slate-300 mt-1 font-medium">100% ADNOC & OSHAD Alignment.</p>
                      </div>
                  </div>
                  
                  <div className="p-5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md flex items-center gap-5 transition-all hover:bg-white/15">
                      <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-300 shadow-inner">
                        <Activity size={24}/>
                      </div>
                      <div>
                          <h3 className="font-bold text-white text-base">Predictive Analytics</h3>
                          <p className="text-xs text-slate-300 mt-1 font-medium">Forecast incidents before they occur.</p>
                      </div>
                  </div>
             </motion.div>
             
             <div className="flex justify-between items-center text-xs font-medium text-slate-400/80">
                  <p>© 2025 AD6.Ai Enterprise Solutions</p>
                  <div className="flex gap-6">
                      <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
                      <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
                  </div>
             </div>
          </div>
       </div>

       {/* Right Panel - Login Form */}
       <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[420px] space-y-10"
          >
              <div className="text-center lg:text-left">
                  <div className="inline-flex lg:hidden items-center justify-center w-14 h-14 bg-slate-900 rounded-2xl text-emerald-400 mb-6 shadow-lg">
                      <Hexagon size={32} strokeWidth={2} />
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Sign In</h2>
                  <p className="text-slate-500 mt-3 font-medium text-base">Enter your work email to access the command center.</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <div className="space-y-2">
                      <Label className="ml-1">Work Email <span className="text-red-500">*</span></Label>
                      <div className="relative group">
                          <div className={`absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors ${fieldErrors.email ? 'text-red-400' : 'text-slate-400 group-focus-within:text-indigo-600'}`}>
                              <Mail size={20} />
                          </div>
                          <Input 
                              type="email"
                              name="email" 
                              value={email}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className={`pl-14 ${fieldErrors.email ? 'border-red-500 focus-visible:ring-red-500 bg-red-50/5' : touched.email && !fieldErrors.email ? 'border-emerald-500 focus-visible:ring-emerald-500 bg-emerald-50/5' : ''}`}
                              placeholder="name@company.com"
                              disabled={status === 'loading' || status === 'success'}
                          />
                          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                              {fieldErrors.email && <AlertCircle size={18} className="text-red-500" />}
                              {touched.email && !fieldErrors.email && !status.includes('loading') && <CheckCircle2 size={18} className="text-emerald-500" />}
                          </div>
                      </div>
                      <AnimatePresence>
                        {fieldErrors.email && (
                            <motion.p 
                                initial={{ opacity: 0, height: 0 }} 
                                animate={{ opacity: 1, height: 'auto' }} 
                                exit={{ opacity: 0, height: 0 }}
                                className="text-red-500 text-xs font-bold mt-1 ml-1 flex items-center gap-1"
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

                  <div className="pt-2">
                      <Button 
                          type="submit" 
                          disabled={status === 'loading' || status === 'success'}
                          className="w-full gap-3 py-6 text-sm"
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
                                Secure Sign In <ArrowRight size={18} />
                              </>
                          )}
                      </Button>
                  </div>
              </form>
              
              <div className="pt-8 border-t border-slate-100 text-center">
                  <p className="text-sm font-semibold text-slate-500">
                      New to the platform? {' '}
                      <button onClick={onSignUpClick} className="text-indigo-600 font-bold hover:text-indigo-800 hover:underline transition-colors">
                          Create Workspace
                      </button>
                  </p>
              </div>
          </motion.div>
       </div>
    </div>
  )
}

export default LoginPage;
