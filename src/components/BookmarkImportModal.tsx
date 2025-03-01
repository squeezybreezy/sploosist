
import React, { useState, useRef } from 'react';
import { X, Upload, BookmarkIcon, AlertCircle, Loader2, Check, Download } from 'lucide-react';
import { parseBookmarkHtml, processBookmarksForImport, generateBookmarklet } from '@/lib/bookmarkImporter';
import { importBookmarks } from '@/lib/bookmarkService';
import { Bookmark, Tag, Category } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface BookmarkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableTags: Tag[];
  availableCategories: Category[];
  onImportComplete: () => void;
}

const BookmarkImportModal: React.FC<BookmarkImportModalProps> = ({
  isOpen,
  onClose,
  availableTags,
  availableCategories,
  onImportComplete
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importedBookmarks, setImportedBookmarks] = useState<Partial<Bookmark>[]>([]);
  const [newTags, setNewTags] = useState<Tag[]>([]);
  const [newCategories, setNewCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'import' | 'bookmarklet'>('import');
  const [importStatus, setImportStatus] = useState<'idle' | 'parsing' | 'parsed' | 'importing' | 'complete'>('idle');
  
  // Generate current app URL for the bookmarklet
  const appUrl = window.location.origin;
  const bookmarkletCode = generateBookmarklet(appUrl);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    setError(null);
    setImportStatus('parsing');
    
    try {
      // Read the file content
      const content = await file.text();
      
      // Parse the HTML content
      const parsedBookmarks = parseBookmarkHtml(content);
      
      if (parsedBookmarks.length === 0) {
        setError('No bookmarks found in the file. Make sure you uploaded a valid bookmarks HTML export file.');
        setImportedBookmarks([]);
        setImportStatus('idle');
        return;
      }
      
      // Process the bookmarks to handle tags and categories
      const { bookmarks, newTags, newCategories } = processBookmarksForImport(
        parsedBookmarks,
        availableTags,
        availableCategories
      );
      
      setImportedBookmarks(bookmarks);
      setNewTags(newTags);
      setNewCategories(newCategories);
      setImportStatus('parsed');
      
    } catch (err) {
      console.error('Error parsing bookmarks:', err);
      setError('Could not parse the bookmarks file. Please make sure it\'s a valid HTML export from a browser.');
      setImportedBookmarks([]);
      setImportStatus('idle');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleImport = async () => {
    if (importedBookmarks.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    setImportStatus('importing');
    
    try {
      // Import the bookmarks
      const result = await importBookmarks(
        importedBookmarks as Bookmark[], 
        newTags, 
        newCategories
      );
      
      toast({
        title: 'Import complete',
        description: `Successfully imported ${result.imported} bookmarks. ${result.failed > 0 ? `Failed to import ${result.failed} bookmarks.` : ''}`,
      });
      
      setImportStatus('complete');
      onImportComplete();
      
      // Close after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (err) {
      console.error('Error importing bookmarks:', err);
      setError('An error occurred while importing bookmarks. Please try again.');
      setImportStatus('parsed'); // Return to parsed state to allow retrying
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetImport = () => {
    setImportedBookmarks([]);
    setNewTags([]);
    setNewCategories([]);
    setError(null);
    setImportStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Prevent modal from closing when clicking inside
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative max-w-2xl w-full bg-card rounded-lg shadow-lg animate-scale-up overflow-y-auto max-h-[90vh]"
        onClick={handleModalClick}
      >
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-card z-10">
          <h2 className="text-lg font-semibold">Import Bookmarks</h2>
          <button
            className="p-1 rounded-full hover:bg-secondary transition-colors"
            onClick={onClose}
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4">
          {/* Tab navigation */}
          <div className="flex border-b mb-4">
            <button
              className={`px-4 py-2 border-b-2 ${activeTab === 'import' 
                ? 'border-primary text-primary' 
                : 'border-transparent hover:text-primary/70'}`}
              onClick={() => setActiveTab('import')}
              disabled={isLoading}
            >
              Import from File
            </button>
            <button
              className={`px-4 py-2 border-b-2 ${activeTab === 'bookmarklet' 
                ? 'border-primary text-primary' 
                : 'border-transparent hover:text-primary/70'}`}
              onClick={() => setActiveTab('bookmarklet')}
              disabled={isLoading}
            >
              Quick Add Button
            </button>
          </div>
          
          {activeTab === 'import' && (
            <div className="space-y-4">
              {importStatus === 'idle' && (
                <>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Upload Bookmarks File</h3>
                    <p className="text-muted-foreground mb-4">
                      Upload an HTML bookmarks export file from Chrome, Firefox, or other browsers
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".html,.htm"
                      onChange={handleFileChange}
                      className="hidden"
                      id="bookmark-file"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <span>Select File</span>
                      )}
                    </button>
                  </div>
                  
                  <div className="rounded-lg bg-secondary/50 p-4">
                    <h4 className="font-medium flex items-center">
                      <BookmarkIcon className="h-4 w-4 mr-2" />
                      How to export your bookmarks
                    </h4>
                    <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                      <p><strong>Google Chrome:</strong> Open the Bookmark Manager (Ctrl+Shift+O) → Click the three dots menu → Export bookmarks</p>
                      <p><strong>Firefox:</strong> Click the Bookmarks menu → Manage Bookmarks → Import and Backup → Export Bookmarks to HTML</p>
                      <p><strong>Microsoft Edge:</strong> Click the Favorites menu → Manage favorites → Click the three dots menu → Export favorites</p>
                    </div>
                  </div>
                </>
              )}
              
              {importStatus === 'parsing' && (
                <div className="py-8 text-center">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
                  <h3 className="text-lg font-medium">Parsing bookmarks...</h3>
                  <p className="text-muted-foreground mt-2">This may take a moment for large bookmark files</p>
                </div>
              )}
              
              {error && (
                <div className="rounded-lg bg-destructive/20 p-4 text-destructive flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}
              
              {importStatus === 'parsed' && (
                <div className="space-y-4">
                  <div className="rounded-lg bg-secondary/50 p-4">
                    <h4 className="font-medium">Import Summary</h4>
                    <ul className="mt-2 space-y-1">
                      <li>Bookmarks to import: {importedBookmarks.length}</li>
                      <li>New tags to create: {newTags.length}</li>
                      <li>New categories to create: {newCategories.length}</li>
                    </ul>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={resetImport}
                      className="px-4 py-2 border rounded-md hover:bg-secondary transition-colors"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleImport}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          <span>Importing...</span>
                        </div>
                      ) : (
                        <span>Import Bookmarks</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
              
              {importStatus === 'importing' && (
                <div className="py-8 text-center">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
                  <h3 className="text-lg font-medium">Importing bookmarks...</h3>
                  <p className="text-muted-foreground mt-2">This may take a moment</p>
                </div>
              )}
              
              {importStatus === 'complete' && (
                <div className="rounded-lg bg-green-500/20 p-4 text-green-500 flex items-start">
                  <Check className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <p>Import complete! Refreshing your bookmarks...</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'bookmarklet' && (
            <div className="space-y-4">
              <div className="rounded-lg bg-secondary/50 p-4">
                <h4 className="font-medium flex items-center">
                  <BookmarkIcon className="h-4 w-4 mr-2" />
                  Quick Add Bookmark Button
                </h4>
                <p className="mt-2 text-muted-foreground">
                  Drag the button below to your bookmarks bar to quickly add any page you're viewing to your collection.
                </p>
              </div>
              
              <div className="flex justify-center my-6">
                <a 
                  href={bookmarkletCode}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center"
                  onClick={(e) => e.preventDefault()}
                  draggable="true"
                >
                  <BookmarkIcon className="h-5 w-5 mr-2" />
                  Add to Collection
                </a>
              </div>
              
              <div className="rounded-lg bg-secondary/50 p-4">
                <h4 className="font-medium">How to use</h4>
                <ol className="mt-2 space-y-2 list-decimal list-inside text-muted-foreground">
                  <li>Drag the button above to your browser's bookmarks bar</li>
                  <li>When browsing any webpage you want to save, click the bookmarklet</li>
                  <li>The page will be automatically added to your collection</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookmarkImportModal;
