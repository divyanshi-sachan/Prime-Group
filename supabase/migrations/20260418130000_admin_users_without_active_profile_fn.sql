-- Admin: list members with no active profile (correct pagination; avoids PostgREST embed ambiguity).
CREATE OR REPLACE FUNCTION public.admin_users_without_active_profile(
  p_limit integer,
  p_offset integer
)
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz,
  last_login_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.id, u.email, u.created_at, u.last_login_at
  FROM public.users u
  WHERE u.role = 'user'
    AND NOT EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = u.id
        AND p.deleted_at IS NULL
    )
  ORDER BY u.created_at DESC NULLS LAST
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 1), 1), 100)
  OFFSET GREATEST(COALESCE(p_offset, 0), 0);
$$;

REVOKE ALL ON FUNCTION public.admin_users_without_active_profile(integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_users_without_active_profile(integer, integer) TO service_role;
