
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  BookmarkPlus, 
  ListFilter, 
  LayoutGrid, 
  Trash2,
  SlidersHorizontal,
  Upload,
  Download
} from 'lucide-react';
import BookmarkCard from '@/components/BookmarkCard';
import BookmarkFilters from '@/components/BookmarkFilters';
import EmptyState from '@/components/EmptyState';
import AddBookmarkModal from '@/components/AddBookmarkModal';
import Navbar from '@/components/Navbar';
import BookmarkImportModal from '@/components/BookmarkImportModal';
import PageWrapper from '@/components/PageWrapper';
import { Bookmark, BookmarkFilters as BookmarkFiltersType, Tag, Category } from '@/lib/types';
import { filterBookmarks } from '@/lib/bookmarkUtils';
import { 
  fetchBookmarks, 
  saveBookmark, 
  deleteBookmark, 
  fetchTags, 
  fetchCategories 
} from '@/lib/bookmarkService';
import { generateBookmarklet } from '@/lib/bookmarkImporter';

const Index = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [filters, setFilters] = useState<BookmarkFiltersType>({
    query: '',
    tags: [],
    sortBy: 'dateAdded-desc'
  });
  const [editBookmark, setEditBookmark] = useState<Bookmark | undefined>(undefined);
  const [isGridView, setIsGridView] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookmarkToDelete, setBookmarkToDelete] = useState<string | null>(null);

  // Fetch bookmarks from Supabase
  const { 
    data: bookmarks = [], 
    isLoading: isLoadingBookmarks,
    error: bookmarksError 
  } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: fetchBookmarks,
  });

  // Fetch tags from Supabase
  const { 
    data: allTags = [], 
    isLoading: isLoadingTags 
  } = useQuery({
    queryKey: ['tags'],
    queryFn: fetchTags,
  });

  // Fetch categories from Supabase
  const { 
    data: allCategories = [], 
    isLoading: isLoadingCategories 
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // Filter bookmarks based on current filters
  const filteredBookmarks = filterBookmarks(bookmarks, filters);

  // Mutation to add/update a bookmark
  const addBookmarkMutation = useMutation({
    mutationFn: saveBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      setIsAddModalOpen(false);
      setEditBookmark(undefined);
    },
    onError: (error) => {
      console.error('Error saving bookmark:', error);
      toast({
        title: 'Error',
        description: 'Failed to save bookmark. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Mutation to delete a bookmark
  const deleteBookmarkMutation = useMutation({
    mutationFn: deleteBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      setIsDeleteModalOpen(false);
      setBookmarkToDelete(null);
    },
    onError: (error) => {
      console.error('Error deleting bookmark:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete bookmark. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleFilterChange = (newFilters: BookmarkFiltersType) => {
    setFilters(newFilters);
  };

  const handleAddBookmark = (bookmark: Bookmark) => {
    const isEdit = bookmarks.some(b => b.id === bookmark.id);
    
    addBookmarkMutation.mutate(bookmark);
    
    toast({
      title: isEdit ? "Bookmark updated" : "Bookmark added",
      description: isEdit 
        ? "Your bookmark has been successfully updated." 
        : "Your bookmark has been successfully added.",
    });
  };

  const handleEditBookmark = (bookmark: Bookmark) => {
    setEditBookmark(bookmark);
    setIsAddModalOpen(true);
  };

  const handleBookmarkClick = (bookmark: Bookmark) => {
    // In a real app, this would update the lastVisited date
    // Here we'll just open the URL in a new tab
    window.open(bookmark.url, '_blank');
  };

  const confirmDeleteBookmark = (bookmarkId: string) => {
    setBookmarkToDelete(bookmarkId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteBookmark = () => {
    if (bookmarkToDelete) {
      deleteBookmarkMutation.mutate(bookmarkToDelete);
      
      toast({
        title: "Bookmark deleted",
        description: "Your bookmark has been successfully removed.",
      });
    }
  };

  // Handle import complete
  const handleImportComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    queryClient.invalidateQueries({ queryKey: ['tags'] });
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  };

  // Handle add bookmarklet to browser
  const handleAddBookmarklet = (e: React.MouseEvent) => {
    e.preventDefault();
    
    toast({
      title: "Drag to your bookmarks bar",
      description: "Drag the button to your browser's bookmarks bar to enable Quick Add for any page.",
    });
  };

  // Handle API errors
  useEffect(() => {
    if (bookmarksError) {
      console.error('Error fetching bookmarks:', bookmarksError);
      toast({
        title: 'Error loading bookmarks',
        description: 'Please try refreshing the page.',
        variant: 'destructive',
      });
    }
  }, [bookmarksError, toast]);

  const isLoading = isLoadingBookmarks || isLoadingTags || isLoadingCategories;

  // Generate bookmarklet
  const appUrl = window.location.origin;
  const bookmarkletCode = generateBookmarklet(appUrl);

  return (
    <PageWrapper>
      <div className="min-h-screen bg-background">
        <Navbar onAddBookmark={() => {
          setEditBookmark(undefined);
          setIsAddModalOpen(true);
        }} />
        
        <div className="container py-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Bookmarks</h1>
              <p className="text-muted-foreground mt-1">
                Manage your bookmarks with enhanced video and page previews
              </p>
            </div>
            
            <div className="flex gap-2">
              {/* Quick Add Button */}
              <a
                href={bookmarkletCode}
                onClick={handleAddBookmarklet}
                draggable="true"
                className="hidden sm:flex px-4 py-2 border border-primary/30 text-primary rounded-md items-center gap-2 hover:bg-primary/10 transition-colors"
                title="Drag to your bookmarks bar to enable quick adding from any page"
              >
                <Download className="h-4 w-4" />
                <span>Quick Add Button</span>
              </a>
              
              {/* Import Button */}
              <button
                className="hidden sm:flex px-4 py-2 border border-primary/30 text-primary rounded-md items-center gap-2 hover:bg-primary/10 transition-colors"
                onClick={() => setIsImportModalOpen(true)}
              >
                <Upload className="h-4 w-4" />
                <span>Import</span>
              </button>
              
              <button
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center gap-2 hover:bg-primary/90 transition-colors md:hidden"
                onClick={() => {
                  setEditBookmark(undefined);
                  setIsAddModalOpen(true);
                }}
              >
                <BookmarkPlus className="h-5 w-5" />
              </button>
              
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
              
              {/* Mobile Import Button */}
              <div className="flex gap-2 sm:hidden">
                <button
                  className="p-2 border rounded-md hover:bg-secondary transition-colors"
                  onClick={() => setIsImportModalOpen(true)}
                  aria-label="Import bookmarks"
                >
                  <Upload className="h-4 w-4" />
                </button>
                <a
                  href={bookmarkletCode}
                  onClick={handleAddBookmarklet}
                  draggable="true"
                  className="p-2 border rounded-md hover:bg-secondary transition-colors"
                  aria-label="Quick add bookmark button"
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
          
          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : (
            /* Bookmarks Grid/List */
            filteredBookmarks.length === 0 ? (
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
            )
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
        
        {/* Import Bookmarks Modal */}
        <BookmarkImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          availableTags={allTags}
          availableCategories={allCategories}
          onImportComplete={handleImportComplete}
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
                  disabled={deleteBookmarkMutation.isPending}
                >
                  {deleteBookmarkMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      <span>Deleting...</span>
                    </div>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Index;
