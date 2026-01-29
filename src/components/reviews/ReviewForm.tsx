import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateReview } from "@/hooks/useReviews";
import { toast } from "sonner";

interface ReviewFormProps {
  bookingId: string;
  sitterId: string;
  sitterName: string;
  onSuccess?: () => void;
}

const StarRatingInput = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded"
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              star <= (hovered || value)
                ? "text-primary fill-primary"
                : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export const ReviewForm = ({
  bookingId,
  sitterId,
  sitterName,
  onSuccess,
}: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const createReview = useCreateReview();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      await createReview.mutateAsync({
        booking_id: bookingId,
        sitter_id: sitterId,
        rating,
        comment: comment.trim() || undefined,
      });

      toast.success("Review submitted successfully!");
      setRating(0);
      setComment("");
      onSuccess?.();
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast.error(error.message || "Failed to submit review");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave a Review for {sitterName}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Rating</label>
            <StarRatingInput value={rating} onChange={setRating} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Your Review (optional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this pet sitter..."
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {comment.length}/1000 characters
            </p>
          </div>

          <Button
            type="submit"
            disabled={rating === 0 || createReview.isPending}
            className="w-full"
          >
            {createReview.isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
