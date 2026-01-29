import { Star } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSitterReviews, useSitterRating, Review } from "@/hooks/useReviews";

interface ReviewsListProps {
  sitterId: string;
}

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating
              ? "text-primary fill-primary"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
};

const ReviewCard = ({ review }: { review: Review }) => {
  const initials = review.owner_name
    ? review.owner_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="flex gap-4 py-4 border-b last:border-0">
      <Avatar className="w-10 h-10">
        <AvatarFallback className="text-sm">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium">{review.owner_name || "Anonymous"}</span>
          <span className="text-sm text-muted-foreground">
            {format(new Date(review.created_at), "MMM d, yyyy")}
          </span>
        </div>
        <StarRating rating={review.rating} />
        {review.comment && (
          <p className="mt-2 text-muted-foreground">{review.comment}</p>
        )}
      </div>
    </div>
  );
};

const ReviewsSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex gap-4 py-4 border-b last:border-0">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    ))}
  </div>
);

export const ReviewsList = ({ sitterId }: ReviewsListProps) => {
  const { data: reviews, isLoading: reviewsLoading } = useSitterReviews(sitterId);
  const { data: rating, isLoading: ratingLoading } = useSitterRating(sitterId);

  const isLoading = reviewsLoading || ratingLoading;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Reviews</CardTitle>
          {!isLoading && rating && rating.count > 0 && (
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary fill-primary" />
              <span className="font-semibold">{rating.average}</span>
              <span className="text-muted-foreground">
                ({rating.count} {rating.count === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ReviewsSkeleton />
        ) : reviews && reviews.length > 0 ? (
          <div className="divide-y">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No reviews yet. Be the first to leave a review!
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewsList;
