-- Single-call dashboard aggregates (replaces full-table scans from the app).
CREATE OR REPLACE FUNCTION public.admin_dashboard_stats_payload()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
WITH seven AS (
  SELECT (now() - interval '7 days') AS ts
),
totals AS (
  SELECT
    (SELECT count(*)::bigint FROM public.users) AS total_users,
    (SELECT count(*)::bigint FROM public.profiles WHERE deleted_at IS NULL) AS total_profiles,
    (SELECT count(*)::bigint FROM public.profiles WHERE deleted_at IS NULL AND profile_status = 'pending') AS pending_profiles,
    (SELECT count(*)::bigint FROM public.profiles WHERE deleted_at IS NULL AND profile_status = 'active') AS active_profiles,
    (SELECT count(*)::bigint FROM public.users u WHERE u.created_at >= (SELECT ts FROM seven)) AS new_users_last7,
    (SELECT count(*)::bigint FROM public.profiles p WHERE p.deleted_at IS NULL AND p.created_at >= (SELECT ts FROM seven)) AS new_profiles_last7
),
rejected_suspended AS (
  SELECT
    count(*) FILTER (WHERE profile_status = 'rejected')::bigint AS rejected,
    count(*) FILTER (WHERE profile_status = 'suspended')::bigint AS suspended
  FROM public.profiles
  WHERE deleted_at IS NULL
),
pay AS (
  SELECT
    coalesce(sum(amount), 0)::bigint AS total_revenue,
    coalesce(
      sum(amount) FILTER (
        WHERE date_trunc('month', timezone('UTC', coalesce(paid_at, created_at)))
          = date_trunc('month', timezone('UTC', now()))
      ),
      0
    )::bigint AS this_month
  FROM public.payments
  WHERE status = 'success'
),
by_plan_rows AS (
  SELECT plan_id, sum(amount)::bigint AS sum_amount
  FROM public.payments
  WHERE status = 'success'
  GROUP BY plan_id
),
gender_rows AS (
  SELECT initcap(lower(coalesce(p.gender, 'other'))) AS name, count(*)::bigint AS cnt
  FROM public.profiles p
  WHERE p.deleted_at IS NULL
  GROUP BY coalesce(p.gender, 'other')
),
religion_rows AS (
  SELECT name, cnt
  FROM (
    SELECT
      coalesce(nullif(trim(religion), ''), 'Not specified') AS name,
      count(*)::bigint AS cnt
    FROM public.profiles
    WHERE deleted_at IS NULL
    GROUP BY coalesce(nullif(trim(religion), ''), 'Not specified')
    ORDER BY cnt DESC
    LIMIT 8
  ) sub
),
city_rows AS (
  SELECT name, cnt
  FROM (
    SELECT
      coalesce(nullif(trim(city), ''), 'Not specified') AS name,
      count(*)::bigint AS cnt
    FROM public.profiles
    WHERE deleted_at IS NULL
    GROUP BY coalesce(nullif(trim(city), ''), 'Not specified')
    ORDER BY cnt DESC
    LIMIT 6
  ) sub2
),
status_rows AS (
  SELECT 'Pending'::text AS name, t.pending_profiles AS cnt FROM totals t
  UNION ALL
  SELECT 'Active'::text, t.active_profiles FROM totals t
  UNION ALL
  SELECT 'Rejected'::text, rs.rejected FROM rejected_suspended rs
  UNION ALL
  SELECT 'Suspended'::text, rs.suspended FROM rejected_suspended rs
)
SELECT jsonb_build_object(
  'stats', (
    SELECT jsonb_build_object(
      'totalUsers', t.total_users,
      'totalProfiles', t.total_profiles,
      'pendingProfiles', t.pending_profiles,
      'activeProfiles', t.active_profiles,
      'newUsersLast7', t.new_users_last7,
      'newProfilesLast7', t.new_profiles_last7
    )
    FROM totals t
  ),
  'revenue', (
    SELECT jsonb_build_object(
      'total', p.total_revenue,
      'thisMonth', p.this_month,
      'byPlan', COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object('plan_id', b.plan_id, 'sum', b.sum_amount) ORDER BY b.plan_id NULLS LAST
          )
          FROM by_plan_rows b
        ),
        '[]'::jsonb
      )
    )
    FROM pay p
  ),
  'byGender', COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'name',
          g.name,
          'count',
          g.cnt,
          'pct',
          (round(100.0 * g.cnt / nullif((SELECT total_profiles FROM totals), 0)))::int
        )
        ORDER BY g.cnt DESC
      )
      FROM gender_rows g
    ),
    '[]'::jsonb
  ),
  'byReligion', COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'name',
          r.name,
          'count',
          r.cnt,
          'pct',
          (round(100.0 * r.cnt / nullif((SELECT total_profiles FROM totals), 0)))::int
        )
        ORDER BY r.cnt DESC
      )
      FROM religion_rows r
    ),
    '[]'::jsonb
  ),
  'byStatus', COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'name',
          s.name,
          'count',
          s.cnt,
          'pct',
          (round(100.0 * s.cnt / nullif((SELECT total_profiles FROM totals), 0)))::int
        )
        ORDER BY s.cnt DESC
      )
      FROM status_rows s
      WHERE s.cnt > 0
    ),
    '[]'::jsonb
  ),
  'byCity', COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'name',
          c.name,
          'count',
          c.cnt,
          'pct',
          (round(100.0 * c.cnt / nullif((SELECT total_profiles FROM totals), 0)))::int
        )
        ORDER BY c.cnt DESC
      )
      FROM city_rows c
    ),
    '[]'::jsonb
  )
);
$$;

REVOKE ALL ON FUNCTION public.admin_dashboard_stats_payload() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_dashboard_stats_payload() TO service_role;
