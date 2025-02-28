
import React, { useState } from 'react';
import { SortOption, BookmarkType, Tag, Category } from '@/lib/types';
import { Search, ChevronDown, X, Filter } from 'lucide-react';
import TagsInput from './TagsInput';

interface BookmarkFiltersProps {
  tags: Tag[];
  categories: Category[];
  onFilterChange: (filters: {
    query: string;
    tags: string[];
    type?: BookmarkType;
    category?: string;
    isAlive?: boolean;
    contentChanged?: boolean;
    sortBy: SortOption;
  }) => void;
  initialFilters?: {
    query: string;
    tags: string[];
    type?: BookmarkType;
    category?: string;
    isAlive?: boolean;
    contentChanged?: boolean;
    sortBy: SortOption;
  };
}

const BookmarkFilters: React.FC<BookmarkFiltersProps> = ({
  tags,
  categories,
  onFilterChange,
  initialFilters = {
    query: '',
    tags: [],
    sortBy: 'dateAdded-desc'
  }
}) => {
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [selectedTags, setSelectedTags] = useState<Tag[]>(
    filters.tags.map(tagId => tags.find(t => t.id === tagId)).filter(Boolean) as Tag[]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, query: e.target.value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleTagsChange = (newTags: Tag[]) => {
    setSelectedTags(newTags);
    const newFilters = { ...filters, tags: newTags.map(t => t.id) };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as BookmarkType | '';
    const newFilters = { 
      ...filters, 
      type: value === '' ? undefined : value as BookmarkType 
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const newFilters = { 
      ...filters, 
      category: value === '' ? undefined : value 
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilters = { ...filters, sortBy: e.target.value as SortOption };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleIsAliveChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const newFilters = { 
      ...filters, 
      isAlive: value === '' ? undefined : value === 'true' 
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleContentChangedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const newFilters = { 
      ...filters, 
      contentChanged: value === '' ? undefined : value === 'true' 
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const newFilters = {
      query: '',
      tags: [],
      sortBy: 'dateAdded-desc' as SortOption
    };
    setFilters(newFilters);
    setSelectedTags([]);
    onFilterChange(newFilters);
  };

  const hasActiveFilters = 
    filters.query || 
    filters.tags.length > 0 || 
    filters.type || 
    filters.category || 
    filters.isAlive !== undefined || 
    filters.contentChanged !== undefined;

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Search and clear filters row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            className="w-full pl-9 pr-3 py-2 border rounded-md"
            placeholder="Search bookmarks..."
            value={filters.query}
            onChange={handleInputChange}
          />
        </div>
        
        <button 
          className={`${
            hasActiveFilters 
              ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          } px-3 py-2 rounded-md flex items-center gap-2 transition-colors`}
          onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
          <span className={`${hasActiveFilters ? 'bg-primary-foreground text-primary' : 'bg-secondary-foreground/20'} h-5 w-5 rounded-full text-xs flex items-center justify-center`}>
            {Object.values(filters).filter(v => 
              Array.isArray(v) ? v.length > 0 : v !== undefined && v !== 'dateAdded-desc' && v !== ''
            ).length}
          </span>
        </button>
        
        {hasActiveFilters && (
          <button 
            className="bg-destructive/10 text-destructive hover:bg-destructive/20 px-3 py-2 rounded-md flex items-center gap-2 transition-colors"
            onClick={clearFilters}
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>
      
      {/* Advanced filters section */}
      {isAdvancedFilterOpen && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-md bg-card animate-slide-down">
          {/* Tags filter */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tags</label>
            <TagsInput
              tags={selectedTags}
              availableTags={tags}
              onTagsChange={handleTagsChange}
              placeholder="Filter by tags..."
            />
          </div>
          
          {/* Type filter */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Type</label>
            <select 
              className="w-full p-2 border rounded-md bg-background focus:ring-2 focus:ring-ring"
              value={filters.type || ''}
              onChange={handleTypeChange}
            >
              <option value="">All types</option>
              <option value="link">Links</option>
              <option value="video">Videos</option>
              <option value="image">Images</option>
              <option value="document">Documents</option>
            </select>
          </div>
          
          {/* Category filter */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Category</label>
            <select 
              className="w-full p-2 border rounded-md bg-background focus:ring-2 focus:ring-ring"
              value={filters.category || ''}
              onChange={handleCategoryChange}
            >
              <option value="">All categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          
          {/* Status filters */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Link Status</label>
            <select 
              className="w-full p-2 border rounded-md bg-background focus:ring-2 focus:ring-ring"
              value={filters.isAlive === undefined ? '' : String(filters.isAlive)}
              onChange={handleIsAliveChange}
            >
              <option value="">Any status</option>
              <option value="true">Active links</option>
              <option value="false">Broken links</option>
            </select>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Content Status</label>
            <select 
              className="w-full p-2 border rounded-md bg-background focus:ring-2 focus:ring-ring"
              value={filters.contentChanged === undefined ? '' : String(filters.contentChanged)}
              onChange={handleContentChangedChange}
            >
              <option value="">Any changes</option>
              <option value="true">Changed content</option>
              <option value="false">Unchanged content</option>
            </select>
          </div>
          
          {/* Sort dropdown */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Sort By</label>
            <select 
              className="w-full p-2 border rounded-md bg-background focus:ring-2 focus:ring-ring"
              value={filters.sortBy}
              onChange={handleSortChange}
            >
              <option value="dateAdded-desc">Newest first</option>
              <option value="dateAdded-asc">Oldest first</option>
              <option value="lastVisited-desc">Recently visited</option>
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookmarkFilters;
