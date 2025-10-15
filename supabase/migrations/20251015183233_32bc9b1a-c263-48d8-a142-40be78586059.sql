-- Fix: Prevent users from modifying their subscription_plan
-- This addresses the CLIENT_SIDE_AUTH vulnerability where users could upgrade themselves to premium

-- Drop the existing broad update policy
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;

-- Create a more restrictive update policy
CREATE POLICY "Users can update their preferences"
ON public.user_preferences FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger function to prevent modifying sensitive fields
CREATE OR REPLACE FUNCTION public.protect_user_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent modification of subscription_plan (only edge functions can modify)
  IF OLD.subscription_plan IS DISTINCT FROM NEW.subscription_plan THEN
    RAISE EXCEPTION 'subscription_plan cannot be modified by users';
  END IF;
  
  -- Prevent modification of user_id
  IF OLD.user_id IS DISTINCT FROM NEW.user_id THEN
    RAISE EXCEPTION 'user_id cannot be modified';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to enforce protection
DROP TRIGGER IF EXISTS protect_sensitive_user_preferences ON public.user_preferences;

CREATE TRIGGER protect_sensitive_user_preferences
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_user_preferences();