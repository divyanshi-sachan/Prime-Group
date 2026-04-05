-- FAQ admin writes failed when policies subqueried public.users under RLS.
-- Align with plans/profiles: use SECURITY DEFINER helper public.is_admin_user().

DROP POLICY IF EXISTS "Admins can manage faqs" ON public.faqs;

CREATE POLICY "Admins can manage faqs"
  ON public.faqs FOR ALL
  TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));
