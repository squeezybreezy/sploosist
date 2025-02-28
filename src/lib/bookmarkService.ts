
import { supabase, getCurrentUser } from './supabase';
import { Bookmark, Tag, Category, BookmarkType } from './types';
import { generateUniqueId } from './bookmarkUtils';

// Convert database model to application model
const mapBookmarkFromDB = async (dbBookmark: any): Promise<Bookmark> => {
  // Fetch tags for this bookmark
  const { data: tagRelations } = await supabase
    .from('bookmark_tags')
    .select('tag_id')
    .eq('bookmark_id', dbBookmark.id);
  
  const tagIds = tagRelations?.map(rel => rel.tag_id) || [];
  
  let tags: Tag[] = [];
  if (tagIds.length > 0) {
    const { data: dbTags } = await supabase
      .from('tags')
      .select('*')
      .in('id', tagIds);
    
    tags = (dbTags || []).map(tag => ({
      id: tag.id,
      name: tag.name,
      color: tag.color || undefined,
    }));
  }
  
  // Fetch category if it exists
  let category: Category | undefined = undefined;
  if (dbBookmark.category_id) {
    const { data: dbCategory } = await supabase
      .from('categories')
      .select('*')
      .eq('id', dbBookmark.category_id)
      .single();
    
    if (dbCategory) {
      category = {
        id: dbCategory.id,
        name: dbCategory.name,
        icon: dbCategory.icon || undefined,
      };
    }
  }
  
  return {
    id: dbBookmark.id,
    url: dbBookmark.url,
    title: dbBookmark.title,
    description: dbBookmark.description || undefined,
    type: dbBookmark.type as BookmarkType,
    thumbnailUrl: dbBookmark.thumbnail_url || undefined,
    videoThumbnailTimestamp: dbBookmark.video_thumbnail_timestamp || undefined,
    dateAdded: new Date(dbBookmark.date_added),
    lastVisited: dbBookmark.last_visited ? new Date(dbBookmark.last_visited) : undefined,
    lastChecked: dbBookmark.last_checked ? new Date(dbBookmark.last_checked) : undefined,
    isAlive: dbBookmark.is_alive,
    contentChanged: dbBookmark.content_changed,
    tags,
    category,
    favicon: dbBookmark.favicon || undefined,
    splatCount: dbBookmark.splat_count || 0,
  };
};

// Convert application model to database model
const prepareBookmarkForDB = (bookmark: Bookmark, userId: string) => {
  return {
    id: bookmark.id,
    user_id: userId,
    url: bookmark.url,
    title: bookmark.title,
    description: bookmark.description || null,
    type: bookmark.type,
    thumbnail_url: bookmark.thumbnailUrl || null,
    video_thumbnail_timestamp: bookmark.videoThumbnailTimestamp || null,
    date_added: bookmark.dateAdded.toISOString(),
    last_visited: bookmark.lastVisited?.toISOString() || null,
    last_checked: bookmark.lastChecked?.toISOString() || null,
    is_alive: bookmark.isAlive !== undefined ? bookmark.isAlive : true,
    content_changed: bookmark.contentChanged || null,
    favicon: bookmark.favicon || null,
    category_id: bookmark.category?.id || null,
    splat_count: bookmark.splatCount || 0,
  };
};

