import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Review {
  id: string;
  booking_id: string;
  owner_id: string;
  sitter_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  owner_name?: string;
}

interface CreateReviewData {
  booking_id: string;
  sitter_id: string;
  rating: number;
  comment?: string;
}

// Fetch reviews for a specific sitter
export const useSitterReviews = (sitterId: string | undefined) => {
  return useQuery({
    queryKey: ["reviews", sitterId],
    queryFn: async () => {
      if (!sitterId) return [];

      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("sitter_id", sitterId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch owner names for reviews
      const ownerIds = [...new Set(data.map((r) => r.owner_id))];
      
      if (ownerIds.length === 0) return data as Review[];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name")
        .in("user_id", ownerIds);

      const profileMap = new Map(
        profiles?.map((p) => [p.user_id, `${p.first_name || ""} ${p.last_name || ""}`.trim()])
      );

      return data.map((review) => ({
        ...review,
        owner_name: profileMap.get(review.owner_id) || "Anonymous",
      })) as Review[];
    },
    enabled: !!sitterId,
  });
};

// Fetch average rating and count for a sitter
export const useSitterRating = (sitterId: string | undefined) => {
  return useQuery({
    queryKey: ["sitterRating", sitterId],
    queryFn: async () => {
      if (!sitterId) return { average: 0, count: 0 };

      const { data: avgData } = await supabase.rpc("get_sitter_average_rating", {
        sitter_uuid: sitterId,
      });

      const { data: countData } = await supabase.rpc("get_sitter_review_count", {
        sitter_uuid: sitterId,
      });

      return {
        average: Number(avgData) || 0,
        count: Number(countData) || 0,
      };
    },
    enabled: !!sitterId,
  });
};

// Check if user can review a specific booking
export const useCanReview = (bookingId: string | undefined) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["canReview", bookingId, user?.id],
    queryFn: async () => {
      if (!bookingId || !user) return { canReview: false, existingReview: null };

      // Check if booking is completed and belongs to user
      const { data: booking } = await supabase
        .from("bookings")
        .select("id, status, owner_id")
        .eq("id", bookingId)
        .eq("owner_id", user.id)
        .eq("status", "completed")
        .maybeSingle();

      if (!booking) return { canReview: false, existingReview: null };

      // Check if review already exists
      const { data: existingReview } = await supabase
        .from("reviews")
        .select("*")
        .eq("booking_id", bookingId)
        .maybeSingle();

      return {
        canReview: !existingReview,
        existingReview,
      };
    },
    enabled: !!bookingId && !!user,
  });
};

// Create a new review
export const useCreateReview = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateReviewData) => {
      if (!user) throw new Error("Must be logged in to create a review");

      const { data: review, error } = await supabase
        .from("reviews")
        .insert({
          booking_id: data.booking_id,
          owner_id: user.id,
          sitter_id: data.sitter_id,
          rating: data.rating,
          comment: data.comment || null,
        })
        .select()
        .single();

      if (error) throw error;
      return review;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.sitter_id] });
      queryClient.invalidateQueries({ queryKey: ["sitterRating", variables.sitter_id] });
      queryClient.invalidateQueries({ queryKey: ["canReview"] });
    },
  });
};

// Update an existing review
export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
      rating,
      comment,
    }: {
      reviewId: string;
      rating: number;
      comment?: string;
    }) => {
      const { data, error } = await supabase
        .from("reviews")
        .update({ rating, comment: comment || null })
        .eq("id", reviewId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", data.sitter_id] });
      queryClient.invalidateQueries({ queryKey: ["sitterRating", data.sitter_id] });
    },
  });
};

// Delete a review
export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, sitterId }: { reviewId: string; sitterId: string }) => {
      const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

      if (error) throw error;
      return { sitterId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", data.sitterId] });
      queryClient.invalidateQueries({ queryKey: ["sitterRating", data.sitterId] });
      queryClient.invalidateQueries({ queryKey: ["canReview"] });
    },
  });
};
