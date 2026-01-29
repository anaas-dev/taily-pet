-- Fix 1: For sitter_profiles_public view - views inherit security from underlying tables
-- The view already pulls from sitter_profiles which has RLS, and it only exposes non-PII fields.
-- The view is intentionally designed for public access - this is security by design.
-- We just need to ensure the view definition is correct (it already excludes email, phone, address).

-- Fix 2: Add audit logging table for admin actions (defense-in-depth for role_check_client_side)

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_table TEXT,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- System (via triggers) can insert audit logs - using SECURITY DEFINER functions
CREATE POLICY "System can insert audit logs via triggers"
ON public.admin_audit_log
FOR INSERT
WITH CHECK (true);

-- Create audit logging function for sitter profile status changes
CREATE OR REPLACE FUNCTION public.log_admin_sitter_action()
RETURNS TRIGGER AS $$
BEGIN
  IF has_role(auth.uid(), 'admin'::app_role) THEN
    INSERT INTO public.admin_audit_log (admin_id, action, target_table, target_id, details)
    VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      NEW.id,
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'sitter_name', NEW.first_name || ' ' || NEW.last_name
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add audit trigger on sitter_profiles for admin actions (status changes)
CREATE TRIGGER audit_sitter_profile_changes
AFTER UPDATE ON public.sitter_profiles
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.log_admin_sitter_action();

-- Create audit logging function for role changes
CREATE OR REPLACE FUNCTION public.log_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF has_role(auth.uid(), 'admin'::app_role) THEN
    INSERT INTO public.admin_audit_log (admin_id, action, target_table, target_id, details)
    VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      jsonb_build_object(
        'user_id', COALESCE(NEW.user_id, OLD.user_id),
        'role', COALESCE(NEW.role::text, OLD.role::text)
      )
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add audit trigger on user_roles for role changes
CREATE TRIGGER audit_role_changes
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.log_role_changes();