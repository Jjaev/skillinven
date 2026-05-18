
-- Restrict overly permissive policies — require authenticated users for write operations
DROP POLICY IF EXISTS "Authenticated users can submit requests" ON public.skills;
DROP POLICY IF EXISTS "Authenticated users can update requests" ON public.skills;
DROP POLICY IF EXISTS "Authenticated users can delete requests" ON public.skills;

CREATE POLICY "Authenticated users can insert skills"
  ON public.skills FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = submitter_id);

CREATE POLICY "Authenticated users can update skills"
  ON public.skills FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete skills"
  ON public.skills FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);
