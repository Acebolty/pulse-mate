import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

/**
 * SearchableDropdown Component
 * A dropdown with search functionality for selecting from a list of options
 */
const SearchableDropdown = ({
  value = '',
  onChange,
  options = [],
  placeholder = 'Search and select...',
  disabled = false,
  className = '',
  maxHeight = '200px',
  showSearchIcon = true,
  emptyMessage = 'No options found',
  filterFunction = null // Custom filter function
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Use useMemo to compute filtered options - this prevents infinite loops
  const filteredOptions = useMemo(() => {
    if (filterFunction) {
      return filterFunction(searchQuery);
    } else {
      return options.filter(option =>
        option.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  }, [searchQuery, options, filterFunction]);

  // Reset highlighted index when filtered options change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredOptions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchQuery('');
        inputRef.current?.blur();
        break;
    }
  };

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [highlightedIndex]);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearchQuery('');
    inputRef.current?.blur();
  };

  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // If user is typing and dropdown is closed, open it
    if (!isOpen && query.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchQuery : value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full p-3 pr-10 border border-gray-300 dark:border-slate-600 rounded-lg 
            dark:bg-slate-700 dark:text-slate-200 
            disabled:bg-gray-50 dark:disabled:bg-slate-700/50 disabled:cursor-not-allowed
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600
            ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
          `}
        />
        
        {/* Search/Dropdown Icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {showSearchIcon && isOpen ? (
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 dark:text-slate-500" />
          ) : (
            <ChevronDownIcon 
              className={`w-5 h-5 text-gray-400 dark:text-slate-500 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`} 
            />
          )}
        </div>
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div 
          className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg shadow-lg"
          style={{ maxHeight }}
        >
          <div 
            ref={listRef}
            className="overflow-y-auto"
            style={{ maxHeight }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`px-3 py-2 cursor-pointer transition-colors duration-150 ${
                    index === highlightedIndex
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-900 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700'
                  } ${
                    index === 0 ? 'rounded-t-lg' : ''
                  } ${
                    index === filteredOptions.length - 1 ? 'rounded-b-lg' : ''
                  }`}
                >
                  {option}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500 dark:text-slate-400 text-center">
                {emptyMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
