import React from 'react';
import { Category } from '@/pages/Home';

interface CategoryItemProps {
  category: Category;
  isActive: boolean;
  onClick: () => void;
}

export const CategoryItem: React.FC<CategoryItemProps> = ({ category, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-all duration-200 ${
        isActive 
          ? 'bg-primary/10 text-primary' 
          : 'hover:bg-tertiary/50'
      }`}
    >
      <i className={`fa-solid ${category.icon} w-5 text-center`}></i>
      <span className="flex-1 font-medium">{category.name}</span>
      <span className="bg-tertiary/70 text-gray-600 text-xs px-2 py-1 rounded-full">
        {category.count}
      </span>
    </button>
  );
};