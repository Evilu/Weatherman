import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "weather-button text-white shadow-lg hover:shadow-xl",
        destructive:
          "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 border border-red-400/30",
        outline:
          "border-2 border-white/40 bg-white/30 backdrop-blur-md hover:bg-white/50 hover:border-white/60 text-slate-800 font-semibold shadow-sm hover:shadow-md",
        secondary:
          "bg-white/25 backdrop-blur-md border border-white/30 hover:bg-white/40 text-slate-800 font-semibold shadow-sm hover:shadow-md",
        ghost: "hover:bg-white/20 hover:backdrop-blur-md text-slate-700 hover:text-slate-900",
        link: "text-sky-600 hover:text-sky-700 underline-offset-4 hover:underline font-semibold",
      },
      size: {
        default: "h-11 px-8 py-2.5",
        sm: "h-9 px-6 text-xs",
        lg: "h-12 px-10 text-base",
        icon: "h-11 w-11",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild: _asChild = false, ...props }, ref) => {
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
