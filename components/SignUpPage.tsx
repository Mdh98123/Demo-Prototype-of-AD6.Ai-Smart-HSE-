
import React, { useState } from "react";
import { useUser } from '../contexts/UserContext';
import { LeadCaptureService } from '../services/leadCaptureService';
import { Mail, Loader2, ShieldCheck, ArrowRight, User, Building, AlertCircle, CheckCircle2, Hexagon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface SignUpPageProps {
    onLoginClick: () => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onLoginClick }) => {
  const { register } = useUser();
  
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      department: ''
  });
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validate = (name: string, value: string) => {
      let error = "";
      if (name === "name" && !value.trim()) error = "Full name is required.";
      if (name === "email") {
          if (!value.trim()) error = "Email is required.";
          else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) error = "Invalid email format.";
      }
      if (name === "department" && !value) error = "Please select a department.";
      return error;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setTouched(prev => ({ ...prev, [name]: true }));
      setFieldErrors(prev => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData({
          ...formData,
          [name]: value
      });
      if (status === 'error') setStatus('idle');
      
      // Real-time validation
      if (touched[name]) {
          setFieldErrors(prev => ({ ...prev, [name]: validate(name, value) }));
      }
  };

  const triggerConfetti = () => {
    const end = Date.now() + 3 * 1000;
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    
    // Validate all fields
    const errors: { [key: string]: string } = {};
    Object.keys(formData).forEach(key => {
        const error = validate(key, (formData as any)[key]);
        if (error) errors[key] = error;
    });

    if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setTouched({ name: true, email: true, department: true });
        return;
    }

    setStatus('loading');

    try {
        LeadCaptureService.captureEmail(formData.email).catch(err => {
            console.warn("Analytics capture failed silently:", err);
        });

        const success = await register(formData.email, formData.name, formData.department);
        
        if (success) {
            setStatus('success');
            triggerConfetti();
        } else {
            setFormError("Registration failed. Please try again.");
            setStatus('error');
        }
    } catch (err: any) {
        console.error("Registration error:", err);
        setFormError("An unexpected error occurred. Please try again.");
        setStatus('error');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 font-sans text-slate-900 overflow-hidden">
       {/* Left Panel */}
       <div className="hidden lg:flex w-5/12 bg-slate-950 relative flex-col justify-between p-16 text-white overflow-hidden isolate">
          {/* Background */}
          <div className="absolute inset-0 z-0">
              <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-indigo-900/20 rounded-full blur-[120px] mix-blend-screen" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-900/30 rounded-full blur-[100px] mix-blend-screen" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          </div>

          <div className="relative z-10 flex flex-col h-full justify-between animate-in fade-in slide-in-from-left-8 duration-1000">
             <div>
                 <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
                        <Hexagon size={28} strokeWidth={2.5} className="fill-white/10" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight leading-none text-white">AD6.Ai</h2>
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-400 mt-1.5">Smart HSE Suite</p>
                    </div>
                 </div>
                 
                 <div className="space-y-8 max-w-lg">
                     <h1 className="text-5xl font-black leading-[1.1] tracking-tight">
                        <span className="text-white">Join the Future</span><br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-emerald-200 to-white">of Safety Ops.</span>
                     </h1>
                     <p className="text-lg text-slate-400 leading-relaxed font-medium">
                        Create your account to unlock predictive intelligence, automated compliance reporting, and real-time risk management tools.
                     </p>
                 </div>
             </div>

             <div className="grid grid-cols-1 gap-4">
                  <div className="group bg-white/5 backdrop-blur-sm border border-white/5 p-5 rounded-2xl flex items-center gap-5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 cursor-default">
                      <div className="p-3 bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 rounded-xl text-indigo-400 ring-1 ring-indigo-500/20 group-hover:scale-110 transition-transform"><ShieldCheck size={20}/></div>
                      <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200/70 mb-0.5">Secure Access</p>
                          <p className="font-bold text-white text-sm">Role-Based Permission Matrix</p>
                      </div>
                  </div>
             </div>
             
             <div className="mt-8 pt-8 border-t border-white/5 flex justify-between items-center text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div> Registration Open</span>
                  <span>v2.4.0</span>
             </div>
          </div>
       </div>

       {/* Right Panel - Sign Up Form */}
       <div className="w-full lg:w-7/12 flex items-center justify-center p-8 lg:p-24 bg-white relative overflow-y-auto">
          <div className="w-full max-w-md space-y-10 animate-in fade-in zoom-in-95 duration-500 delay-150 py-10">
              
              <div className="text-center lg:text-left space-y-2">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Create Account</h2>
                  <p className="text-slate-500 font-medium text-lg">Enter your details to provision a new workspace.</p>
              </div>

              {/* Form */}
              <form onSubmit={handleRegisterSubmit} className="space-y-6">
                  <div className="space-y-2">
                      <Label>Full Name <span className="text-red-500">*</span></Label>
                      <div className="relative group">
                          <div className={`absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors ${fieldErrors.name ? 'text-red-400' : 'text-slate-300 group-focus-within:text-indigo-600'}`}>
                              <User size={20} />
                          </div>
                          <Input 
                              type="text" 
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              onBlur={handleBlur}
                              className={`pl-14 ${fieldErrors.name ? 'border-red-500 focus-visible:ring-red-500 bg-red-50/10' : touched.name && !fieldErrors.name ? 'border-emerald-200 bg-emerald-50/10 focus-visible:ring-emerald-500' : ''}`}
                              placeholder="Jane Doe"
                              disabled={status === 'loading' || status === 'success'}
                          />
                          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                              {fieldErrors.name && <AlertCircle size={16} className="text-red-500" />}
                              {touched.name && !fieldErrors.name && <CheckCircle2 size={16} className="text-emerald-500" />}
                          </div>
                      </div>
                      {fieldErrors.name && <p className="text-red-500 text-xs font-bold ml-1">{fieldErrors.name}</p>}
                  </div>

                  <div className="space-y-2">
                      <Label>Work Email <span className="text-red-500">*</span></Label>
                      <div className="relative group">
                          <div className={`absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors ${fieldErrors.email ? 'text-red-400' : 'text-slate-300 group-focus-within:text-indigo-600'}`}>
                              <Mail size={20} />
                          </div>
                          <Input 
                              type="email" 
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              onBlur={handleBlur}
                              className={`pl-14 ${fieldErrors.email ? 'border-red-500 focus-visible:ring-red-500 bg-red-50/10' : touched.email && !fieldErrors.email ? 'border-emerald-200 bg-emerald-50/10 focus-visible:ring-emerald-500' : ''}`}
                              placeholder="name@company.com"
                              disabled={status === 'loading' || status === 'success'}
                          />
                          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                              {fieldErrors.email && <AlertCircle size={16} className="text-red-500" />}
                              {touched.email && !fieldErrors.email && <CheckCircle2 size={16} className="text-emerald-500" />}
                          </div>
                      </div>
                      {fieldErrors.email && <p className="text-red-500 text-xs font-bold ml-1">{fieldErrors.email}</p>}
                  </div>

                  <div className="space-y-2">
                      <Label>Department <span className="text-red-500">*</span></Label>
                      <div className="relative group">
                          <div className={`absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors ${fieldErrors.department ? 'text-red-400' : 'text-slate-300 group-focus-within:text-indigo-600'}`}>
                              <Building size={20} />
                          </div>
                          <select 
                              name="department"
                              value={formData.department}
                              onChange={handleInputChange}
                              onBlur={handleBlur}
                              className={`w-full pl-14 pr-6 py-5 bg-slate-50 border-2 rounded-2xl outline-none transition-all font-bold text-sm text-slate-800 placeholder:text-slate-300 placeholder:font-semibold appearance-none cursor-pointer ${
                                  fieldErrors.department 
                                  ? 'border-red-500 focus:border-red-500 bg-red-50/10' 
                                  : touched.department && !fieldErrors.department
                                    ? 'border-emerald-200 bg-emerald-50/10 focus:border-emerald-500'
                                    : 'border-slate-100 focus:border-indigo-600 focus:bg-white hover:border-slate-200'
                              }`}
                              disabled={status === 'loading' || status === 'success'}
                          >
                              <option value="">Select Department...</option>
                              <option value="HSE">HSE Management</option>
                              <option value="Operations">Operations</option>
                              <option value="Engineering">Engineering</option>
                              <option value="Admin">Administration</option>
                          </select>
                          <div className="absolute inset-y-0 right-8 flex items-center pointer-events-none">
                              {fieldErrors.department && <AlertCircle size={16} className="text-red-500" />}
                              {touched.department && !fieldErrors.department && <CheckCircle2 size={16} className="text-emerald-500" />}
                          </div>
                      </div>
                      {fieldErrors.department && <p className="text-red-500 text-xs font-bold ml-1">{fieldErrors.department}</p>}
                  </div>

                  <AnimatePresence>
                    {status === 'error' && formError && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0, y: -10 }} 
                            animate={{ opacity: 1, height: 'auto', y: 0 }} 
                            exit={{ opacity: 0, height: 0, y: -10 }}
                            className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-3"
                        >
                            <AlertCircle size={16} className="text-red-600 mt-0.5 shrink-0" /> 
                            <p className="text-red-700 text-xs font-bold leading-tight">{formError}</p>
                        </motion.div>
                    )}
                  </AnimatePresence>

                  <Button 
                      type="submit" 
                      disabled={status === 'loading' || status === 'success' || Object.keys(fieldErrors).length > 0 && Object.values(fieldErrors).some(Boolean)}
                      className="w-full gap-3"
                      variant={status === 'success' ? 'success' : 'default'}
                  >
                      {status === 'loading' ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Provisioning Account...
                          </>
                      ) : status === 'success' ? (
                          <>
                            <CheckCircle2 size={18} />
                            Success - Redirecting...
                          </>
                      ) : (
                          <>
                            Create Account <ArrowRight size={18} />
                          </>
                      )}
                  </Button>
              </form>
              
              <div className="pt-6 border-t border-slate-100 text-center">
                  <p className="text-sm font-medium text-slate-500">
                      Already have an account? {' '}
                      <button onClick={onLoginClick} className="text-indigo-600 font-bold hover:underline">
                          Sign In
                      </button>
                  </p>
              </div>
          </div>
       </div>
    </div>
  )
}

export default SignUpPage;
