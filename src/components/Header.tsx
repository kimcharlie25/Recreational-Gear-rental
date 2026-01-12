import React from 'react';
import { ShoppingCart, Package } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useCategories } from '../hooks/useCategories';

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
  onMenuClick: () => void;
  onOrderTrackingClick?: () => void;
  onCategoryClick?: (categoryId: string) => void;
  selectedCategory?: string;
}

const Header: React.FC<HeaderProps> = ({ cartItemsCount, onCartClick, onMenuClick, onOrderTrackingClick, onCategoryClick, selectedCategory }) => {
  const { siteSettings, loading } = useSiteSettings();
  const { categories, loading: categoriesLoading } = useCategories();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-primary/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <button
            onClick={onMenuClick}
            className="flex items-center space-x-3 text-secondary hover:text-primary transition-all duration-300"
          >
            {loading ? (
              <div className="w-12 h-12 bg-gray-100 rounded-full animate-pulse" />
            ) : (
              <img
                src={siteSettings?.site_logo || "/logo.jpg"}
                alt={siteSettings?.site_name || "Beracah Cafe"}
                className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                onError={(e) => {
                  e.currentTarget.src = "/logo.jpg";
                }}
              />
            )}
            <h1 className="text-2xl font-bold tracking-tight">
              {loading ? (
                <div className="w-32 h-7 bg-gray-100 rounded animate-pulse" />
              ) : (
                siteSettings?.site_name || "Beracah Cafe"
              )}
            </h1>
          </button>

          <div className="flex-1 overflow-x-auto mx-8 scrollbar-hide">
            <nav className="hidden md:flex items-center space-x-10">
              {categoriesLoading ? (
                <div className="flex space-x-8">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-20 h-5 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <>
                  <button
                    onClick={() => onCategoryClick?.('all')}
                    className={`transition-all duration-300 whitespace-nowrap text-xs uppercase tracking-widest font-black ${selectedCategory === 'all' || !selectedCategory
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-900 border-b-2 border-transparent hover:text-primary'
                      }`}
                  >
                    All
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => onCategoryClick?.(category.id)}
                      className={`flex items-center space-x-2 transition-all duration-300 whitespace-nowrap text-xs uppercase tracking-widest font-black border-b-2 ${selectedCategory === category.id
                        ? 'text-primary border-primary'
                        : 'text-gray-900 border-transparent hover:text-primary'
                        }`}
                    >
                      <span className="text-lg">{category.icon}</span>
                      <span>{category.name}</span>
                    </button>
                  ))}
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onCartClick}
              className="relative p-2.5 text-secondary hover:text-primary hover:bg-primary/5 rounded-full transition-all duration-300"
            >
              <ShoppingCart className="h-7 w-7" />
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center ring-2 ring-white animate-bounce-gentle">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;