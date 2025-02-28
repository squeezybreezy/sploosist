
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  BookmarkPlus, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';

interface NavbarProps {
  onAddBookmark: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onAddBookmark }) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.',
      });
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <nav className="bg-card shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">
            Bookmark Buddy
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={onAddBookmark}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <BookmarkPlus className="h-5 w-5" />
              <span>Add Bookmark</span>
            </button>

            {user && (
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="text-muted-foreground">Signed in as </span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-secondary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="mt-4 py-3 border-t md:hidden animate-fade-in">
            <button
              onClick={() => {
                onAddBookmark();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-secondary rounded-md transition-colors"
            >
              <div className="flex items-center gap-2">
                <BookmarkPlus className="h-5 w-5" />
                <span>Add Bookmark</span>
              </div>
            </button>

            {user && (
              <>
                <div className="px-4 py-2 text-sm">
                  <span className="text-muted-foreground">Signed in as </span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-secondary rounded-md transition-colors text-destructive"
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="h-5 w-5" />
                    <span>Sign out</span>
                  </div>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
