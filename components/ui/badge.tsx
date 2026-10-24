import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertOctagon, AlertTriangle, AlertCircle, ShieldCheck, CheckCircle2, Clock, XCircle } from "lucide-react"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-slate-800 bg-slate-900 text-white",
        secondary:
          "border-slate-200 bg-slate-100 text-slate-800",
        destructive:
          "border-red-300 bg-red-50 text-red-800",
        outline: "border-slate-300 text-slate-800 bg-white",
        success:
          "border-emerald-300 bg-emerald-50 text-emerald-800",
        warning:
          "border-amber-300 bg-amber-50 text-amber-800",
        info: "border-blue-300 bg-blue-50 text-blue-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export type RiskSeverity = 'Critical' | 'High' | 'Moderate' | 'Medium' | 'Low';

export interface SeverityBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  level: RiskSeverity | string;
  showIcon?: boolean;
}

export function SeverityBadge({ level, showIcon = true, className, ...props }: SeverityBadgeProps) {
  const normalized = (level || '').toLowerCase();
  
  if (normalized.includes('crit')) {
    return (
      <div 
        className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded border border-red-300 bg-red-50 text-red-900 text-[11px] font-bold tracking-wider uppercase", className)}
        {...props}
      >
        {showIcon && <AlertOctagon size={12} className="text-red-700 shrink-0" />}
        <span>Critical</span>
      </div>
    );
  }
  
  if (normalized.includes('high')) {
    return (
      <div 
        className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded border border-orange-300 bg-orange-50 text-orange-950 text-[11px] font-bold tracking-wider uppercase", className)}
        {...props}
      >
        {showIcon && <AlertTriangle size={12} className="text-orange-700 shrink-0" />}
        <span>High</span>
      </div>
    );
  }
  
  if (normalized.includes('mod') || normalized.includes('med')) {
    return (
      <div 
        className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded border border-amber-300 bg-amber-50 text-amber-950 text-[11px] font-bold tracking-wider uppercase", className)}
        {...props}
      >
        {showIcon && <AlertCircle size={12} className="text-amber-700 shrink-0" />}
        <span>Moderate</span>
      </div>
    );
  }
  
  return (
    <div 
      className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded border border-emerald-300 bg-emerald-50 text-emerald-950 text-[11px] font-bold tracking-wider uppercase", className)}
      {...props}
    >
      {showIcon && <ShieldCheck size={12} className="text-emerald-700 shrink-0" />}
      <span>Low</span>
    </div>
  );
}

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: 'Open' | 'Closed' | 'In_Progress' | 'Pending' | 'Approved' | 'Rejected' | 'Overdue' | string;
}

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const norm = (status || '').toLowerCase().replace(/_/g, ' ');
  
  if (norm.includes('close') || norm.includes('approv') || norm.includes('complet')) {
    return (
      <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded border border-emerald-300 bg-emerald-50 text-emerald-950 text-[11px] font-semibold", className)} {...props}>
        <CheckCircle2 size={12} className="text-emerald-700 shrink-0" />
        <span className="capitalize">{norm}</span>
      </div>
    );
  }
  
  if (norm.includes('overdue') || norm.includes('reject')) {
    return (
      <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded border border-red-300 bg-red-50 text-red-950 text-[11px] font-semibold", className)} {...props}>
        <XCircle size={12} className="text-red-700 shrink-0" />
        <span className="capitalize">{norm}</span>
      </div>
    );
  }
  
  if (norm.includes('progress') || norm.includes('pend') || norm.includes('review')) {
    return (
      <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded border border-amber-300 bg-amber-50 text-amber-950 text-[11px] font-semibold", className)} {...props}>
        <Clock size={12} className="text-amber-700 shrink-0" />
        <span className="capitalize">{norm}</span>
      </div>
    );
  }
  
  return (
    <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-300 bg-slate-50 text-slate-800 text-[11px] font-semibold", className)} {...props}>
      <span className="capitalize">{norm}</span>
    </div>
  );
}

export { Badge, badgeVariants }

