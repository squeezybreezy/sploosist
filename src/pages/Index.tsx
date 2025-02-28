
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  BookmarkPlus, 
  ListFilter, 
  LayoutGrid, 
  Trash2,
  ArrowUpDown
} from 'lucide-react';
import BookmarkCard from '@/components/BookmarkCard';
import BookmarkFilters from '@/components/BookmarkFilters';
import EmptyState from '@/components/EmptyState';
import AddBookmarkModal from '@/components/AddBookmarkModal';
import { Bookmark, BookmarkFilters as BookmarkFiltersType, Tag, Category } from '@/lib/types';
import { filterBookmarks, generateMockBookmarks } from '@/lib/bookmarkUtils';

const Index = () => {
  const { toast } = useToast();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filters, setFilters] = useState<BookmarkFiltersType>({
    query: '',
    tags: [],
    sortBy: 'dateAdded-desc'
  });
  const [editBookmark, setEditBookmark] = useState<Bookmark | undefined>(undefined);
  const [isGridView, setIsGridView] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookmarkToDelete, setBookmarkToDelete] = useState<string | null>(null);

  // Load bookmarks on initial load
  useEffect(() => {
    // In a real app, this would fetch from API/localStorage
    const loadedBookmarks = generateMockBookmarks();
    setBookmarks(loadedBookmarks);
  }, []);

  // Apply filters when bookmarks or filters change
  useEffect(() => {
    const filtered = filterBookmarks(bookmarks, filters);
    setFilteredBookmarks(filtered);
  }, [bookmarks, filters]);

  // Extract all unique tags from bookmarks
  const allTags: Tag[] = Array.from(
    new Map(
      bookmarks
        .flatMap(bookmark => bookmark.tags)
        .map(tag => [tag.id, tag])
    ).values()
  );

  // Extract all unique categories from bookmarks
  const allCategories: Category[] = Array.from(
    new Map(
      bookmarks
        .filter(bookmark => bookmark.category)
        .map(bookmark => [bookmark.category!.id, bookmark.category!])
    ).values()
  );

  const handleFilterChange = (newFilters: BookmarkFiltersType) => {
    setFilters(newFilters);
  };

  const handleAddBookmark = (bookmark: Bookmark) => {
    const isEdit = bookmarks.some(b => b.id === bookmark.id);
    
    if (isEdit) {
      setBookmarks(bookmarks.map(b => b.id === bookmark.id ? bookmark : b));
      toast({
        title: "Bookmark updated",
        description: "Your bookmark has been successfully updated.",
      });
    } else {
      setBookmarks([bookmark, ...bookmarks]);
      toast({
        title: "Bookmark added",
        description: "Your bookmark has been successfully added.",
      });
    }
    
    setEditBookmark(undefined);
  };

  const handleEditBookmark = (bookmark: Bookmark) => {
    setEditBookmark(bookmark);
    setIsAddModalOpen(true);
  };

  const handleBookmarkClick = (bookmark: Bookmark) => {
    // In a real app, this would update the lastVisited date
    // and then open the URL in a new tab
    window.open(bookmark.url, '_blank');
  };

  const confirmDeleteBookmark = (bookmarkId: string) => {
    setBookmarkToDelete(bookmarkId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteBookmark = () => {
    if (bookmarkToDelete) {
      setBookmarks(bookmarks.filter(b => b.id !== bookmarkToDelete));
      toast({
        title: "Bookmark deleted",
        description: "Your bookmark has been successfully removed.",
      });
      setIsDeleteModalOpen(false);
      setBookmarkToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bookmark Buddy</h1>
            <p className="text-muted-foreground mt-1">
              Manage your bookmarks with enhanced video and page previews
            </p>
          </div>
          
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center gap-2 hover:bg-primary/90 transition-colors"
            onClick={() => {
              setEditBookmark(undefined);
              setIsAddModalOpen(true);
            }}
          >
            <BookmarkPlus className="h-5 w-5" />
            <span>Add Bookmark</span>
          </button>
        </div>
        
        {/* Filters & View Toggle */}
        <div className="space-y-3">
          <BookmarkFilters
            tags={allTags}
            categories={allCategories}
            onFilterChange={handleFilterChange}
            initialFilters={filters}
          />
          
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {filteredBookmarks.length} bookmark{filteredBookmarks.length !== 1 ? 's' : ''} found
            </p>
            
            <div className="flex items-center gap-2">
              <div className="border rounded-md flex overflow-hidden">
                <button
                  className={`p-2 ${isGridView ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'} transition-colors`}
                  onClick={() => setIsGridView(true)}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  className={`p-2 ${!isGridView ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'} transition-colors`}
                  onClick={() => setIsGridView(false)}
                  aria-label="List view"
                >
                  <ListFilter className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bookmarks Grid/List */}
        {filteredBookmarks.length === 0 ? (
          <EmptyState
            title="No bookmarks found"
            description={
              bookmarks.length === 0
                ? "You haven't added any bookmarks yet. Add your first bookmark to get started."
                : "No bookmarks match your current filters. Try adjusting your search criteria."
            }
            actionLabel={bookmarks.length === 0 ? "Add Bookmark" : undefined}
            onAction={bookmarks.length === 0 ? () => setIsAddModalOpen(true) : undefined}
            isFiltered={bookmarks.length > 0}
          />
        ) : (
          <div className={`grid gap-4 animate-fade-in ${
            isGridView 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredBookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                onClick={handleBookmarkClick}
                onEdit={handleEditBookmark}
                onDelete={confirmDeleteBookmark}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Add/Edit Bookmark Modal */}
      <AddBookmarkModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditBookmark(undefined);
        }}
        onAddBookmark={handleAddBookmark}
        editBookmark={editBookmark}
        availableTags={allTags}
        availableCategories={allCategories}
      />
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-card rounded-lg p-6 shadow-lg max-w-sm w-full animate-scale-up">
            <Trash2 className="h-10 w-10 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-center mb-2">Delete Bookmark</h2>
            <p className="text-center mb-6 text-muted-foreground">
              Are you sure you want to delete this bookmark? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 border rounded-md hover:bg-secondary transition-colors"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setBookmarkToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
                onClick={handleDeleteBookmark}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
