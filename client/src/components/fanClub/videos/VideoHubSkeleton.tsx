import { Skeleton } from "../../ui/skeleton";

// The shape of the video room while the catalog loads: the featured block
// and a row of program tiles.
export function VideoHubSkeleton() {
  return (
    <div role="status" aria-label="Cargando videos">
      <Skeleton className="mb-4 h-9 w-72" />
      <Skeleton className="mb-10 h-12 w-full md:max-w-md" />
      <div className="mb-12 overflow-hidden rounded-3xl md:grid md:grid-cols-[3fr_2fr]">
        <Skeleton className="aspect-[3/1] w-full rounded-none" />
        <div className="p-6 sm:p-8">
          <Skeleton className="mb-3 h-4 w-32" />
          <Skeleton className="mb-5 h-8 w-48" />
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="mb-2 h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      <Skeleton className="mb-4 h-6 w-20" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="w-60 shrink-0 sm:w-72">
            <Skeleton className="aspect-[3/1] w-full rounded-xl" />
            <Skeleton className="mt-2 h-3 w-24" />
            <Skeleton className="mt-2 h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
