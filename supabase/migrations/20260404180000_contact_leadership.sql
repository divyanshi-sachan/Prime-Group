-- Contact page: leadership team (JSON in app_settings) + public storage for headshots.
INSERT INTO public.app_settings (key, value)
VALUES ('contact_leadership', '[]')
ON CONFLICT (key) DO NOTHING;

-- Bucket: public read for headshot URLs. If INSERT fails, create in Dashboard: name contact-leadership, public.
INSERT INTO storage.buckets (id, name, public)
VALUES ('contact-leadership', 'contact-leadership', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read contact-leadership" ON storage.objects;
CREATE POLICY "Public read contact-leadership"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'contact-leadership');
