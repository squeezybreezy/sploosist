
-- Create the necessary tables for the bookmark manager

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  thumbnail_url TEXT,
  video_thumbnail_timestamp FLOAT,
  date_added TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_visited TIMESTAMP WITH TIME ZONE,
  last_checked TIMESTAMP WITH TIME ZONE,
  is_alive BOOLEAN DEFAULT TRUE,
  content_changed BOOLEAN,
  favicon TEXT,
  category_id TEXT
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT
);

-- Bookmark tags relation table
CREATE TABLE IF NOT EXISTS bookmark_tags (
  bookmark_id TEXT NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (bookmark_id, tag_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS bookmarks_user_id_idx ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS categories_user_id_idx ON categories(user_id);
CREATE INDEX IF NOT EXISTS tags_user_id_idx ON tags(user_id);

-- Row-level security policies
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmark_tags ENABLE ROW LEVEL SECURITY;

-- Policies for bookmarks
CREATE POLICY bookmarks_user_policy ON bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- Policies for categories
CREATE POLICY categories_user_policy ON categories
  FOR ALL USING (auth.uid() = user_id);

-- Policies for tags
CREATE POLICY tags_user_policy ON tags
  FOR ALL USING (auth.uid() = user_id);

-- Policies for bookmark_tags (based on bookmark ownership)
CREATE POLICY bookmark_tags_user_policy ON bookmark_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM bookmarks
      WHERE bookmarks.id = bookmark_tags.bookmark_id
      AND bookmarks.user_id = auth.uid()
    )
  );
