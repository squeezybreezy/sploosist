
import React, { useState, useRef, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { Tag } from '@/lib/types';

interface TagsInputProps {
  tags: Tag[];
  availableTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  placeholder?: string;
}

const TagsInput: React.FC<TagsInputProps> = ({
  tags,
  availableTags,
  onTagsChange,
  placeholder = 'Add tags...'
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter available tags based on input and already selected tags
  const filteredTags = availableTags
    .filter((tag) => !tags.some((t) => t.id === tag.id))
    .filter((tag) => 
      tag.name.toLowerCase().includes(inputValue.toLowerCase())
    );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsDropdownOpen(true);
  };

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    // Check if the related target is inside the dropdown
    if (dropdownRef.current && !dropdownRef.current.contains(e.relatedTarget as Node)) {
      setIsDropdownOpen(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  const addTag = (tag: Tag) => {
    onTagsChange([...tags, tag]);
    setInputValue('');
    inputRef.current?.focus();
  };

  const removeTag = (tagId: string) => {
    onTagsChange(tags.filter(tag => tag.id !== tagId));
  };

  return (
    <div className="relative">
      <div 
        className="flex flex-wrap gap-2 p-2 border rounded-md bg-background min-h-10 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <div 
            key={tag.id} 
            className="tag-badge group flex items-center gap-1 animate-fade-in"
            style={{ backgroundColor: tag.color ? `${tag.color}20` : undefined, borderColor: tag.color || undefined }}
          >
            <span style={{ color: tag.color }}>{tag.name}</span>
            <button
              type="button"
              className="rounded-full p-0.5 hover:bg-secondary/50 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag.id);
              }}
              aria-label={`Remove ${tag.name} tag`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <input
          ref={inputRef}
          type="text"
          className="flex-grow outline-none bg-transparent min-w-20 h-6"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
        />
      </div>

      {isDropdownOpen && filteredTags.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md"
          style={{ maxHeight: '200px' }}
        >
          {filteredTags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent cursor-pointer"
              onClick={() => addTag(tag)}
              tabIndex={0}
              role="option"
              aria-selected="false"
            >
              <Plus className="h-3.5 w-3.5" />
              <span style={{ color: tag.color }}>{tag.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagsInput;
