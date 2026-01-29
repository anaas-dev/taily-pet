-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  sitter_id UUID NOT NULL REFERENCES public.sitter_profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(booking_id)
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews for active sitters
CREATE POLICY "Anyone can view reviews of active sitters"
ON public.reviews
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.sitter_profiles
    WHERE id = sitter_id AND status = 'active'
  )
);

-- Owners can create reviews for their completed bookings
CREATE POLICY "Owners can create reviews for their bookings"
ON public.reviews
FOR INSERT
WITH CHECK (
  auth.uid() = owner_id
  AND EXISTS (
    SELECT 1 FROM public.bookings
    WHERE id = booking_id
      AND owner_id = auth.uid()
      AND status = 'completed'
  )
);

-- Owners can update their own reviews
CREATE POLICY "Owners can update their own reviews"
ON public.reviews
FOR UPDATE
USING (auth.uid() = owner_id);

-- Owners can delete their own reviews
CREATE POLICY "Owners can delete their own reviews"
ON public.reviews
FOR DELETE
USING (auth.uid() = owner_id);

-- Sitters can view reviews about themselves
CREATE POLICY "Sitters can view their own reviews"
ON public.reviews
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.sitter_profiles
    WHERE id = sitter_id AND user_id = auth.uid()
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get sitter's average rating
CREATE OR REPLACE FUNCTION public.get_sitter_average_rating(sitter_uuid UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0)
  FROM public.reviews
  WHERE sitter_id = sitter_uuid;
$$;

-- Function to get sitter's review count
CREATE OR REPLACE FUNCTION public.get_sitter_review_count(sitter_uuid UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM public.reviews
  WHERE sitter_id = sitter_uuid;
$$;