import React from 'react';
import { useCategories } from '../hooks/useCategories';

interface MobileNavProps {
  activeCategory: string;
  onCategoryClick: (categoryId: string) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ activeCategory, onCategoryClick }) => {
  const { categories } = useCategories();

  return (
    <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-sm border-b border-secondary/10 md:hidden shadow-sm">
      <div className="flex overflow-x-auto scrollbar-hide px-4 py-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryClick(category.id)}
            className={`flex-shrink-0 flex items-center space-x-2 px-6 py-2.5 transition-all duration-300 mr-3 uppercase tracking-[0.15em] text-[10px] font-black ${activeCategory === category.id
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-white text-secondary border border-secondary/10 hover:border-primary/30 hover:bg-primary/5'
              }`}
          >
            <span className="text-base grayscale opacity-70 group-hover:opacity-100 transition-opacity">{category.icon}</span>
            <span className="whitespace-nowrap">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileNav;