"use client";

import { useState, useRef, useEffect } from "react";

interface MultiSelectDropdownProps {
  label: string;
  options: Array<{ id: string; name: string }>;
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export default function MultiSelectDropdown({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = "Select...",
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const handleSelectAll = () => {
    if (selectedValues.length === filteredOptions.length) {
      onChange([]);
    } else {
      onChange(filteredOptions.map((opt) => opt.name));
    }
  };

  const displayText =
    selectedValues.length === 0
      ? placeholder
      : selectedValues.length === 1
      ? selectedValues[0]
      : `${selectedValues.length} selected`;

  return (
    <div className="relative z-[100]" ref={dropdownRef} style={{ zIndex: 100 }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 sm:px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-left text-sm sm:text-base focus:outline-none focus:border-primary flex items-center justify-between min-h-[44px]"
      >
        <span className="truncate">{displayText}</span>
        <svg
          className={`w-5 h-5 text-white/60 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className={`${isMobile ? 'fixed inset-0' : 'absolute top-full left-0 right-0 mt-2'} bg-black/95 backdrop-blur-md ${!isMobile ? 'rounded-lg' : ''} shadow-xl border border-white/20 ${isMobile ? 'max-h-screen' : 'max-h-80'} flex flex-col z-[99999]`}
        >
          {/* Search Box */}
          <div className="p-3 border-b border-white/10">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}...`}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-primary text-sm"
              autoFocus
            />
          </div>

          {/* Select All / Deselect All */}
          {filteredOptions.length > 0 && (
            <div className="px-3 py-2 border-b border-white/10">
              <label className="flex items-center cursor-pointer text-sm text-white/80 hover:text-white">
                <input
                  type="checkbox"
                  checked={selectedValues.length === filteredOptions.length && filteredOptions.length > 0}
                  onChange={handleSelectAll}
                  className="mr-2 w-4 h-4 rounded border-white/20 bg-white/10 text-primary focus:ring-primary focus:ring-offset-0"
                />
                <span>
                  {selectedValues.length === filteredOptions.length ? "Deselect All" : "Select All"}
                </span>
              </label>
            </div>
          )}

          {/* Options List */}
          <div className={`overflow-y-auto ${isMobile ? 'flex-1' : 'max-h-60'}`}>
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-white/60 text-sm text-center">No {label.toLowerCase()} found</div>
            ) : (
              filteredOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center px-4 py-2 hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.name)}
                    onChange={() => handleToggle(option.name)}
                    className="mr-3 w-4 h-4 rounded border-white/20 bg-white/10 text-primary focus:ring-primary focus:ring-offset-0"
                  />
                  <span className="text-white text-sm flex-1">{option.name}</span>
                </label>
              ))
            )}
          </div>

          {/* Close Button */}
          <div className="p-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setSearchQuery("");
              }}
              className="w-full px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary text-sm font-semibold rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

