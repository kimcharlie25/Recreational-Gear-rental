import React, { useState } from 'react';
import { Plus, Minus, X } from 'lucide-react';
import { MenuItem, Variation, AddOn } from '../types';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, quantity?: number, variation?: Variation, addOns?: AddOn[]) => void;
  quantity: number;
  cartItemId?: string;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onAddToCart,
  quantity,
  cartItemId,
  onUpdateQuantity
}) => {
  const [showCustomization, setShowCustomization] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<Variation | undefined>(
    item.variations?.[0]
  );
  const [selectedAddOns, setSelectedAddOns] = useState<(AddOn & { quantity: number })[]>([]);

  // Determine discount display values
  const basePrice = item.basePrice;
  const effectivePrice = item.effectivePrice ?? basePrice;
  const hasExplicitDiscount = Boolean(item.isOnDiscount && item.discountPrice !== undefined);
  const hasImplicitDiscount = effectivePrice < basePrice;
  const showDiscount = hasExplicitDiscount || hasImplicitDiscount;
  const discountedPrice = hasExplicitDiscount
    ? (item.discountPrice as number)
    : (hasImplicitDiscount ? effectivePrice : undefined);

  const calculatePrice = () => {
    // Use effective price (discounted or regular) as base
    let price = effectivePrice;
    if (selectedVariation) {
      price = effectivePrice + selectedVariation.price;
    }
    selectedAddOns.forEach(addOn => {
      price += addOn.price * addOn.quantity;
    });
    return price;
  };

  const handleAddToCart = () => {
    if (item.variations?.length || item.addOns?.length) {
      setShowCustomization(true);
    } else {
      onAddToCart(item, 1);
    }
  };

  const handleCustomizedAddToCart = () => {
    // Convert selectedAddOns back to regular AddOn array for cart
    const addOnsForCart: AddOn[] = selectedAddOns.flatMap(addOn =>
      Array(addOn.quantity).fill({ ...addOn, quantity: undefined })
    );
    onAddToCart(item, 1, selectedVariation, addOnsForCart);
    setShowCustomization(false);
    setSelectedAddOns([]);
  };

  const handleIncrement = () => {
    if (!cartItemId) return;
    onUpdateQuantity(cartItemId, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 0 && cartItemId) {
      onUpdateQuantity(cartItemId, quantity - 1);
    }
  };

  const updateAddOnQuantity = (addOn: AddOn, quantity: number) => {
    setSelectedAddOns(prev => {
      const existingIndex = prev.findIndex(a => a.id === addOn.id);

      if (quantity === 0) {
        // Remove add-on if quantity is 0
        return prev.filter(a => a.id !== addOn.id);
      }

      if (existingIndex >= 0) {
        // Update existing add-on quantity
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity };
        return updated;
      } else {
        // Add new add-on with quantity
        return [...prev, { ...addOn, quantity }];
      }
    });
  };

  const groupedAddOns = item.addOns?.reduce((groups, addOn) => {
    const category = addOn.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(addOn);
    return groups;
  }, {} as Record<string, AddOn[]>);

  return (
    <>
      <div className={`bg-white rounded-none shadow-none hover:shadow-2xl transition-all duration-500 overflow-hidden group border border-secondary/10 ${!item.available ? 'opacity-50' : ''}`}>
        {/* Image Container with Badges */}
        <div className="relative h-[28rem] bg-gray-50 overflow-hidden">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`absolute inset-0 flex items-center justify-center bg-gray-100 ${item.image ? 'hidden' : ''}`}>
            <div className="text-8xl opacity-10 grayscale">⛰️</div>
          </div>

          {/* Overlays for high contrast badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {item.isOnDiscount && item.discountPrice && (
              <div className="bg-primary text-white text-[10px] font-black tracking-widest px-4 py-2 uppercase shadow-2xl">
                Special Offer
              </div>
            )}
            {item.popular && (
              <div className="bg-secondary text-white text-[10px] font-black tracking-widest px-4 py-2 uppercase shadow-2xl">
                Most Wanted
              </div>
            )}
          </div>

          {!item.available && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
              <span className="text-secondary font-black uppercase tracking-widest border-2 border-secondary px-6 py-3">Currently Fully Booked</span>
            </div>
          )}

          {/* Price Tag Overlay */}
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
            <div className="flex items-end justify-between">
              {showDiscount && discountedPrice !== undefined && (
                <div className="bg-primary text-white text-[10px] font-black px-3 py-1.5 uppercase">
                  Save {Math.round(((basePrice - discountedPrice) / basePrice) * 100)}%
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="flex items-start justify-between mb-4">
            <h4 className="text-2xl font-black text-secondary leading-none uppercase tracking-tight flex-1">{item.name}</h4>
            {item.variations && item.variations.length > 0 && (
              <span className="text-[10px] font-black text-primary border border-primary px-3 py-1 uppercase tracking-widest">
                {item.variations.length} Options
              </span>
            )}
          </div>

          <p className={`text-sm mb-8 leading-relaxed font-medium ${!item.available ? 'text-gray-400' : 'text-gray-600'}`}>
            {item.description}
          </p>

          <div className="flex items-center justify-between border-t border-secondary/10 pt-8">
            <div className="flex-1">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-secondary">
                  ₱{calculatePrice().toLocaleString()}
                </span>
                {showDiscount && discountedPrice !== undefined && (
                  <span className="text-sm text-gray-400 line-through font-bold">
                    ₱{basePrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-shrink-0">
              {item.available && (
                quantity === 0 ? (
                  <button
                    onClick={handleAddToCart}
                    className="bg-primary text-white px-10 py-4 font-black text-xs uppercase tracking-widest hover:bg-secondary transition-all duration-500 transform active:scale-95 shadow-lg"
                  >
                    {item.variations?.length || item.addOns?.length ? 'Configure Rental' : 'Secure Gear'}
                  </button>
                ) : (
                  <div className="flex items-center space-x-4 bg-secondary text-white p-1">
                    <button
                      onClick={handleDecrement}
                      className="p-3 hover:bg-primary transition-colors duration-300"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="font-black w-8 text-center text-lg">{quantity}</span>
                    <button
                      onClick={handleIncrement}
                      className="p-3 hover:bg-primary transition-colors duration-300"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Stock indicator with high contrast */}
          {item.trackInventory && item.stockQuantity !== null && (
            <div className="mt-6">
              {item.stockQuantity > item.lowStockThreshold ? (
                <div className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  Inventory Available: {item.stockQuantity} Units
                </div>
              ) : item.stockQuantity > 0 ? (
                <div className="text-[10px] font-black uppercase tracking-widest text-orange-600 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" />
                  Limited Availability: {item.stockQuantity} Units Left
                </div>
              ) : (
                <div className="text-[10px] font-black uppercase tracking-widest text-red-600 flex items-center gap-2 opacity-50">
                  <div className="w-2 h-2 bg-red-600 rounded-full" />
                  Waitlist Only: 0 Units Available
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Customization Modal - Luxury Minimalist Style */}
      {showCustomization && (
        <div className="fixed inset-0 bg-secondary/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto relative animate-scale-in">
            <button
              onClick={() => setShowCustomization(false)}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-all duration-300 z-10"
            >
              <X className="h-6 w-6 text-secondary" />
            </button>

            <div className="p-12">
              <div className="mb-12">
                <h3 className="text-4xl font-black text-secondary tracking-tight uppercase mb-2">Configure Your Gear</h3>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">{item.name}</p>
              </div>

              {/* Size Variations / Rental Days */}
              {item.variations && item.variations.length > 0 && (
                <div className="mb-12">
                  <h4 className="text-xs font-black text-secondary uppercase tracking-[0.3em] mb-6">Select Duration</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {item.variations.map((variation) => (
                      <label
                        key={variation.id}
                        className={`group flex items-center justify-between p-6 border-2 transition-all duration-500 cursor-pointer ${selectedVariation?.id === variation.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-100 hover:border-gray-300'
                          }`}
                      >
                        <div className="flex items-center space-x-4">
                          <input
                            type="radio"
                            name="variation"
                            checked={selectedVariation?.id === variation.id}
                            onChange={() => setSelectedVariation(variation)}
                            className="w-6 h-6 text-primary border-gray-300 focus:ring-secondary"
                          />
                          <span className="text-lg font-black text-secondary uppercase">{variation.name}</span>
                        </div>
                        <span className="text-xl font-black text-primary">
                          ₱{((item.effectivePrice || item.basePrice) + variation.price).toLocaleString()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Add-ons */}
              {groupedAddOns && Object.keys(groupedAddOns).length > 0 && (
                <div className="mb-12">
                  <h4 className="text-xs font-black text-secondary uppercase tracking-[0.3em] mb-6">Equipment Enhancements</h4>
                  {Object.entries(groupedAddOns).map(([category, addOns]) => (
                    <div key={category} className="mb-8">
                      <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                        {category}
                      </h5>
                      <div className="space-y-4">
                        {addOns.map((addOn) => (
                          <div
                            key={addOn.id}
                            className={`flex items-center justify-between p-6 border transition-all duration-300 ${selectedAddOns.find(a => a.id === addOn.id) ? 'border-primary bg-primary/5' : 'border-gray-100'
                              }`}
                          >
                            <div className="flex-1">
                              <span className="text-sm font-black text-secondary uppercase">{addOn.name}</span>
                              <div className="text-xs font-bold text-primary mt-1">
                                {addOn.price > 0 ? `+ ₱${addOn.price.toLocaleString()}` : 'Included'}
                              </div>
                            </div>

                            <div className="flex items-center space-x-6">
                              {selectedAddOns.find(a => a.id === addOn.id) ? (
                                <div className="flex items-center space-x-6 bg-secondary text-white p-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const current = selectedAddOns.find(a => a.id === addOn.id);
                                      updateAddOnQuantity(addOn, (current?.quantity || 1) - 1);
                                    }}
                                    className="p-2 hover:bg-primary transition-colors"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="font-black text-lg min-w-[20px] text-center">
                                    {selectedAddOns.find(a => a.id === addOn.id)?.quantity || 0}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const current = selectedAddOns.find(a => a.id === addOn.id);
                                      updateAddOnQuantity(addOn, (current?.quantity || 0) + 1);
                                    }}
                                    className="p-2 hover:bg-primary transition-colors"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => updateAddOnQuantity(addOn, 1)}
                                  className="px-8 py-3 bg-gray-100 text-secondary hover:bg-secondary hover:text-white transition-all duration-500 font-black text-[10px] uppercase tracking-widest"
                                >
                                  Select Option
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Price Summary & Final CTA */}
              <div className="mt-20 space-y-8">
                <div className="flex items-end justify-between border-t-2 border-secondary pt-8">
                  <div className="text-secondary">
                    <p className="text-[10px] uppercase tracking-[0.3em] font-black opacity-50 mb-2">Total Gear Value</p>
                    <p className="text-5xl font-black">₱{calculatePrice().toLocaleString()}</p>
                  </div>
                  <button
                    onClick={handleCustomizedAddToCart}
                    className="bg-primary text-white px-12 py-6 font-black text-sm uppercase tracking-[0.2em] hover:bg-secondary transition-all duration-500 shadow-2xl transform active:scale-95"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuItemCard;
