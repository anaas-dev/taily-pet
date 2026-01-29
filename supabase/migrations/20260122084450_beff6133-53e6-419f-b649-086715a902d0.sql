-- Create a secure view for public sitter profile data (excludes PII)
CREATE VIEW public.sitter_profiles_public 
WITH (security_invoker = true)
AS 
SELECT 
  id, 
  user_id, 
  status, 
  first_name, 
  last_name,
  bio, 
  experience, 
  hourly_rate, 
  services,
  accepted_pet_types, 
  accepted_pet_sizes,
  town, 
  photos, 
  weekly_schedule, 
  availability_overrides,
  approximate_latitude, 
  approximate_longitude,
  created_at, 
  updated_at
  -- EXCLUDES: email, phone, address (PII)
FROM public.sitter_profiles
WHERE status = 'active';

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.sitter_profiles_public TO authenticated;

-- Create RPC function to get sitter contact info only for authorized users
-- (users with confirmed/completed bookings OR active message conversations)
CREATE OR REPLACE FUNCTION public.get_sitter_contact_info(sitter_profile_id UUID)
RETURNS TABLE(email TEXT, phone TEXT, address TEXT)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT s.email, s.phone, s.address
  FROM public.sitter_profiles s
  WHERE s.id = sitter_profile_id
    AND s.status = 'active'
    AND (
      -- User is the sitter themselves
      s.user_id = auth.uid()
      OR
      -- User has a confirmed or completed booking with this sitter
      EXISTS (
        SELECT 1 FROM public.bookings b
        WHERE b.sitter_id = sitter_profile_id
          AND b.owner_id = auth.uid()
          AND b.status IN ('confirmed', 'completed')
      )
      OR
      -- User has an active message conversation with this sitter
      EXISTS (
        SELECT 1 FROM public.messages m
        WHERE (m.sender_id = auth.uid() AND m.receiver_id = s.user_id)
           OR (m.receiver_id = auth.uid() AND m.sender_id = s.user_id)
      )
    );
$$;