import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm border border-blue-700",
        destructive: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm border border-red-700",
        outline: "border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 shadow-xs",
        secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 border border-slate-200",
        ghost: "hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-transparent",
        link: "text-blue-600 underline-offset-4 hover:underline border-transparent bg-transparent shadow-none",
        success: "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm border border-emerald-700",
        dark: "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 shadow-sm border border-slate-800",
      },
      size: {
        default: "h-11 min-h-[44px] px-5 py-2.5",
        sm: "h-9 min-h-[36px] rounded-lg px-3.5 text-xs font-bold uppercase tracking-wider",
        lg: "h-12 min-h-[48px] rounded-xl px-7 text-base font-bold",
        icon: "h-10 w-10 min-h-[40px] min-w-[40px] rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "success" | "dark" | null | undefined;
  size?: "default" | "sm" | "lg" | "icon" | null | undefined;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
