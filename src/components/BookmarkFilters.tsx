
import React, { useState, useEffect, useRef } from 'react';
import { Tag, Category, BookmarkFilters as BookmarkFiltersType, BookmarkType, SortOption } from '@/lib/types';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  ChevronDown, 
  Tag as TagIcon,
  Clock, 
  Image as ImageIcon,
  FileText,
  Link,
  Video,
  Check,
  Filter,
  SortAsc,
  SortDesc,
  PaintBucket
} from 'lucide-react';

interface BookmarkFiltersProps {
  tags: Tag[];
  categories: Category[];
  initialFilters: BookmarkFiltersType;
  onFilterChange: (filters: BookmarkFiltersType) => void;
}

const sortOptions: { label: string; value: SortOption }[] = [
  { label: 'Newest first', value: 'dateAdded-desc' },
  { label: 'Oldest first', value: 'dateAdded-asc' },
  { label: 'Recently visited', value: 'lastVisited-desc' },
  { label: 'Least recently visited', value: 'lastVisited-asc' },
  { label: 'Title (A-Z)', value: 'title-asc' },
  { label: 'Title (Z-A)', value: 'title-desc' },
  { label: 'Most splats', value: 'splatCount-desc' },
  { label: 'Least splats', value: 'splatCount-asc' },
];

const typeOptions: { label: string; value: BookmarkType; icon: JSX.Element }[] = [
  { label: 'Links', value: 'link', icon: <Link className="h-4 w-4" /> },
  { label: 'Videos', value: 'video', icon: <Video className="h-4 w-4" /> },
  { label: 'Images', value: 'image', icon: <ImageIcon className="h-4 w-4" /> },
  { label: 'Documents', value: 'document', icon: <FileText className="h-4 w-4" /> },
];

