-- Fix: Remove overly permissive policy that exposes all user profiles
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Create a secure function to get message partner names
-- This function only returns first_name and last_name for users
-- that the current user has an existing message conversation with
CREATE OR REPLACE FUNCTION public.get_message_partner_info(partner_ids UUID[])
RETURNS TABLE(user_id UUID, first_name TEXT, last_name TEXT)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT p.user_id, p.first_name, p.last_name
  FROM public.profiles p
  WHERE p.user_id = ANY(partner_ids)
    AND EXISTS (
      SELECT 1 FROM public.messages m
      WHERE (m.sender_id = auth.uid() AND m.receiver_id = p.user_id)
         OR (m.receiver_id = auth.uid() AND m.sender_id = p.user_id)
    );
$$;

-- Create a secure function to get a single partner's info for direct lookup
CREATE OR REPLACE FUNCTION public.get_single_partner_info(partner_id UUID)
RETURNS TABLE(first_name TEXT, last_name TEXT)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT p.first_name, p.last_name
  FROM public.profiles p
  WHERE p.user_id = partner_id
    AND EXISTS (
      SELECT 1 FROM public.messages m
      WHERE (m.sender_id = auth.uid() AND m.receiver_id = partner_id)
         OR (m.receiver_id = auth.uid() AND m.sender_id = partner_id)
    );
$$;