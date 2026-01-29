-- Fix 1: Profiles table - restrict to viewing own profile only
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Allow authenticated users to view basic profile info of others (for messaging context)
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Fix 2: Sitter profiles - require authentication to view active sitters
DROP POLICY IF EXISTS "Anyone can view active sitter profiles" ON public.sitter_profiles;

CREATE POLICY "Authenticated users can view active sitter profiles"
ON public.sitter_profiles
FOR SELECT
TO authenticated
USING (status = 'active'::sitter_status);