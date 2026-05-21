'use client';

import React from 'react';

interface FilterChipProps {
  label: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, active, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 text-xs font-medium border rounded whitespace-nowrap transition-colors ${
        active
          ? 'border-blue-600 bg-blue-50 text-blue-700'
          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
};

export default FilterChip;
