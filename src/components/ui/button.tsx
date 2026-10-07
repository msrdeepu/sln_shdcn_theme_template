import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-500 text-zinc-950 font-semibold shadow hover:bg-emerald-400 hover:shadow-emerald-500/25 hover:shadow-lg",
        destructive:
          "bg-red-500 text-zinc-50 shadow-sm hover:bg-red-500/90",
        outline:
          "border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm text-zinc-100 shadow-sm hover:bg-zinc-800 hover:text-white hover:border-zinc-700",
        secondary:
          "bg-zinc-800 text-zinc-100 shadow-sm hover:bg-zinc-700 hover:text-white",
        ghost:
          "text-zinc-300 hover:bg-zinc-800/60 hover:text-white",
        link:
          "text-emerald-400 underline-offset-4 hover:underline",
        glass:
          "bg-white/10 backdrop-blur-md text-white border border-white/15 hover:bg-white/20 hover:border-white/25 shadow-xl",
        glow:
          "bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:brightness-110",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base font-medium",
        icon: "h-10 w-10",
        iconSm: "h-8 w-8",
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
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
