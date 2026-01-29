import { Star } from "lucide-react";
import { useSitterRating } from "@/hooks/useReviews";
import { Skeleton } from "@/components/ui/skeleton";

interface SitterRatingBadgeProps {
  sitterId: string;
  showCount?: boolean;
}

export const SitterRatingBadge = ({
  sitterId,
  showCount = true,
}: SitterRatingBadgeProps) => {
  const { data: rating, isLoading } = useSitterRating(sitterId);

  if (isLoading) {
    return <Skeleton className="h-5 w-24" />;
  }

  if (!rating || rating.count === 0) {
    return (
      <span className="text-sm text-muted-foreground">No reviews yet</span>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Star className="w-4 h-4 text-primary fill-primary" />
      <span className="font-medium">{rating.average}</span>
      {showCount && (
        <span className="text-muted-foreground text-sm">
          ({rating.count} {rating.count === 1 ? "review" : "reviews"})
        </span>
      )}
    </div>
  );
};

export default SitterRatingBadge;
