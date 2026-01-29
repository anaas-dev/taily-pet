-- Fix profiles_table_public: Remove overly permissive policy that exposes all user profiles
-- The current "Authenticated users can view profiles" policy allows ANY authenticated user
-- to read ALL user profiles including PII (email, phone). This is a security risk.

-- Drop the permissive policy
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Users can only view their own profile directly
-- For other user's names, we already have secure RPC functions:
-- - get_message_partner_info(): Returns names only for message partners
-- - get_single_partner_info(): Same restriction
-- - get_sitter_contact_info(): Returns contact info only for authorized relationships