// Fetch all bookmarks for the current user
export const fetchBookmarks = async (): Promise<Bookmark[]> => {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not authenticated");
  
  const { data: dbBookmarks, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', user.id);
  
  if (error) {
    console.error('Error fetching bookmarks:', error);
    throw error;
  }
  
  const bookmarks = await Promise.all(
    (dbBookmarks || []).map(mapBookmarkFromDB)
  );
  
  return bookmarks;
};

// Add or update a bookmark
export const saveBookmark = async (bookmark: Bookmark): Promise<Bookmark> => {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not authenticated");
  
  // Ensure bookmark has an ID
  if (!bookmark.id) {
    bookmark.id = generateUniqueId();
  }
  
  const dbBookmark = prepareBookmarkForDB(bookmark, user.id);
  
  // Insert or update bookmark
  const { error: bookmarkError } = await supabase
    .from('bookmarks')
    .upsert(dbBookmark);
  
  if (bookmarkError) {
    console.error('Error saving bookmark:', bookmarkError);
    throw bookmarkError;
  }
  
  // Handle tags: first delete existing relations, then add new ones
  const { error: deleteError } = await supabase
    .from('bookmark_tags')
    .delete()
    .eq('bookmark_id', bookmark.id);
  
  if (deleteError) {
    console.error('Error removing old tag relations:', deleteError);
    throw deleteError;
  }
  
  // Add new tag relations
  if (bookmark.tags.length > 0) {
    const tagRelations = bookmark.tags.map(tag => ({
      bookmark_id: bookmark.id,
      tag_id: tag.id
    }));
    
    const { error: tagError } = await supabase
      .from('bookmark_tags')
      .insert(tagRelations);
    
    if (tagError) {
      console.error('Error adding tag relations:', tagError);
      throw tagError;
    }
  }
  
  return bookmark;
};

// Update a bookmark's splat count
export const updateSplatCount = async (bookmarkId: string, increment: boolean = true): Promise<number> => {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not authenticated");

  // Get the current bookmark to get the current splat count
  const { data: bookmarkData, error: fetchError } = await supabase
    .from('bookmarks')
    .select('splat_count')
    .eq('id', bookmarkId)
    .eq('user_id', user.id)
    .single();

  if (fetchError) {
    console.error('Error fetching bookmark for splat update:', fetchError);
    throw fetchError;
  }

  const currentSplatCount = bookmarkData?.splat_count || 0;
  const newSplatCount = increment ? currentSplatCount + 1 : Math.max(0, currentSplatCount - 1);

  // Update the splat count
  const { error: updateError } = await supabase
    .from('bookmarks')
    .update({ splat_count: newSplatCount })
    .eq('id', bookmarkId)
    .eq('user_id', user.id);

  if (updateError) {
    console.error('Error updating splat count:', updateError);
    throw updateError;
  }

  return newSplatCount;
};

// Import multiple bookmarks at once
export const importBookmarks = async (
  bookmarks: Bookmark[],
  newTags: Tag[],
  newCategories: Category[]
): Promise<{ imported: number; failed: number }> => {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not authenticated");
  
  let imported = 0;
  let failed = 0;
  
  // First, save any new categories
  if (newCategories.length > 0) {
    const categoriesToInsert = newCategories.map(category => ({
      id: category.id,
      user_id: user.id,
      name: category.name,
      icon: category.icon || null
    }));
    
    const { error: categoryError } = await supabase
      .from('categories')
      .upsert(categoriesToInsert);
    
    if (categoryError) {
      console.error('Error saving categories:', categoryError);
      throw categoryError;
    }
  }
  
  // Then, save any new tags
  if (newTags.length > 0) {
    const tagsToInsert = newTags.map(tag => ({
      id: tag.id,
      user_id: user.id,
      name: tag.name,
      color: tag.color || null
    }));
    
    const { error: tagError } = await supabase
      .from('tags')
      .upsert(tagsToInsert);
    
    if (tagError) {
      console.error('Error saving tags:', tagError);
      throw tagError;
    }
  }
  
  // Now save bookmarks one by one (to better handle errors)
  for (const bookmark of bookmarks) {
    try {
      await saveBookmark(bookmark);
      imported++;
    } catch (error) {
      console.error(`Error importing bookmark ${bookmark.url}:`, error);
      failed++;
    }
  }
  
  return { imported, failed };
};

// Delete a bookmark
export const deleteBookmark = async (bookmarkId: string): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not authenticated");
  
  // First delete tag relations
  const { error: tagError } = await supabase
    .from('bookmark_tags')
    .delete()
    .eq('bookmark_id', bookmarkId);
  
  if (tagError) {
    console.error('Error deleting tag relations:', tagError);
    throw tagError;
  }
  
  // Then delete the bookmark
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', bookmarkId)
    .eq('user_id', user.id);
  
  if (error) {
    console.error('Error deleting bookmark:', error);
    throw error;
  }
};

// Fetch all tags for the current user
export const fetchTags = async (): Promise<Tag[]> => {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not authenticated");
  
  const { data: dbTags, error } = await supabase
    .from('tags')
    .select('*')
    .eq('user_id', user.id);
  
  if (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
  
  return (dbTags || []).map(tag => ({
    id: tag.id,
    name: tag.name,
    color: tag.color || undefined,
  }));
};

// Add or update a tag
export const saveTag = async (tag: Tag): Promise<Tag> => {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not authenticated");
  
  // Ensure tag has an ID
  if (!tag.id) {
    tag.id = generateUniqueId();
  }
  
  const { error } = await supabase
    .from('tags')
    .upsert({
      id: tag.id,
      user_id: user.id,
      name: tag.name,
      color: tag.color || null,
    });
  
  if (error) {
    console.error('Error saving tag:', error);
    throw error;
  }
  
  return tag;
};

// Fetch all categories for the current user
export const fetchCategories = async (): Promise<Category[]> => {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not authenticated");
  
  const { data: dbCategories, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id);
  
  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
  
  return (dbCategories || []).map(category => ({
    id: category.id,
    name: category.name,
    icon: category.icon || undefined,
  }));
};

// Add or update a category
export const saveCategory = async (category: Category): Promise<Category> => {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not authenticated");
  
  // Ensure category has an ID
  if (!category.id) {
    category.id = generateUniqueId();
  }
  
  const { error } = await supabase
    .from('categories')
    .upsert({
      id: category.id,
      user_id: user.id,
      name: category.name,
      icon: category.icon || null,
    });
  
  if (error) {
    console.error('Error saving category:', error);
    throw error;
  }
  
  return category;
};
