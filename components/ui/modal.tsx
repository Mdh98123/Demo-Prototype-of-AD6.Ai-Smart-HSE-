import * as React from "react"
import { cn } from "../../lib/utils"
import { X } from "lucide-react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "full"
  className?: string
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
  full: "max-w-[calc(100%-2rem)] md:max-w-[calc(100%-4rem)] h-[calc(100%-2rem)] md:h-[calc(100%-4rem)]" // Responsive full
}

export function Modal({ isOpen, onClose, title, description, children, size = "md", className }: ModalProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => { document.body.style.overflow = "unset" }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Dialog */}
      <div 
        className={cn(
          "relative z-50 flex flex-col w-full glass-modal animate-in zoom-in-95 duration-200", 
          sizeClasses[size],
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {(title || description) && (
          <div className="flex flex-col space-y-1.5 p-6 border-b border-slate-100">
            <div className="flex items-start justify-between">
              {title && <h2 className="text-lg font-bold leading-none tracking-tight text-slate-900">{title}</h2>}
              <button 
                onClick={onClose}
                className="rounded-full p-1 border border-transparent hover:bg-slate-100 hover:border-slate-200 transition-colors glass-card right-6 top-6 absolute focus:outline-none focus:ring-2 focus:ring-slate-900 ring-offset-2"
              >
                <X className="h-4 w-4 text-slate-500" />
                <span className="sr-only">Close</span>
              </button>
            </div>
            {description && <p className="text-sm font-medium text-slate-500">{description}</p>}
          </div>
        )}
        
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
