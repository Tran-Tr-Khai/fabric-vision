import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 shrink-0 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-[#1677ff] text-white hover:bg-[#2888ff]',
        outline:
          'border border-border bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white',
        ghost: 'text-slate-400 hover:bg-slate-800 hover:text-white',
        secondary: 'bg-slate-800 text-slate-200 hover:bg-slate-700',
      },
      size: { default: 'h-10 px-4', sm: 'h-8 px-3 text-[11px]', icon: 'size-8' },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        data-variant={variant ?? 'default'}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'
