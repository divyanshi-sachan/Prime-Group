-- Simplify profile fields: single annual income, drop redundant family/location columns,
-- rename contact address to permanent address and add current address.

-- 1) Annual income: one column instead of min/max
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS annual_income INT;

UPDATE public.profiles
SET annual_income = CASE
  WHEN annual_income_min IS NOT NULL AND annual_income_max IS NOT NULL
    THEN (annual_income_min + annual_income_max) / 2
  ELSE COALESCE(annual_income_max, annual_income_min)
END
WHERE annual_income IS NULL
  AND (annual_income_min IS NOT NULL OR annual_income_max IS NOT NULL);

ALTER TABLE public.profiles DROP COLUMN IF EXISTS annual_income_min;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS annual_income_max;

-- 2) Birthplace only: merge grew_up_in when birthplace empty, then drop grew_up_in
UPDATE public.profiles
SET birthplace = NULLIF(TRIM(grew_up_in), '')
WHERE (birthplace IS NULL OR TRIM(birthplace) = '')
  AND grew_up_in IS NOT NULL
  AND TRIM(grew_up_in) <> '';

ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS grew_up_in;

-- 3) Remove family classification fields
ALTER TABLE public.profiles DROP COLUMN IF EXISTS family_type;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS family_values;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS family_status;

-- 4) Contact address -> permanent address + optional current address
ALTER TABLE public.profiles
  RENAME COLUMN contact_address TO permanent_address;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS current_address TEXT;

COMMENT ON COLUMN public.profiles.birthplace IS 'City or town of birth';
COMMENT ON COLUMN public.profiles.permanent_address IS 'Permanent / native address (shown on unlock)';
COMMENT ON COLUMN public.profiles.current_address IS 'Current residence if different from permanent';
COMMENT ON COLUMN public.profiles.annual_income IS 'Annual income (single figure, same currency as site convention)';
