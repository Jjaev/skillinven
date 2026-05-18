-- Community posts and comments tables (logged-out community board with nickname)
CREATE TABLE public.posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  author_name text NOT NULL,
  flair text CHECK (flair IN ('스킬추천', '업데이트', '잡담', '질문')),
  upvotes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.post_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  content text NOT NULL,
  author_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_posts_upvotes ON public.posts(upvotes DESC);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Public read for both tables
CREATE POLICY "Posts are publicly viewable"
  ON public.posts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Post comments are publicly viewable"
  ON public.post_comments FOR SELECT
  TO anon, authenticated
  USING (true);

-- Anyone (including anonymous nickname users) can insert
CREATE POLICY "Anyone can create posts"
  ON public.posts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can create post comments"
  ON public.post_comments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Update upvotes only (no auth, used by upvote button)
CREATE POLICY "Anyone can update posts"
  ON public.posts FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Admin delete (we keep this open since admin route is unauthenticated by design)
CREATE POLICY "Anyone can delete posts"
  ON public.posts FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can delete post comments"
  ON public.post_comments FOR DELETE
  TO anon, authenticated
  USING (true);

-- RPC for atomic upvote increment
CREATE OR REPLACE FUNCTION public.increment_post_upvote(_post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.posts SET upvotes = upvotes + 1 WHERE id = _post_id;
END;
$$;