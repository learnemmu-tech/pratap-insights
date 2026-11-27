import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-oklch(0.708 0 0) focus-visible:ring-[3px] focus-visible:ring-oklch(0.708 0 0)/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-oklch(0.577 0.245 27.325) aria-invalid:ring-oklch(0.577 0.245 27.325)/20 dark:aria-invalid:ring-oklch(0.577 0.245 27.325)/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 dark:focus-visible:border-oklch(0.556 0 0) dark:focus-visible:ring-oklch(0.556 0 0)/50 dark:aria-invalid:border-oklch(0.704 0.191 22.216) dark:aria-invalid:ring-oklch(0.704 0.191 22.216)/20 dark:dark:aria-invalid:ring-oklch(0.704 0.191 22.216)/40",
  {
    variants: {
      variant: {
        default: "h-11 rounded-[6px] bg-[#c0623a] px-4 text-sm font-medium text-white hover:bg-[#a8512f] active:bg-[#924022]",
        destructive: "h-11 rounded-[6px] bg-[#c03a3a] px-4 text-sm font-medium text-white hover:bg-[#c03a3a]/90",
        outline: "h-11 rounded-[6px] border border-[#e2d9cc] bg-white px-4 text-sm font-medium text-[#1c2b3a] hover:bg-[#f5e8e2]",
        secondary: "h-11 rounded-[6px] bg-[#eef1f5] px-4 text-sm font-medium text-[#1c2b3a] hover:bg-[#e2d9cc]",
        ghost: "h-11 rounded-[6px] px-4 text-sm font-medium text-[#1c2b3a] hover:bg-[#f5e8e2]",
        link: "h-auto rounded-none px-0 text-sm font-medium text-[#c0623a] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 rounded-[6px] px-4 text-sm",
        sm: "h-10 rounded-[6px] px-3 text-sm",
        lg: "h-12 rounded-[6px] px-6 text-sm",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
