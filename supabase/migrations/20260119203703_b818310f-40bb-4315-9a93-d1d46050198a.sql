-- Add approximate location coordinates to sitter_profiles
-- These store approximate area centers, NOT exact addresses

ALTER TABLE public.sitter_profiles
ADD COLUMN approximate_latitude NUMERIC(10, 6),
ADD COLUMN approximate_longitude NUMERIC(10, 6);

-- Create an index for location-based queries
CREATE INDEX idx_sitter_profiles_location 
ON public.sitter_profiles (approximate_latitude, approximate_longitude)
WHERE status = 'active';

-- Add a comment to clarify purpose
COMMENT ON COLUMN public.sitter_profiles.approximate_latitude IS 'Approximate area latitude - NOT exact address location';
COMMENT ON COLUMN public.sitter_profiles.approximate_longitude IS 'Approximate area longitude - NOT exact address location';