
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, BookmarkCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { saveBookmark } from '@/lib/bookmarkService';
import { Bookmark, BookmarkType } from '@/lib/types';
import { generateUniqueId, getBookmarkTypeFromUrl } from '@/lib/bookmarkUtils';
import { useToast } from '@/hooks/use-toast';

const AddBookmark = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'saving' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const addBookmark = async () => {
      // Wait for auth to initialize
      if (loading) return;
      
      // Redirect to login if not authenticated
      if (!user) {
        navigate('/signin?redirect=/add');
        return;
      }
      
      try {
        // Get parameters from URL
        const url = searchParams.get('url');
        const title = searchParams.get('title');
        const description = searchParams.get('description');
        
        if (!url) {
          setErrorMessage('No URL provided');
          setStatus('error');
          return;
        }
        
        // Create the bookmark
        const bookmark: Bookmark = {
          id: generateUniqueId(),
          url,
          title: title || url,
          description: description || undefined,
          type: getBookmarkTypeFromUrl(url) as BookmarkType,
          dateAdded: new Date(),
          isAlive: true,
          tags: [],
        };
        
        setStatus('saving');
        
        // Save the bookmark
        await saveBookmark(bookmark);
        
        // Show success
        setStatus('success');
        
        // Redirect to main page after a delay
        setTimeout(() => {
          navigate('/');
        }, 2000);
        
      } catch (error) {
        console.error('Error adding bookmark:', error);
        setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
        setStatus('error');
      }
    };
    
    addBookmark();
    
  }, [searchParams, navigate, user, loading]);
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full p-8 space-y-6 rounded-lg border border-border bg-card shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Quick Add Bookmark</h1>
          
          {status === 'loading' && (
            <div className="mt-8 flex flex-col items-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          )}
          
          {status === 'saving' && (
            <div className="mt-8 flex flex-col items-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Saving bookmark...</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="mt-8 flex flex-col items-center">
              <div className="rounded-full bg-green-500/20 p-3 mb-4">
                <BookmarkCheck className="h-10 w-10 text-green-500" />
              </div>
              <p className="font-medium">Bookmark added successfully!</p>
              <p className="mt-2 text-muted-foreground">Redirecting to your collection...</p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="mt-8 space-y-4">
              <div className="rounded-full bg-destructive/20 p-3 mx-auto">
                <div className="h-10 w-10 text-destructive flex items-center justify-center">❌</div>
              </div>
              <p className="font-medium text-destructive">Error adding bookmark</p>
              <p className="text-muted-foreground">{errorMessage}</p>
              <button
                onClick={() => navigate('/')}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
              >
                Return to Collection
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddBookmark;
