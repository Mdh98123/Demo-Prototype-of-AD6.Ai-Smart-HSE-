
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-bold tracking-wide ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40",
        destructive: "bg-status-fail text-white hover:bg-red-600 shadow-md",
        outline: "border-2 border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 hover:border-neutral-300",
        secondary: "bg-neutral-100 text-neutral-800 hover:bg-neutral-200",
        ghost: "hover:bg-neutral-50 hover:text-brand-600",
        link: "text-brand-600 underline-offset-4 hover:underline",
        success: "bg-status-pass text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25",
        dark: "bg-neutral-900 text-white hover:bg-neutral-800 shadow-lg shadow-neutral-900/20",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-xl px-4 text-xs font-black uppercase tracking-wider",
        lg: "h-14 rounded-[1.25rem] px-8 text-base",
        icon: "h-10 w-10",
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