const BookmarkFilters: React.FC<BookmarkFiltersProps> = ({
  tags,
  categories,
  initialFilters,
  onFilterChange,
}) => {
  const [filters, setFilters] = useState<BookmarkFiltersType>(initialFilters);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  
  // Handle outside clicks to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setIsTagDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Update filters and notify parent
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, query: e.target.value }));
  };
  
  const handleTagToggle = (tagId: string) => {
    setFilters(prev => {
      const currentTags = [...prev.tags];
      const tagIndex = currentTags.indexOf(tagId);
      
      if (tagIndex > -1) {
        currentTags.splice(tagIndex, 1);
      } else {
        currentTags.push(tagId);
      }
      
      return { ...prev, tags: currentTags };
    });
  };
  
  const handleCategoryChange = (categoryId: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      category: categoryId === prev.category ? undefined : categoryId
    }));
    setIsCategoryDropdownOpen(false);
  };
  
  const handleTypeChange = (type: BookmarkType | undefined) => {
    setFilters(prev => ({
      ...prev,
      type: type === prev.type ? undefined : type
    }));
    setIsTypeDropdownOpen(false);
  };
  
  const handleSortChange = (sortOption: SortOption) => {
    setFilters(prev => ({
      ...prev,
      sortBy: sortOption
    }));
    setIsSortDropdownOpen(false);
  };
  
  const handleClearFilters = () => {
    setFilters({
      query: '',
      tags: [],
      sortBy: 'dateAdded-desc'
    });
  };
  
  const hasActiveFilters = 
    filters.query.trim() !== '' || 
    filters.tags.length > 0 || 
    filters.type !== undefined || 
    filters.category !== undefined || 
    filters.isAlive !== undefined || 
    filters.contentChanged !== undefined;
  
  // Get current sort option label
  const currentSortOption = sortOptions.find(option => option.value === filters.sortBy);
  
  return (
    <div className="space-y-2">
      {/* Search Bar and Advanced Filters Toggle */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search bookmarks..."
            className="w-full pl-10 pr-10 py-2 bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={filters.query}
            onChange={handleSearchChange}
          />
          {filters.query && (
            <button
              className="absolute inset-y-0 right-3 flex items-center"
              onClick={() => setFilters(prev => ({ ...prev, query: '' }))}
              aria-label="Clear search"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
        
        {/* Sort Dropdown */}
        <div ref={sortDropdownRef} className="relative">
          <button
            className="flex items-center gap-2 px-3 py-2 bg-secondary/50 border border-border rounded-md hover:bg-secondary transition-colors"
            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
          >
            <SortAsc className="h-4 w-4" />
            <span className="text-sm hidden sm:inline">Sort by:</span>
            <span className="text-sm truncate max-w-28 sm:max-w-full">{currentSortOption?.label}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
          
          {isSortDropdownOpen && (
            <div className="absolute z-10 right-0 mt-1 w-48 bg-card rounded-md shadow-lg border border-border overflow-hidden">
              <div className="py-1">
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    className={`flex items-center w-full px-4 py-2 text-left text-sm ${
                      filters.sortBy === option.value ? 'bg-secondary/80 text-primary' : 'hover:bg-secondary'
                    }`}
                    onClick={() => handleSortChange(option.value)}
                  >
                    <span className="w-4 mr-2 inline-flex justify-center">
                      {filters.sortBy === option.value && <Check className="h-4 w-4" />}
                    </span>
                    <span>
                      {option.value.includes('splat') ? (
                        <span className="flex items-center gap-1">
                          {option.label}
                          <PaintBucket className="h-3 w-3 text-primary" />
                        </span>
                      ) : (
                        option.label
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Toggle Advanced Filters */}
        <button
          className={`flex items-center gap-2 px-3 py-2 border rounded-md ${
            showAdvancedFilters || hasActiveFilters ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90' : 'bg-secondary/50 border-border hover:bg-secondary'
          } transition-colors`}
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="text-sm hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white text-primary text-xs font-semibold">
              {filters.tags.length + (filters.type ? 1 : 0) + (filters.category ? 1 : 0) + (filters.isAlive !== undefined ? 1 : 0) + (filters.contentChanged !== undefined ? 1 : 0) + (filters.query ? 1 : 0)}
            </span>
          )}
        </button>
      </div>
      
      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="p-4 bg-card border border-border rounded-md shadow-sm space-y-4 animate-fade-in">
          <div className="flex flex-wrap gap-4">
            {/* Tags Filter */}
            <div ref={tagDropdownRef} className="relative min-w-48">
              <button
                className="flex items-center justify-between w-full px-3 py-2 bg-secondary/50 border border-border rounded-md hover:bg-secondary transition-colors"
                onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
              >
                <div className="flex items-center gap-2">
                  <TagIcon className="h-4 w-4" />
                  <span className="text-sm">Tags</span>
                  {filters.tags.length > 0 && (
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs font-semibold">
                      {filters.tags.length}
                    </span>
                  )}
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
              
              {isTagDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-card rounded-md shadow-lg border border-border overflow-hidden">
                  <div className="p-2">
                    {tags.length === 0 ? (
                      <div className="text-sm text-muted-foreground text-center py-2">No tags available</div>
                    ) : (
                      <>
                        {tags.map(tag => (
                          <div key={tag.id} className="flex items-center mb-1 last:mb-0">
                            <label className="flex items-center w-full px-2 py-1.5 rounded hover:bg-secondary cursor-pointer">
                              <input
                                type="checkbox"
                                className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                checked={filters.tags.includes(tag.id)}
                                onChange={() => handleTagToggle(tag.id)}
                              />
                              <span className="flex items-center gap-1.5 text-sm">
                                <span 
                                  className="w-2 h-2 rounded-full" 
                                  style={{ backgroundColor: tag.color || '#ccc' }}
                                ></span>
                                {tag.name}
                              </span>
                            </label>
                          </div>
                        ))}
                        
                        {filters.tags.length > 0 && (
                          <button
                            className="w-full mt-2 px-2 py-1 text-xs text-muted-foreground hover:text-foreground text-center border-t border-border pt-2"
                            onClick={() => setFilters(prev => ({ ...prev, tags: [] }))}
                          >
                            Clear selected tags
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Categories Filter */}
            <div ref={categoryDropdownRef} className="relative min-w-48">
              <button
                className="flex items-center justify-between w-full px-3 py-2 bg-secondary/50 border border-border rounded-md hover:bg-secondary transition-colors"
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              >
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="text-sm">
                    {filters.category 
                      ? `Category: ${categories.find(c => c.id === filters.category)?.name}` 
                      : 'Category'}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
              
              {isCategoryDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-card rounded-md shadow-lg border border-border overflow-hidden">
                  <div className="p-2">
                    <div 
                      className={`flex items-center mb-1 px-2 py-1.5 rounded hover:bg-secondary cursor-pointer ${!filters.category ? 'bg-secondary/80 text-primary' : ''}`}
                      onClick={() => handleCategoryChange(undefined)}
                    >
                      <span className="text-sm">All Categories</span>
                    </div>
                    
                    {categories.length === 0 ? (
                      <div className="text-sm text-muted-foreground text-center py-2">No categories available</div>
                    ) : (
                      categories.map(category => (
                        <div 
                          key={category.id} 
                          className={`flex items-center mb-1 last:mb-0 px-2 py-1.5 rounded hover:bg-secondary cursor-pointer ${filters.category === category.id ? 'bg-secondary/80 text-primary' : ''}`}
                          onClick={() => handleCategoryChange(category.id)}
                        >
                          <span className="text-sm">{category.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Type Filter */}
            <div ref={typeDropdownRef} className="relative min-w-48">
              <button
                className="flex items-center justify-between w-full px-3 py-2 bg-secondary/50 border border-border rounded-md hover:bg-secondary transition-colors"
                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
              >
                <div className="flex items-center gap-2">
                  {filters.type ? (
                    typeOptions.find(t => t.value === filters.type)?.icon || <FileText className="h-4 w-4" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  <span className="text-sm">
                    {filters.type 
                      ? `Type: ${typeOptions.find(t => t.value === filters.type)?.label}` 
                      : 'Type'}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
              
              {isTypeDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-card rounded-md shadow-lg border border-border overflow-hidden">
                  <div className="p-2">
                    <div 
                      className={`flex items-center mb-1 px-2 py-1.5 rounded hover:bg-secondary cursor-pointer ${!filters.type ? 'bg-secondary/80 text-primary' : ''}`}
                      onClick={() => handleTypeChange(undefined)}
                    >
                      <span className="text-sm">All Types</span>
                    </div>
                    
                    {typeOptions.map(type => (
                      <div 
                        key={type.value} 
                        className={`flex items-center mb-1 last:mb-0 px-2 py-1.5 rounded hover:bg-secondary cursor-pointer ${filters.type === type.value ? 'bg-secondary/80 text-primary' : ''}`}
                        onClick={() => handleTypeChange(type.value)}
                      >
                        <span className="flex items-center gap-2 text-sm">
                          {type.icon}
                          {type.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-primary focus:ring-primary"
                checked={filters.isAlive === false}
                onChange={() => setFilters(prev => ({ 
                  ...prev, 
                  isAlive: prev.isAlive === false ? undefined : false 
                }))}
              />
              <span className="text-sm">Show broken links</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-primary focus:ring-primary"
                checked={filters.contentChanged === true}
                onChange={() => setFilters(prev => ({ 
                  ...prev, 
                  contentChanged: prev.contentChanged === true ? undefined : true
                }))}
              />
              <span className="text-sm">Show changed content</span>
            </label>
          </div>
          
          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <button
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={handleClearFilters}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookmarkFilters;
