import { cn } from "@/lib/utils"

// Shimmer instead of shadcn's default pulse, which is nearly invisible on
// this light palette.
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-shimmer rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
