import { Card } from "../ui/brand/Card";
import { Skeleton } from "../ui/skeleton";

// Same footprint as EpisodeCard, so the grid does not jump when episodes
// arrive.
export function EpisodeCardSkeleton() {
  return (
    <Card>
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-5">
        <Skeleton className="mb-2 h-6 w-4/5" />
        <Skeleton className="mb-1.5 h-4 w-full" />
        <Skeleton className="mb-4 h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </Card>
  );
}

type EpisodeGridSkeletonProps = {
  count: number;
};

export function EpisodeGridSkeleton({ count }: EpisodeGridSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Cargando episodios"
      className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }, (_, index) => (
        <EpisodeCardSkeleton key={index} />
      ))}
    </div>
  );
}
