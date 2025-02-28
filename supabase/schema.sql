
-- Create tables

-- Bookmarks table
CREATE TABLE bookmarks (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    thumbnail_url TEXT,
    video_thumbnail_timestamp INTEGER,
    date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    last_visited TIMESTAMP WITH TIME ZONE,
    last_checked TIMESTAMP WITH TIME ZONE,
    is_alive BOOLEAN DEFAULT TRUE,
    content_changed BOOLEAN DEFAULT FALSE,
    favicon TEXT,
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    splat_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tags table
CREATE TABLE tags (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Categories table
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Bookmark tags junction table
CREATE TABLE bookmark_tags (
    bookmark_id TEXT NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
    tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (bookmark_id, tag_id)
);

-- Set up RLS (Row Level Security)

-- Enable RLS on all tables
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmark_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for bookmarks table
CREATE POLICY "Users can view their own bookmarks"
ON bookmarks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks"
ON bookmarks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks"
ON bookmarks FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
ON bookmarks FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for tags table
CREATE POLICY "Users can view their own tags"
ON tags FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tags"
ON tags FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags"
ON tags FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags"
ON tags FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for categories table
CREATE POLICY "Users can view their own categories"
ON categories FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories"
ON categories FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
ON categories FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
ON categories FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for bookmark_tags junction table
CREATE POLICY "Users can view their own bookmark tags"
ON bookmark_tags FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM bookmarks
    WHERE bookmarks.id = bookmark_tags.bookmark_id
    AND bookmarks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own bookmark tags"
ON bookmark_tags FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM bookmarks
    WHERE bookmarks.id = bookmark_tags.bookmark_id
    AND bookmarks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own bookmark tags"
ON bookmark_tags FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM bookmarks
    WHERE bookmarks.id = bookmark_tags.bookmark_id
    AND bookmarks.user_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_bookmark_tags_bookmark_id ON bookmark_tags(bookmark_id);
CREATE INDEX idx_bookmark_tags_tag_id ON bookmark_tags(tag_id);
